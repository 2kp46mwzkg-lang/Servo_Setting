/* Réglages Servo — modèle Python inséré tel quel dans le script Machine Expert généré (corps principal : axes, réglages, paramètres, liste).
   C'est du Python (IronPython 2.7 de Machine Expert) entre les deux accents graves ` : ne pas y mettre d'accent grave ni de ${ ,
   et garder la première et la dernière ligne (const … = String.raw` … `;). Les repères # @@HARDWARE@@ et # @@TRACES@@ sont remplacés par les deux autres modèles. */
const ME_CORE = String.raw`try:
    unicode
except NameError:
    unicode = str

def safe(f, defaut=None):
    try:
        return f()
    except Exception:
        return defaut

def appareils(obj, res):
    """Parcours recursif de l'arbre du projet (meme principe que le script de lecture)"""
    for enfant in safe(lambda: list(obj.get_children(False)), []):
        if safe(lambda: enfant.is_device, False):
            res.append(enfant)
        appareils(enfant, res)

def parametres(dev):
    """host_parameters du variateur et de ses sous-noeuds, ranges par nom"""
    res = {}
    pile = [dev]
    while pile:
        d = pile.pop(0)
        for conn in safe(lambda: list(d.connectors), []):
            for p in safe(lambda: list(conn.host_parameters), []):
                nom = safe(lambda: p.name, "")
                if nom and nom not in res:
                    res[nom] = p
        for e in safe(lambda: list(d.get_children(False)), []):
            if safe(lambda: e.is_device, False):
                pile.append(e)
    return res

def code_enum(p, choix):
    # liste deroulante : texte affiche ("Start with actual values") -> code a ecrire ("0")
    cible = unicode(choix).strip().lower()
    for it in safe(lambda: list(p.allowed_values), []):
        vis = unicode(safe(lambda: it.visible_name, u""))
        if vis.split(u" / ")[0].strip().lower() == cible:
            return unicode(safe(lambda: it.value, u""))
    return None

def texte(valeur, genre):
    if genre in ("txt", "enum"):
        return unicode(valeur)
    if genre == "int":
        return "%d" % int(round(valeur))
    s = ("%.6f" % valeur).rstrip("0")
    if s.endswith("."):
        s += "0"
    return s

def identique(ancien, nouveau):
    a = unicode(ancien if ancien is not None else "").strip().lower()
    try:
        return abs(float(a) - float(nouveau)) < 1e-9
    except Exception:
        return a == unicode(nouveau).strip().lower()

def ecrire(p, valeur):
    try:
        p.value = valeur
    except Exception:
        if hasattr(p, "set_value"):
            p.set_value(valeur)
        else:
            raise
    return safe(lambda: p.value, "")

lignes = []
def dire(s=""):
    print(s)
    lignes.append(unicode(s))

projet = projects.primary
if projet is None:
    raise Exception("Aucun projet ouvert dans Machine Expert")

HW_ARRET = False
# @@HARDWARE@@

tous = []
appareils(projet, tous)
par_nom = {}
for d in tous:
    par_nom.setdefault(safe(lambda: d.get_name(), ""), []).append(d)

def demander(nom_drv, changements, alertes):
    """Fenetre de confirmation avant de modifier un axe.
    Renvoie "oui", "tous", "non" ou "stop"."""
    lignes_msg = [nom_drv + " : %d parametre(s) vont etre modifies" % len(changements), ""]
    for a in alertes:
        lignes_msg.append("! " + a)
    if alertes:
        lignes_msg.append("")
    for c in changements:
        lignes_msg.append("%s :  %s  ->  %s" % (c[0], c[1], c[2]))
    msg = u"\n".join([unicode(x) for x in lignes_msg])
    ui = safe(lambda: system.ui, None)
    if ui is None:
        return None
    choix = ["Oui, modifier cet axe", "Oui a tous (ne plus demander)", "Non, passer cet axe", "Arreter le script"]
    try:
        r = ui.choose(msg, choix)
        idx = r[0] if isinstance(r, (tuple, list)) else r
        return {0: "oui", 1: "tous", 2: "non", 3: "stop"}.get(idx, "non")
    except Exception:
        pass
    try:
        r = ui.prompt(msg + u"\n\nOui = modifier cet axe\nNon = passer cet axe\nAnnuler = arreter le script",
                      PromptChoice.YesNoCancel, PromptResult.Yes)
        if r == PromptResult.Yes:
            return "oui"
        if r == PromptResult.No:
            return "non"
        return "stop"
    except Exception:
        return None

dire("Reglages servo -> Machine Expert : projet " + PROJET)
dire("Mode : " + ("SIMULATION (rien n'est ecrit)" if SIMULATION else ("ECRITURE avec confirmation par axe" if DEMANDER else "ECRITURE sans confirmation")))
dire("")
n_mod = n_ok = n_err = n_absent = n_main = n_refus = 0
axes_liste = []    # (variateur, objet, parametres, noms des parametres regles) pour la liste de parametres
oui_a_tous = not DEMANDER
arret = HW_ARRET
for axe, alertes, liste in REGLAGES:
    nom_drv = PREFIXE + axe
    if arret:
        dire("%s : non traite (script arrete)" % nom_drv)
        continue
    trouves = par_nom.get(nom_drv, [])
    if not trouves:
        dire("%s : variateur introuvable dans le projet, axe ignore" % nom_drv)
        dire("")
        n_absent += 1
        continue
    dire(nom_drv)
    if len(trouves) > 1:
        dire("   ! %d appareils portent ce nom : le premier est utilise" % len(trouves))
    for a in alertes:
        dire("   ! alerte de l'outil : " + a)
    params = parametres(trouves[0])
    axes_liste.append((nom_drv, trouves[0], params, [x[0] for x in liste]))
    changements = []   # (parametre, ancien, nouveau, origine, note, objet)
    for nom_p, valeur, genre, origine in liste:
        if nom_p in INERTIES:
            valeur = valeur * FACTEUR_INERTIE
        nouveau = texte(valeur, genre)
        p = params.get(nom_p)
        if p is None:
            dire("   %-22s introuvable sur ce variateur" % nom_p)
            n_err += 1
            continue
        if genre == "enum":
            code = code_enum(p, valeur)
            if not code:
                dire("   %-22s choix '%s' introuvable dans la liste : a regler a la main" % (nom_p, valeur))
                n_main += 1
                continue
            nouveau = code
            origine = "%s = %s, %s" % (code, valeur, origine)
        ancien = safe(lambda: p.value, "")
        note = ""
        if nom_p in INERTIES:
            try:
                fa, fb = float(ancien), float(nouveau)
                if fa > 0 and fb > 0 and (fb / fa > 1000 or fa / fb > 1000):
                    note = "   <- ecart x1000 : verifier l'unite (FACTEUR_INERTIE)"
            except Exception:
                pass
        if identique(ancien, nouveau):
            dire("   %-22s %12s   inchange" % (nom_p, ancien))
            n_ok += 1
            continue
        if genre == "txt":
            try:
                float(ancien)
                dire("   %-22s %12s   valeur codee : a regler a la main sur '%s'" % (nom_p, ancien, nouveau))
                n_main += 1
                continue
            except Exception:
                pass
        changements.append((nom_p, ancien, nouveau, origine, note, p))
    if not changements:
        dire("   rien a modifier")
        dire("")
        continue
    if SIMULATION:
        for nom_p, ancien, nouveau, origine, note, p in changements:
            dire("   %-22s %12s -> %-12s [%s]%s" % (nom_p, ancien, nouveau, origine, note))
            n_mod += 1
        dire("")
        continue
    if not oui_a_tous:
        rep = demander(nom_drv, changements, alertes)
        if rep is None:
            dire("   ! pas de fenetre de confirmation disponible : rien n'est ecrit (mets DEMANDER = False pour ecrire sans confirmation)")
            arret = True
            dire("")
            continue
        if rep == "stop":
            dire("   arret demande : cet axe et les suivants ne sont pas modifies")
            arret = True
            dire("")
            continue
        if rep == "non":
            for nom_p, ancien, nouveau, origine, note, p in changements:
                dire("   %-22s %12s -> %-12s refuse, non ecrit" % (nom_p, ancien, nouveau))
                n_refus += 1
            dire("")
            continue
        if rep == "tous":
            oui_a_tous = True
    for nom_p, ancien, nouveau, origine, note, p in changements:
        try:
            relu = ecrire(p, nouveau)
            etat = "ecrit" if identique(relu, nouveau) else "ecrit, relu " + unicode(relu)
            dire("   %-22s %12s -> %-12s %s [%s]%s" % (nom_p, ancien, nouveau, etat, origine, note))
            n_mod += 1
        except Exception as ex:
            dire("   %-22s ERREUR d'ecriture : %s" % (nom_p, ex))
            n_err += 1
    dire("")
# ---------------------------------------------------------------- liste de parametres
# Cree (ou complete) une liste de parametres sous Application avec les axes
# traites et une colonne par parametre regle, pour voir les valeurs d'un coup.
# Creation : import d'un fichier .export avec un identifiant neuf.
# Mise a jour : la liste est sauvegardee, completee (variateurs et colonnes
# manquants, rien n'est retire) puis reimportee a la place de l'ancienne.
import re, time
TYPE_LISTE = "eb1d6d94-88e5-4ae1-a109-73cc8c5acc2e"
NL = u"\r\n"
MODELE_LISTE = NL.join([
    u'<ExportFile>',
    u'  <StructuredView Guid="{d9b2b2cc-ea99-4c3b-aa42-1e5c49e65b84}">',
    u'<Single xml:space="preserve" Type="{3daac5e4-660e-42e4-9cea-3711b98bfb63}" Method="IArchivable">',
    u'  <Null Name="Profile" />',
    u'  <List2 Name="EntryList">',
    u'    <Single Type="{6198ad31-4b98-445c-927f-3258a0e82fe3}" Method="IArchivable">',
    u'      <Single Name="IsRoot" Type="bool">True</Single>',
    u'      <Single Name="MetaObject" Type="{81297157-7ec9-45ce-845e-84cab2b88ade}" Method="IArchivable">',
    u'        <Single Name="Guid" Type="System.Guid">%(guid)s</Single>',
    u'        <Single Name="ParentGuid" Type="System.Guid">%(parent)s</Single>',
    u'        <Single Name="Name" Type="string">%(nom)s</Single>',
    u'        <Dictionary Type="{2c41fa04-1834-41c1-816e-303c7aa2c05b}" Name="Properties" />',
    u'        <Single Name="TypeGuid" Type="System.Guid">eb1d6d94-88e5-4ae1-a109-73cc8c5acc2e</Single>',
    u'        <Null Name="EmbeddedTypeGuids" />',
    u'        <Single Name="Timestamp" Type="long">%(ts)s</Single>',
    u'      </Single>',
    u'      <Single Name="Object" Type="{eb1d6d94-88e5-4ae1-a109-73cc8c5acc2e}" Method="IArchivable">',
    u'        %(devices)s',
    u'        %(colonnes)s',
    u'      </Single>',
    u'      <Single Name="ParentSVNodeGuid" Type="System.Guid">%(parent)s</Single>',
    u'      <Array Name="Path" Type="string">',
    u'%(path)s',
    u'      </Array>',
    u'      <Single Name="Index" Type="int">-1</Single>',
    u'    </Single>',
    u'  </List2>',
    u'  <Null Name="ProfileName" />',
    u'</Single>  </StructuredView>',
    u'</ExportFile>', u''])

def xml_txt(s):
    return unicode(s).replace(u"&", u"&amp;").replace(u"<", u"&lt;").replace(u">", u"&gt;")

def xml_brut(s):
    return unicode(s).replace(u"&lt;", u"<").replace(u"&gt;", u">").replace(u"&amp;", u"&")

def nom_de(o):
    return unicode(safe(lambda: o.get_name(), u"?"))

def guid_de(o):
    return unicode(safe(lambda: o.guid, u"")).strip(u"{}").lower()

def tous_objets(obj, res):
    for e in safe(lambda: list(obj.get_children(False)), []):
        res.append(e)
        tous_objets(e, res)

BALISE = re.compile(r"<(/?)([A-Za-z0-9_:]+)\b[^>]*?(/?)>")
def fin_element(texte, debut):
    prof = 0
    for m in BALISE.finditer(texte, debut):
        if m.group(1):
            prof -= 1
        elif not m.group(3):
            prof += 1
        if prof == 0:
            return m.end()
    return -1

def enfants_xml(texte, debut, fin):
    res = []
    i = debut
    while True:
        m = BALISE.search(texte, i, fin)
        if m is None or m.group(1):
            break
        f = m.end() if m.group(3) else fin_element(texte, m.start())
        if f < 0 or f > fin:
            break
        res.append((m.start(), f))
        i = f
    return res

def bloc_liste2(texte, nom):
    m = re.search(r'<List2 Name="%s"\s*(/?)>' % nom, texte)
    if m is None:
        return None
    if m.group(1):
        return (m.end(), m.end(), m.start(), m.end())
    f = fin_element(texte, m.start())
    return (m.end(), f - len("</List2>"), m.start(), f)

def entree_xml(pid, colonne):
    return NL.join([
        u'              <Single Type="{432056a4-5545-471b-ad12-232a86744144}" Method="IArchivable">',
        u'                <Single Name="ParameterId" Type="long">%d</Single>' % pid,
        u'                <Single Name="ParameterName" Type="string">%s</Single>' % xml_txt(colonne),
        u'                <Null Name="ComponentName" />',
        u'              </Single>'])

def entrees_pour(params, colonnes, deja=()):
    res = []
    for c in colonnes:
        if c in deja:
            continue
        p = params.get(c.split(u".", 1)[1] if u"." in c else c)
        pid = safe(lambda: int(p.id), None) if p is not None else None
        if pid is not None:
            res.append(entree_xml(pid, c))
    return res

def device_xml(guid, nom, entrees):
    if entrees:
        par = u'<List2 Name="Parameters">' + NL + NL.join(entrees) + NL + u'            </List2>'
    else:
        par = u'<List2 Name="Parameters" />'
    return NL.join([
        u'          <Single Type="{a8413734-d35f-4255-9e08-233d5b7901a6}" Method="IArchivable">',
        u'            <Single Name="Guid" Type="System.Guid">%s</Single>' % guid,
        u'            <Single Name="Name" Type="string">%s</Single>' % xml_txt(nom),
        u'            ' + par,
        u'          </Single>'])

def devices_xml(blocs):
    return u'<List2 Name="Devices">' + NL + NL.join(blocs) + NL + u'        </List2>'

def colonnes_xml(colonnes):
    return (u'<List2 Name="ParameterNames">' + NL +
            NL.join([u'          <Single Type="string">%s</Single>' % xml_txt(c) for c in colonnes]) +
            NL + u'        </List2>')

def horodatage():
    try:
        import System
        return unicode(System.DateTime.Now.Ticks)
    except Exception:
        import datetime
        d = datetime.datetime.now() - datetime.datetime(1, 1, 1)
        return unicode((d.days * 86400 + d.seconds) * 10000000 + d.microseconds * 10)

def nouveau_guid():
    try:
        import System
        return unicode(System.Guid.NewGuid().ToString()).lower()
    except Exception:
        import uuid
        return unicode(uuid.uuid4())

def confirmer(msg):
    ui = safe(lambda: system.ui, None)
    if ui is None:
        return None
    try:
        r = ui.choose(msg, ["Oui, creer / completer la liste", "Non"])
        idx = r[0] if isinstance(r, (tuple, list)) else r
        return idx == 0
    except Exception:
        pass
    try:
        return ui.prompt(msg, PromptChoice.YesNoCancel, PromptResult.Yes) == PromptResult.Yes
    except Exception:
        return None

def lire_fichier(chemin):
    with codecs.open(chemin, "r", "utf-8-sig") as f:
        return f.read()

def ecrire_fichier(chemin, texte):
    with codecs.open(chemin, "w", "utf-8") as f:
        f.write(texte)

def liste_parametres():
    nom = LISTE_PARAMETRES
    if not axes_liste:
        dire("Liste %s : aucun variateur traite, liste non creee" % nom)
        return
    # colonnes "Section.Nom" dans l'ordre des reglages
    colonnes = []
    for nom_drv, dev, params, noms in axes_liste:
        for n in noms:
            p = params.get(n)
            if p is None:
                continue
            sec = unicode(safe(lambda: p.section, u"") or u"").strip()
            c = (sec + u"." + n) if sec else n
            if c not in colonnes:
                colonnes.append(c)
    axes = []
    vus = set()
    for nom_drv, dev, params, noms in axes_liste:
        g = guid_de(dev)
        if g and g not in vus:
            vus.add(g)
            axes.append((g, nom_drv, params))
    tout = []
    tous_objets(projet, tout)
    existante = None
    for o in tout:
        if nom_de(o) == nom and unicode(safe(lambda: o.type, u"")).strip(u"{}").lower() == TYPE_LISTE:
            existante = o
            break
    if existante is not None:
        app = safe(lambda: existante.parent)
    else:
        apps = [o for o in tout if safe(lambda: o.is_application, False)]
        app = apps[0] if apps else None
    if app is None:
        dire("Liste %s : objet Application introuvable, liste non creee" % nom)
        return
    dossier = os.path.dirname(FICHIER_RAPPORT)
    date = time.strftime("%Y%m%d_%H%M%S")
    if existante is None:
        chemin = []
        x = app
        while x is not None:
            n = safe(lambda: x.get_name(), None)
            if n is None:
                break
            chemin.insert(0, n)
            x = safe(lambda: x.parent, None)
        texte = MODELE_LISTE % {
            "guid": nouveau_guid(), "parent": guid_de(app), "nom": xml_txt(nom), "ts": horodatage(),
            "devices": devices_xml([device_xml(g, n, entrees_pour(params, colonnes)) for g, n, params in axes]),
            "colonnes": colonnes_xml(colonnes),
            "path": NL.join([u'        <Single Type="string">%s</Single>' % xml_txt(n) for n in chemin])}
        msg = (u"Liste de parametres %s : creation sous %s\n%d variateur(s), %d colonne(s) :\n%s"
               % (nom, nom_de(app), len(axes), len(colonnes), u", ".join(colonnes)))
    else:
        sauvegarde = os.path.join(dossier, u"sauvegarde_%s_%s.export" % (nom, date))
        try:
            projet.export_native([existante], sauvegarde, True)
            texte = lire_fichier(sauvegarde)
        except Exception as ex:
            dire("Liste %s : sauvegarde impossible (%s), liste non modifiee" % (nom, ex))
            return
        c_dev = bloc_liste2(texte, "Devices")
        c_col = bloc_liste2(texte, "ParameterNames")
        if c_dev is None or c_col is None or c_col[2] < c_dev[3]:
            dire("Liste %s : format inattendu, liste non modifiee (sauvegarde : %s)" % (nom, sauvegarde))
            return
        anciennes = [xml_brut(c) for c in re.findall(r'<Single Type="string">([^<]*)</Single>', texte[c_col[0]:c_col[1]])]
        toutes = anciennes + [c for c in colonnes if c not in anciennes]
        par_guid = dict((g, params) for g, n, params in axes)
        blocs = []
        presents = set()
        n_entrees = 0
        for b0, b1 in enfants_xml(texte, c_dev[0], c_dev[1]):
            b = texte[b0:b1]
            m = re.search(r'<Single Name="Guid" Type="System.Guid">([^<]*)</Single>', b)
            g = m.group(1).strip(u"{}").lower() if m else u""
            presents.add(g)
            if g in par_guid:
                deja = [xml_brut(x) for x in re.findall(r'<Single Name="ParameterName" Type="string">([^<]*)</Single>', b)]
                ajout = entrees_pour(par_guid[g], toutes, deja)
                if ajout:
                    n_entrees += len(ajout)
                    if u'<List2 Name="Parameters" />' in b:
                        b = b.replace(u'<List2 Name="Parameters" />', u'<List2 Name="Parameters">' + NL + NL.join(ajout) + NL + u'            </List2>', 1)
                    else:
                        k = b.rfind(u"</List2>")
                        j = b.rfind(u"\n", 0, k) + 1
                        b = b[:j] + NL.join(ajout) + NL + b[j:]
            blocs.append(u"          " + b)
        nouveaux = [(g, n, params) for g, n, params in axes if g not in presents]
        for g, n, params in nouveaux:
            blocs.append(device_xml(g, n, entrees_pour(params, toutes)))
        n_col = len(toutes) - len(anciennes)
        if not nouveaux and not n_col and not n_entrees:
            dire("Liste %s : deja a jour (%d variateur(s), %d colonne(s))" % (nom, len(presents), len(toutes)))
            return
        texte = (texte[:c_dev[2]] + devices_xml(blocs) + texte[c_dev[3]:c_col[2]] +
                 colonnes_xml(toutes) + texte[c_col[3]:])
        msg = (u"Liste de parametres %s : mise a jour\n+%d variateur(s), +%d colonne(s), %d case(s) ajoutee(s).\n"
               u"Rien n'est retire. Sauvegarde : %s\nFerme l'onglet de la liste s'il est ouvert."
               % (nom, len(nouveaux), n_col, n_entrees + sum([len(entrees_pour(p, toutes)) for g, n, p in nouveaux]), sauvegarde))
    if DEMANDER and not oui_a_tous:
        r = confirmer(msg)
        if r is None:
            dire("Liste %s : pas de fenetre de confirmation, liste non modifiee" % nom)
            return
        if not r:
            dire("Liste %s : refusee, non modifiee" % nom)
            return
    fichier = os.path.join(dossier, u"liste_%s_%s.export" % (nom, date))
    try:
        ecrire_fichier(fichier, texte)
        app.import_native(fichier)
    except Exception as ex:
        dire("Liste %s : ERREUR d'import (%s). Fichier : %s" % (nom, ex, fichier))
        return
    finale = None
    for o in safe(lambda: list(app.get_children(False)), []):
        if nom_de(o) == nom:
            finale = o
    if finale is None:
        dire("Liste %s : import accepte mais liste introuvable sous %s" % (nom, nom_de(app)))
        return
    nd = len(safe(lambda: list(finale.devices), []))
    nc = len(safe(lambda: list(finale.parameters), []))
    dire("Liste %s %s sous %s : %d variateur(s), %d colonne(s). Ouvre-la pour voir les valeurs."
         % (nom, "creee" if existante is None else "mise a jour", nom_de(app), nd, nc))

# les axes crees par le hardware mais sans reglages vont aussi dans la liste
noms_liste = []
for _r in REGLAGES:
    for _x in _r[2]:
        if _x[0] not in noms_liste:
            noms_liste.append(_x[0])
if not noms_liste:
    noms_liste = ["FeedConstant", "GearIn", "GearOut", "J_Load", "J_Gear", "UserCurrentLimit", "DriveStopCurrentLimit",
                  "ControllerStopDec", "ControllerStopJerk", "StopTimeLim", "UserDefinedStopMode", "Vel_P_Gain", "Vel_I_Gain"]
deja_liste = set([_x[0] for _x in axes_liste])
for _x in AXES_HW:
    _axe = _x[0]
    _n = PREFIXE + _axe
    if _n in deja_liste:
        continue
    _d = [o for o in safe(lambda: list(projet.find(_n, True)), []) if safe(lambda: o.is_device, False)]
    if _d:
        axes_liste.append((_n, _d[0], parametres(_d[0]), noms_liste))

if LISTE_PARAMETRES:
    if SIMULATION:
        dire("Liste %s : non creee en simulation" % LISTE_PARAMETRES)
    elif arret:
        dire("Liste %s : non traitee (script arrete)" % LISTE_PARAMETRES)
    else:
        try:
            liste_parametres()
        except Exception as ex:
            dire("Liste %s : ERREUR %s" % (LISTE_PARAMETRES, ex))
    dire("")

# @@TRACES@@

for axe, raison in AXES_IGNORES:
    dire("%s : reglages non generes par l'outil (%s)" % (PREFIXE + axe, raison))
if AXES_IGNORES:
    dire("")
dire("Bilan : %d %s, %d inchanges, %d refuses, %d a regler a la main, %d erreurs, %d variateurs introuvables"
     % (n_mod, "a modifier" if SIMULATION else "modifies", n_ok, n_refus, n_main, n_err, n_absent))
if SIMULATION:
    dire("Rien n'a ete modifie (SIMULATION = True). Mets SIMULATION = False pour ecrire.")
else:
    dire("Termine. Verifie quelques valeurs dans Machine Expert puis enregistre le projet.")
try:
    with codecs.open(FICHIER_RAPPORT, "w", "utf-8") as f:
        f.write(u"\n".join(lignes))
    print("\nRapport ecrit : " + FICHIER_RAPPORT)
except Exception as ex:
    print("\nRapport non ecrit (%s)" % ex)
`;
