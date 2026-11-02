/* Réglages Servo — dictionnaire E/S livré (mots du dossier -> noms des variables automate) et onglets E/S.
   Pour ajouter un mot : une ligne dans IO_SEED (catégorie equipement / action / etat / organe), ou dans la page, Catalogue > Dictionnaire E/S. */
/* ---------- Dictionnaire E/S : appellations du dossier -> noms des variables automate ---------- */
/* Une entrée = un mot (ou groupe de mots) du dossier, sa catégorie et sa traduction :
   equipement -> lettre du repère (vérin -> V), action -> mouvement commandé (sortie), etat -> position détectée (entrée), organe -> partie de machine.
   Règles de nommage dans l'entrée « regles » (préfixe booléen, modèles). */
const IO_CATS = [['equipement', 'Équipement (lettre du repère)'], ['action', 'Action commandée (sortie)'], ['etat', 'État détecté (entrée)'], ['organe', 'Organe de machine']];
const IO_CAT_L = Object.fromEntries(IO_CATS);
const IO_SEED = {
  equipement: [['vérin, verin, cylinder, cylindre, cyl', 'V'], ['moteur, motor', 'M'], ['capteur, détecteur, detecteur, cellule, sensor', 'S'], ['pompe, pump', 'P'], ['vanne, électrovanne, electrovanne, valve', 'EV'], ['frein, brake', 'B'], ['ventilateur, fan', 'F'], ['pince, gripper', 'G'], ['ventouse, suction cup, vacuum', 'VC']],
  action: [['monter, montée, montee, monte, lever, levée, levee, raise, raising up, up', 'raisingUp'], ['baisser, baisse, descendre, descente, lower, lowering, raising down, down', 'raisingDown'], ['avancer, avance, sortir, sortie, forward, extend, extending', 'forward'], ['reculer, recul, rentrer, rentrée, rentree, backward, retract, retracting', 'backward'],
    ['ouvrir, ouverture, open, opening', 'opening'], ['fermer, fermeture, close, closing', 'closing'], ['serrer, serrage, clamp, clamping', 'clamping'], ['desserrer, desserrage, unclamp, unclamping', 'unclamping'], ['pousser, poussée, poussee, push, pushing', 'pushing'], ['tirer, pull, pulling', 'pulling'],
    ['tourner, rotation, rotate, rotating', 'rotating'], ['marche, démarrer, demarrer, start, run, running', 'running'], ['bloquer, verrouiller, lock, locking', 'locking'], ['débloquer, debloquer, déverrouiller, deverrouiller, unlock, unlocking', 'unlocking'], ['éjecter, ejecter, éjection, ejection, eject, ejecting', 'ejecting'], ['indexer, index, indexing', 'indexing'], ['souffler, soufflage, blow, blowing', 'blowing'], ['aspirer, aspiration, suck, vacuum on', 'sucking']],
  etat: [['monté, montée, monte, montee, haut, en haut, up, raised', 'up'], ['descendu, descendue, bas, en bas, down, lowered', 'down'], ['sorti, sortie, avancé, avancée, avance, extended, out', 'out'], ['rentré, rentrée, rentre, reculé, reculée, recule, retracted, in', 'in'], ['ouvert, open, opened', 'open'], ['fermé, ferme, closed', 'closed'], ['serré, serre, clamped', 'clamped'], ['desserré, desserre, unclamped', 'unclamped'],
    ['présent, present, présence, presence, detected', 'present'], ['absent, absence', 'absent'], ['plein, full', 'full'], ['vide, empty', 'empty'], ['défaut, defaut, fault, error', 'fault'], ['prêt, pret, ready', 'ready'], ['en marche, running', 'running'], ['bloqué, bloque, verrouillé, verrouille, locked', 'locked'], ['débloqué, debloque, déverrouillé, deverrouille, unlocked', 'unlocked'], ['pression, pressure', 'pressure']],
  organe: [['lame, blade', 'Blade'], ['porte, door', 'Door'], ['plateau, plate', 'Plate'], ['table', 'Table'], ['tapis, bande, belt', 'Belt'], ['convoyeur, conveyor', 'Conveyor'], ['pince, gripper', 'Gripper'], ['butée, butee, stopper', 'Stopper'], ['guide', 'Guide'], ['rouleau, roller', 'Roller'], ['chariot, carriage', 'Carriage'], ['bras, arm', 'Arm'], ['capot, carter, cover, hood', 'Cover'],
    ['trémie, tremie, hopper', 'Hopper'], ['film', 'Film'], ['carton, box, case', 'Box'], ['produit, product', 'Product'], ['pièce, piece, part', 'Part'], ['palette, pallet', 'Pallet'], ['bobine, reel', 'Reel'], ['couteau, knife', 'Knife'], ['aiguillage, diverter', 'Diverter'], ['poussoir, pusher', 'Pusher'], ['ventouse, suction cup', 'SuctionCup'], ['soudure, sealing', 'Sealing'], ['mâchoire, machoire, jaw', 'Jaw'], ['vis, screw', 'Screw'], ['étiquette, etiquette, label', 'Label'], ['sac, bag', 'Bag'], ['bouteille, bottle', 'Bottle'], ['barquette, tray', 'Tray'], ['avant, front', 'Front'], ['arrière, arriere, rear, back', 'Rear'], ['gauche, left', 'Left'], ['droite, droit, right', 'Right'], ['central, centrale, milieu, middle, center', 'Middle'], ['entrée machine, entree machine, infeed, inlet', 'Infeed'], ['sortie machine, outfeed, outlet', 'Outfeed']]
};
const IO_STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'd', 'l', 'au', 'aux', 'en', 'sur', 'sous', 'pour', 'avec', 'par', 'the', 'of', 'a', 'an', 'to', 'for', 'and', 'or', 'ou', 'on', 'off', 'n', 'no', 'nr', 'n°']);
const IO_REGLES0 = { prefixe: 'x', patSortie: '{E}{n}_{action}_{organe}', patEntree: '{E}{n}_{etat}_{organe}', mono: 'premiere' };
const ioSlug = s => nrmE(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function ioBuiltin() {
  const out = [{ id: 'io-regles', type: 'regles', ...IO_REGLES0, _cat: true }];
  Object.entries(IO_SEED).forEach(([cat, L]) => L.forEach(([mots, trad]) => out.push({ id: 'io-' + cat + '-' + ioSlug(trad), cat, mot: mots, trad, _cat: true })));
  return out;
}
const ioRegles = () => ({ ...IO_REGLES0, ...(S.iodict.find(x => x.type === 'regles') || {}) });
/* Index : chaque mot (normalisé) -> entrées possibles (un même mot peut être une action et un état : « sortie ») ; les groupes de mots sont essayés en premier (3, 2 puis 1 mot) */
function ioIndex() {
  const m = new Map();
  S.iodict.filter(x => x.type !== 'regles' && x.mot && x.trad).forEach(x => String(x.mot).split(',').map(w => nrmE(w).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean).forEach(w => { if (!m.has(w)) m.set(w, []); if (!m.get(w).some(e => e.cat === x.cat)) m.get(w).push(x); }));
  return m;
}
const ioCamel = (s, upper) => { const w = String(s || '').split(/[^A-Za-z0-9]+/).filter(Boolean); return w.map((x, i) => (i === 0 && !upper ? x[0].toLowerCase() : x[0].toUpperCase()) + x.slice(1)).join(''); };
/* Nomme un appareil d'après sa désignation. kind : 'bistable' (2 sorties), 'mono' (1 sortie), 'entree' (1 entrée par état) */
function ioNommer(desig, kind, idx) {
  idx = idx || ioIndex();
  const R = ioRegles();
  const txt = nrmE(desig).replace(/\//g, ' / ').replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const T = txt ? txt.split(' ') : [];
  const found = { equipement: [], action: [], etat: [], organe: [] }, inconnus = [];
  const pref = kind === 'entree' ? 'etat' : 'action', pick = l => l.find(e => e.cat === pref) || l[0];
  let n = '', lastWords = null;
  for (let i = 0; i < T.length; i++) {
    const t = T[i];
    if (t === '/') { continue; }
    if (!n && /^\d+[a-z]?$/.test(t)) { n = t.toUpperCase(); continue; }
    let hit = null, len = 0;
    for (let k = Math.min(3, T.length - i); k >= 1 && !hit; k--) { const ph = T.slice(i, i + k).join(' '); if (idx.has(ph)) { hit = pick(idx.get(ph)); len = k; } }
    /* « raising up/down » : après un « / », le mot seul reprend le début du groupe précédent (raising + down) */
    if (i > 0 && T[i - 1] === '/' && lastWords && lastWords.length > 1) { const ph = lastWords.slice(0, -1).concat([t]).join(' '); if (idx.has(ph)) { hit = pick(idx.get(ph)); len = 1; } }
    if (hit) { if (!found[hit.cat].includes(hit.trad)) found[hit.cat].push(hit.trad); lastWords = T.slice(i, i + len); i += len - 1; continue; }
    if (!IO_STOP.has(t)) inconnus.push(t);
  }
  const E = found.equipement[0] || '', organe = found.organe.map(o => ioCamel(o, true)).join('');
  const make = (pat, mot) => { let s = pat.replace('{E}', E).replace('{n}', n).replace('{action}', mot).replace('{etat}', mot).replace('{organe}', organe); s = s.replace(/_+/g, '_').replace(/^_|_$/g, ''); return R.prefixe + s; };
  const notes = [];
  if (!E) notes.push('type d’équipement non reconnu (vérin, moteur…)');
  if (!n) notes.push('pas de numéro');
  let noms = [];
  if (kind === 'entree') { noms = (found.etat.length ? found.etat : found.action).map(a => make(R.patEntree, a)); if (!found.etat.length) notes.push(found.action.length ? 'pas d’état détecté : action utilisée' : 'pas d’état détecté (monté, descendu, présent…)'); }
  else {
    const acts = found.action.length ? found.action : found.etat;
    if (!found.action.length) notes.push(found.etat.length ? 'pas d’action : état utilisé' : 'pas d’action reconnue (monter, baisser, avancer…)');
    if (kind === 'bistable') { noms = acts.map(a => make(R.patSortie, a)); if (acts.length === 1) notes.push('bistable : une seule action trouvée (il en faut deux)'); }
    else { noms = acts.length ? [make(R.patSortie, R.mono === 'derniere' ? acts[acts.length - 1] : acts[0])] : []; if (acts.length > 1) notes.push('monostable : ' + (R.mono === 'derniere' ? 'dernière' : 'première') + ' action gardée (' + acts.join(', ') + ')'); }
  }
  if (inconnus.length) notes.push('mot' + (inconnus.length > 1 ? 's' : '') + ' inconnu' + (inconnus.length > 1 ? 's' : '') + ' : ' + inconnus.join(', '));
  return { noms, E, n, found, organe, inconnus, notes };
}
const IO_KINDS = [['bistable', 'Sortie · distributeur bistable (2 bobines)'], ['mono', 'Sortie · monostable (1 bobine)'], ['entree', 'Entrée · capteur']];
const IO_KIND_L = { bistable: 'bistable', mono: 'monostable', entree: 'entrée' };
function renderIoDict() {
  const v = $('#view'); if (!allLoaded()) { v.innerHTML = ''; return; }
  const R = ioRegles(), F = S.ioForm || (S.ioForm = { desig: 'Vérin 1 monter baisser lame', kind: 'bistable' });
  const q = (S.search.iodict || '').toLowerCase().trim(), cat = S.serie.iodict || '';
  const words = q.split(/\s+/).filter(Boolean);
  const L = S.iodict.filter(x => x.type !== 'regles').filter(x => (!cat || x.cat === cat) && (!words.length || words.every(w => [x.mot, x.trad, IO_CAT_L[x.cat]].join(' ').toLowerCase().includes(w))));
  const ed = S.lib.iodict;
  const t = ioNommer(F.desig, F.kind);
  const test = `<div class="pgroup" style="margin-top:12px"><div class="pg-h">Essai</div><div class="pform addline" style="padding:10px 12px"><input type="text" id="ioTestDesig" value="${esc(F.desig)}" placeholder="Désignation du dossier (ex. Vérin 1 monter baisser lame)" aria-label="Désignation à tester" style="min-width:320px;flex:1">
      <select id="ioTestKind" aria-label="Type">${IO_KINDS.map(([k, l]) => optH(k, F.kind, l)).join('')}</select></div>
    <div style="padding:0 12px 12px"><div class="mono" style="font-size:14px;font-weight:600">${t.noms.length ? t.noms.map(esc).join('<br>') : '<span class="el-warn">aucun nom</span>'}</div>
    <div class="el-sub" style="margin-top:4px">${esc(['équipement ' + (t.E || '?'), 'n° ' + (t.n || '?'), 'actions : ' + (t.found.action.join(', ') || '—'), 'états : ' + (t.found.etat.join(', ') || '—'), 'organe : ' + (t.organe || '—')].join(' · '))}${t.notes.length ? `<br><span class="el-warn">${esc(t.notes.join(' · '))}</span>` : ''}</div></div></div>`;
  const regles = `<div class="pgroup" style="margin-top:12px"><div class="pg-h">Règles de nommage</div><div class="pform addline" style="padding:10px 12px;gap:10px">
      <label class="el-sub">Préfixe <input type="text" id="ioPrefixe" value="${esc(R.prefixe)}" style="width:50px" aria-label="Préfixe"></label>
      <label class="el-sub">Sortie <input type="text" id="ioPatS" value="${esc(R.patSortie)}" style="width:230px" aria-label="Modèle des sorties"></label>
      <label class="el-sub">Entrée <input type="text" id="ioPatE" value="${esc(R.patEntree)}" style="width:230px" aria-label="Modèle des entrées"></label>
      <label class="el-sub">Monostable <select id="ioMono" aria-label="Action gardée pour un monostable">${optH('premiere', R.mono, 'première action')}${optH('derniere', R.mono, 'dernière action')}</select></label>
      <button class="btn" id="ioReglesOk">Enregistrer les règles</button></div>
    <div class="el-sub" style="padding:0 12px 12px">{E} = lettre de l’équipement, {n} = numéro, {action} / {etat} = traduction, {organe} = organe en CamelCase. Un distributeur bistable donne une sortie par action (monter + baisser) ; un monostable une seule.</div></div>`;
  let body = '', last = null;
  L.sort((a, b) => IO_CATS.findIndex(c => c[0] === a.cat) - IO_CATS.findIndex(c => c[0] === b.cat) || String(a.trad).localeCompare(String(b.trad), 'fr')).forEach(x => {
    if (x.cat !== last) { body += `<tr class="grp"><td colspan="3">${esc(IO_CAT_L[x.cat] || x.cat)}</td></tr>`; last = x.cat; }
    body += `<tr class="row ${ed && ed.id === x.id ? 'sel' : ''}" data-edit="${esc(x.id)}"><td><button class="linkbtn" data-edit="${esc(x.id)}">${esc(x.mot)}</button></td><td class="mono">${esc(x.trad)}</td><td class="el-sub">${x._cat ? 'livré' : 'modifié'}${x.note ? ' · ' + esc(x.note) : ''}</td></tr>`;
  });
  const table = L.length ? `<div class="tblwrap"><table><thead><tr><th>Mots du dossier</th><th>Traduction</th><th></th></tr></thead><tbody>${body}</tbody></table></div>` : '<div class="empty"><b>Aucun mot</b><span>Rien ne correspond à ce filtre.</span></div>';
  const form = ed ? `<section class="panel edit sticky"><div class="panel-h"><h2>${ed.id ? esc(ed.trad || '') : 'Nouveau mot'}</h2><button class="btn ghost" id="libCancel">Fermer</button></div>
    <div class="panel-b" id="libForm"><fieldset>
      <div class="field wide"><label for="lib-mot">Mots du dossier <span class="el-sub">(séparés par des virgules : français, anglais, variantes)</span></label><div class="inp text"><input id="lib-mot" data-k="mot" value="${esc(ed.mot || '')}" autocomplete="off"></div></div>
      <div class="field wide"><label for="lib-cat">Catégorie</label><select id="lib-cat" data-k="cat">${IO_CATS.map(([k, l]) => optH(k, ed.cat || 'action', l)).join('')}</select></div>
      <div class="field wide"><label for="lib-trad">Traduction <span class="el-sub">(lettre pour un équipement, mot anglais sinon)</span></label><div class="inp text"><input id="lib-trad" data-k="trad" value="${esc(ed.trad || '')}" autocomplete="off"></div></div>
      <div class="field wide"><label for="lib-note">Note</label><div class="inp text"><input id="lib-note" data-k="note" value="${esc(ed.note || '')}" autocomplete="off"></div></div></fieldset>
    <div class="actions"><button class="btn primary" id="libSave">${ed.id ? 'Enregistrer' : 'Ajouter'}</button>${ed.id && !ed._cat ? `<button class="btn ghost ${S.confirm === ed.id ? 'danger armed' : ''}" id="libDel">${S.confirm === ed.id ? 'Confirmer la suppression' : 'Supprimer'}</button>` : ''}</div></div></section>` : '';
  v.innerHTML = `<div class="panel" style="padding:10px 12px"><div class="libbar"><div class="inp text"><input id="libSearch" placeholder="Rechercher un mot ou une traduction…" value="${esc(S.search.iodict || '')}" autocomplete="off"></div>
      <select id="libSerie" aria-label="Catégorie"><option value="">Toutes les catégories (${S.iodict.filter(x => x.type !== 'regles').length})</option>${IO_CATS.map(([k, l]) => optH(k, cat, l)).join('')}</select><button class="btn primary" id="libNew">+ Ajouter</button>
      <div class="libnote">Dictionnaire des E/S : comment une appellation du dossier (« Vérin 1 monter baisser lame », « Cylinder 1 raising up/down blade ») devient le nom de la variable automate (xV1_raisingUp_Blade, xV1_raisingDown_Blade). Commun à tous les projets ; les noms d’un projet se vérifient et se corrigent dans l’onglet E/S du projet. Un mot livré se modifie (la fiche remplace la version livrée).</div></div>
    ${test}${regles}</div>
    <div class="libgrid ${ed ? 'editing' : ''}" style="margin-top:14px"><section class="panel">${table}</section>${form}</div>`;
  const ls = $('#libSearch'); ls.oninput = () => { S.search.iodict = ls.value; const pos = ls.selectionStart; render(); const n = $('#libSearch'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
  $('#libSerie').onchange = e => { S.serie.iodict = e.target.value; render(); };
  $('#libNew').onclick = () => { S.lib.iodict = { cat: 'action' }; S.confirm = null; render(); };
  v.querySelectorAll('tr[data-edit]').forEach(b => b.onclick = () => { S.lib.iodict = { ...S.iodict.find(x => x.id === b.dataset.edit) }; S.confirm = null; render(); });
  const td = $('#ioTestDesig'), tk = $('#ioTestKind');
  td.oninput = () => { F.desig = td.value; const pos = td.selectionStart; render(); const n = $('#ioTestDesig'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
  tk.onchange = () => { F.kind = tk.value; render(); };
  $('#ioReglesOk').onclick = async () => {
    const d = { type: 'regles', prefixe: $('#ioPrefixe').value.trim(), patSortie: $('#ioPatS').value.trim() || IO_REGLES0.patSortie, patEntree: $('#ioPatE').value.trim() || IO_REGLES0.patEntree, mono: $('#ioMono').value };
    try { await writeDoc('iodict', 'io-regles', d); setStatus('Règles de nommage enregistrées.'); render(); } catch (e) { setStatus('Impossible : ' + (e.message || e.code), true); }
  };
  if (!ed) return;
  const lf = $('#libForm');
  const sync = e => { const el = e.target; if (!el.dataset.k) return; S.lib.iodict = { ...(S.lib.iodict || {}), [el.dataset.k]: el.value }; };
  lf.addEventListener('input', sync); lf.addEventListener('change', sync);
  $('#libCancel').onclick = () => { S.lib.iodict = null; S.confirm = null; render(); };
  $('#libSave').onclick = async () => {
    const d = { ...(S.lib.iodict || {}) }; delete d._cat;
    if (!String(d.mot || '').trim() || !String(d.trad || '').trim()) { setStatus('Mots du dossier et traduction sont obligatoires.', true); return; }
    d.mot = String(d.mot).split(',').map(x => x.trim()).filter(Boolean).join(', '); d.trad = String(d.trad).trim(); if (!d.cat) d.cat = 'action';
    const id = d.id || newId('iodict'); delete d.id;
    try { await writeDoc('iodict', id, d); S.lib.iodict = null; setStatus('« ' + d.mot + ' » → ' + d.trad + ' enregistré.'); render(); } catch (e) { setStatus('Enregistrement impossible : ' + (e.message || e.code), true); }
  };
  const del = $('#libDel'); if (del) del.onclick = async () => {
    if (S.confirm !== ed.id) { S.confirm = ed.id; render(); return; }
    S.confirm = null; try { await deleteDoc('iodict', ed.id); S.lib.iodict = null; setStatus(''); render(); } catch (e) { setStatus('Suppression impossible : ' + (e.message || e.code), true); }
  };
}
/* ---------- E/S du projet : récapitulatif des noms, modifiable ---------- */
function ioList() { return (curProj()?.es || []).slice(); }
function renderIo() {
  const v = $('#view'); if (!allLoaded()) { v.innerHTML = ''; return; }
  const cur = curProj(); if (!cur) { v.innerHTML = noProj(); renderProj(); return; }
  const L = ioList(), idx = ioIndex(), F = S.ioAdd || (S.ioAdd = { txt: '', kind: 'bistable' });
  const rows = L.map((x, k) => {
    const t = ioNommer(x.desig, x.kind, idx), noms = x.noms && x.noms.length ? x.noms : t.noms, fixe = !!(x.noms && x.noms.length);
    const diff = fixe && JSON.stringify(x.noms) !== JSON.stringify(t.noms);
    return `<tr data-io="${k}"><td><b>${esc(x.desig)}</b>${x.src ? `<div class="el-sub">${esc(x.src)}</div>` : ''}</td>
      <td><select data-kind aria-label="Type de ${esc(x.desig)}">${IO_KINDS.map(([kk, l]) => optH(kk, x.kind, l)).join('')}</select></td>
      <td><textarea data-noms rows="${Math.max(1, noms.length)}" class="mono" style="width:100%;min-width:220px;font-size:13px;resize:vertical" aria-label="Noms de ${esc(x.desig)}">${esc(noms.join('\n'))}</textarea>${fixe ? `<div class="el-sub">modifié à la main${diff ? ' · dictionnaire : ' + esc(t.noms.join(', ') || '—') : ''} <button class="btn ghost" data-ioreset="${k}">Reprendre le dictionnaire</button></div>` : ''}${t.notes.length ? `<div class="el-sub el-warn">${esc(t.notes.join(' · '))}</div>` : ''}</td>
      <td><button class="btn ghost" data-iodel="${k}">Retirer</button></td></tr>`;
  }).join('');
  const nInc = L.filter(x => ioNommer(x.desig, x.kind, idx).inconnus.length).length;
  v.innerHTML = projTop() + `<div class="panel" style="margin-top:14px"><div class="panel-h"><h2>E/S · ${L.length} appareil${L.length > 1 ? 's' : ''}</h2></div>
    <div class="tabnote">Récapitulatif des entrées / sorties du projet : la désignation du dossier, le type (distributeur bistable = 2 sorties, monostable = 1, capteur = entrée) et les noms de variables automate que le dictionnaire en déduit. Un nom se corrige directement dans la case (il est alors gardé tel quel) ; pour corriger « pour toujours », ajoute ou modifie le mot dans Catalogue › Dictionnaire E/S.${nInc ? ` <span class="el-warn">${nInc} désignation${nInc > 1 ? 's' : ''} avec un mot inconnu.</span>` : ''}</div>
    ${L.length ? `<div class="tblwrap" style="margin-top:10px"><table class="gtbl"><thead><tr><th>Désignation (dossier)</th><th>Type</th><th>Noms automate</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty"><b>Aucune E/S</b><span>Colle les désignations du dossier ci-dessous, une par ligne.</span></div>'}
    <div class="pform addline" style="align-items:flex-start"><span class="addlab">Ajouter</span><textarea id="ioTxt" rows="3" placeholder="Une désignation par ligne, ex. Vérin 1 monter baisser lame" aria-label="Désignations à ajouter" style="flex:1;min-width:260px;font:inherit;font-size:13px;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);color:var(--fg)">${esc(F.txt)}</textarea>
      <select id="ioKind" aria-label="Type des lignes ajoutées">${IO_KINDS.map(([k, l]) => optH(k, F.kind, l)).join('')}</select><button class="btn primary" id="ioAdd">Ajouter</button></div></div>`;
  renderProj();
  const save = (list, msg) => projPatch({ es: list }, msg);
  v.querySelectorAll('tr[data-io]').forEach(tr => {
    const k = +tr.dataset.io;
    tr.querySelector('[data-kind]').onchange = e => { const l = ioList(); l[k] = { ...l[k], kind: e.target.value, noms: [] }; save(l, '« ' + l[k].desig + ' » : ' + IO_KIND_L[e.target.value] + ', noms recalculés.'); };
    const ta = tr.querySelector('[data-noms]'); ta.onchange = () => { const l = ioList(), noms = ta.value.split('\n').map(s => s.trim()).filter(Boolean); l[k] = { ...l[k], noms }; save(l, '« ' + l[k].desig + ' » : noms gardés tels quels.'); };
    const rs = tr.querySelector('[data-ioreset]'); if (rs) rs.onclick = () => { const l = ioList(); l[k] = { ...l[k], noms: [] }; save(l, '« ' + l[k].desig + ' » : noms repris du dictionnaire.'); };
    tr.querySelector('[data-iodel]').onclick = () => { const l = ioList(); const x = l.splice(k, 1)[0]; save(l, '« ' + x.desig + ' » retiré.'); };
  });
  const tx = $('#ioTxt'); tx.oninput = () => { F.txt = tx.value; };
  $('#ioKind').onchange = e => { F.kind = e.target.value; };
  $('#ioAdd').onclick = () => {
    const lines = F.txt.split('\n').map(s => s.trim()).filter(Boolean); if (!lines.length) { setStatus('Colle au moins une désignation.', true); return; }
    const l = ioList(); lines.forEach(d => { if (!l.some(x => nrmE(x.desig) === nrmE(d))) l.push({ desig: d, kind: F.kind, noms: [], src: 'ajouté à la main' }); });
    S.ioAdd = { txt: '', kind: F.kind }; save(l, lines.length + ' désignation' + (lines.length > 1 ? 's' : '') + ' ajoutée' + (lines.length > 1 ? 's' : '') + '.');
  };
}
