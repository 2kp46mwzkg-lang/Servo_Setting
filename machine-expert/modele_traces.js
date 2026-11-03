/* Réglages Servo — modèle Python inséré tel quel dans le script Machine Expert généré (partie TRACES : une trace par axe, 4 diagrammes).
   C'est du Python (IronPython 2.7 de Machine Expert) entre les deux accents graves ` : ne pas y mettre d'accent grave ni de ${ ,
   et garder la première et la dernière ligne (const … = String.raw` … `;). Repère @@TRACES@@ dans modele_script.js. */
const TRACE_CORE = String.raw`# ================================================================ TRACES DES AXES
# Une trace par famille d'axes physiques (TRC_Axes_MT, _MC, _MP, _MR) avec, pour
# chaque axe, 4 diagrammes : Vitesse (consigne + reel), Position (reel + consigne),
# Erreur de poursuite, Courant. Les traces sont recreees a chaque lancement.
# Script d'origine : script_traces_brushless.py (valide sur Machine Expert V2.2).
import re as tr_re

def traces_axes():
    ################# Parametres #################
    MODE = "CREER"
    NOM_APPLICATION = "Application"
    TACHE_TRACE = globals().get("TACHE_TRACE", u"TASK_SR_Main")
    MODELE_NOM_TRACE = "TRC_Axes_{famille}"
    PREFIXE_DRIVER = globals().get("PREFIXE", "DRV_")
    FAMILLES_PHYSIQUES = ["MT", "MC", "MP", "MR"]
    ACCEPTER_SUFFIXE = True
    AXES_EXCLUS = []
    MODELE_VARIABLE = "{drv}.{param}"
    DIAGRAMMES = [
        ("Vitesse",          [("MechRefVelocity",   True),
                              ("MechVelocity",      False)]),
        ("Position",         [("MechPosition",      False),
                              ("MechRefPosition",   True)]),
        ("Erreur poursuite", [("TrackingDeviation", False)]),
        ("Courant mA",       [("Current",           False)]),
    ]
    # "AXE" = les 4 diagrammes repetes pour chaque axe, avec ses variables seulement
    # "PARAMETRE" = chaque diagramme regroupe tous les axes de la trace
    REGROUPEMENT = "AXE"
    MAX_AXES_PAR_TRACE = globals().get("TRACES_MAX_AXES", 0)
    REMPLACER_EXISTANTE = True
    SUPPRIMER_TRACES_VIDES = True
    ANCIENNES_TRACES = ["TRC_Axes_Physiques"]
    IGNORER_DESACTIVES = True
    CHAQUE_N_CYCLES = 1
    AUTO_START = False
    SEUIL_VARIABLES = 60
    PALETTE = [0xFF1F77B4, 0xFFD62728, 0xFF2CA02C, 0xFFFF7F0E,
               0xFF9467BD, 0xFF8C564B, 0xFFE377C2, 0xFF7F7F7F,
               0xFFBCBD22, 0xFF17BECF, 0xFF393B79, 0xFF637939,
               0xFF8C6D31, 0xFF843C39, 0xFF7B4173, 0xFF3182BD]
    # Axes de l'outil (AXES_HW) : seuls ceux-la sont traces si TRACES_TOUS_LES_AXES = False
    Liste_Brushless = [] if globals().get("TRACES_TOUS_LES_AXES", True) else [x[0] for x in globals().get("AXES_HW", []) if x[1]]

    ################# Outils #################
    JOURNAL = []
    DEJA_SIGNALE = set()
    API_DIAG = []
    MEMBRES_DOTNET = set(["Equals", "GetHashCode", "GetType", "ToString",
                          "MemberwiseClone", "ReferenceEquals", "Finalize"])
    REGEX_AXE = tr_re.compile("^" + tr_re.escape(PREFIXE_DRIVER) + "("
                              + "|".join([tr_re.escape(f) for f in FAMILLES_PHYSIQUES])
                              + r")(\d+)" + ("(.*)" if ACCEPTER_SUFFIXE else "()")
                              + "$")

    def motif_vers_regex(motif):
        return tr_re.compile("^" + ".*".join([tr_re.escape(p) for p in motif.split("*")]) + "$")

    REGEX_EXCLUS = [motif_vers_regex(m) for m in AXES_EXCLUS]

    def log(texte, niveau="info"):
        JOURNAL.append((niveau, texte))
        dire(u"   " + unicode(texte))
        try:
            if niveau == "erreur":
                system.write_message(Severity.Error, texte)
            elif niveau == "warn":
                system.write_message(Severity.Warning, texte)
            else:
                system.write_message(Severity.Information, texte)
        except Exception:
            pass

    def essayer(objet, attribut, valeur):
        try:
            setattr(objet, attribut, valeur)
            return True
        except Exception as e:
            if attribut not in DEJA_SIGNALE:
                DEJA_SIGNALE.add(attribut)
                log("   ! reglage '{}' impossible : {}".format(attribut, e), "warn")
            return False

    def eclaircir(couleur):
        a = (couleur >> 24) & 0xFF
        r = (couleur >> 16) & 0xFF
        g = (couleur >> 8) & 0xFF
        b = couleur & 0xFF
        r = r + (255 - r) // 2
        g = g + (255 - g) // 2
        b = b + (255 - b) // 2
        return (a << 24) | (r << 16) | (g << 8) | b

    def cle_tri(nom):
        m = REGEX_AXE.match(nom)
        if m:
            return (0, FAMILLES_PHYSIQUES.index(m.group(1)), int(m.group(2)), m.group(3), nom)
        return (1, 0, 0, "", nom)

    def famille_de(nom):
        m = REGEX_AXE.match(nom)
        if m:
            return m.group(1)
        return None

    def est_exclu(nom):
        for r in REGEX_EXCLUS:
            if r.match(nom):
                return True
        return False

    def resume(noms, maxi=8):
        if len(noms) <= maxi:
            return ", ".join(noms)
        return "{}... (+{} autres)".format(", ".join(noms[:maxi]), len(noms) - maxi)

    def nom_trace(famille):
        return MODELE_NOM_TRACE.format(famille=famille)

    def regex_traces_famille(famille):
        return tr_re.compile("^" + tr_re.escape(nom_trace(famille)) + r"(_\d+)?$")

    def enfants(objet):
        try:
            return list(objet.get_children(False))
        except Exception:
            return []

    def tous_les_objets():
        resultat = []
        a_visiter = enfants(projects.primary)
        while a_visiter:
            obj = a_visiter.pop(0)
            resultat.append(obj)
            a_visiter.extend(enfants(obj))
        return resultat

    def trouver_application():
        proj = projects.primary
        candidats = list(proj.find(NOM_APPLICATION, True))
        for o in candidats:
            if getattr(o, "is_application", False):
                return o
        try:
            app = proj.active_application
            if app is not None:
                return app
        except Exception:
            pass
        if candidats:
            return candidats[0]
        return None

    def lister_taches(objets):
        noms = set()
        for o in objets:
            if getattr(o, "is_task", False):
                noms.add(o.get_name())
        return sorted(noms)

    def analyser_drivers(objets):
        noms_excel = [PREFIXE_DRIVER + str(n) for n in Liste_Brushless]
        analyse = {}
        for o in objets:
            if not getattr(o, "is_device", False):
                continue
            nom = o.get_name()
            if not nom.startswith(PREFIXE_DRIVER):
                continue
            if noms_excel and nom not in noms_excel:
                continue
            actif = True
            try:
                actif = bool(o.is_enabled())
            except Exception:
                pass
            if not REGEX_AXE.match(nom):
                statut = "EXCLU (pas un axe physique)"
            elif est_exclu(nom):
                statut = "EXCLU (AXES_EXCLUS)"
            elif IGNORER_DESACTIVES and not actif:
                statut = "EXCLU (desactive)"
            else:
                statut = "GARDE"
            analyse[nom] = statut
        for n in noms_excel:
            if n not in analyse:
                log("   ! {} est dans les axes de l'outil mais introuvable dans le projet".format(n), "warn")
        gardes = sorted([n for n in analyse if analyse[n] == "GARDE"], key=cle_tri)
        return gardes, analyse

    def repartir_par_famille(axes):
        return [(f, [a for a in axes if famille_de(a) == f]) for f in FAMILLES_PHYSIQUES]

    def decouper(famille, axes):
        if MAX_AXES_PAR_TRACE and 0 < MAX_AXES_PAR_TRACE < len(axes):
            n = MAX_AXES_PAR_TRACE
            morceaux = [axes[i:i + n] for i in range(0, len(axes), n)]
            return [(nom_trace(famille) + "_" + str(i + 1), m) for i, m in enumerate(morceaux)]
        return [(nom_trace(famille), axes)]

    def construire_plan(axes):
        plan = []
        if REGROUPEMENT == "AXE":
            for drv in axes:
                for (titre, params) in DIAGRAMMES:
                    plan.append((drv + " - " + titre, [(drv, p, c) for (p, c) in params]))
        else:
            for (titre, params) in DIAGRAMMES:
                plan.append((titre, [(drv, p, c) for drv in axes for (p, c) in params]))
        return [(t, cs) for (t, cs) in plan if cs]

    def afficher_analyse(analyse, gardes):
        log("---- Equipements {}... examines ({}) ----".format(PREFIXE_DRIVER, len(analyse)))
        for nom in sorted(analyse, key=cle_tri):
            log("   {:<22} {}".format(nom, analyse[nom]))
        par_famille = ["{} {}".format(f, len(a)) for (f, a) in repartir_par_famille(gardes)]
        log("Axes physiques ({}) : {}".format(len(gardes), ", ".join(par_famille)), "resultat")
        for (f, a) in repartir_par_famille(gardes):
            if a:
                log("   {} : {}".format(f, ", ".join(a)))
        exclus = sorted([n for n in analyse if analyse[n] != "GARDE"], key=cle_tri)
        if exclus:
            log("Ignores ({}) : {}".format(len(exclus), resume(["{} {}".format(n, analyse[n][6:]) for n in exclus], 6)), "resultat")

    def traces_existantes(app):
        res = []
        pile = enfants(app)
        while pile:
            o = pile.pop(0)
            if getattr(o, "is_trace_object", False):
                res.append(o)
            else:
                pile.extend(enfants(o))
        return res

    def traces_de_famille(app, famille):
        motif = regex_traces_famille(famille)
        return [t for t in traces_existantes(app) if motif.match(t.get_name())]

    def traces_nommees(app, nom):
        try:
            return [o for o in app.find(nom, True) if getattr(o, "is_trace_object", False)]
        except Exception:
            return []

    def supprimer_objets(objets):
        noms = []
        for o in objets:
            nom = o.get_name()
            try:
                o.remove()
                noms.append(nom)
            except Exception as e:
                log("   ! suppression de {} impossible : {}".format(nom, e), "warn")
        return noms

    ################# Diagnostic API trace #################
    def noms_publics(objet):
        try:
            return ", ".join(sorted([n for n in dir(objet) if not n.startswith("_") and n not in MEMBRES_DOTNET]))
        except Exception as e:
            return "illisible ({})".format(e)

    def chercher_reglage_legacy(tr):
        for (libelle, cible) in (("trace", tr), ("diagrams", getattr(tr, "diagrams", None))):
            if cible is None:
                continue
            try:
                attributs = [a for a in dir(cible) if "legacy" in a.lower() and not a.startswith("_")]
            except Exception:
                attributs = []
            for a in attributs:
                try:
                    valeur = getattr(cible, a)
                except Exception as e:
                    log("   ? {}.{} illisible : {}".format(libelle, a, e))
                    continue
                if isinstance(valeur, bool) and valeur:
                    try:
                        setattr(cible, a, False)
                        log("   {}.{} : True -> False".format(libelle, a))
                    except Exception as e:
                        log("   ? {}.{} non modifiable : {}".format(libelle, a, e))
                elif callable(valeur):
                    log("   {}.{}() existe (non appelee)".format(libelle, a))
                else:
                    log("   {}.{} = {}".format(libelle, a, valeur))

    def diagnostic_api(tr):
        if API_DIAG:
            return
        API_DIAG.append(True)
        log("API trace - module : " + noms_publics(trace), "api")
        log("API trace - objet trace : " + noms_publics(tr), "api")
        try:
            log("API trace - diagrams : " + noms_publics(tr.diagrams), "api")
        except Exception:
            pass
        try:
            variables = list(tr.variable_list)
            if variables:
                log("API trace - variable : " + noms_publics(variables[0]), "api")
        except Exception:
            pass

    ################# Creation d'une trace #################
    def creer_trace(app, nom, famille, axes):
        plan = construire_plan(axes)
        tr = trace.create(app, nom)
        try:
            tr.task_name = TACHE_TRACE
        except Exception as e:
            log("   ! {} : tache '{}' refusee : {}".format(nom, TACHE_TRACE, e), "warn")
        chercher_reglage_legacy(tr)
        # 1) Diagrammes : Machine Expert refuse diagrams.add() sur une trace sans variable (« legacy mode ») et add() ne prend pas
        #    d'argument : les diagrammes sont donc crees APRES les variables (etape 3), sans argument, puis nommes et remplis.
        diagrammes = []
        # 2) Variables : une couleur par axe, consignes en plus clair
        couleurs = {}
        for i, drv in enumerate(axes):
            couleurs[drv] = PALETTE[i % len(PALETTE)]
        variables = {}
        for (titre, courbes) in plan:
            for (drv, param, consigne) in courbes:
                cle = (drv, param)
                if cle in variables:
                    continue
                expr = MODELE_VARIABLE.format(drv=drv, param=param)
                c = eclaircir(couleurs[drv]) if consigne else couleurs[drv]
                try:
                    variables[cle] = tr.add_trace_variable(variableName=expr, graphColor=c)
                except Exception as e:
                    variables[cle] = None
                    log("   ! variable '{}' non ajoutee : {}".format(expr, e), "warn")
        # 3) Diagrammes (apres les variables) : add() sans argument, nom, puis les courbes par la methode que l'API accepte
        nb_diag = 0
        refus = None
        def mettre_courbe(d, v):
            erreurs = []
            for f in (lambda: d.add_diagram_variable(v), lambda: d.variables.add(v), lambda: d.add_variable(v), lambda: d.add(v), lambda: d.variable_list.add(v)):
                try:
                    f()
                    return None
                except Exception as e:
                    erreurs.append(unicode(e) if 'unicode' in globals() else str(e))
            return erreurs[-1] if erreurs else "aucune methode"
        for i, (titre, courbes) in enumerate(plan):
            vs = [variables[(drv, param)] for (drv, param, consigne) in courbes]
            vs = [v for v in vs if v is not None]
            if not vs:
                continue
            try:
                d = tr.diagrams.add()
                essayer(d, "name", titre)
                if nb_diag == 0:
                    log("API trace - diagramme : " + noms_publics(d), "api")
                manque = 0
                for v in vs:
                    err = mettre_courbe(d, v)
                    if err is not None:
                        manque += 1
                        if manque == 1:
                            log("   ! {} : courbe non placee dans '{}' : {}".format(nom, titre, err), "warn")
                nb_diag += 1
            except Exception as e:
                if nb_diag == 0 or "legacy" in str(e).lower():
                    refus = e
                    break
                log("   ! {} : diagramme '{}' non cree : {}".format(nom, titre, e), "warn")
        essayer(tr, "every_n_cycles", CHAQUE_N_CYCLES)
        essayer(tr, "auto_start", AUTO_START)
        essayer(tr, "comment", "Verification des axes {} : {}".format(famille, ", ".join(axes)))
        nb_var = len([v for v in variables.values() if v is not None])
        log("{} : {} axe(s) ({}), {} variable(s), {} diagramme(s)".format(nom, len(axes), resume(axes), nb_var, nb_diag), "resultat")
        if refus is not None:
            log("{} : diagrammes refuses par Machine Expert ({}). La trace contient toutes ses variables, avec l'affichage par defaut.".format(nom, refus), "warn")
            diagnostic_api(tr)
        if nb_var > SEUIL_VARIABLES:
            log("{} volumineuse ({} variables) : si le download est refuse ou lent, regler TRACES_MAX_AXES (ex : 8).".format(nom, nb_var), "warn")
        return True

    ################# Creation #################
    def mode_creer(app, taches, axes, analyse):
        afficher_analyse(analyse, axes)
        if not TACHE_TRACE:
            log("TACHE_TRACE est vide : renseigner une tache parmi : " + ", ".join(taches), "erreur")
            return
        if taches and TACHE_TRACE not in taches:
            log("Tache '{}' introuvable. Taches disponibles : {}".format(TACHE_TRACE, ", ".join(taches)), "erreur")
            return
        if not axes:
            log("Aucun axe physique trouve, aucune trace creee.", "erreur")
            return
        motifs = [regex_traces_famille(f) for f in FAMILLES_PHYSIQUES]
        for ancien in ANCIENNES_TRACES:
            if [m for m in motifs if m.match(ancien)]:
                continue
            if supprimer_objets(traces_nommees(app, ancien)):
                log("Ancienne trace {} supprimee (remplacee par une trace par famille)".format(ancien), "resultat")
        nb_creees = 0
        for (famille, axes_f) in repartir_par_famille(axes):
            existantes = traces_de_famille(app, famille)
            if not axes_f:
                if SUPPRIMER_TRACES_VIDES and existantes:
                    noms = supprimer_objets(existantes)
                    log("{} supprimee(s) : plus aucun axe {}".format(", ".join(noms), famille), "resultat")
                else:
                    log(" - famille {} : aucun axe, pas de trace".format(famille))
                continue
            noms_existants = [t.get_name() for t in existantes]
            if REMPLACER_EXISTANTE and existantes:
                supprimer_objets(existantes)
                log(" - ancienne(s) trace(s) supprimee(s) : " + ", ".join(noms_existants))
                noms_existants = []
            for (nom, groupe) in decouper(famille, axes_f):
                if nom in noms_existants:
                    log("{} existe deja -> non modifiee".format(nom), "resultat")
                    continue
                try:
                    if creer_trace(app, nom, famille, groupe):
                        nb_creees += 1
                except Exception as e:
                    log("Creation de {} impossible : {}".format(nom, e), "erreur")
        if nb_creees:
            log("{} trace(s) creee(s) sous l'application {} (arbre Outils), tache {}.".format(nb_creees, app.get_name(), TACHE_TRACE), "resultat")

    def principal():
        try:
            trace
        except NameError:
            log("L'API de script 'trace' n'existe pas dans cette version de Machine Expert : traces non creees.", "erreur")
            return
        if projects.primary is None:
            log("Aucun projet ouvert.", "erreur")
            return
        app = trouver_application()
        if app is None:
            log("Application '{}' introuvable.".format(NOM_APPLICATION), "erreur")
            return
        objets = tous_les_objets()
        taches = lister_taches(objets)
        axes, analyse = analyser_drivers(objets)
        log("==== Traces par famille d'axes - application {} - {} axe(s) physique(s) ====".format(app.get_name(), len(axes)))
        mode_creer(app, taches, axes, analyse)

    def fenetre():
        erreurs = [t.strip() for (n, t) in JOURNAL if n == "erreur"]
        alertes = [t.strip() for (n, t) in JOURNAL if n == "warn"]
        resultats = [t.strip() for (n, t) in JOURNAL if n == "resultat"]
        api = [t for (n, t) in JOURNAL if n == "api"]
        lignes_f = ["Traces des axes", ""]
        if erreurs:
            lignes_f.append("ERREUR(S) :")
            lignes_f.extend(["- " + t for t in erreurs[:10]])
            lignes_f.append("")
        if resultats:
            lignes_f.extend(resultats)
            lignes_f.append("")
        if alertes:
            lignes_f.append("{} avertissement(s), dont :".format(len(alertes)))
            lignes_f.extend(["- " + t for t in alertes[:8]])
            lignes_f.append("(detail complet dans la vue Messages et le rapport)")
        if api:
            lignes_f.append("")
            lignes_f.append("Diagrammes refuses : copier les {} lignes 'API trace' de la vue Messages.".format(len(api)))
        texte = "\n".join(lignes_f)
        try:
            if erreurs:
                system.ui.error(texte)
            elif alertes:
                system.ui.warning(texte)
            else:
                system.ui.info(texte)
        except Exception:
            print(texte)

    dire("TRACES DES AXES")
    try:
        principal()
    except Exception:
        import traceback
        log("Erreur inattendue des traces :\n" + traceback.format_exc(), "erreur")
    dire("")
    fenetre()

if globals().get("CREER_TRACES", False):
    if SIMULATION:
        dire("TRACES DES AXES : non creees en simulation (SIMULATION = True)")
        dire("")
    elif globals().get("arret", False) or HW_ARRET:
        dire("TRACES DES AXES : non creees (script arrete)")
        dire("")
    else:
        traces_axes()
`;
