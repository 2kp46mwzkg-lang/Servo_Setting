/* Réglages Servo — modèle Python inséré tel quel dans le script Machine Expert généré (partie HARDWARE : création des appareils, Node-ID, heartbeat, Optional device).
   C'est du Python (IronPython 2.7 de Machine Expert) entre les deux accents graves ` : ne pas y mettre d'accent grave ni de ${ ,
   et garder la première et la dernière ligne (const … = String.raw` … `;). Les constantes MATERIEL, AXES_HW, HEARTBEAT_MS… sont écrites par app.js en tête du script. */
const HW_CORE = String.raw`# ================================================================ HARDWARE
# Cree les appareils qui manquent (jamais de suppression), dans l'ordre :
# materiel du projet (CAN, ATV320, alimentations, TM5, Ethernet/IP), puis
# pour chaque axe : codeur LE_, variateur DRV_, carte IO_.
# Ensuite il ecrit les reglages du materiel : Node-ID, Optional device et
# parametres des ATV320, modes de la carte IO, masques de diagnostic.
import re as hw_re
import os as hw_os
import math as hw_math
import codecs as hw_codecs

def hw_find(nom):
    return [o for o in safe(lambda: list(projet.find(nom, True)), []) if safe(lambda: o.is_device, False)]

def hw_params_directs(dev):
    res = {}
    for conn in safe(lambda: list(dev.connectors), []):
        for p in safe(lambda: list(conn.host_parameters), []):
            n = safe(lambda: p.name, "")
            if n and n not in res:
                res[n] = p
    return res

def hw_trouver(ps, cle):
    """Nom exact, sinon code isole dans le nom (ACC -> "Acceleration (ACC)"). Renvoie (p, nom) ou (None, [candidats])."""
    if cle in ps:
        return ps[cle], cle
    bas = [n for n in ps if unicode(n).strip().lower() == unicode(cle).strip().lower()]
    if len(bas) == 1:
        return ps[bas[0]], bas[0]
    rx = hw_re.compile(u"(^|[^A-Za-z0-9_])" + hw_re.escape(unicode(cle)) + u"($|[^A-Za-z0-9_])")
    cands = [n for n in ps if rx.search(unicode(n))]
    if len(cands) > 1:
        par = [n for n in cands if (u"(" + unicode(cle) + u")") in unicode(n)]
        cands = par if len(par) == 1 else cands
    if len(cands) == 1:
        return ps[cands[0]], cands[0]
    return None, cands

def hw_choix(p):
    return [(unicode(safe(lambda: it.value, u"")), unicode(safe(lambda: it.visible_name, u""))) for it in safe(lambda: list(p.allowed_values), [])]

def hw_code(p, valeur):
    """Valeur a ecrire : pour une liste deroulante, le code du choix (texte affiche, debut du texte ou code)."""
    choix = hw_choix(p)
    if not choix:
        return unicode(valeur)
    v = unicode(valeur).strip().lower()
    for code, vis in choix:
        if vis.strip().lower() == v or vis.split(u" / ")[0].strip().lower() == v:
            return code
    for code, vis in choix:
        if code.strip().lower() == v:
            return code
    return None

def hw_param(dev, nom_p, valeur, recursif=True):
    ps = parametres(dev) if recursif else hw_params_directs(dev)
    p, trouve = hw_trouver(ps, nom_p)
    if p is None:
        if trouve:
            return "ambigu (%s)" % u", ".join(trouve[:4])
        return "introuvable"
    code = hw_code(p, valeur)
    if code is None:
        return "valeur %s refusee (choix : %s)" % (valeur, u" | ".join([vis for c, vis in hw_choix(p)][:8]))
    try:
        if identique(safe(lambda: p.value, ""), code):
            return "inchange"
        ecrire(p, code)
        return "ecrit"
    except Exception as ex:
        return "erreur : %s" % ex

def hw_params_liste(dev):
    """Tous les parametres hotes de l'appareil (sans dedoublonnage par nom), dans l'ordre"""
    res = []
    for conn in safe(lambda: list(dev.connectors), []):
        for p in safe(lambda: list(conn.host_parameters), []):
            res.append(p)
    return res

def hw_struct(v):
    """'{16#80000201, 16#FF, {FALSE, FALSE}, 0, 0}' -> liste des elements de premier niveau (texte)"""
    s = unicode(v if v is not None else u"").strip()
    if not (s.startswith(u"{") and s.endswith(u"}")):
        return None
    out, buf, prof = [], u"", 0
    for ch in s[1:-1]:
        if ch == u"{":
            prof += 1
        elif ch == u"}":
            prof -= 1
        if ch == u"," and prof == 0:
            out.append(buf.strip())
            buf = u""
        else:
            buf += ch
    out.append(buf.strip())
    return out

def hw_struct_txt(elems):
    return u"{" + u", ".join(elems) + u"}"

# "General Options" (id 2) de l'esclave CANopen = 5 drapeaux : Write DCF, Create all SDOs, Optional Device, Not initialize, Reset Node
OPT_FLAGS = [u"FLAG_DCF_Write", u"FLAG_CreateAllSDOs", u"FLAG_Optional", u"FLAG_NotInitialize", u"FLAG_ResetNode"]
OPT_INDEX = 2

def hw_versions_connues(typ, ident, tous_devs):
    """Versions d'un type d'appareil (type + identifiant) connues : dans le projet ouvert, puis dans le depot d'appareils de Machine Expert"""
    vus = []
    for d in tous_devs:
        i = safe(lambda: d.get_device_identification())
        if i is not None and unicode(safe(lambda: i.type, u"")) == unicode(typ) and unicode(safe(lambda: i.id, u"")).strip().lower() == unicode(ident).strip().lower():
            v = unicode(safe(lambda: i.version, u""))
            if v and v not in vus:
                vus.append(v)
    try:
        for dd in device_repository.get_all_devices():
            i = safe(lambda: dd.device_id, None)
            if i is None:
                continue
            if unicode(safe(lambda: i.type, u"")) == unicode(typ) and unicode(safe(lambda: i.id, u"")).strip().lower() == unicode(ident).strip().lower():
                v = unicode(safe(lambda: i.version, u""))
                if v and v not in vus:
                    vus.append(v)
    except Exception:
        pass
    return vus

def hw_sous_elements(p):
    """Sous-elements d'un parametre structure ou bitfield (ScriptCompoundDataElement) : plusieurs acces essayes"""
    for f in (lambda: list(p), lambda: list(p.sub_elements), lambda: list(p.elements), lambda: list(p.get_sub_elements()), lambda: [p[k] for k in range(len(p))]):
        try:
            l = f()
            if l:
                return l
        except Exception:
            pass
    return []

def hw_optionnel(dev, oui, nom=u""):
    """Case « Optional device » de l'esclave CANopen : 3e drapeau du parametre General Options."""
    ps = parametres(dev)
    p = ps.get(u"General Options")
    if p is None:
        cands = [n for n in ps if hw_re.search(u"general.*options|optional|optionnel", unicode(n), hw_re.I)]
        if len(cands) == 1:
            p = ps[cands[0]]
    if p is None:
        return "parametre General Options introuvable (lance explorer_materiel.py et envoie le rapport)"
    cur = unicode(safe(lambda: p.value, u""))
    elems = hw_struct(cur)
    if elems is None or len(elems) <= OPT_INDEX:
        # parametre simple (autre devdesc) : on ecrit un booleen
        voulu = u"TRUE" if oui else u"FALSE"
        if identique(cur, voulu):
            return "inchange"
        try:
            ecrire(p, voulu)
            return "ecrit"
        except Exception as ex:
            return "erreur %s" % ex
    voulu = u"TRUE" if oui else u"FALSE"
    if elems[OPT_INDEX].strip().upper() == voulu:
        return "inchange"
    # bitfield : chaque drapeau est un sous-element (ScriptCompoundDataElement) ; on ecrit le drapeau Optional seul
    subs = hw_sous_elements(p)
    if subs:
        cible = None
        for se in subs:
            txt = unicode(safe(lambda: se.identifier, u"")) + u" " + unicode(safe(lambda: se.visible_name, u"")) + u" " + unicode(safe(lambda: se.name, u""))
            if hw_re.search(u"optional", txt, hw_re.I):
                cible = se
                break
        if cible is None and len(subs) > OPT_INDEX:
            cible = subs[OPT_INDEX]
        if cible is not None:
            derniere = None
            for val in (voulu, bool(oui), 1 if oui else 0, u"1" if oui else u"0"):
                try:
                    cible.value = val
                    relu = unicode(safe(lambda: cible.value, u"")).strip().upper()
                    if relu in (voulu, u"1" if oui else u"0"):
                        return "ecrit"
                    derniere = u"valeur relue %s" % relu
                except Exception as ex:
                    derniere = ex
            membres = u", ".join([a for a in dir(cible) if not a.startswith("_")][:40])
            return "non ecrit : drapeau Optional trouve (%s) mais refuse (%s). Membres du drapeau : %s" % (unicode(safe(lambda: cible.visible_name, u"?")), derniere, membres)
    try:
        elems[OPT_INDEX] = voulu
        ecrire(p, hw_struct_txt(elems))
        relu = hw_struct(unicode(safe(lambda: p.value, u"")))
        if relu is not None and len(relu) > OPT_INDEX and relu[OPT_INDEX].strip().upper() == voulu:
            return "ecrit"
        raise Exception(u"valeur relue %s" % unicode(safe(lambda: p.value, u"")))
    except Exception as ex:
        # l'API n'accepte pas la structure : on ne reimporte jamais un export d'appareil (Machine Expert cree un doublon au lieu de remplacer)
        membres = u", ".join([a for a in dir(p) if not a.startswith("_")][:40])
        return "non ecrit, l'API refuse la structure General Options (%s) : coche la case a la main (ATV320 > General > Optional device). Membres du parametre : %s" % (ex, membres)

def hw_cobids(dev, nom, node):
    """Apres un changement de Node-ID : COB-ID des PDO et de l'EMCY recalcules d'apres leur formule '$NODEID+16#...'. Renvoie (n_ecrits, erreurs)."""
    lp = hw_params_liste(dev)
    n_ok, err = 0, []
    for k, p in enumerate(lp):
        n = unicode(safe(lambda: p.name, u""))
        if not n.lower().startswith(u"generic") or u"cobid" not in n.lower().replace(u" ", u"").replace(u"-", u""):
            continue
        f = unicode(safe(lambda: p.value, u"")).strip().strip(u"'\"")
        m = hw_re.match(u"\\$NODEID\\s*\\+\\s*16#([0-9A-Fa-f]+)$", f)
        if not m or k == 0:
            continue
        base = int(m.group(1), 16)
        voulu = u"16#%08X" % (base + int(node))
        pid = safe(lambda: p.id, None)
        q = None
        if pid is not None:
            for x in lp:
                if safe(lambda: x.id, None) == pid - 1:
                    q = x
                    break
        if q is None:
            q = lp[k - 1]
        qn = unicode(safe(lambda: q.name, u""))
        elems = hw_struct(unicode(safe(lambda: q.value, u"")))
        if elems is None:
            continue
        idx = [i for i, e in enumerate(elems) if e.strip().upper().startswith(u"16#")]
        if not idx:
            continue
        i = idx[0]
        try:
            if int(elems[i].strip()[3:], 16) == base + int(node):
                continue
        except Exception:
            pass
        ancien = elems[i]
        elems[i] = voulu
        try:
            ecrire(q, hw_struct_txt(elems))
            relu = hw_struct(unicode(safe(lambda: q.value, u"")))
            if relu is None or int(relu[i].strip()[3:], 16) != base + int(node):
                raise Exception(u"valeur relue %s" % unicode(safe(lambda: q.value, u"")))
            n_ok += 1
        except Exception as ex:
            err.append(u"%s : %s -> %s refuse (%s)" % (qn, ancien, voulu, ex))
    return (n_ok, err)

def hw_sous(e, cible, prof):
    """Descend l'arbre sous e (profondeur max prof) : premier noeud nomme cible ou BC_..."""
    pile = [(f, 1) for f in safe(lambda: list(e.get_children(False)), [])]
    while pile:
        x, d = pile.pop(0)
        n = unicode(safe(lambda: x.get_name(), u""))
        if n == cible or n.startswith(u"BC_") or n.upper().startswith(cible.upper().split(u"_")[0] + u"_"):
            return x
        if d < prof:
            pile.extend([(g, d + 1) for g in safe(lambda: list(x.get_children(False)), [])])
    return None

def hw_parent(par, cible):
    """Parent BC_... (noeud fixe d'une tete de bus TM5NS31, ex. BC_TM5NS31) : cherche sous la tete de l'appareil,
    sinon parmi tous les noeuds BC_ du projet celui qui est sous cette tete, sinon le seul BC_ du projet."""
    r = hw_sous(par, cible, 4)
    if r is not None:
        return r
    nom_tete = unicode(safe(lambda: par.get_name(), u""))
    cands = [o for o in safe(lambda: list(projet.find(cible, True)), [])]
    if not cands:
        for o in tous_devices():
            if unicode(safe(lambda: o.get_name(), u"")).startswith(u"BC_"):
                cands.append(o)
    def sous_tete(o):
        x = safe(lambda: o.parent)
        for _ in range(6):
            if x is None:
                return False
            if unicode(safe(lambda: x.get_name(), u"")) == nom_tete:
                return True
            x = safe(lambda: x.parent)
        return False
    bons = [o for o in cands if sous_tete(o)]
    if len(bons) == 1:
        return bons[0]
    if len(cands) == 1:
        return cands[0]
    enfants = [unicode(safe(lambda: f.get_name(), u"?")) for f in safe(lambda: list(par.get_children(False)), [])]
    dire("   %s : enfants trouves sous la tete = %s ; noeuds %s dans le projet = %d" % (nom_tete, u", ".join(enfants) or u"(aucun)", cible, len(cands)))
    return None

def tous_devices():
    res = []
    def rec(o):
        for e in safe(lambda: list(o.get_children(False)), []):
            res.append(e)
            rec(e)
    rec(projet)
    return res

def hw_confirmer(msg):
    ui = safe(lambda: system.ui, None)
    if ui is None:
        return None
    try:
        r = ui.choose(msg, ["Oui, creer ces appareils", "Non, ne rien creer (passer aux reglages)", "Arreter le script"])
        idx = r[0] if isinstance(r, (tuple, list)) else r
        return {0: "oui", 1: "non", 2: "stop"}.get(idx, "non")
    except Exception:
        pass
    try:
        r = ui.prompt(msg + u"\n\nOui = creer\nNon = ne rien creer\nAnnuler = arreter le script", PromptChoice.YesNoCancel, PromptResult.Yes)
        if r == PromptResult.Yes:
            return "oui"
        if r == PromptResult.No:
            return "non"
        return "stop"
    except Exception:
        return None

def hw_apres_creation(dev, nom, typ, role, axe):
    if role == "codeur":
        for k, v in (("GearIn", 1), ("GearOut", 1), ("FeedConstant", "360.0")):
            hw_param(dev, k, v, False)
    if role == "carte":
        enfants = safe(lambda: list(dev.get_children(False)), [])
        if len(enfants) >= 3:
            for prefixe, groupe in (("TP_", enfants[0]), ("DQ_", enfants[1]), ("DI_", enfants[2])):
                for i, voie in enumerate(safe(lambda: list(groupe.get_children(False)), [])):
                    safe(lambda: voie.rename(prefixe + axe + "_" + str(i)))
        else:
            dire("   %s : %d groupe(s) d'E/S au lieu de 3, voies non renommees" % (nom, len(enfants)))

def hw_masques_sorties(dev):
    for groupe in safe(lambda: list(dev.get_children(False)), []):
        if unicode(safe(lambda: groupe.get_name(), "")).startswith("DQG_DigitalOut"):
            ps = hw_params_directs(groupe)
            for k in ("DiagMask", "OpenloadDiagMsk", "OverloadDiagMsk"):
                if k in ps:
                    hw_param(groupe, k, 0, False)

# ---- Heartbeat des ATV320 : Producer time = HEARTBEAT_MS arrondi au multiple superieur du cycle de la tache TACHE_CAN
HW_CYCLE = []      # (valeur, origine) deja annoncees dans le rapport
HB_RE = hw_re.compile(u"producer.*time|heartbeat.*(time|producer)|hb.?time", hw_re.I)

def hw_duree_ms(v):
    """t#2ms, 20 ms, 2000 (us) -> millisecondes ; None si illisible"""
    if v is None:
        return None
    s = unicode(v).strip().lower()
    m = hw_re.search(u"(\\d+(?:[.,]\\d+)?)\\s*(ms|us|\u00b5s|s)?", s)
    if not m:
        return None
    x = float(m.group(1).replace(u",", u"."))
    u = m.group(2)
    if u == u"ms":
        return x
    if u in (u"us", u"\u00b5s"):
        return x / 1000.0
    if u == u"s":
        return x * 1000.0
    return x / 1000.0 if x >= 1000 else x

def hw_dossier():
    d = hw_os.path.dirname(globals().get("FICHIER_RAPPORT", u"")) or hw_os.path.join(hw_os.path.expanduser(u"~"), u"Documents")
    if not hw_os.path.isdir(d):
        try:
            hw_os.makedirs(d)
        except Exception:
            pass
    return d

HW_EXPORTS = {}
def hw_export_texte(dev, nom):
    """Export natif de l'objet (une fois par objet), lu puis efface ; texte, None si impossible.
    Lecture seule : un export d'appareil n'est jamais reimporte (Machine Expert cree un doublon au lieu de remplacer).
    Le fichier precedent est supprime avant l'export, sinon Machine Expert demande s'il faut l'ecraser."""
    if nom in HW_EXPORTS:
        return HW_EXPORTS[nom]
    p = hw_os.path.join(hw_dossier(), u"_lecture_%s.export" % nom)
    try:
        if hw_os.path.exists(p):
            hw_os.remove(p)
        projet.export_native([dev], p, False)
        with hw_codecs.open(p, "r", "utf-8-sig") as f:
            HW_EXPORTS[nom] = f.read()
    except Exception:
        HW_EXPORTS[nom] = None
    try:
        hw_os.remove(p)
    except Exception:
        pass
    return HW_EXPORTS[nom]

def hw_tache_bus(dev, nom):
    """Nom de la tache du cycle de bus (BusCycleTask) : lue sur le parent de l'appareil (CAN_Manager, un seul export, petit),
    puis en remontant si « parent » ; un ATV320 qui a sa propre tache differente de celle du CAN_Manager est rare. None si illisible."""
    d = safe(lambda: dev.parent)
    n = unicode(safe(lambda: d.get_name(), u"")) if d is not None else u""
    prof = 0
    while d is not None and prof < 4:
        t = hw_export_texte(d, n)
        if t is None:
            return None
        m = hw_re.search(u'<Single Name="BusCycleTask" Type="string">([^<]*)</Single>', t)
        if m is None:
            return None
        if m.group(1).strip():
            return m.group(1).strip()
        d = safe(lambda: d.parent)
        n = unicode(safe(lambda: d.get_name(), u"")) if d is not None else u""
        prof += 1
    return None

HW_TACHES = {}
def hw_cycle_tache(tache):
    """Cycle (ms) de la tache : propriete interval (+ unite lue dans son export). (ms, origine) ou (None, raison)"""
    if tache in HW_TACHES:
        return HW_TACHES[tache]
    res = (None, u"tache %s introuvable dans le projet" % tache)
    objs = safe(lambda: list(projet.find(tache, True)), [])
    if objs:
        t = objs[0]
        unite = u""
        try:
            texte = hw_export_texte(t, u"tache_" + tache)
            if texte is None:
                raise Exception(u"export impossible")
            m = hw_re.search(u'<Single Name="Interval"[^>]*>\\s*<Single Name="Time"[^>]*>([^<]*)</Single>\\s*<Single Name="Unit"[^>]*>([^<]*)</Single>', texte)
            if m:
                res = (hw_duree_ms(m.group(1).strip() + u" " + m.group(2).strip()), u"tache %s : %s %s" % (tache, m.group(1).strip(), m.group(2).strip()))
                unite = m.group(2).strip()
        except Exception:
            pass
        if res[0] is None:
            v = safe(lambda: t.interval, None)
            ms = hw_duree_ms((unicode(v) + u" " + unite) if v is not None else None)
            res = (ms, u"tache %s, interval = %s %s" % (tache, v, unite)) if ms else (None, u"cycle de la tache %s illisible" % tache)
    HW_TACHES[tache] = res
    return res

def hw_cycle_ms(dev, nom):
    """Cycle de bus de l'appareil : sa tache BusCycleTask (ou celle du parent), sinon TACHE_CAN. (ms, origine)"""
    tache = hw_tache_bus(dev, nom)
    if not tache:
        tache = globals().get("TACHE_CAN", u"")
        if not tache:
            return (None, u"tache de cycle de bus non lue et TACHE_CAN vide")
    return hw_cycle_tache(tache)

def hw_heartbeat(dev, nom):
    """Ecrit le Producer time (heartbeat) de l'ATV320. Renvoie (etat, valeur)."""
    hb = globals().get("HEARTBEAT_MS", 0)
    if not hb:
        return ("inchange", 0)
    ms, ou = hw_cycle_ms(dev, nom)
    if ms:
        n = int(hw_math.floor(float(hb) / ms + 0.5))   # multiple le plus proche (ex. 200 ms, cycle 15 ms -> 13 x 15 = 195)
        if n < 1:
            n = 1
        val = int(round(n * ms))
        cle = (val, ou)
        if cle not in HW_CYCLE:
            HW_CYCLE.append(cle)
            dire(u"   Heartbeat ATV320 : Producer time %d ms = %d x cycle %s ms (%s)" % (val, n, (u"%g" % ms), ou))
    else:
        val = int(hb)
        if (val, ou) not in HW_CYCLE:
            HW_CYCLE.append((val, ou))
            dire(u"   Heartbeat ATV320 : cycle non lu (%s) : Producer time %d ms tel quel" % (ou, hb))
    # 1. parametre hote de l'appareil, si le devdesc l'expose
    cands = [n for n in parametres(dev) if HB_RE.search(unicode(n))]
    if len(cands) == 1:
        return (hw_param(dev, cands[0], val), val)
    return (u"parametre Heartbeat-Producer Time introuvable sur cet appareil : a regler a la main (ATV320 > General > Producer time %d)" % val, val)

HW_ECRITS = [0]
def hw_reglages(dev, nom, typ, params, role, axe=None):
    if typ == "CAN_Layer":
        safe(lambda: setattr(dev.connectors.by_id(1).host_parameters.by_id(2), "value", "3"))
    if role == "carte":
        absents = []
        for k, v in params:
            etat = hw_param(dev, k, v, False)
            if etat == "ecrit":
                HW_ECRITS[0] += 1
            elif etat == "introuvable":
                absents.append(k)
            elif etat != "inchange":
                dire("   %s : %s %s" % (nom, k, etat))
        if absents:
            dire("   %s : pas de %s sur cette carte (laisse tel quel)" % (nom, ", ".join(absents)))
        hw_masques_sorties(dev)
        return
    n_ok = 0
    for k, v in params:
        if k == "@optional":
            etat = hw_optionnel(dev, v, nom)
            k = "Optional device (%s) :" % ("oui" if v else "non")
        else:
            etat = hw_param(dev, k, v)
            if k == "Node-ID" and etat == "ecrit":
                nc, err = hw_cobids(dev, nom, v)
                if nc:
                    dire(u"   %s : Node-ID %s, COB-ID des PDO / EMCY recalcules (%d)" % (nom, v, nc))
                for e in err:
                    dire(u"   %s : COB-ID %s" % (nom, e))
        if etat == "ecrit":
            n_ok += 1
            HW_ECRITS[0] += 1
        elif etat != "inchange":
            dire("   %s : %s %s" % (nom, k, etat))
    if typ == "ATV320":
        etat, val = hw_heartbeat(dev, nom)
        if etat == "ecrit":
            n_ok += 1
            HW_ECRITS[0] += 1
            dire(u"   %s : Producer time (heartbeat) %d ms" % (nom, val))
        elif etat != "inchange":
            dire(u"   %s : Producer time (heartbeat) %s" % (nom, etat))
    if n_ok and typ != "CAN_Layer":
        dire("   %-28s %d reglage(s) ecrit(s)" % (nom, n_ok))

MODES_IO_DEFAUT = [("IO0_Mode", 1), ("IO1_Mode", 1), ("IO4_Mode", 0), ("IO5_Mode", 0)]

def hardware():
    global HW_ARRET
    dire("HARDWARE")
    plc = (hw_find("LMC_PacDrive") or [None])[0]
    if plc is None:
        dire("   automate LMC_PacDrive introuvable dans le projet : ajoute-le puis relance (rien n'est cree)")
        dire("")
        return
    ident = safe(lambda: plc.get_device_identification())
    plc_id = unicode(safe(lambda: ident.id, ""))
    plc_v = unicode(safe(lambda: ident.version, ""))
    plan = [(n, t, p, prm, "materiel", "") for n, t, p, prm in MATERIEL]
    for x in AXES_HW:
        axe, gamme, carte = x[0], x[1], x[2]
        codeur = x[3] if len(x) > 3 else True
        modes = x[4] if len(x) > 4 else MODES_IO_DEFAUT
        if codeur:
            plan.append(("LE_" + axe, "LE_Enc", CATALOGUE["LE_Enc"][4], [], "codeur", axe))
        plan.append((PREFIXE + axe, gamme, CATALOGUE[gamme][4], [], "variateur", axe))
        if carte:
            plan.append(("IO_" + axe, gamme + "_IO", PREFIXE + axe, modes, "carte", axe))
    # Appareil deja present sous un autre nom : meme parent, meme DeviceID (type + identifiant, module), nom non prevu par le plan
    noms_plan = set([x[0] for x in plan])
    equiv = {}
    def hw_ident(dev):
        i = safe(lambda: dev.get_device_identification())
        m = safe(lambda: dev.get_module_identification())
        return (unicode(safe(lambda: i.type, u"")), unicode(safe(lambda: i.id, u"")), unicode(safe(lambda: m.id, u"")) if m is not None else u"")
    def meme_type(dev, c):
        t, i, m = hw_ident(dev)
        cid = plc_id if c[1] == "plc_id" else unicode(c[1])
        return t == unicode(c[0]) and i.strip().lower() == cid.strip().lower() and (not c[3] or m.strip().lower() == unicode(c[3]).strip().lower())
    def hw_par(nom):
        # appareil par son nom, sinon son equivalent (present sous un autre nom)
        d = (hw_find(nom) or [None])[0]
        return d if d is not None else equiv.get(nom)
    def hw_node(dev):
        p = hw_params_directs(dev).get("Node-ID")
        return unicode(safe(lambda: p.value, u"")).strip() if p is not None else u""
    def hw_equiv(x):
        nom, typ, parent_nom, params = x[0], x[1], x[2], x[3]
        if typ not in CATALOGUE or nom in equiv:
            return equiv.get(nom)
        c = CATALOGUE[typ]
        par = hw_par(parent_nom)
        if par is None:
            return None
        node = [unicode(v).strip() for k, v in params if k == "Node-ID"]
        pris = set([unicode(safe(lambda: d.get_name(), u"")) for d in equiv.values()])
        for e in safe(lambda: list(par.get_children(False)), []):
            n = unicode(safe(lambda: e.get_name(), u""))
            if n in noms_plan or n in pris or not safe(lambda: e.is_device, False):
                continue
            if not meme_type(e, c):
                continue
            # esclave CANopen : meme reference ET meme Node-ID, sinon c'est un autre appareil
            if node:
                ne = hw_node(e)
                if ne and ne != node[0]:
                    continue
            equiv[nom] = e
            return e
        return None
    def present(x):
        if hw_find(x[0]):
            return True
        e = hw_equiv(x)
        if e is not None:
            n = unicode(safe(lambda: e.get_name(), u"?"))
            if RENOMMER_EXISTANTS:
                try:
                    e.rename(x[0])
                    dire("   %-28s deja present sous %s sous le nom %s (meme reference) : renomme %s" % (x[0], x[2], n, x[0]))
                except Exception as ex:
                    dire("   %-28s deja present sous %s sous le nom %s (meme reference) : renommage impossible (%s)" % (x[0], x[2], n, ex))
            else:
                dire("   %-28s deja present sous %s sous le nom %s (meme reference) : garde tel quel, non cree (RENOMMER_EXISTANTS = True pour le renommer)" % (x[0], x[2], n))
            return True
        return False
    # chaque ilot TM5 commence par sa carte TM5SPS3 (PS3 : alimente la tete et le bus TM5) ; PS1 / PS2 = segment de puissance, plus loin
    for k, x in enumerate(MATERIEL):
        if x[1] == "TM5NS31":
            enfants = [y for y in MATERIEL[k + 1:] if y[2] == x[0]]
            if not enfants or not unicode(enfants[0][1]).upper().startswith(u"TM5SPS3"):
                dire("   %-28s tete de bus sans carte TM5SPS3 (PS3) en premier : a corriger dans l'outil (Materiel du projet)" % x[0])
    absents = [x for x in plan if not present(x)]
    hors = [x for x in absents if x[1] not in CATALOGUE]
    a_creer = [x for x in absents if x[1] in CATALOGUE]
    dire("   %d appareil(s) prevu(s) : %d deja dans le projet, %d a creer" % (len(plan), len(plan) - len(absents), len(a_creer)))
    for x in hors:
        dire("   %-28s type %s absent du catalogue : non cree (a ajouter dans l'onglet Materiel de l'outil)" % (x[0], x[1]))
    if SIMULATION:
        for x in a_creer:
            dire("   a creer : %-28s %-14s sous %s" % (x[0], x[1], x[2] + ((" > " + CATALOGUE[x[1]][4]) if unicode(CATALOGUE[x[1]][4]).startswith(u"BC_") else "")))
        dire("")
        return
    if a_creer and DEMANDER:
        msg = u"Hardware : %d appareil(s) a creer\n\n" % len(a_creer)
        msg += u"\n".join([u"%s (%s) sous %s" % (x[0], x[1], x[2]) for x in a_creer[:35]])
        if len(a_creer) > 35:
            msg += u"\n... et %d autre(s)" % (len(a_creer) - 35)
        rep = hw_confirmer(msg)
        if rep is None:
            dire("   pas de fenetre de confirmation : rien n'est cree (mets DEMANDER = False pour creer sans confirmation)")
            dire("")
            return
        if rep == "stop":
            dire("   arret demande : rien n'est cree ni modifie")
            HW_ARRET = True
            dire("")
            return
        if rep == "non":
            dire("   creation refusee : on passe aux reglages")
            a_creer = []
    creer = set([x[0] for x in a_creer])
    n_cree = n_err = 0
    for nom, typ, parent_nom, params, role, axe in plan:
        dev = (hw_find(nom) or [None])[0]
        if dev is None and nom in equiv:
            dev = equiv[nom]   # present sous un autre nom : on le regle quand meme
        if dev is None:
            if nom not in creer:
                continue
            c = CATALOGUE[typ]
            par = hw_par(parent_nom)
            if par is None:
                dire("   %-28s parent %s introuvable : non cree" % (nom, parent_nom))
                n_err += 1
                continue
            if unicode(c[4]).startswith(u"BC_"):
                # BC_TM5NS31 = nom de la tete de bus dans les anciens projets : le module va directement sous la tete,
                # sauf si un noeud de ce nom existe vraiment sous elle
                sous = hw_sous(par, c[4], 3)
                if sous is not None:
                    par = sous
                    parent_nom = parent_nom + " > " + unicode(safe(lambda: sous.get_name(), c[4]))
            # position dans l'ilot : rang parmi les appareils du meme parent dans MATERIEL (l'ordre de l'arbre = l'ordre physique)
            rang = None
            if typ.upper().startswith("TM5"):
                freres = [y[0] for y in MATERIEL if y[2] == parent_nom.split(" > ")[0]]
                if nom in freres:
                    rang = freres.index(nom)
            try:
                did = DeviceID(c[0], plc_id if c[1] == "plc_id" else c[1], plc_v if c[2] == "plc_v" else c[2])
                fait = False
                if rang is not None and rang < len(safe(lambda: list(par.get_children(False)), [])):
                    try:
                        if c[3]:
                            par.insert(nom, rang, did, c[3])
                        else:
                            par.insert(nom, rang, did)
                        fait = True
                    except Exception:
                        fait = False
                if not fait:
                    if c[3]:
                        par.add(nom, did, c[3])
                    else:
                        par.add(nom, did)
                    if rang is not None and rang < len(safe(lambda: list(par.get_children(False)), [])) - 1:
                        dire("   %-28s ajoute en fin d'ilot (insertion au rang %d refusee) : a deplacer a la main en position %d" % (nom, rang, rang + 1))
            except Exception as ex:
                # version du catalogue absente de ce Machine Expert : on reessaie avec la version installee (projet ou depot d'appareils)
                cree_autre = False
                if "no device found" in unicode(ex).lower():
                    cid = plc_id if c[1] == "plc_id" else c[1]
                    for v in hw_versions_connues(c[0], cid, tous):
                        if unicode(v) == unicode(plc_v if c[2] == "plc_v" else c[2]):
                            continue
                        try:
                            did2 = DeviceID(c[0], cid, v)
                            if c[3]:
                                par.add(nom, did2, c[3])
                            else:
                                par.add(nom, did2)
                            dire("   %-28s version %s absente de ce Machine Expert : cree en version %s (mets-la dans l'onglet Materiel de l'outil)" % (nom, unicode(c[2]), v))
                            cree_autre = True
                            break
                        except Exception:
                            pass
                if not cree_autre:
                    dire("   %-28s ERREUR de creation (%s) : %s" % (nom, typ, ex))
                    n_err += 1
                    continue
            dev = (hw_find(nom) or [None])[0]
            if dev is None:
                dire("   %-28s cree mais introuvable ensuite (verifier dans l'arbre)" % nom)
                n_err += 1
                continue
            dire("   %-28s cree sous %s" % (nom, parent_nom))
            n_cree += 1
            hw_apres_creation(dev, nom, typ, role, axe)
        hw_reglages(dev, nom, typ, params, role, axe)
    hw_masques_sorties(plc)
    for nom, ip in ADRESSES_IP:
        dire("   %s : adresse IP %s a verifier dans Machine Expert" % (nom, ip))
    dire("   Bilan hardware : %d cree(s), %d deja present(s), %d erreur(s), %d hors catalogue, %d reglage(s) ecrit(s)" % (n_cree, len(plan) - len(absents), n_err, len(hors), HW_ECRITS[0]))
    dire("")

if CREER_HARDWARE:
    try:
        hardware()
    except Exception as ex:
        dire("HARDWARE : ERREUR %s" % ex)
        dire("")
`;
