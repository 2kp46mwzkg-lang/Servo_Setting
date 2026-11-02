# -*- coding: utf-8 -*-
# =====================================================================
#  Exploration du materiel d'un projet Machine Expert (LECTURE SEULE)
#  Outils > Scripting > Executer le fichier de script.
#
#  A faire avant, dans un projet de TEST (pas un projet client) :
#   - ajoute a la main l'alimentation du TM5 dans l'ilot, et tout autre
#     appareil que l'outil ne sait pas encore creer ;
#   - ajoute au moins deux ATV320 sous le CAN_Manager ; sur UN SEUL des
#     deux : coche « Optional device » et mets Producer time (heartbeat)
#     a 300 au lieu de 200 ; laisse l'autre tel quel ;
#   - s'il y a des cartes TM5SPS1 / TM5SPS2 (PS1, PS2), ajoute-en une de
#     chaque dans un ilot ;
#   - enregistre le projet (Ctrl+S).
#
#  Ce que fait le script (rien n'est modifie dans le projet) :
#   1. lit le DeviceID (type, id, version, module) de chaque appareil ;
#   2. lit tous les parametres d'un ATV320 (nom, valeur, unite, choix) ;
#   3. compare les ATV320 entre eux (parametres et export) pour trouver
#      les reglages « Optional device » et « Producer time » ;
#   4. lit les taches (nom, cycle) pour le calcul du heartbeat.
#  Resultat dans Documents\explo_materiel\ :
#   - explo_materiel.json : a importer dans l'outil (onglet Materiel,
#     bouton « Importer depuis Machine Expert ») ;
#   - rapport_explo_materiel.txt et atv_<nom>.export : a m'envoyer si
#     quelque chose n'est pas reconnu.
# =====================================================================
from __future__ import print_function
import os, codecs
import re as re_
try:
    unicode
except NameError:
    unicode = str

DOSSIER = os.path.join(os.path.expanduser("~"), "Documents", "explo_materiel")
if not os.path.isdir(DOSSIER):
    os.makedirs(DOSSIER)

lignes = []
resume = []
def dire(s=u""):
    lignes.append(unicode(s))
def note(s):
    resume.append(unicode(s))
    lignes.append(u">> " + unicode(s))

RIEN = object()
def safe(f, defaut=None):
    try:
        return f()
    except Exception:
        return defaut

def nom_de(o):
    return unicode(safe(lambda: o.get_name(), u"?"))

def lire(p):
    with codecs.open(p, "r", "utf-8-sig") as f:
        return f.read().splitlines()

def js(v):
    if v is None:
        return u"null"
    if isinstance(v, bool):
        return u"true" if v else u"false"
    if isinstance(v, (int, float)):
        return unicode(v)
    s = unicode(v)
    s = s.replace(u"\\", u"\\\\").replace(u'"', u'\\"').replace(u"\r", u"\\r").replace(u"\n", u"\\n").replace(u"\t", u"\\t")
    return u'"' + s + u'"'

def js_liste(l):
    return u"[" + u", ".join([js(x) for x in l]) + u"]"

def ident(dev):
    out = {}
    for meth in ("get_device_identification", "get_module_identification"):
        f = safe(lambda: getattr(dev, meth), None)
        if f is None:
            continue
        i = safe(lambda: f(), None)
        if i is None:
            continue
        out[meth] = (safe(lambda: i.type, None), unicode(safe(lambda: i.id, u"")), unicode(safe(lambda: i.version, u"")))
    return out

def nom_type(dev):
    # nom du type tel que Machine Expert l'affiche (si l'API le donne)
    for a in ("device_type_name", "type_name", "get_type_name", "get_device_description", "device_description"):
        v = safe(lambda: getattr(dev, a), None)
        if v is None:
            continue
        if callable(v):
            v = safe(lambda: v(), None)
        if v is None:
            continue
        for b in ("name", "Name", "type_name"):
            w = safe(lambda: getattr(v, b), None)
            if w:
                v = w
                break
        t = unicode(v).strip()
        if t and len(t) < 80 and not t.startswith(u"<"):
            return t
    return u""

def params_de(dev):
    res = []
    vus = set()
    for ci, conn in enumerate(safe(lambda: list(dev.connectors), [])):
        for p in safe(lambda: list(conn.host_parameters), []):
            n = unicode(safe(lambda: p.name, u""))
            if not n or n in vus:
                continue
            vus.add(n)
            d = {"n": n, "conn": ci}
            for cle, a in (("v", "value"), ("id", "id"), ("s", "section"), ("u", "unit"), ("d", "default_value"),
                           ("min", "min_value"), ("max", "max_value"), ("desc", "description")):
                v = safe(lambda: getattr(p, a), RIEN)
                if v is not RIEN and v is not None and not callable(v):
                    d[cle] = unicode(v)[:120]
            ch = safe(lambda: list(p.allowed_values), [])
            if ch:
                d["c"] = [unicode(safe(lambda: it.visible_name, u"?"))[:60] for it in ch[:60]]
                d["cv"] = [unicode(safe(lambda: it.value, u""))[:30] for it in ch[:60]]
            res.append(d)
    return res

projet = projects.primary
if projet is None:
    raise Exception("Aucun projet ouvert dans Machine Expert")

appareils = []
def parcours(obj, parent_dev, prof):
    for e in safe(lambda: list(obj.get_children(False)), []):
        if safe(lambda: e.is_device, False):
            appareils.append((e, parent_dev, prof))
            parcours(e, e, prof + 1)
        else:
            parcours(e, parent_dev, prof)
parcours(projet, None, 0)

# ---------------------------------------------------------------- 1. DeviceID
objs = []
vus = {}
plc = None
dire(u"==================== APPAREILS (nom, DeviceID, module, parent)")
for dev, par, prof in appareils:
    i = ident(dev)
    d = i.get("get_device_identification")
    m = i.get("get_module_identification")
    if d is None:
        continue
    if nom_de(dev) == u"LMC_PacDrive" and plc is None:
        plc = d
    cle = (d[0], d[1], d[2], m[1] if m else u"")
    vus.setdefault(cle, []).append(nom_de(dev))
    tn = nom_type(dev)
    objs.append(u'{"nom": %s, "parent": %s, "type": %s, "id": %s, "version": %s, "module": %s, "moduleType": %s, "moduleVersion": %s, "typeName": %s}' % (
        js(nom_de(dev)), js(nom_de(par) if par is not None else u""), js(d[0]), js(d[1]), js(d[2]),
        js(m[1] if m else u""), js(m[0] if m else None), js(m[2] if m else u""), js(tn)))
    dire(u"%s%s   DeviceID(%s, %s, %s)%s%s   parent %s" % (u"  " * prof, nom_de(dev), d[0], d[1], d[2],
         (u"   module %s / %s" % (m[1], m[2])) if m else u"", (u"   [%s]" % tn) if tn else u"",
         nom_de(par) if par is not None else u"-"))
note(u"%d appareils lus, %d DeviceID differents" % (len(objs), len(vus)))

# ---------------------------------------------------------------- 2. ATV320
def est_atv(dev):
    d = ident(dev).get("get_device_identification")
    return (d is not None and d[1] == u"101A 2038") or nom_de(dev).upper().startswith(u"ATV")
atv = [dev for dev, par, prof in appareils if est_atv(dev)]
note(u"%d ATV320 trouve(s)" % len(atv))
atv_json = u"null"
diff_json = []
exp_json = []
fichiers = []
if atv:
    tous_p = [(nom_de(a), params_de(a)) for a in atv]
    n0, p0 = tous_p[0]
    dire(u"")
    dire(u"==================== PARAMETRES DE %s (%d)" % (n0, len(p0)))
    for d in p0:
        dire(u"   [%s] %s = %s%s%s%s" % (d.get("conn"), d["n"], d.get("v", u""), (u" " + d["u"]) if d.get("u") else u"",
             (u"   id " + d["id"]) if d.get("id") else u"", (u"   choix : " + u" | ".join(d["c"])[:250]) if d.get("c") else u""))
    champs = []
    for d in p0:
        morceaux = [u'"%s": %s' % (k, js(d[k])) for k in ("n", "v", "id", "s", "u", "d", "min", "max") if k in d]
        if d.get("c"):
            morceaux.append(u'"c": ' + js_liste(d["c"]))
            morceaux.append(u'"cv": ' + js_liste(d["cv"]))
        champs.append(u"{" + u", ".join(morceaux) + u"}")
    atv_json = u'{"appareil": %s, "params": [\n    %s\n  ]}' % (js(n0), u",\n    ".join(champs))
    # differences de valeurs entre ATV320 (le Node-ID differe toujours)
    if len(tous_p) > 1:
        dire(u"")
        dire(u"==================== PARAMETRES QUI DIFFERENT ENTRE LES ATV320")
        noms = []
        for _, ps in tous_p:
            for d in ps:
                if d["n"] not in noms:
                    noms.append(d["n"])
        for n in noms:
            vals = []
            for an, ps in tous_p:
                v = [d.get("v", u"") for d in ps if d["n"] == n]
                vals.append((an, v[0] if v else u"(absent)"))
            if len(set([v for _, v in vals])) > 1:
                dire(u"   %s : %s" % (n, u" ; ".join([u"%s=%s" % (a, v) for a, v in vals])))
                diff_json.append(u'{"n": %s, "valeurs": {%s}}' % (js(n), u", ".join([u"%s: %s" % (js(a), js(v)) for a, v in vals])))
        note(u"%d parametre(s) differents entre les ATV320 (Node-ID compris)" % len(diff_json))
    # export de chaque ATV320 et lignes qui different du premier
    for a in atv:
        pe = os.path.join(DOSSIER, u"atv_%s.export" % nom_de(a))
        try:
            projet.export_native([a], pe, False)
            fichiers.append((nom_de(a), pe))
        except Exception as ex:
            dire(u"   export de %s impossible : %s" % (nom_de(a), ex))
    if len(fichiers) > 1:
        base_n, base_f = fichiers[0]
        l0 = safe(lambda: lire(base_f), [])
        dire(u"")
        dire(u"==================== EXPORTS : LIGNES QUI DIFFERENT DE %s" % base_n)
        for an, pf in fichiers[1:]:
            l1 = safe(lambda: lire(pf), [])
            s0, s1 = set(l0), set(l1)
            moins = [x.strip() for x in l0 if x not in s1 and u"Guid" not in x and u"Timestamp" not in x][:30]
            plus = [x.strip() for x in l1 if x not in s0 and u"Guid" not in x and u"Timestamp" not in x][:30]
            dire(u"   %s : %d ligne(s) differente(s)" % (an, len(moins) + len(plus)))
            for x in moins:
                dire(u"      - " + x[:200])
            for x in plus:
                dire(u"      + " + x[:200])
            exp_json.append(u'{"atv": %s, "moins": %s, "plus": %s}' % (js(an), js_liste([x[:200] for x in moins]), js_liste([x[:200] for x in plus])))
        note(u"%d export(s) d'ATV320 compares a %s" % (len(fichiers) - 1, base_n))

# ---------------------------------------------------------------- 2b. API des parametres structures (General Options, SDO List) : ce que l'objet expose
if atv:
    dire(u"")
    dire(u"==================== API DES PARAMETRES STRUCTURES DE %s (lecture seule)" % nom_de(atv[0]))
    for conn in safe(lambda: list(atv[0].connectors), []):
        for p in safe(lambda: list(conn.host_parameters), []):
            n = unicode(safe(lambda: p.name, u""))
            if n not in (u"General Options", u"SDO List", u"Node-ID", u"PDO 16#1400"):
                continue
            v = safe(lambda: p.value, None)
            dire(u"   %s : type python de value = %s ; repr = %s" % (n, type(v).__name__, unicode(repr(v))[:160]))
            attrs = [a for a in safe(lambda: dir(p), []) if not a.startswith(u"_")]
            dire(u"      attributs de p : " + u", ".join(attrs)[:600])
            if v is not None and not isinstance(v, (unicode, str, int, float, bool)):
                vattrs = [a for a in safe(lambda: dir(v), []) if not a.startswith(u"_")]
                dire(u"      attributs de value : " + u", ".join(vattrs)[:600])
                try:
                    dire(u"      len(value) = %s ; value[0] = %s" % (len(v), unicode(repr(v[0]))[:120]))
                except Exception as ex:
                    dire(u"      value non indexable (%s)" % ex)
            for a in (u"sub_parameters", u"elements", u"members", u"children", u"struct_members", u"sub_elements"):
                x = safe(lambda: getattr(p, a), RIEN)
                if x is not RIEN and x is not None:
                    try:
                        l = list(x) if not callable(x) else list(x())
                        dire(u"      p.%s : %d element(s) : %s" % (a, len(l), u" | ".join([unicode(safe(lambda: getattr(e, "name", e), e))[:40] + u"=" + unicode(safe(lambda: getattr(e, "value", u"?"), u"?"))[:40] for e in l[:8]])))
                    except Exception as ex:
                        dire(u"      p.%s present mais illisible (%s)" % (a, ex))
    note(u"API des parametres structures lue (section 2b du rapport)")

# ---------------------------------------------------------------- 3. reperes dans l'export du premier ATV320
if atv and fichiers:
    dire(u"")
    dire(u"==================== EXPORT DE %s : LIGNES PARLANT DE NODE / OPTIONAL / HEARTBEAT / PRODUCER" % fichiers[0][0])
    try:
        for x in lire(fichiers[0][1]):
            if re_.search(u"node|optional|heartbeat|producer|guard", x, re_.I):
                dire(u"   " + x.strip()[:200])
    except Exception as ex:
        dire(u"   lecture impossible : %s" % ex)

# ---------------------------------------------------------------- 4. taches (cycle du bus CAN pour le heartbeat)
taches = []
def parcours_tout(obj, prof):
    for e in safe(lambda: list(obj.get_children(False)), []):
        taches_cand(e, prof)
        parcours_tout(e, prof + 1)
def taches_cand(e, prof):
    n = nom_de(e)
    est = safe(lambda: e.is_task, False) or safe(lambda: getattr(e, "interval"), None) is not None or u"TASK" in n.upper()
    if not est or safe(lambda: e.is_device, False):
        return
    infos = {}
    for a in ("interval", "priority", "kind_of_task", "cycle_time", "watchdog_enabled"):
        v = safe(lambda: getattr(e, a), RIEN)
        if v is not RIEN and v is not None and not callable(v):
            infos[a] = unicode(v)[:60]
    lignes_exp = []
    try:
        pe = os.path.join(DOSSIER, u"tache_%s.export" % n)
        projet.export_native([e], pe, False)
        for x in lire(pe):
            if re_.search(u"interval|cycle|priority|watchdog", x, re_.I):
                lignes_exp.append(x.strip()[:160])
    except Exception as ex:
        lignes_exp.append(u"export impossible : %s" % ex)
    taches.append((n, infos, lignes_exp[:8]))
parcours_tout(projet, 0)
dire(u"")
dire(u"==================== TACHES (nom, proprietes, lignes de l'export)")
for n, infos, lx in taches:
    dire(u"   %s   %s" % (n, u", ".join([u"%s = %s" % (k, v) for k, v in infos.items()]) or u"(pas de propriete lue)"))
    for x in lx:
        dire(u"      " + x)
note(u"%d tache(s) lue(s) : %s" % (len(taches), u", ".join([n for n, i, l in taches][:8])))

# ---------------------------------------------------------------- fichiers
p_json = os.path.join(DOSSIER, "explo_materiel.json")
with codecs.open(p_json, "w", "utf-8") as f:
    f.write(u'{"source": "explorer_materiel", "version": 2, "projet": %s,\n' % js(safe(lambda: projet.path, u"")))
    f.write(u' "plc": %s,\n' % ((u'{"id": %s, "version": %s}' % (js(plc[1]), js(plc[2]))) if plc else u"null"))
    f.write(u' "appareils": [\n  ' + u",\n  ".join(objs) + u"\n ],\n")
    f.write(u' "atv320": ' + atv_json + u",\n")
    f.write(u' "atv_differences": [' + u", ".join(diff_json) + u"],\n")
    f.write(u' "atv_exports": [' + u", ".join(exp_json) + u"],\n")
    f.write(u' "taches": [' + u", ".join([u'{"nom": %s, "infos": {%s}, "export": %s}' % (js(n), u", ".join([u"%s: %s" % (js(k), js(v)) for k, v in i.items()]), js_liste(l)) for n, i, l in taches]) + u"]\n}\n")
p_rap = os.path.join(DOSSIER, "rapport_explo_materiel.txt")
with codecs.open(p_rap, "w", "utf-8") as f:
    f.write(u"\r\n".join(lignes))
print(u"")
print(u"==================== RESUME")
for s in resume:
    print(u"  " + s)
print(u"  A importer dans l'outil : " + p_json)
print(u"  Rapport : " + p_rap)
