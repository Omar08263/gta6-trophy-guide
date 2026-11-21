// Leonida Platinum — boot, filters, list, detail pane, roadmap and missables.
// Data comes from data/trophies.json (same origin, fetched at run time, no network).
import { loadEarned, saveEarned, exportEarned, importEarned } from './store.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadEarned();
let selected = trophies[1]; // open on the first story trophy so the guide is visible at once
let view = 'guide';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const listMeta = document.getElementById('listMeta');
const searchEl = document.getElementById('search');
const tierEl = document.getElementById('tier');
const kindEl = document.getElementById('kind');
const earnedEl = document.getElementById('earned');
const spoilerEl = document.getElementById('spoiler');

const KIND_LABELS = {
  story: 'Story', side: 'Side strand', collectible: 'Collectible', activity: 'Activity',
  combat: 'Combat & crime', partner: 'Partner', economy: 'Money & economy',
  exploration: 'Exploration', completion: '100% completion', platinum: 'Platinum',
};

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.name);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (tierEl.value !== 'all' && t.grade !== tierEl.value) return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (earnedEl.value === 'todo' && earned.has(t.name)) return false;
    if (earnedEl.value === 'done' && !earned.has(t.name)) return false;
    if (earnedEl.value === 'missable' && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge ' + t.grade;
  b.textContent = t.grade;
  return b;
}

function missableFlag(t) {
  const f = document.createElement('span');
  f.className = 'flag';
  f.textContent = 'MISSABLE IN THE MOMENT';
  return f;
}

function trophyRow(t) {
  const li = document.createElement('li');
  if (earned.has(t.name)) li.classList.add('earned');
  if (selected && selected.name === t.name) li.classList.add('selected');
  const top = document.createElement('div');
  top.className = 'row-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleEarned(t);
  });
  top.append(box);
  const name = document.createElement('span');
  name.className = 'name' + (isSpoilerHidden(t) ? ' hidden-name' : '');
  name.textContent = isSpoilerHidden(t) ? 'Hidden story trophy' : t.name;
  top.append(name, gradeBadge(t));
  if (t.missable) top.append(missableFlag(t));
  li.append(top);
  if (!isSpoilerHidden(t)) {
    const desc = document.createElement('p');
    desc.className = 'row-desc';
    desc.textContent = '“' + t.description + '”';
    li.append(desc);
    const guide = document.createElement('p');
    guide.className = 'row-guide';
    guide.textContent = t.guide;
    li.append(guide);
    const meta = document.createElement('p');
    meta.className = 'row-meta';
    meta.textContent = KIND_LABELS[t.kind] + ' · ' + t.difficulty + ' · ' + t.time;
    li.append(meta);
  } else {
    const hidden = document.createElement('p');
    hidden.className = 'row-desc';
    hidden.textContent = 'Spoilers hidden — earn this trophy to reveal its name and guide.';
    li.append(hidden);
  }
  li.addEventListener('click', () => {
    selected = t;
    renderList();
    renderDetail();
  });
  return li;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyRow));
  listMeta.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies · '
    + earned.size + ' earned · click a trophy to read its full guide';
}

function renderDetail() {
  detailEl.replaceChildren();
  if (!selected) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Pick a trophy from the list to read its guide.';
    detailEl.append(p);
    return;
  }
  const t = selected;
  if (isSpoilerHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Spoilers are on and this story trophy is not earned yet. Turn off “Hide story spoilers” above, or earn it, to read its guide.';
    detailEl.append(h, p);
    return;
  }
  detailEl.append(gradeBadge(t));
  const h = document.createElement('h2');
  h.textContent = t.name;
  detailEl.append(h);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = 'Official description: “' + t.description + '”';
  detailEl.append(official);
  const facts = document.createElement('p');
  facts.className = 'facts';
  facts.textContent = KIND_LABELS[t.kind] + ' · ' + t.grade + ' · Difficulty: ' + t.difficulty
    + ' · Rough time: ' + t.time + (t.missable ? ' · Missable in the moment' : ' · Not missable');
  detailEl.append(facts);
  const gh = document.createElement('h3');
  gh.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailEl.append(gh, guide);
  const sh = document.createElement('h3');
  sh.textContent = 'Steps';
  const steps = document.createElement('ol');
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.textContent = s;
    steps.append(li);
  }
  detailEl.append(sh, steps);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earn-btn';
  btn.textContent = earned.has(t.name) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(t));
  detailEl.append(btn);
  const src = document.createElement('p');
  src.className = 'sources';
  src.textContent = 'Sources: ' + t.source;
  detailEl.append(src);
}

function renderProgress() {
  const n = earned.size;
  const pct = Math.round((n / trophies.length) * 100);
  document.getElementById('earnedCount').textContent = n;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = pct + '% — '
    + (n === 0 ? 'the platinum is a long road. Start with the story.'
      : n < 14 ? 'story done is the foundation — keep the main missions going.'
      : n < 30 ? 'good pace — now side strands and activities.'
      : n < 54 ? 'into the endgame: collectibles and grinds.'
      : 'one trophy left — the platinum is yours.');
  document.getElementById('platText').textContent = earned.has('Vice Got a Price!')
    ? 'Platinum: Vice Got a Price! — EARNED. Leonida Legend!'
    : 'Platinum: Vice Got a Price! — locked (' + (54 - (n - (earned.has('Vice Got a Price!') ? 1 : 0))) + ' of 54 to go)';
  const missables = trophies.filter((t) => t.missable);
  document.getElementById('missCount').textContent = '(' + missables.filter((t) => !earned.has(t.name)).length + ' left of ' + missables.length + ')';
}

function toggleEarned(t) {
  if (earned.has(t.name)) earned.delete(t.name);
  else earned.add(t.name);
  if (t.name === 'Vice Got a Price!') {
    // The platinum is earned by earning the rest; keep the tick honest.
  }
  saveEarned(earned);
  renderAll();
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderMissables();
  renderRoadmap();
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren(...trophies.filter((t) => t.missable).map(trophyRow));
}

const ROADMAP = [
  { title: 'Stage 1 — Play the story (Chapters 1–4 + finale)', body: 'Just Like Paradise, Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma, You Gotta Know When to Get Off, plus the named missions Trust, Break the Bank, Family Matters, DWNFALL, Hi-Jacked and Snow Storm. 13 trophies, all unmissable. Do the partner trophies Hot Together and Retail Therapy while your partner is with you during story play.' },
  { title: 'Stage 2 — Side strands', body: 'Finish the five named strands — Andy (Road to Rehabilitation), Kenton (This Was No Boat Accident), Billy (The Lone Rider), Randy (Supply & Demand), Tyrone (Spin On This!) — plus Bret’s hunt (Fair Game) and three more stranger strands for Strangers & Freaks (8 in total). 7 trophies.' },
  { title: 'Stage 3 — Activities & skill trophies', body: 'Try all 9 activity types (Master of None), then the races (Earn Cash, Not Kudos — 20 different races; Top Fun — win at all 14 drone locations), fishing vs Cal (Baited My Tackle), an arcade game (Stick Fiddler), bowling (Let’s Go Bowling), and the hard one: gold in all 42 Shooting Range challenges (The Shootist). 7 trophies.' },
  { title: 'Stage 4 — Combat & crime in free roam', body: 'Gunslinger (5 takedowns in one Combat Focus), Catch Me If You Can (unscheduled departure at VCIA), Challenging Tank (Rhinos), Sneakthief (undetected jewelry robbery), Capital Offense (smash out of a showroom), Ten Pin (melee drive-by) and Bad Luck, I Guess (succeed on the immediate retry) — the in-the-moment trophies. Then the repeatable robberies: 5 bank vaults (Maximum Withdrawal), an armored truck (A Classic Blitz Play) and one illegal operation per gang (Pest Control, 9 gangs). 10 trophies.' },
  { title: 'Stage 5 — Explore & collect', body: 'All 52 areas of Leonida (The Goodtime State), all 18 meditation spots (Positive Mental Attitude), 100 WAiNK It locations (You WAiNKer!), 3 card sets (Don’t Touch My Deck), 100 vehicles discovered (Whip It Good) and the quiet moments: a cocktail on Ocean Beach (In The Beginning…) and the strange event (The Truth Is Out There). 7 trophies.' },
  { title: 'Stage 6 — Money & the long grinds', body: 'Launder $250,000 of Marked Bills (Dime on the Dollar), spend $100,000 in shops (Treat Yo Self), buy all 8 garages (Little Boxes), register 10 vehicles in the Scooter Bros app (On the Spot), complete 50 challenges (One Last Thing) and 250 stunts (Cunning Stunts), plus the choices trophy (Actions Speak Louder) and the partnership moment (Personal Best). 8 trophies.' },
  { title: 'Stage 7 — 100% and the platinum', body: 'A Long Road (100% completion) is the last gold. Once it pops, the only trophy left is the platinum itself — Vice Got a Price! — which unlocks automatically. 2 trophies.' },
];

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  const stageTrophies = [
    ['Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!', 'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust', 'Break the Bank', 'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm', 'Hot Together'],
    ['Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider', 'Supply & Demand', 'Spin On This!', 'Fair Game', 'Strangers & Freaks'],
    ['Master of None', 'Earn Cash, Not Kudos', 'Top Fun', 'Baited My Tackle', 'Stick Fiddler', 'Let’s Go Bowling', 'The Shootist'],
    ['Gunslinger', 'Catch Me If You Can', 'Challenging Tank', 'Sneakthief', 'Capital Offense', 'Ten Pin', 'Bad Luck, I Guess', 'Maximum Withdrawal', 'A Classic Blitz Play', 'Pest Control'],
    ['The Goodtime State', 'Positive Mental Attitude', 'You WAiNKer!', 'Don’t Touch My Deck', 'Whip It Good', 'In The Beginning…', 'The Truth Is Out There'],
    ['Dime on the Dollar', 'Treat Yo Self', 'Little Boxes', 'On the Spot', 'One Last Thing', 'Cunning Stunts', 'Actions Speak Louder', 'Personal Best'],
    ['A Long Road', 'Vice Got a Price!'],
  ];
  ROADMAP.forEach((stage, i) => {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.body;
    const prog = document.createElement('p');
    prog.className = 'stage-progress';
    const names = stageTrophies[i];
    const done = names.filter((n) => earned.has(n)).length;
    prog.textContent = done + ' of ' + names.length + ' earned in this stage';
    li.append(h, p, prog);
    list.append(li);
  });
}

function showView(name) {
  view = name;
  for (const btn of document.querySelectorAll('#tabs button')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  for (const id of ['guide', 'roadmap', 'missables', 'sources']) {
    document.getElementById('view-' + id).classList.toggle('hidden', id !== name);
  }
  document.getElementById('toolbar').style.display = name === 'guide' ? '' : 'none';
}

for (const btn of document.querySelectorAll('#tabs button')) {
  btn.addEventListener('click', () => showView(btn.dataset.view));
}
for (const el of [searchEl, tierEl, kindEl, earnedEl, spoilerEl]) {
  el.addEventListener('input', () => { renderList(); renderDetail(); });
}
document.getElementById('exportBtn').addEventListener('click', () => exportEarned(earned));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importEarned(file);
    saveEarned(earned);
    renderAll();
  } catch (err) {
    alert('Could not import that file: ' + err.message);
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned ticks?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

// If the platinum was ticked while others are missing, keep the count honest:
// the platinum only counts once the other 54 are earned.
if (earned.has('Vice Got a Price!') && earned.size < 55) {
  // Leave the tick as the user set it; the header shows how many remain.
}

renderAll();
