# -*- coding: utf-8 -*-
# =====================================================================
#  Supprime les appareils crees en double par erreur (ex. ATV320_M1_1
#  a cote de ATV320_M1) : meme parent, meme DeviceID, et un nom qui est
#  celui d'un frere + "_<numero>".
#  Outils > Scripting > Executer le fichier de script.
#
#  SIMULATION = True  : liste seulement, rien n'est supprime.
#  SIMULATION = False : demande confirmation (liste affichee), puis supprime.
#  Enregistre le projet avant (Ctrl+S) : la suppression n'est pas annulable
#  par le script (Ctrl+Z dans Machine Expert, ou ne pas enregistrer).
# =====================================================================
from __future__ import print_function
import re
try:
    unicode
except NameError:
    unicode = str

SIMULATION = True
PARENTS = [u"CAN_Manager"]     # ou [] pour chercher dans tout le projet

def safe(f, defaut=None):
    try:
        return f()
    except Exception:
        return defaut

def nom_de(o):
    return unicode(safe(lambda: o.get_name(), u"?"))

def ident(dev):
    i = safe(lambda: dev.get_device_identification())
    return (unicode(safe(lambda: i.type, u"")), unicode(safe(lambda: i.id, u"")), unicode(safe(lambda: i.version, u"")))

projet = projects.primary
if projet is None:
    raise Exception("Aucun projet ouvert dans Machine Expert")

parents = []
if PARENTS:
    for n in PARENTS:
        parents.extend([o for o in safe(lambda: list(projet.find(n, True)), []) if safe(lambda: o.is_device, False)])
else:
    def tous(obj, res):
        for e in safe(lambda: list(obj.get_children(False)), []):
            if safe(lambda: e.is_device, False):
                res.append(e)
            tous(e, res)
    tous(projet, parents)

doublons = []
for par in parents:
    enfants = [e for e in safe(lambda: list(par.get_children(False)), []) if safe(lambda: e.is_device, False)]
    noms = dict((nom_de(e), e) for e in enfants)
    for e in enfants:
        n = nom_de(e)
        m = re.match(u"^(.+)_(\\d+)$", n)
        if not m or m.group(1) not in noms:
            continue
        base = noms[m.group(1)]
        if ident(base) == ident(e) and base is not e:
            doublons.append((e, n, m.group(1), nom_de(par)))

print(u"")
print(u"==================== DOUBLONS (%d)" % len(doublons))
for e, n, b, p in doublons:
    print(u"   %-24s sous %-16s doublon de %s" % (n, p, b))
if not doublons:
    print(u"   aucun")
elif SIMULATION:
    print(u"   SIMULATION = True : rien n'est supprime (mets SIMULATION = False pour supprimer)")
else:
    ui = safe(lambda: system.ui, None)
    ok = False
    if ui is not None:
        msg = u"Supprimer ces %d appareil(s) ?\n\n%s" % (len(doublons), u"\n".join([u"%s (sous %s)" % (n, p) for e, n, b, p in doublons[:40]]))
        try:
            r = ui.choose(msg, [u"Oui, supprimer", u"Non"])
            idx = r[0] if isinstance(r, (tuple, list)) else r
            ok = (idx == 0)
        except Exception:
            try:
                ok = ui.prompt(msg, PromptChoice.YesNo, PromptResult.No) == PromptResult.Yes
            except Exception:
                ok = False
    if not ok:
        print(u"   suppression refusee ou pas de fenetre de confirmation : rien n'est supprime")
    else:
        n_ok = 0
        for e, n, b, p in doublons:
            try:
                e.remove()
                n_ok += 1
                print(u"   %-24s supprime" % n)
            except Exception as ex:
                print(u"   %-24s ERREUR : %s" % (n, ex))
        print(u"   %d supprime(s) sur %d. Enregistre le projet (Ctrl+S) si c'est bon." % (n_ok, len(doublons)))
