/* Keeper prototype: plain JS, no build step. */
(function () {
  'use strict';
  const D = window.KEEPER_DATA;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const app = $('#app'), device = $('#device');
  const STORE = 'keeper-demo-v2';
  const DAY = 86400000;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- dates ---------- */
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = n => { const d = today0(); d.setDate(d.getDate() + n); return d; };
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const fromISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const daysOut = s => Math.round((fromISO(s) - today0()) / DAY);
  const DOW = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const daysToDow = (dow, allowToday) => { const t = today0().getDay(); let n = (dow - t + 7) % 7; if (n === 0 && !allowToday) n = 7; return n; };
  const shortDate = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  function dueInfo(due, status) {
    if (!due) return { label: 'No date', cls: 'none' };
    const n = daysOut(due), d = fromISO(due);
    const md = (d.getMonth() + 1) + '/' + d.getDate();
    if (status === 'done') return { label: md, cls: '' };
    if (n === 0) return { label: 'Today', cls: 'today' };
    if (n === 1) return { label: 'Tomorrow', cls: 'soon' };
    return { label: md, cls: n < 0 ? 'overdue' : '' };
  }
  const agoText = ts => { const s = ago(ts); return s === 'now' ? 'just now' : s + ' ago'; };
  function ago(ts) {
    const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return 'now';
    if (m < 60) return m + 'm';
    const h = Math.round(m / 60);
    if (h < 24) return h + 'h';
    return Math.round(h / 24) + 'd';
  }

  /* ---------- icons ---------- */
  const P = {
    gmail: '<path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>',
    outlook: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="3"/><path d="M15 9h3M15 12h3M15 15h3"/>',
    slack: '<path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    sms: '<path d="M4 5h16v11H9l-5 4z"/>',
    zoom: '<rect x="3" y="7" width="12" height="10" rx="2"/><path d="M15 11l6-3v8l-6-3z"/>',
    meet: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/><circle cx="9.5" cy="12" r="2"/>',
    keeper: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    send: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
    feed: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    checklist: '<path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    gcal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    clip: '<path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.3M12 17h.01"/>',
    merge: '<path d="M6 4v5a5 5 0 0 0 5 5h7M14 10l4 4-4 4M6 20v-3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    wave: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  const ic = (n, cls) => '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';
  /* colour is reserved for actions: sources, people and projects are neutral */
  const srcLabel = s => (D.SOURCES[s] || D.SOURCES.keeper).label;
  const LOGO = {"gmail": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path fill=\"#4285F4\" d=\"M6 38h7V22L4 15v20a3 3 0 0 0 2 3z\"/><path fill=\"#34A853\" d=\"M35 38h7a3 3 0 0 0 2-3V15l-9 7z\"/><path fill=\"#FBBC04\" d=\"M35 11v11l9-7v-3c0-3.7-4.2-5.8-7.2-3.6z\"/><path fill=\"#EA4335\" d=\"M13 22V11l11 8.3L35 11v11l-11 8.3z\"/><path fill=\"#C5221F\" d=\"M4 12v3l9 7V11l-1.8-1.6C8.2 7.2 4 9.3 4 12z\"/></svg>", "outlook": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"18\" y=\"8\" width=\"26\" height=\"32\" rx=\"3\" fill=\"#28A8EA\"/><path fill=\"#0078D4\" d=\"M18 24h26v13a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3z\"/><rect x=\"4\" y=\"13\" width=\"22\" height=\"22\" rx=\"3\" fill=\"#0A64C2\"/><ellipse cx=\"15\" cy=\"24\" rx=\"5.2\" ry=\"6.3\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.6\"/></svg>", "slack": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path fill=\"#E01E5A\" d=\"M14 29a4 4 0 1 1-4-4h4zm2 0a4 4 0 0 1 8 0v10a4 4 0 0 1-8 0z\"/><path fill=\"#36C5F0\" d=\"M20 14a4 4 0 1 1 4-4v4zm0 2a4 4 0 0 1 0 8H10a4 4 0 0 1 0-8z\"/><path fill=\"#2EB67D\" d=\"M34 20a4 4 0 1 1 4 4h-4zm-2 0a4 4 0 0 1-8 0V10a4 4 0 0 1 8 0z\"/><path fill=\"#ECB22E\" d=\"M28 34a4 4 0 1 1-4 4v-4zm0-2a4 4 0 0 1 0-8h10a4 4 0 0 1 0 8z\"/></svg>", "sms": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"44\" height=\"44\" rx=\"11\" fill=\"#34C759\"/><path fill=\"#fff\" d=\"M24 12c-7.7 0-14 5-14 11.2 0 3.6 2.1 6.8 5.4 8.8L14 37l6.2-3.3c1.2.3 2.5.5 3.8.5 7.7 0 14-5 14-11.2S31.7 12 24 12z\"/></svg>", "zoom": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"2\" y=\"2\" width=\"44\" height=\"44\" rx=\"11\" fill=\"#0B5CFF\"/><rect x=\"10\" y=\"16\" width=\"19\" height=\"16\" rx=\"4\" fill=\"#fff\"/><path fill=\"#fff\" d=\"M31 21.5l7-4.5v14l-7-4.5z\"/></svg>", "meet": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path fill=\"#00832D\" d=\"M27 24l4.4 5 5.6 3.7 1-8.6-1-8.4-5.7 3.2z\"/><path fill=\"#0066DA\" d=\"M4 31.6V38a3 3 0 0 0 3 3h6.4l1.3-4.8-1.3-4.6-4.4-1.3z\"/><path fill=\"#E94235\" d=\"M13.4 7L4 16.4l4.8 1.3 4.6-1.3 1.3-4.4z\"/><path fill=\"#2684FC\" d=\"M13.4 16.4H4v15.2h9.4z\"/><path fill=\"#00AC47\" d=\"M42 11.3l-5 4.4v16.9l5 4.1c.8.6 2 0 2-1V12.3c0-1-1.2-1.6-2-1zM27 24v7.6H13.4V41h20.1a3 3 0 0 0 3-3v-5.6z\"/><path fill=\"#FFBA00\" d=\"M33.5 7H13.4v9.4H27V24l9.6-8V10a3 3 0 0 0-3-3z\"/></svg>", "gcal": "<svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"6\" y=\"6\" width=\"36\" height=\"36\" rx=\"5\" fill=\"#fff\" stroke=\"#DADCE0\" stroke-width=\"2\"/><path d=\"M6 11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v5H6z\" fill=\"#1A73E8\"/><text x=\"24\" y=\"36\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-weight=\"700\" font-size=\"15\" fill=\"#1A73E8\">31</text></svg>", "keeper": "<img src=\"keeper-logo.svg\" alt=\"\">"};
  const srcIc = s => '<span class="src-ic lg" title="' + esc(srcLabel(s)) + '">' + (LOGO[s] || LOGO.keeper) + '</span>';
  const SICON = {
    upnext: '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    inprogress: '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor"/>',
    blocked: '<circle cx="8" cy="8" r="6.4" fill="currentColor"/><path d="M5 8h6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>',
    done: '<circle cx="8" cy="8" r="6.4" fill="currentColor"/><path d="M5.2 8.2l1.9 1.9 3.7-4" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    triage: '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2.2 2"/>'
  };
  const sdot = st => '<svg class="sico" viewBox="0 0 16 16" aria-hidden="true">' + (SICON[st] || '') + '</svg>';
  const spill = st => '<span class="spill s-' + st + '">' + sdot(st) + esc(st === 'triage' ? 'To review' : statusLabel(st)) + '</span>';
  const srcTag = s => '<span class="lab">' + srcIc(s) + esc(srcLabel(s)) + '</span>';
  const personName = k => (D.PEOPLE[k] ? D.PEOPLE[k].name : k) || '';
  const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const av = k => { if (k === 'maya') return '<img class="av" src="maya.svg" alt="Maya">'; const n = personName(k); return n ? '<span class="av" title="' + esc(n) + '">' + esc(initials(n)) + '</span>' : ''; };
  const projName = p => (D.PROJECTS[p] ? D.PROJECTS[p].name : '');
  const projTag = p => esc(projName(p));

  /* ---------- state ---------- */
  let uid = 1;
  const nid = () => 't' + Date.now().toString(36) + (uid++);
  function mkTask(t, extra) {
    return Object.assign({
      id: nid(), title: t.title, source: t.source, category: t.category, project: t.project || null,
      requester: t.requester || null, collaborators: t.collaborators || [],
      due: t.due == null ? null : iso(addDays(t.due)), status: t.status || 'upnext',
      snippet: t.snippet || '', captured: Date.now() - (t.ago || 0) * 60000, fresh: false,
      triage: !!t.triage, low: !!t.low, dismissed: false,
      also: (t.also || []).map(a => ({ source: a.source, snippet: a.snippet, captured: Date.now() - (a.ago || 0) * 60000 }))
    }, extra || {});
  }
  /* completion detection: what Keeper has seen in your channels that shows a task is (partly) done */
  const DETECT_SEED = {
    'Send final brand guidelines PDF': { kind: 'partial', via: 'gmail', proof: 'You emailed Dana the guidelines PDF', remaining: 'Dana’s Slack follow-up also asked for the print-ready version', ago: 22 }
  };
  const DETECT_LIVE = { title: 'Revise the Halcyon homepage hero', kind: 'done', via: 'gmail', proof: 'You sent Marcus the revised homepage hero in Gmail' };
  /* detected changes: one wording change and one due-date change in the demo */
  const CHANGE_SEED = {
    'Send Raj the revised deck timeline': { kind: 'title', via: 'slack', proof: 'Raj in Slack: “Can you include the budget too?”', to: 'Send Raj the revised deck timeline and budget', ago: 14 },
    'Send weekly status report to Halcyon': { kind: 'due', via: 'outlook', proof: 'Marcus in Outlook: “Can this land two days later?”', days: 2, ago: 31 }
  };
  function seedDetect(list) {
    list.forEach(t => { const d = DETECT_SEED[t.title]; if (d && !t.detect) t.detect = { kind: d.kind, via: d.via, proof: d.proof, remaining: d.remaining || '', at: Date.now() - d.ago * 60000 }; });
    list.forEach(t => { const c = CHANGE_SEED[t.title]; if (!c || t.change) return;
      t.change = { kind: c.kind, via: c.via, proof: c.proof, at: Date.now() - c.ago * 60000, from: c.kind === 'title' ? t.title : t.due, to: c.kind === 'title' ? c.to : (t.due ? iso(addDays(daysOut(t.due) + c.days)) : null), state: 'pending' }; });
    return list;
  }
  const narrow = () => window.innerWidth < 720;
  function fresh() {
    return { onboarded: false, step: 0, channels: ['gmail', 'slack', 'sms', 'zoom'], screen: 'board', mode: 'mobile', mstatus: 'inprogress',
      tasks: seedDetect(D.SEED.map(t => mkTask(t))), detectSeeded: 3, incomingIdx: 0, live: true, unseen: 0, filter: { text: '', tokens: [] } };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.tasks) { s.tasks.forEach(t => t.fresh = false); s.filter = s.filter || { text: '', tokens: [] }; s.mstatus = 'inprogress'; s.live = true; s.unseen = s.unseen || 0; if (s.screen === 'feed') s.screen = 'board'; return s; } } catch (e) {}
    return null;
  }
  let S = load() || fresh();
  if (S.detectSeeded === 2) { seedDetect(S.tasks); S.detectSeeded = 3; }
  if (S.detectSeeded !== 2 && S.detectSeeded !== 3) { S.tasks.forEach(t => { if (t.title === 'Share the Halcyon staging site' && t.detect && !S.detectFired) { delete t.detect; if (t.doneBy === 'keeper') { t.status = 'inprogress'; t.doneBy = null; } } }); seedDetect(S.tasks); S.detectSeeded = 3; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  const UI = { expand: {}, srcTab: {}, editField: null, feedSel: null, sheet: null, menu: null, ask: null, drag: null, suppressClick: false, search: false, scale: 1 };
  const filterOn = () => !!(S.filter.text.trim() || S.filter.tokens.length);
  const mode = () => (narrow() ? 'mobile' : S.mode);
  const task = id => S.tasks.find(t => t.id === id);

  /* ---------- filter parsing ---------- */
  const FIRST = {}; Object.keys(D.PEOPLE).forEach(k => { if (k !== 'maya') FIRST[D.PEOPLE[k].name.split(' ')[0].toLowerCase()] = k; });
  const PROJKEYS = { northwind: 'northwind', halcyon: 'halcyon', brightside: 'brightside', okafor: 'okafor', lumen: 'lumen', studio: 'studio' };
  const CATWORDS = [
    ['Purchasing', /\b(purchas\w*|buy\w*|order\w*|renew\w*|licen[cs]e\w*|subscriptions?)\b/],
    ['Scheduling', /\b(schedul\w*|book\w*|meetings?|calendar|site visits?|visits?)\b/],
    ['Status update', /\b(status|updates?|progress|reports?|recaps?)\b/],
    ['Feedback & revisions', /\b(feedback|revis\w*|edits?|changes)\b/],
    ['Scope & timeline', /\b(scope|timelines?|deadlines?|delay\w*)\b/],
    ['Communication', /\b(communications?|repl\w*|respond\w*|messages?)\b/],
    ['Coordination', /\b(coordinat\w*|collaborat\w*|suppliers?|subcontractors?)\b/],
    ['Deliverables', /\b(deliverables?|deliver\w*|files?|final)\b/]
  ];
  const SRCWORDS = [
    ['email', /\b(e-?mails?|inbox)\b/, 'Email'], ['gmail', /\bgmail\b/, 'Gmail'], ['outlook', /\boutlook\b/, 'Outlook'],
    ['slack', /\bslack\b/, 'Slack'], ['sms', /\b(texts?|sms|business texts?)\b/, 'Business texts'],
    ['zoom', /\bzoom\b/, 'Zoom'], ['meet', /\b(google meet|meet)\b/, 'Google Meet'], ['calls', /\bcalls?\b/, 'Calls']
  ];
  const DUEWORDS = [['overdue', /\b(overdue|late|past due)\b/, 'Overdue'], ['today', /\btoday\b/, 'Due today'], ['tomorrow', /\btomorrow\b/, 'Due tomorrow'],
    ['thisweek', /\bthis week\b/, 'Due this week'], ['nextweek', /\bnext week\b/, 'Due next week'], ['nodate', /\bno (due )?date\b/, 'No date']];
  const STOP = new Set('a an the all my me show find tasks task for from with due and or in on to of what is are that any by about please items things stuff need needs who anything everything something show'.split(' '));
  function parseFilter(text) {
    let t = ' ' + text.toLowerCase() + ' ';
    const out = [];
    const take = (re, fn) => { t = t.replace(new RegExp(re.source, 'g'), m => { fn(m); return ' '; }); };
    DUEWORDS.forEach(([v, re, label]) => take(re, () => out.push({ type: 'due', value: v, label })));
    SRCWORDS.forEach(([v, re, label]) => take(re, () => out.push({ type: 'source', value: v, label })));
    CATWORDS.forEach(([v, re]) => take(re, () => out.push({ type: 'category', value: v, label: v })));
    Object.keys(PROJKEYS).forEach(k => take(new RegExp('\\b' + k + '\\w*'), () => out.push({ type: 'project', value: PROJKEYS[k], label: D.PROJECTS[PROJKEYS[k]].name })));
    Object.keys(FIRST).forEach(f => take(new RegExp('\\b' + f + '(\'s|’s)?\\b'), () => out.push({ type: 'person', value: FIRST[f], label: personName(FIRST[f]) })));
    const rest = t.split(/[^a-z0-9']+/).filter(w => w && !STOP.has(w));
    if (rest.length) out.push({ type: 'text', value: rest.join(' '), label: '“' + rest.join(' ') + '”' });
    const seen = new Set();
    return out.filter(k => { const key = k.type + k.value; if (seen.has(key)) return false; seen.add(key); return true; });
  }
  const activeTokens = () => S.filter.tokens.concat(parseFilter(S.filter.text).map(t => Object.assign({ auto: true }, t)));
  function matches(tk, tokens) {
    const by = {};
    tokens.forEach(t => (by[t.type] = by[t.type] || []).push(t.value));
    const ok = (type, fn) => !by[type] || by[type].some(fn);
    return ok('source', v => v === 'email' ? /gmail|outlook/.test(tk.source) : v === 'calls' ? /zoom|meet/.test(tk.source) : tk.source === v)
      && ok('category', v => tk.category === v)
      && ok('project', v => tk.project === v)
      && ok('person', v => tk.requester === v || new RegExp('\\b' + personName(v).split(' ')[0] + '\\b', 'i').test(tk.title))
      && ok('due', v => {
        if (v === 'nodate') return !tk.due;
        if (!tk.due) return false;
        const n = daysOut(tk.due), toSun = 7 - today0().getDay();
        return v === 'overdue' ? n < 0 && tk.status !== 'done' : v === 'today' ? n === 0 && tk.status !== 'done' : v === 'tomorrow' ? n === 1
          : v === 'thisweek' ? n >= 0 && n < toSun : v === 'nextweek' ? n >= toSun && n < toSun + 7 : true;
      })
      && ok('text', v => v.split(' ').every(w => (tk.title + ' ' + tk.snippet + ' ' + (D.PROJECTS[tk.project] || {}).name).toLowerCase().includes(w)));
  }

  /* ---------- task parsing (assistant) ---------- */
  const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, couple: 2, few: 3 };
  const num = w => (/^\d+$/.test(w) ? +w : NUMW[w] || 0);
  const diff = d => Math.round((d - today0()) / DAY);
  const future = d => { if (d < today0()) d.setFullYear(d.getFullYear() + 1); return d; };
  /* understands most ways people say a date: weekdays, relative spans, month names, the 25th, 10/30, 2026-11-04 … */
  function parseDue(text) {
    const s = text.toLowerCase().replace(/’/g, "'");
    const pre = '(?:\\b(?:by|on|due|before|until|for|at)\\s+)?(?:the\\s+)?';
    const N = '(\\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|couple of|few)';
    const MONTHS = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?';
    const DAYS = '(monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat|sunday|sun)';
    const dowIdx = w => DOW.findIndex(d => d.startsWith(w.slice(0, 3)));
    const tries = [
      ['(\\d{4})-(\\d{2})-(\\d{2})', m => diff(new Date(+m[1], +m[2] - 1, +m[3]))],
      [N + ' (day|week|month)s? from (now|today)\\b', m => unit(num(m[1].replace(' of', '')), m[2])],
      ['in ' + N + ' (day|week|month)s?\\b', m => unit(num(m[1].replace(' of', '')), m[2])],
      ['day after tomorrow', () => 2],
      ['(today|tonight|end of (the )?day|eod|asap|right away)\\b', () => 0],
      ['(tomorrow|tmrw|tmr)\\b', () => 1],
      ['(end of (the )?month|eom|month end)\\b', () => { const t = today0(); return diff(new Date(t.getFullYear(), t.getMonth() + 1, 0)); }],
      ['(end of (the )?week|this week|eow)\\b', () => daysToDow(5, true)],
      ['(this )?weekend\\b', () => daysToDow(6, true)],
      ['next month\\b', () => { const t = today0(); return diff(new Date(t.getFullYear(), t.getMonth() + 1, 1)); }],
      ['(next week|early next week)\\b', () => daysToDow(1, false)],
      ['end of next week\\b', () => daysToDow(5, true) + 7],
      ['(next|this|coming)?\\s*' + DAYS + '\\b', m => { const i = dowIdx(m[2]); const n = daysToDow(i, false); return n + (m[1] === 'next' && n < 4 ? 7 : 0); }],
      [MONTHS + '\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b', m => { const d = new Date(m[3] ? +m[3] : today0().getFullYear(), MON.indexOf(m[1].slice(0, 3)), +m[2]); return diff(m[3] ? d : future(d)); }],
      ['(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?' + MONTHS + '\\b', m => diff(future(new Date(today0().getFullYear(), MON.indexOf(m[2].slice(0, 3)), +m[1])))],
      ['(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?\\b', m => { const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : today0().getFullYear(); const d = new Date(y, +m[1] - 1, +m[2]); return diff(m[3] ? d : future(d)); }],
      ['(\\d{1,2})(st|nd|rd|th)\\b', m => { const t = today0(); let d = new Date(t.getFullYear(), t.getMonth(), +m[1]); if (d < t) d = new Date(t.getFullYear(), t.getMonth() + 1, +m[1]); return diff(d); }]
    ];
    function unit(n, u) { if (!n) n = 1; if (u === 'day') return n; if (u === 'week') return n * 7; const t = today0(); return diff(new Date(t.getFullYear(), t.getMonth() + n, t.getDate())); }
    for (const [src, fn] of tries) {
      const re = new RegExp(pre + '\\b' + src);
      const m0 = s.match(re);
      if (m0) {
        const m = s.slice(m0.index).match(new RegExp('\\b' + src)) || m0;
        const days = fn(m);
        if (days == null || isNaN(days)) continue;
        return { days, start: m0.index, end: m0.index + m0[0].length };
      }
    }
    return null;
  }
  function guessCategory(text) {
    const s = text.toLowerCase();
    const order = [
      ['Purchasing', /\b(buy|order|purchase|renew|licen[cs]e|subscription|pay for)\b/],
      ['Scheduling', /\b(schedule|reschedule|book|set up a (call|meeting)|meeting|site visit|visit)\b/],
      ['Status update', /\b(status|progress|report|recap|update)\b/],
      ['Scope & timeline', /\b(scope|timeline|deadline|push back|delay)\b/],
      ['Communication', /\b(reply|respond|email|text|message|call back|get back to)\b/],
      ['Coordination', /\b(coordinate|ask|check with|follow up with|sync|confirm)\b/],
      ['Feedback & revisions', /\b(feedback|revise|revision|edit|tweak|rework)\b/],
      ['Deliverables', /\b(send|deliver|share|export|final|files|draft)\b/]
    ];
    for (const [c, re] of order) if (re.test(s)) return c;
    return 'Communication';
  }
  function findPeople(text) {
    const out = [];
    Object.keys(FIRST).forEach(f => { const m = text.match(new RegExp('\\b' + f + '\\b', 'i')); if (m) out.push({ key: FIRST[f], index: m.index }); });
    return out.sort((a, b) => a.index - b.index);
  }
  const COLWORDS = [['upnext', 'up next|next up|backlog|later|someday'], ['inprogress', 'in progress|doing|working on|blocked|waiting']];
  function parseCol(text) {
    for (const [id, words] of COLWORDS) {
      const m = text.match(new RegExp('\\s*(?:,|\\band\\b|\\bthen\\b)?\\s*\\b(?:(?:add|put|move|file|drop)(?: (?:it|this))? )?(?:to|in|into|on|under)\\s+(?:the\\s+|my\\s+)?(?:' + words + ')(?:\\s+(?:column|list|lane))?\\b', 'i'));
      if (m) return { id, start: m.index, end: m.index + m[0].length };
    }
    return null;
  }
  /* turn a rambling request into a short task title */
  const FILLER = /^\s*(?:(?:ok(?:ay)?|so|um+|uh+|hey keeper|keeper|please|hey|alright|right)[,\s]+)*(?:(?:can|could) you\s+|i(?:'ll| will)? (?:need|have|want|got) to\s+|i(?:'ve| have)? got(?:ta| to)\s+|i gotta\s+|i should\s+|i must\s+|need to\s+|have to\s+|(?:please\s+)?remind me to\s+|remember to\s+|(?:make sure|be sure) (?:to|that i)\s+|don'?t forget to\s+|let'?s\s+|go ahead and\s+|add (?:a )?task (?:to\s+)?|todo:?\s*|to-do:?\s*|new task:?\s*)+/i;
  const REWRITES = [
    /* messages become the thing to deliver: "reply to Jen about the logo colors" → "Send Jen the logo colors" */
    [/^(?:reply|respond|write back|get back|answer|email|e-mail|text|message|ping|slack|dm|follow up|circle back|check in)(?: to| with)? (\w+)(?:['’]s)? (?:about|re|regarding|on|with|for) (?:the |her |his |their |our |my )?(.+)$/i, (m, who, what) => 'Send ' + who + ' the ' + what],
    [/^(?:email|e-mail|text|message|ping|slack|dm) (\w+) (the|a|an|our|my|her|his|their) /i, 'Send $1 $2 '],
    [/^shoot (?:over|across)?\b/i, 'Send'], [/^send over\b/i, 'Send'], [/^get (\w+) (the|a|an)\b/i, 'Send $1 $2'],

    [/^take a look at\b/i, 'Review'], [/^have a look at\b/i, 'Review'], [/^look over\b/i, 'Review'], [/^go over\b/i, 'Review'],
    [/^put together\b/i, 'Draft'], [/^come up with\b/i, 'Draft'], [/^work on\b/i, 'Work on'], [/^figure out\b/i, 'Decide'],
    [/^(?:set up|schedule|book) a (call|meeting)(?: with (\w+))? to (?:go over|discuss|talk about|review)\b/i, (m, k, who) => 'Schedule ' + k + (who ? ' with ' + who : '') + ' about'], [/^set up a (call|meeting) with\b/i, 'Schedule a $1 with'], [/^hop on a call with\b/i, 'Call'], [/^give (\w+) a call\b/i, 'Call $1'],
    [/^pick up\b/i, 'Buy'], [/^grab\b/i, 'Get']
  ];
  const VAGUE = /^(?:reply|respond|write back|get back|answer|email|e-mail|text|message|ping|slack|dm|follow up|circle back|check in|touch base|call back|get in touch|reach out|talk to|chat with)\b/i;
  function stripDates(t) {
    for (let i = 0; i < 3; i++) { const r = parseDue(t); if (!r) break; t = t.slice(0, r.start) + ' ' + t.slice(r.end); }
    return t.replace(/\s+(?:by|before|until|on|due|for|at)\s*$/i, ' ');
  }
  function simplifyTitle(w) {
    let t = ' ' + stripDates(w.replace(/\s+/g, ' ').trim()) + ' ';
    t = t.replace(FILLER, ' ');
    t = t.replace(/^\s*(i|we)\s+/i, ' ');
    /* keep the main clause only */
    t = t.split(/\s(?:so that|so she|so he|so they|so we|so i|because|since|which|cause|’cause|'cause|as soon as|once|in case|otherwise|and then|and also|plus|but)\s|[.;!?]|,\s(?:and|so|but|then)\s/i)[0];
    t = t.replace(/\s(?:before|after|ahead of|during|at|in) (?:our|the|my|their|her|his|next|this) (?:call|meeting|review|sync|chat|catch-?up|kickoff)\b.*$/i, '');
    t = t.replace(/\s(?:when|if) (?:i|you|we|she|he|they) (?:can|get a chance|have time)\b.*$/i, '');
    t = t.replace(/\s(?:as well|too|for me|real quick|quickly|asap|if possible|please|okay|ok)\s*$/i, ' ');
    t = t.replace(/\s+(?:and|then|or|to|for|with|about|on|of|the|a|an)\s*$/i, ' ');
    t = t.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();
    for (const [re, to] of REWRITES) if (re.test(t)) { t = t.replace(re, to); break; }
    const words = t.split(' ');
    if (words.length > 10) { t = words.slice(0, 10).join(' ').replace(/\s+(?:and|then|or|to|for|with|about|on|of|the|a|an|so|that)$/i, ''); }
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function parseTask(text) {
    let w = ' ' + text.trim() + ' ';
    const cr = parseCol(w); let col = 'upnext';
    if (cr) { col = cr.id; w = w.slice(0, cr.start) + ' ' + w.slice(cr.end); }
    w = w.replace(FILLER, ' ');
    const dr = parseDue(w);
    let due = null;
    if (dr) { due = dr.days; w = w.slice(0, dr.start) + ' ' + w.slice(dr.end); }
    let collaborators = [];
    w = w.replace(/\bwith\s+([a-z]+)\b/i, (m, n) => {
      const k = FIRST[n.toLowerCase()];
      if (!k || D.PEOPLE[k].role !== 'client') return m;   /* keep "with Leo" in the title; a client becomes the requester */
      collaborators = [k]; return ' ';
    });
    let requester = null;
    w = w.replace(/\b(?:for|from)\s+([a-z]+)\b/i, (m, n) => {
      const k = FIRST[n.toLowerCase()];
      if (k) { requester = k; return ' '; }
      return m;
    });
    const asked = w.match(/^\s*([a-z]+)\s+(asked|wants|needs)( me)?( to)?\s+/i);
    if (!requester && asked && FIRST[asked[1].toLowerCase()]) { requester = FIRST[asked[1].toLowerCase()]; w = w.slice(asked[0].length); }
    if (!requester) {
      const ci = collaborators.findIndex(k => D.PEOPLE[k].role === 'client');
      if (ci >= 0) requester = collaborators.splice(ci, 1)[0];
    }
    if (!requester) {
      const ppl = findPeople(w).filter(p => D.PEOPLE[p.key].role === 'client');
      if (ppl.length) requester = ppl[0].key;
    }
    let project = null;
    Object.keys(PROJKEYS).forEach(k => { if (new RegExp('\\b' + k, 'i').test(text)) project = PROJKEYS[k]; });
    if (!project && requester && D.PEOPLE[requester].project) project = D.PEOPLE[requester].project;
    let title = simplifyTitle(w);
    return { title: title || text.trim(), due, dueSet: due != null, requester, requesterSet: !!requester, collaborators, project, category: guessCategory(text), col };
  }

  /* ---------- rendering ---------- */
  function setMode() {
    const m = mode();
    device.classList.toggle('is-mobile', m === 'mobile');
    device.classList.toggle('is-desktop', m === 'desktop');
    $$('.seg-view button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    $$('.seg-scope button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scope === (S.scope || 'mvp'))));
    document.body.classList.toggle('vision', vision());
    fitDevice();
    const dt = $('#devToasts'); if (dt && m !== 'mobile') dt.innerHTML = '';
  }
  /* phone is laid out at a true 390×844 and scaled to fit the window, so nothing reflows or clips */
  function fitDevice() {
    if (mode() !== 'mobile' || narrow()) { device.style.transform = ''; UI.scale = 1; return; }
    const st = $('#stage');
    const s = Math.min(1, (st.clientWidth - 32) / 410, (st.clientHeight - 24) / 864);
    UI.scale = s;
    device.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(4) + ')';
  }
  function render() {
    applyAgent();
    setMode();
    UI.menu = null;
    if (!S.onboarded) app.innerHTML = renderOnboarding();
    else app.innerHTML = mode() === 'mobile' ? renderMobile() : renderDesktop();
    app.insertAdjacentHTML('beforeend', '<div class="layer" id="layer"></div>');
    renderLayer(true);
    if (S.onboarded && S.step === 3) { /* noop */ }
  }

  /* first-run review: approve or reject everything Keeper found before it reaches your list */
  const foundTasks = () => S.tasks.filter(t => !t.dismissed && t.status !== 'done' && t.source !== 'keeper' && S.channels.includes(t.source)).sort((a, b) => b.captured - a.captured);
  function onbReviewHTML(steps) {
    const list = foundTasks(), pick = S.onbPick || {};
    const kept = list.filter(t => pick[t.id] === 'keep').length, decided = list.filter(t => pick[t.id]).length;
    const rows = list.map(t => {
      const p = pick[t.id], who = t.requester && t.requester !== 'maya' ? personName(t.requester) : 'You';
      return `<article class="ob-rv ${p || ''}" data-tid="${t.id}">
        <div class="rv-top">${srcIcons(t)}<span>${esc(who)} · ${esc(srcLabel(t.source))}</span></div>
        <div class="ob-title">${esc(t.title)}</div>
        ${t.snippet ? `<div class="rv-snip">“${esc(origin(t).text)}”</div>` : ''}
        <div class="ob-acts">
          <button type="button" class="ob-btn no ${p === 'skip' ? 'on' : ''}" data-action="ob-pick" data-v="skip" aria-pressed="${p === 'skip'}">${ic('x')}Dismiss</button>
          <button type="button" class="ob-btn yes ${p === 'keep' ? 'on' : ''}" data-action="ob-pick" data-v="keep" aria-pressed="${p === 'keep'}">${ic('check')}Keep</button>
        </div></article>`;
    }).join('');
    return `<div class="onb rvstep"><div class="onb-inner">${steps(3)}
      <h2>Keeper found ${list.length} tasks</h2>
      <p class="lead">Keep the ones you owe someone. Dismissed tasks won’t be added to your list.</p>
      <div class="ob-bar"><span>${decided} of ${list.length} reviewed</span><button type="button" class="linkish" data-action="ob-all">Keep all</button></div>
      <div class="ob-list">${rows}</div>
      <div class="onb-foot ob-foot"><button class="btn-primary" data-action="ob-finish" ${kept ? '' : 'disabled'}>Add ${kept} task${kept === 1 ? '' : 's'} to my list</button>
        <span class="small">${decided < list.length ? 'Anything you skip now stays in To review.' : 'You can change these later.'}</span></div>
    </div></div>`;
  }
  function privacyCard() {
    return `<div class="priv"><div class="priv-h">${ic('shield')}<b>Your data stays yours</b></div>
      <ul><li>${ic('check')}Your messages and client data are never used to train AI models, ours or anyone else’s.</li>
      <li>${ic('check')}Encrypted in transit and at rest. Only you can see your list.</li>
      <li>${ic('check')}Keeper reads to find tasks. It never sends anything without your permission.</li>
      <li>${ic('check')}Disconnect a channel or delete everything, anytime, in one tap.</li></ul></div>`;
  }
  function renderOnboarding() {
    const steps = n => '<div class="steps">' + [0, 1, 2, 3].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</div>';
    if (S.step === 0) return `<div class="onb"><div class="onb-inner">
      <div class="onb-hero"><span class="logo-mark" aria-hidden="true"></span>
      <h1 class="welcome-h">The only to-do list<br>that <em>updates itself.</em></h1>
      <p class="lead">Keeper listens across your inboxes, chats, texts and calls, catches every promise you make, and keeps it on one simple list.</p></div>
      <div class="onb-foot"><button class="btn-primary" data-action="onb-next">Get started</button><span class="small">Takes about a minute</span></div>
    </div></div>`;
    if (S.step === 1) {
      const keys = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'];
      const rows = keys.map(k => {
        const s = D.SOURCES[k], on = S.channels.includes(k);
        const extra = k === 'sms' ? '<span class="num">' + bizNum() + '</span>' : '';
        return `<button type="button" class="chan ${on ? 'on' : ''}" data-action="chan" data-k="${k}" aria-pressed="${on}">
          ${srcIc(k)}
          <span class="chan-txt"><b>${esc(s.label)}</b><span>${esc(s.desc)}</span>${extra}</span>
          <span class="tog" aria-hidden="true"></span></button>`;
      }).join('');
      return `<div class="onb"><div class="onb-inner">${steps(1)}
        <h2>Where do your tasks come from?</h2>
        <p class="lead">Pick the channels Keeper should listen to. You can change these anytime.</p>
        <div class="chan-list">${rows}</div>
        ${privacyCard()}
        <div class="onb-foot"><button class="btn-primary" data-action="onb-next" ${S.channels.length ? '' : 'disabled'}>Connect ${S.channels.length} channel${S.channels.length === 1 ? '' : 's'}</button>
        <span class="small">Prototype: connections are simulated</span></div>
      </div></div>`;
    }
    if (S.step === 3) return onbReviewHTML(steps);
    const counts = S.channels.map(k => S.tasks.filter(t => t.source === k).length);
    const rows = S.channels.map((k, i) => `<div class="scan-row" style="--k:${i}">${srcIc(k)}<b>${esc(D.SOURCES[k].label)}</b><span class="bar"><i style="--k:${i}"></i></span><span class="cnt">${counts[i] || 1} found</span></div>`).join('');
    return `<div class="onb"><div class="onb-inner">${steps(2)}
      <h2>Catching your tasks…</h2>
      <p class="lead">Keeper is reading the last week of messages and meetings for anything you owe someone.</p>
      <div class="scan">${rows}</div></div></div>`;
  }

  function summary() {
    const open = S.tasks.filter(t => live(t) && t.status !== 'done');
    const today = open.filter(t => t.due && daysOut(t.due) === 0).length;
    const over = open.filter(t => t.due && daysOut(t.due) < 0).length;
    const on = v => S.filter.tokens.some(t => t.type === 'due' && t.value === v);
    const btn = (v, n, label, cls) => `<button type="button" class="sum-btn ${cls || ''} ${on(v) ? 'on' : ''}" data-action="f-due" data-v="${v}" aria-pressed="${on(v)}"><b>${n}</b> ${label}</button>`;
    return btn('today', today, 'due today') + (over ? btn('overdue', over, 'overdue', 'bad') : '');
  }
  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    return `<div class="greet"><h1>${g}, <em>Maya</em></h1></div>`;
  }
  const searchBtn = () => { const n = S.filter.tokens.length + (S.filter.text.trim() ? 1 : 0);
    return `<button type="button" class="icon-btn labeled ${UI.search || n ? 'on' : ''}" id="searchBtn" data-action="search" aria-label="Filters" aria-expanded="${UI.search}">${ic('filter')}Filter${n && !UI.search ? `<span class="dot-badge">${n}</span>` : ''}</button>`; };
  function filterChips() {
    const cnt = type => S.filter.tokens.filter(t => t.type === type).length;
    const chip = (menu, label) => `<button type="button" class="chip ${cnt(menu) ? 'on' : ''}" data-action="f-menu" data-menu="${menu}">${label}${cnt(menu) ? ' · ' + cnt(menu) : ''} <span class="caret">▾</span></button>`;
    return chip('due', 'Due date') + chip('project', 'Project') + chip('person', 'People') + chip('source', 'Channel');
  }
  /* collapsed to a filter icon; opens filters with the plain-language search beneath */
  function filterBar() {
    if (!UI.search) return '<div id="filter" hidden></div>';
    return `<div class="search" id="filter">
      <div class="f-head"><div class="chips" id="fChips">${filterChips()}</div>
        <button type="button" class="f-close" data-action="f-close">Done</button></div>
      <label class="fbox">${ic('search')}<input id="fInput" type="text" autocomplete="off" placeholder="Search, e.g. “Slack tasks for Brightside”" value="${esc(S.filter.text)}" aria-label="Search tasks in plain language">
      <button type="button" class="clr" data-action="f-clear-text" aria-label="Clear search" ${S.filter.text ? '' : 'hidden'}>${ic('x')}</button></label>
      <div class="tokens" id="tokens">${tokensHTML()}</div>
    </div>`;
  }
  function tokensHTML() {
    const toks = activeTokens();
    if (!toks.length) return '';
    const n = S.tasks.filter(t => matches(t, toks)).length;
    return `<span class="lbl">${n} match${n === 1 ? '' : 'es'}</span>` + toks.map((t, i) =>
      `<button type="button" class="tok" data-action="tok-x" data-i="${i}" title="Remove">${esc(t.label)}<span class="x">×</span></button>`).join('')
      + '<button type="button" class="linkish" data-action="f-clear">Clear</button>';
  }

  const srcIcons = t => '<span class="src-stack">' + [t.source].concat((t.also || []).map(a => a.source)).filter((v, i, a) => a.indexOf(v) === i).map(srcIc).join('') + '</span>';
  /* triage card: accept or dismiss what Keeper caught */
  function reviewCard(t) {
    const from = t.requester && t.requester !== 'maya' ? personName(t.requester) : 'You';
    return `<article class="rv ${t.fresh ? 'fresh' : ''}" data-tid="${t.id}">
      <div class="rv-top">${srcIcons(t)}<span>${esc(from)} · ${esc(srcLabel(t.source))} · ${agoText(t.captured)}</span></div>
      <button type="button" class="rv-title" data-action="open" data-id="${t.id}">${esc(t.title)}</button>
      ${t.snippet ? `<div class="rv-snip">“${esc(origin(t).text)}”</div>` : ''}
      <div class="rv-acts"><button type="button" class="btn-ghost" data-action="rv-dismiss">Dismiss</button><button type="button" class="btn-primary" data-action="rv-add">${ic('check')}Keep</button></div>
    </article>`;
  }
  function reviewStrip() {
    const list = toReview();
    if (!list.length) return '';
    if (mode() === 'mobile') return `<button type="button" class="rv-banner" data-action="review"><span class="rv-count">${list.length}</span><span class="o-txt"><b>${list.length === 1 ? 'New task' : 'New tasks'} to review</b><span>Keeper caught ${list.length === 1 ? 'this' : 'these'}. Keep or dismiss.</span></span>${ic('chev')}</button>`;
    return `<section class="rv-strip"><div class="rv-h"><h2>To review <span class="n">${list.length}</span></h2><span>Keeper caught these. Keep them on your list or dismiss.</span>${list.length > 3 ? `<button type="button" class="linkish" data-action="review">See all</button>` : ''}</div>
      <div class="rv-row">${list.slice(0, 3).map(reviewCard).join('')}</div></section>`;
  }
  function changeBadge(t) {
    const c = t.change; if (!c || t.status === 'done') return '';
    if (c.state === 'auto') return `<span class="det-badge auto">${ic(c.kind === 'due' ? 'cal' : 'spark')}${c.kind === 'due' ? 'Due date updated by Keeper' : 'Updated by Keeper'}</span>`;
    if (c.state !== 'pending') return '';
    if (c.kind === 'due') return `<span class="det-badge">${ic('cal')}Due date moved</span><span class="det-note"><s>${esc(fmtDue(c.from))}</s> → <b>${esc(fmtDue(c.to))}</b> · ${esc(srcLabel(c.via))}</span>`;
    return `<span class="det-badge">${ic('spark')}Updated</span><span class="det-note"><b>Now:</b> ${esc(c.to)}</span>`;
  }
  function detectBadge(t) {
    if (t.status === 'done' && t.doneBy === 'keeper') return `<span class="det-badge auto">${ic('check')}Completed by Keeper</span>`;
    if (!detected(t) || t.status === 'done') return '';
    if (t.detect.kind === 'partial') return `<span class="det-badge part">${ic('check')}Partly done</span><span class="det-note"><b>Still to do:</b> ${esc(t.detect.remaining)}</span>`;
    return `<span class="det-badge">${ic('check')}Detected done</span><span class="det-note">${esc(t.detect.proof)}</span>`;
  }
  function cardHTML(t) {
    const di = dueInfo(t.due, t.status);
    const who = t.requester && t.requester !== 'maya' ? personName(t.requester) : 'You';
    const where = [projName(t.project), who].filter(Boolean).join(' · ');
    return `<article class="card ${t.status === 'done' ? 'done' : ''} ${t.fresh ? 'fresh' : ''}" data-id="${t.id}" tabindex="0" aria-label="${esc(t.title)}">
      <div class="card-title">${esc(t.title)}</div>
      ${changeBadge(t)}${detectBadge(t)}${agentBadge(t)}
      <div class="card-meta"><span class="where">${srcIcons(t)}<span>${esc(where)}</span></span>
        <span class="due ${di.cls}">${t.status === 'done' ? '✓ ' : ''}${esc(di.label)}</span></div>
    </article>`;
  }
  /* Backlog sorts by due date (no date last) until the user reorders it by hand */
  const byDue = (x, y) => (x.due ? fromISO(x.due).getTime() : Infinity) - (y.due ? fromISO(y.due).getTime() : Infinity);
  const live = t => !t.dismissed && !t.triage;
  const toReview = () => S.tasks.filter(t => t.triage && !t.dismissed && (t.source === 'keeper' || S.channels.includes(t.source))).sort((a, b) => b.captured - a.captured);
  function colTasks(id, toks) {
    const list = S.tasks.filter(t => live(t) && t.status === id && matches(t, toks || []));
    return id === 'upnext' && !(S.manual && S.manual.upnext) ? list.slice().sort(byDue) : list;
  }
  const sortNote = id => id !== 'upnext' ? '' : S.manual && S.manual.upnext
    ? `<button type="button" class="sort-note" data-action="sort-due">Sort by due date</button>` : `<span class="sort-note">By due date</span>`;
  function boardHTML() {
    const toks = activeTokens();
    return D.COLUMNS.map(c => {
      const list = colTasks(c.id, toks);
      if (c.id === 'done' && !S.doneOpen) return `<section class="col collapsed" data-col="done">
        <button type="button" class="col-toggle" data-action="done-toggle" aria-expanded="false" aria-label="Show Done (${list.length})"><span class="spill s-done">${sdot('done')}Done</span><span class="n">${list.length}</span><span class="show">Show ${ic('chev')}</span></button>
        <div class="col-body" hidden>${list.map(cardHTML).join('')}</div></section>`;
      return `<section class="col" data-col="${c.id}">
        <div class="col-h"><span class="spill s-${c.id}">${esc(c.name)}</span><span class="n">${list.length}</span>${sortNote(c.id)}${c.id === 'done' ? `<button type="button" class="col-x" data-action="done-toggle" aria-label="Hide Done">Hide</button>` : ''}</div>
        <div class="col-body">${list.length ? list.map(cardHTML).join('') : `<div class="empty">${toks.length ? 'No matching tasks' : 'Drop tasks here'}</div>`}</div>
      </section>`;
    }).join('');
  }
  /* mobile: one status at a time, full-width cards */
  function mTabsHTML() {
    const toks = activeTokens();
    return D.COLUMNS.map(c => {
      const n = colTasks(c.id, toks).length;
      return `<button type="button" class="mtab s-${c.id} ${S.mstatus === c.id ? 'on' : ''}" data-action="mtab" data-tab="${c.id}">${sdot(c.id)}${esc(c.name)}<span class="n">${n}</span></button>`;
    }).join('');
  }
  function mListHTML() {
    const toks = activeTokens();
    const list = colTasks(S.mstatus, toks);
    return (list.length ? list.map(cardHTML).join('') : `<div class="empty">${toks.length ? 'No matching tasks here' : 'Nothing in ' + esc(statusLabel(S.mstatus))}</div>`);
  }
  const incoming = () => S.tasks.filter(t => t.source !== 'keeper' && !t.dismissed && S.channels.includes(t.source)).sort((a, b) => b.captured - a.captured);
  function statusLabel(s) { const c = D.COLUMNS.find(c => c.id === s); return c ? c.name : s; }
  function feedRow(t, opts) {
    const di = dueInfo(t.due, t.status);
    const req = t.requester && t.requester !== 'maya' ? 'From ' + esc(personName(t.requester)) : 'From you';
    const proj = projName(t.project);
    return `<button type="button" class="frow ${t.fresh ? 'new' : ''} ${t.triage ? 'triage' : ''} ${mode() === 'desktop' && UI.feedSel === t.id ? 'sel' : ''}" data-action="open" data-id="${t.id}">
      ${srcIc(t.source)}
      <span class="frow-txt"><span class="frow-title">${t.fresh ? '<span class="newtag">NEW</span> ' : ''}${esc(t.title)}</span>

        <span class="frow-meta">${req}${proj ? ' · ' + esc(proj) : ''}</span>
        ${opts && opts.snip && t.snippet ? `<span class="snip">“${esc(t.snippet)}”</span>` : ''}
        <span class="frow-foot">${opts && opts.status ? spill(t.triage ? 'triage' : t.status) : ''}${agentBadge(t)}${t.also && t.also.length ? `<span class="merged">${ic('merge')}${t.also.length + 1} sources</span>` : ''}<span class="due ${di.cls}">${esc(di.label)}</span><span class="ago">${agoText(t.captured)}</span></span>
      </span>
    </button>`;
  }
  function feedPageHTML() {
    const list = incoming();
    const now = Date.now(), t0 = today0().getTime();
    const groups = [['Just now', t => now - t.captured < 20 * 60000], ['Earlier today', t => t.captured >= t0], ['Yesterday', t => t.captured >= t0 - DAY], ['Earlier this week', () => true]];
    const used = new Set();
    const secs = groups.map(([name, fn]) => {
      const items = list.filter(t => !used.has(t.id) && fn(t));
      items.forEach(t => used.add(t.id));
      if (!items.length) return '';
      return `<div class="feed-sec"><h3>${name}</h3><div class="feed-list">${items.map(t => feedRow(t, { snip: true, status: true })).join('')}</div></div>`;
    }).join('');
    const body = secs || '<div class="empty">No tasks yet from your connected channels.</div>';
    if (mode() !== 'desktop') return body;
    const sel = task(UI.feedSel) && list.some(t => t.id === UI.feedSel) ? task(UI.feedSel) : list[0];
    if (sel) UI.feedSel = sel.id;
    const d = sel && taskDetail(sel);
    return `<div class="feed-split"><div class="feed-col">${body}</div>
      <aside class="feed-detail" data-tid="${sel ? sel.id : ''}">${sel ? `<div class="fd-body">${d.body}</div><div class="fd-foot">${d.foot}</div>` : '<div class="empty">Select a task to see details</div>'}</aside></div>`;
  }
  /* title row for the Task Feed: live indicator plus a small link to channel settings */
  function feedHead() {
    const on = S.channels.filter(k => D.SOURCES[k]);
    return `<div class="feed-h"><h1>Live Feed</h1>
      <p class="feed-meta"><span class="live-dot" aria-hidden="true"></span><span>Live from ${on.length} channel${on.length === 1 ? '' : 's'}</span><span class="dot-sep" aria-hidden="true">·</span><button type="button" class="linkish" data-action="go" data-screen="sources">Manage</button></p></div>`;
  }
  function sourcesHTML() {
    const keys = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'];
    return `<div class="src-page">
      <section class="set-sec"><h2 class="sec-h first">Tracked channels</h2>
      ${keys.map(k => {
        const s = D.SOURCES[k], on = S.channels.includes(k);
        return `<button type="button" class="chan ${on ? 'on' : ''}" data-action="chan" data-k="${k}" aria-pressed="${on}">
          ${srcIc(k)}
          <span class="chan-txt"><b>${esc(s.label)}</b><span>${esc(s.desc)}</span>${k === 'sms' && on ? '<span class="num">' + bizNum() + '</span>' : ''}</span>
          <span class="tog" aria-hidden="true"></span></button>`;
      }).join('')}<p class="note">Prototype: connections are simulated. The Live Feed only shows tasks from channels that are on.</p></section>
      ${vision() ? `<section class="set-sec"><h2 class="sec-h">Assistant voice</h2>
      <button type="button" class="chan" data-action="voice"><span class="src-ic">${ic('wave')}</span><span class="chan-txt"><b>${esc(currentVoice() ? voiceName(currentVoice()) : 'Device default')}</b><span>The voice Keeper uses when you add tasks by voice</span></span>${ic('chev')}</button></section>` : ''}
      ${agentSettings()}
    </div>`;
  }
  const badge = id => `<span class="dot-badge" id="${id}" ${S.unseen ? '' : 'hidden'}>${S.unseen}</span>`;

  function renderMobile() {
    let body;
    if (S.screen === 'feed') body = `${feedHead()}<div id="feedPage">${feedPageHTML()}</div>`;
    else if (S.screen === 'sources') body = `<div class="page-h"><button class="back" data-action="go" data-screen="feed" aria-label="Back to Live Feed">${ic('back')}</button><h1>Settings</h1></div>${sourcesHTML()}`;
    else body = `${greeting()}<div id="rvSlot">${reviewStrip()}</div><div id="agSlot">${agentStrip()}</div>
      <div class="m-tabs" id="mTabs">${mTabsHTML()}</div>
      <div class="m-tools"><div class="tools-l">${searchBtn()}<div class="sum" id="summary">${summary()}</div></div><span id="mSort">${S.mstatus === 'upnext' ? sortNote('upnext') : ''}</span></div>
      ${filterBar()}
      <div class="m-list col-body" id="mList" data-col="${S.mstatus}">${mListHTML()}</div>
      <p class="m-hint">Swipe right to mark done · hold to drag</p>`;
    return `<div class="m-home">
      <div class="m-top"><div class="shell-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div>
        <button type="button" class="icon-btn ${S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="sources" aria-label="Settings">${ic('gear')}</button><img class="m-me" src="maya.svg" alt="Maya"></div>
      <div class="m-body" id="mBody">${body}</div>
      <nav class="m-nav ${vision() ? '' : 'two'}">
        <button class="${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('checklist')}To Do List</button>
        ${vision() ? `<button class="fab" data-action="ask-voice" aria-label="Add a task by voice">${ic('plus')}</button>` : ''}
        <button class="${S.screen === 'feed' || S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="feed" ${S.screen === 'sources' ? 'data-sub="1"' : ''}><span class="navi">${ic('feed')}${badge('navBadge')}</span>Live Feed</button>
      </nav>
    </div>`;
  }
  function renderDesktop() {
    let main;
    if (S.screen === 'feed') main = `<div class="screen">${feedHead()}<div id="feedPage">${feedPageHTML()}</div></div>`;
    else if (S.screen === 'sources') main = `<div class="screen"><div class="page-h"><h1>Settings</h1></div>${sourcesHTML()}</div>`;
    else main = `<div class="d-head">${greeting()}<div class="d-acts">
        <button type="button" class="btn-inc" data-action="inc">${ic('feed')}Live Feed${S.unseen ? ` <b id="incCount">${S.unseen} new</b>` : '<b id="incCount"></b>'}</button>
        ${vision() ? `<button class="btn-ask" data-action="ask">${ic('plus')} Add task</button>` : ''}</div></div>
      <div id="rvSlot">${reviewStrip()}</div><div id="agSlot">${agentStrip()}</div>
      <div class="d-tools">${searchBtn()}<div class="sum" id="summary">${summary()}</div></div>
      ${filterBar()}
      <div class="board ${S.doneOpen ? '' : 'done-collapsed'}" id="board">${boardHTML()}</div>`;
    return `<div class="d-layout">
      <aside class="d-side">
        <div class="d-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div>
        <button class="d-nav ${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('checklist')}To Do List</button>
        <button class="d-nav ${S.screen === 'feed' ? 'on' : ''}" data-action="go" data-screen="feed">${ic('feed')}Live Feed<span class="cnt" id="navBadge" ${S.unseen ? '' : 'hidden'}>${S.unseen}</span></button>
        <button class="d-nav ${S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="sources">${ic('gear')}Settings</button>
        <div class="d-me"><img class="m-me" src="maya.svg" alt=""><span><b>Maya</b></span></div>
      </aside>
      <section class="d-main" id="dMain">${main}</section>
    </div>`;
  }
  /* refresh data-driven regions without touching inputs */
  function refresh() {
    if (!S.onboarded) return;
    applyAgent();
    if (UI.drag && UI.drag.active) { UI.pending = true; return; }
    const b = $('#board'); if (b) b.classList.toggle('done-collapsed', !S.doneOpen); if (b) { const sl = b.scrollLeft; b.innerHTML = boardHTML(); b.scrollLeft = sl; }
    const mt = $('#mTabs'); if (mt) { const sl = mt.scrollLeft; mt.innerHTML = mTabsHTML(); mt.scrollLeft = sl; }
    const ms = $('#mSort'); if (ms) ms.innerHTML = S.mstatus === 'upnext' ? sortNote('upnext') : '';
    const ml = $('#mList'); if (ml) { ml.dataset.col = S.mstatus; ml.innerHTML = mListHTML(); }
    const fpg = $('#feedPage'); if (fpg) fpg.innerHTML = feedPageHTML();
    const rv = $('#rvSlot'); if (rv) rv.innerHTML = reviewStrip();
    const ag = $('#agSlot'); if (ag) ag.innerHTML = agentStrip();
    const sm = $('#summary'); if (sm) sm.innerHTML = summary();
    const tk = $('#tokens'); if (tk) tk.innerHTML = tokensHTML();
    const sb = $('#searchBtn'); if (sb) sb.classList.toggle('on', UI.search || filterOn());
    const fc = $('#fChips'); if (fc) fc.innerHTML = filterChips();
    const sb2 = $('#searchBtn'); if (sb2 && !UI.search) sb2.outerHTML = searchBtn();
    const nb = $('#navBadge'); if (nb) { nb.textContent = S.unseen; nb.hidden = !S.unseen; }
    const ic2 = $('#incCount'); if (ic2) ic2.textContent = S.unseen ? S.unseen + ' new' : '';
    if (UI.sheet && (UI.sheet.type === 'task' || UI.sheet.type === 'inc' || UI.sheet.type === 'review' || UI.sheet.type === 'agents')) renderLayer(true);
  }

  /* ---------- original source (deeplink) ---------- */
  const ORIGIN = {
    gmail: { noun: 'email', cta: 'Open in Gmail', url: 'https://mail.google.com/mail/u/0/#inbox', note: 'In the real product this button opens this exact email (Gmail links each message by its ID). Gmail’s phone app can’t open a single message from a link, so on mobile it opens Gmail on the web.' },
    outlook: { noun: 'email', cta: 'Open in Outlook', url: 'https://outlook.office.com/mail/', note: 'In the real product this button uses the link Microsoft provides for each message, so it opens this exact email in Outlook.' },
    slack: { noun: 'Slack message', cta: 'Open in Slack', url: 'https://app.slack.com/client', note: 'In the real product this button uses the message’s Slack permalink: it opens the Slack app at this message on phones and desktop.' },
    sms: { noun: 'text thread', note: 'Clients text your business number, which Keeper provides, so the thread lives here in Keeper rather than in Messages. Replies go out from the same number, keeping your personal number private.' },
    zoom: { noun: 'call transcript', cta: 'Open recording in Zoom', url: 'https://zoom.us/recording', note: 'Keeper keeps the transcript and jumps to the moment the commitment was made. The button opens the full cloud recording in Zoom.' },
    meet: { noun: 'call transcript', cta: 'Open recording in Drive', url: 'https://drive.google.com/drive/my-drive', note: 'Google Meet saves recordings and transcripts to Google Drive. Keeper jumps to the moment the commitment was made; the button opens the recording.' }
  };
  const DOMAIN = { northwind: 'northwindcoffee.com', halcyon: 'halcyonhealth.com', brightside: 'brightside.studio', okafor: 'okaforrealty.com', lumen: 'lumenlabs.ai', studio: 'mayastudio.co' };
  function origin(t) {
    const m = (t.snippet || '').match(/^([A-Z][a-z]+):\s*(.*)$/);
    let speaker = m ? m[1] : null, text = (m ? m[2] : t.snippet || '').replace(/^[“"]|[”"]$/g, '');
    const key = speaker ? Object.keys(D.PEOPLE).find(k => D.PEOPLE[k].name.split(' ')[0] === speaker) : null;
    const fromKey = key || (speaker ? null : t.requester);
    const fromName = speaker ? (key ? personName(key) : speaker) : personName(t.requester) || 'Unknown';
    return { text, fromKey, fromName, mine: fromKey === 'maya' };
  }
  const srcVariant = (t, i) => !i || !t.also || !t.also[i - 1] ? t : Object.assign({}, t, t.also[i - 1]);
  function origBlock(t0) {
    if (t0.source === 'keeper' || !t0.snippet) return '';
    const idx = UI.srcTab[t0.id] || 0, t = srcVariant(t0, idx);
    const all = [t0.source].concat((t0.also || []).map(a => a.source));
    const tabs = all.length > 1 ? `<div class="src-tabs" role="tablist"><span class="merged">${ic('merge')}Merged from ${all.length} messages</span>${all.map((s, i) => `<button type="button" role="tab" aria-selected="${i === idx}" class="${i === idx ? 'on' : ''}" data-action="src-tab" data-i="${i}">${srcIc(s)}${esc(srcLabel(s))}</button>`).join('')}</div>` : '';
    const o = origin(t), meta = ORIGIN[t.source] || {}, open = !!UI.expand[t0.id];
    return `<div class="orig-b ${open ? 'open' : ''}">${tabs}
      <div class="orig-h">${srcIc(t.source)}<span>${esc(o.mine ? 'You' : o.fromName)} · ${esc(srcLabel(t.source))} · ${agoText(t.captured)}</span></div>
      ${open ? sourceView(t) : `<button type="button" class="orig-snip" data-action="expand" aria-expanded="false">“${esc(o.text)}”</button>`}
      <div class="orig-acts"><button type="button" class="linkish" data-action="expand">${open ? 'Show less' : 'Show full ' + esc(meta.noun || 'message')}</button>
        ${meta.url ? `<a class="open-app" href="${meta.url}" target="_blank" rel="noopener">${esc(meta.cta)} ${ic('ext')}</a>` : ''}</div>
    </div>`;
  }
  function sourceView(t) {
    const o = origin(t), when = new Date(t.captured);
    const time = when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const date = when.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const proj = projName(t.project) || 'Studio', dom = DOMAIN[t.project] || 'example.com';
    const other = t.requester && t.requester !== 'maya' ? t.requester : (t.collaborators[0] || null);
    const otherName = other ? personName(other) : 'Client';
    const first = n => n.split(' ')[0];
    const quote = `<mark>${esc(o.text)}</mark>`;
    if (t.source === 'gmail' || t.source === 'outlook') {
      const fromName = o.mine ? 'Maya' : o.fromName;
      const addr = o.mine ? 'maya@mayastudio.co' : (first(fromName).toLowerCase() + '@' + (/figma/i.test(fromName) ? 'figma.com' : dom));
      return `<div class="sv"><div class="sv-bar">${srcIc(t.source)}${esc(srcLabel(t.source))}<small>${esc(date)}</small></div><div class="sv-pad">
        <h3 class="em-subj">Re: ${esc(proj)} · ${esc(t.category.toLowerCase())}</h3>
        <div class="em-from">${av(o.fromKey || other)}<span><b>${esc(fromName)}</b> &lt;${esc(addr)}&gt;<br>to ${o.mine ? esc(otherName) : 'Maya'}</span><span class="t">${esc(time)}</span></div>
        <div class="em-body"><p>Hi ${o.mine ? esc(first(otherName)) : 'Maya'},</p><p>Hope your week is going well. ${quote}</p><p>Thanks!<br>${esc(first(fromName))}</p></div>
      </div></div>`;
    }
    if (t.source === 'slack') {
      const ch = '#' + proj.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-design';
      return `<div class="sv"><div class="sv-bar">${srcIc('slack')}${esc(proj)} workspace · ${esc(ch)}<small>${esc(date)}</small></div><div class="sv-pad">
        <div class="sl-msg">${av('maya')}<div><div class="who">Maya <small>${esc(new Date(t.captured - 1200000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))}</small></div><p>Morning! Pushing the latest round of files now.</p></div></div>
        <div class="sl-msg">${av(o.fromKey || other)}<div><div class="who">${esc(o.fromName)} <small>${esc(time)}</small></div><p>${quote}</p></div></div>
      </div></div>`;
    }
    if (t.source === 'sms') {
      const inb = o.mine ? 'out' : 'in';
      return `<div class="sv"><div class="sv-bar">${srcIc('sms')}${esc(otherName)} · Business texts ${bizNum()}<small>${esc(date)}</small></div><div class="sv-pad"><div class="tx">
        <span class="ts">${esc(date)} · ${esc(time)}</span>
        <div class="b ${inb === 'in' ? 'out' : 'in'}">Hi ${o.mine ? '' : esc(first(otherName))}, quick check-in on ${esc(proj)}.</div>
        <div class="b ${inb}">${quote}</div>
      </div></div></div>`;
    }
    const mins = 4 + (t.title.length % 30), ts = n => String(Math.floor(n)).padStart(2, '0') + ':' + String(Math.round((n % 1) * 60)).padStart(2, '0');
    const sp = o.mine ? 'Maya' : o.fromName;
    return `<div class="sv"><div class="sv-bar">${srcIc(t.source)}${esc(proj)} sync · ${esc(srcLabel(t.source))}<small>${esc(date)}</small></div><div class="sv-pad">
      <div class="tr-row"><span class="ts">${ts(mins - 1.3)}</span><span><b>${esc(o.mine ? otherName : 'Maya')}</b>Okay, so what’s the next step on that?</span></div>
      <div class="tr-row"><span class="ts">${ts(mins)}</span><span><b>${esc(sp)}</b>${quote}</span></div>
      <div class="tr-row"><span class="ts">${ts(mins + .7)}</span><span><b>${esc(o.mine ? otherName : 'Maya')}</b>Perfect, that works.</span></div>
    </div></div>`;
  }

  /* ---------- connecting a channel: simulated permission screens ---------- */
  const CONNECT = {
    gmail: { host: 'accounts.google.com', who: 'Google', perms: ['Read your email messages', 'See your primary email address'], allow: 'Allow' },
    outlook: { host: 'login.microsoftonline.com', who: 'Microsoft', perms: ['Read your mail', 'Keep access to data you’ve given it access to'], allow: 'Accept' },
    slack: { host: 'slack.com/oauth', who: 'Slack', perms: ['View messages in channels and DMs you’re part of', 'View basic info about people in the workspace'], allow: 'Allow', workspaces: ['Northwind Coffee', 'Halcyon Health', 'Brightside Studio'] },
    zoom: { host: 'zoom.us/oauth', who: 'Zoom', perms: ['View your cloud recordings and transcripts', 'View your scheduled meetings'], allow: 'Allow' },
    gcal: { host: 'accounts.google.com', who: 'Google', perms: ['See your free and busy times', 'Create events and send invites from your calendar'], allow: 'Allow' },
    meet: { host: 'accounts.google.com', who: 'Google', perms: ['See Google Meet recordings and transcripts in your Drive', 'See your calendar events'], allow: 'Allow' }
  };
  const NUMBERS = ['(917) 555-0142', '(646) 555-0198', '(212) 555-0117'];
  const bizNum = () => S.bizNum || NUMBERS[0];
  function connectHTML(k) {
    const st = UI.sheet.step, src = D.SOURCES[k], c = CONNECT[k];
    const close = `<button class="x" data-action="connect-cancel" aria-label="Cancel">${ic('x')}</button>`;
    if (st === 'loading') return `<div class="cx-load">${srcIc(k)}<b>Opening ${esc(c ? c.who : 'setup')}…</b><span class="spin dark"></span></div>`;
    if (st === 'done') return `<div class="cx-load">${srcIc(k)}<b>${esc(src.label)} connected</b><span class="cx-ok">${ic('check')}</span></div>`;
    if (k === 'sms') return `<div class="sh-h"><span class="lab">${srcIc(k)}Business texts</span>${close}</div>
      <div class="sh-body cx">
        <h2 class="sh-title">Pick your business number</h2>
        <p class="cx-p">Clients text this number and Keeper turns their requests into tasks. Your replies come from it too, so your personal number stays private.</p>
        <div class="cx-list">${NUMBERS.map((n, i) => `<button type="button" class="cx-num ${(UI.sheet.pick || 0) === i ? 'on' : ''}" data-action="cx-pick" data-i="${i}"><span class="radio"></span><b>${n}</b><span>New York</span></button>`).join('')}</div>
        <p class="cx-note">Simulated. In the real product Keeper buys this number from a texting provider for about $1–2 a month.</p>
      </div>
      <div class="sh-foot"><button class="btn-ghost" data-action="connect-cancel">Not now</button><button class="btn-primary" data-action="connect-allow">Use this number</button></div>`;
    return `<div class="cx-bar"><span class="lock">${ic('lock')}</span>${esc(c.host)}<span class="sim">Simulated</span>${close}</div>
      <div class="sh-body cx">
        <div class="cx-who">${srcIc(k)}<span>Sign in with ${esc(c.who)}</span></div>
        <h2 class="sh-title">Keeper wants to access your ${esc(c.who)} account</h2>
        <div class="cx-acct">${av('maya')}<span><b>Maya</b>maya@mayastudio.co</span></div>
        ${c.workspaces ? `<div><div class="fl">Workspaces</div><div class="cx-list">${c.workspaces.map(w => `<label class="cx-ws"><input type="checkbox" checked> ${esc(w)}</label>`).join('')}</div></div>` : ''}
        <div><div class="fl">This will let Keeper:</div><ul class="cx-perms">${c.perms.map(x => `<li>${ic('check')}${esc(x)}</li>`).join('')}</ul></div>
        <p class="cx-note">This stands in for ${esc(c.who)}’s own permission page, which opens in the real product. Keeper only reads; it never sends or deletes anything. Your data is encrypted and never used to train AI models.</p>
      </div>
      <div class="sh-foot"><button class="btn-ghost" data-action="connect-cancel">Cancel</button><button class="btn-primary" data-action="connect-allow">${esc(c.allow)}</button></div>`;
  }
  function startConnect(k) {
    openSheet({ type: 'connect', k, step: 'loading', pick: 0 });
    setTimeout(() => { if (UI.sheet && UI.sheet.type === 'connect' && UI.sheet.k === k) { UI.sheet.step = 'consent'; renderLayer(true); } }, 900);
  }
  function finishConnect() {
    const k = UI.sheet.k;
    if (k === 'sms') S.bizNum = NUMBERS[UI.sheet.pick || 0];
    UI.sheet.step = 'done'; renderLayer(true);
    if (k === 'gcal') S.calendar = true; else if (!S.channels.includes(k)) S.channels.push(k);
    save();
    setTimeout(() => {
      closeSheet();
      if (!S.onboarded) render(); else { const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); refresh(); if (k !== 'gcal') toast(srcIc(k) + 'Keeper is now listening to ' + esc(D.SOURCES[k].label)); }
    }, 900);
  }

  /* ---------- assistant voice: best voice on this device, with a picker ---------- */
  const synth = window.speechSynthesis;
  const BAD = /compact|espeak|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|fred|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
  function voiceScore(v) {
    let n = 0;
    if (/natural|neural/i.test(v.name)) n += 60;
    if (/premium/i.test(v.name)) n += 55;
    if (/enhanced/i.test(v.name)) n += 45;
    if (/google us english|google uk english female/i.test(v.name)) n += 30;
    if (/(ava|zoe|samantha|allison|susan|nicky|jenny|aria|michelle|emma|serena|evan|nathan|tom|joelle|noelle|libby|sonia)\b/i.test(v.name)) n += 20;
    if (/en[-_]US/i.test(v.lang)) n += 6; else if (/en[-_](GB|AU|IE|CA)/i.test(v.lang)) n += 3;
    if (BAD.test(v.name)) n -= 200;
    return n;
  }
  function voiceList() { if (!synth) return []; return synth.getVoices().filter(v => /^en/i.test(v.lang) && !BAD.test(v.name)).sort((a, b) => voiceScore(b) - voiceScore(a)); }
  function currentVoice() { const l = voiceList(); return l.find(v => v.name === S.voice) || l[0] || null; }
  const voiceQuality = v => /natural|neural/i.test(v.name) ? 'Natural' : /premium/i.test(v.name) ? 'Premium' : /enhanced/i.test(v.name) ? 'Enhanced' : /google/i.test(v.name) ? 'Online' : 'Standard';
  const voiceName = v => v.name.replace(/^Microsoft\s+/i, '').replace(/\s*Online\s*/i, ' ').replace(/\s*\((natural|premium|enhanced)\)/i, '').replace(/\s+-\s+English.*$/i, '').trim();
  const SAMPLE = 'Hi Maya! I just caught a new task from Jen at Northwind. She needs the final logo files by Friday. Want me to add it to Up Next?';
  function speakWith(text, v, onend) {
    if (!synth) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = 1; u.pitch = 1;
      if (onend) u.onend = onend;
      synth.speak(u);
    } catch (e) {}
  }
  function voiceSheetHTML() {
    const list = voiceList(), cur = currentVoice();
    const rows = list.slice(0, 14).map((v, i) => `<div class="vrow ${cur && v.name === cur.name ? 'on' : ''}">
        <button type="button" class="vpick" data-action="voice-pick" data-i="${i}"><span class="radio"></span><span class="vt"><b>${esc(voiceName(v))}</b><span>${esc(voiceQuality(v))} · ${esc(v.lang)}</span></span></button>
        <button type="button" class="vplay" data-action="voice-play" data-i="${i}" aria-label="Play a sample of ${esc(voiceName(v))}">${ic('play')}</button></div>`).join('');
    return `<div class="sh-h"><span class="lab">${ic('wave')}Assistant voice</span><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
      <div class="sh-body">
        <p class="cx-p">Tap play to hear each voice, then pick one. These are the voices on this device, best first.</p>
        ${rows || '<div class="empty">No English voices found on this device. Try Chrome, Edge or Safari.</div>'}
        <p class="cx-note">Most natural options: Microsoft Edge’s “Natural” voices, Chrome’s “Google US English”, or on iPhone and Mac a free Premium voice (Settings → Accessibility → Spoken Content → Voices, then download Ava or Zoe Premium). Voices as lifelike as ChatGPT’s need a paid voice service.</p>
      </div>`;
  }
  if (synth && 'onvoiceschanged' in synth) synth.onvoiceschanged = () => { if (UI.sheet && UI.sheet.type === 'voice') renderLayer(true); };

  function changeBlock(t) {
    const c = t.change; if (!c || c.state === 'kept') return '';
    const pend = c.state === 'pending', due = c.kind === 'due';
    const head = pend ? (due ? 'Keeper detected a new due date' : 'Keeper detected a change to this task') : (due ? 'Due date updated' : 'Task updated') + (c.state === 'auto' ? ' by Keeper' : '');
    const diff = due ? `<div class="chg-diff"><span class="was">${esc(fmtDue(c.from))}</span><span class="arr">→</span><span class="now">${esc(fmtDue(c.to))}</span></div>`
      : `<div class="chg-diff stk"><span class="lab">Was</span><span class="was">${esc(c.from)}</span><span class="lab">Now</span><span class="now">${esc(c.to)}</span></div>`;
    const acts = pend ? `<div class="chg-acts"><button type="button" class="btn-ghost" data-action="chg-keep">${due ? 'Keep ' + esc(fmtDue(c.from)) : 'Keep original'}</button><button type="button" class="btn-primary" data-action="chg-apply">${ic('check')} ${due ? 'Accept new date' : 'Apply update'}</button></div>`
      : `<div class="chg-acts"><button type="button" class="linkish" data-action="chg-undo">Undo</button></div>`;
    return `<section class="det-block chg"><div class="det-h">${ic(due ? 'cal' : 'spark')}<b>${head}</b></div>${diff}
      <div class="det-ev">${srcIc(c.via)}<span>${esc(c.proof)} · ${esc(agoText(c.at))}</span></div>${acts}</section>`;
  }
  function detectBlock(t) {
    if (!t.detect || t.detect.rejected) return '';
    const when = agoText(t.detect.at);
    const head = t.status === 'done' && t.doneBy === 'keeper' ? 'Keeper completed this task' : t.detect.kind === 'partial' ? 'Keeper detected this is partly done' : t.status === 'done' ? 'Keeper detected this was done' : 'Keeper detected this is done';
    return `<section class="det-block ${t.detect.kind}"><div class="det-h">${ic('check')}<b>${head}</b></div>
      <div class="det-ev">${srcIc(t.detect.via)}<span>${esc(t.detect.proof)} · ${esc(when)}</span></div>
      ${t.detect.kind === 'partial' ? `<div class="det-rem"><b>Still to do</b>${esc(t.detect.remaining)}</div>` : ''}
      ${t.status !== 'done' && t.detect.kind === 'done' ? `<p class="det-sub">${vision() && AG().complete === 'auto' ? 'Auto-complete is on.' : 'Confirm it to move it to Done.'}</p>` : ''}</section>`;
  }
  function taskDetail(t) {
    const req = t.requester && t.requester !== 'maya' ? `<span class="person">${av(t.requester)}${esc(personName(t.requester))}</span>` : `<span class="person">${av('maya')}You</span>`;
    const quick = [['Today', 0], ['Tomorrow', 1], ['Friday', daysToDow(5, true)], ['Next Mon', daysToDow(1, false)]];
    const di = dueInfo(t.due, t.status);
    const dueText = t.due ? di.label + (Math.abs(daysOut(t.due)) < 7 && !/\d/.test(di.label) ? ' · ' + shortDate(fromISO(t.due)) : '') : 'No due date';
    const ed = UI.editField;
    const statusRow = t.triage ? `<dt>Status</dt><dd>${spill('triage')}</dd>` : `<dt>Status</dt><dd class="st-dd"><button type="button" class="sel ${ed === 'status' ? 'open' : ''}" data-action="edit" data-f="status" aria-expanded="${ed === 'status'}">${spill(t.status)}<span class="caret">${ic('down')}</span></button>${looksDone(t) ? '<span class="det-badge sm">Detected done</span>' : ''}</dd>
      ${ed === 'status' ? `<dd class="pop"><div class="opts" role="listbox">${D.COLUMNS.map(c => `<button type="button" role="option" aria-selected="${t.status === c.id}" class="opt ${t.status === c.id ? 'on' : ''}" data-action="set-status" data-v="${c.id}">${spill(c.id)}${t.status === c.id ? ic('check') : ''}</button>`).join('')}</div></dd>` : ''}`;
    const dueRow = `<dt>Due</dt><dd><button type="button" class="sel ${ed === 'due' ? 'open' : ''}" data-action="edit" data-f="due" aria-expanded="${ed === 'due'}"><span class="due ${di.cls}">${esc(dueText)}</span><span class="caret">${ic('down')}</span></button></dd>
      ${ed === 'due' ? `<dd class="pop"><div class="duebox">${quick.map(([l, n]) => `<button type="button" class="chip ${t.due === iso(addDays(n)) ? 'on' : ''}" data-action="set-due" data-n="${n}">${l}</button>`).join('')}
        <button type="button" class="chip ${!t.due ? 'on' : ''}" data-action="set-due" data-n="none">No date</button><input type="date" class="dueInput" value="${t.due || ''}" aria-label="Pick a date"></div></dd>` : ''}`;
    return {
      body: `<h2 class="sh-title">${esc(t.title)}</h2>
          <dl class="fields">${statusRow}${dueRow}<dt>Requested by</dt><dd>${req}</dd><dt>Project</dt><dd>${projTag(t.project) || '—'}</dd></dl>
          ${changeBlock(t)}${detectBlock(t)}
          ${origBlock(t)}
          ${agentBlock(t)}`,
      foot: t.triage ? `<button class="btn-ghost" data-action="rv-dismiss">Dismiss</button><button class="btn-primary" data-action="rv-add">${ic('check')} Keep</button>`
        : t.status === 'done' ? `<button class="btn-ghost" data-action="det-reopen">Reopen</button>`
        : looksDone(t) ? `<button class="btn-ghost" data-action="det-reject">Not done yet</button><button class="btn-primary" data-action="set-status" data-v="done">${ic('check')} Confirm done</button>`
        : `<button class="btn-primary" data-action="set-status" data-v="done">${ic('check')} Mark done</button>`
    };
  }
  /* ================= Vision: Keeper agent prepares the work ================= */
  const vision = () => S.scope === 'vision';
  const AG = () => Object.assign({ draft: 'review', schedule: 'auto', complete: 'ask' }, S.agent || {});
  const SENDVIA = { gmail: 'Reply in the Gmail thread', outlook: 'Reply in the Outlook thread', slack: 'Reply in the Slack thread', sms: 'Text from your business line', zoom: 'Follow-up email', meet: 'Follow-up email', keeper: 'Email' };
  /* which tasks the agent can do the work for */
  function agentKind(t) {
    if (!vision() || t.dismissed || t.triage || t.agentOff) return null;
    if (t.detect && t.detect.kind === 'done' && !t.detect.rejected) return null;
    if (t.status === 'done' && !(t.agent && (t.agent.booked != null || t.agent.sent))) return null;
    const client = t.requester && D.PEOPLE[t.requester] && D.PEOPLE[t.requester].role === 'client';
    if (!client) return null;
    if (/^(schedule|reschedule|book|set up)\b/i.test(t.title) || t.category === 'Scheduling') return AG().schedule === 'off' ? null : 'schedule';
    if (/^(send|share|reply|add|approve|update)\b/i.test(t.title)) return AG().draft === 'off' ? null : 'draft';
    return null;
  }
  const agentTasks = () => S.tasks.filter(t => agentKind(t));
  const calOn = () => S.calendar !== false;
  const autoReply = () => AG().draft === 'auto';
  const autoBook = () => AG().schedule === 'auto' && calOn();
  /* what the agent has done (or would do) for a task right now */
  function agentState(t) {
    const k = agentKind(t), st = t.agent || {};
    if (k === 'draft') return st.sent ? (st.auto ? 'autosent' : 'sent') : 'draft';
    if (k === 'schedule') return st.booked != null ? (st.auto ? 'autobooked' : 'booked') : st.sent ? 'timessent' : 'times';
    return null;
  }
  /* with automatic permissions on, Keeper actually does the work: books (task -> Done) or replies (task -> In Progress) */
  /* detected work: Up Next moves to In Progress; in Phase 2 with auto-complete on, proven tasks move to Done */
  const detected = t => t.detect && !t.detect.rejected && !t.dismissed && !t.triage;
  const looksDone = t => detected(t) && t.detect.kind === 'done' && t.status !== 'done';
  const pendingChange = t => t.change && t.change.state === 'pending' && !t.dismissed && !t.triage;
  function applyChange(t, auto) {
    const c = t.change; if (!c) return;
    if (c.kind === 'title') t.title = c.to; else t.due = c.to;
    c.state = auto ? 'auto' : 'applied';
  }
  function undoChange(t) {
    const c = t.change; if (!c) return;
    if (c.kind === 'title') t.title = c.from; else t.due = c.from;
    c.state = 'kept';
  }
  function fmtDue(v) { return v ? dueInfo(v, 'upnext').label : 'No date'; }
  function applyDetect() {
    let changed = false;
    S.tasks.forEach(t => { if (vision() && AG().complete === 'auto' && pendingChange(t)) { applyChange(t, true); changed = true; } });
    S.tasks.forEach(t => {
      if (!detected(t)) return;
      if (t.status === 'upnext') { t.status = 'inprogress'; changed = true; }
      if (vision() && AG().complete === 'auto' && t.detect.kind === 'done' && t.status !== 'done' && !t.detect.undone) { t.status = 'done'; t.doneBy = 'keeper'; changed = true; }
    });
    if (changed) save();
  }
  function detectEvent() {
    if (!S.onboarded || S.detectFired) return;
    const t = S.tasks.find(x => x.title === DETECT_LIVE.title && !x.dismissed && x.status !== 'done');
    S.detectFired = true;
    if (!t) { save(); return; }
    t.detect = { kind: DETECT_LIVE.kind, via: DETECT_LIVE.via, proof: DETECT_LIVE.proof, remaining: '', at: Date.now() };
    t.fresh = true; applyDetect(); save(); refresh(); if (UI.sheet && UI.sheet.type === 'task') renderLayer(true);
    const auto = t.status === 'done';
    toast(esc(t.title), { title: auto ? 'Completed by Keeper' : 'Looks done', id: t.id, sub: srcIc(t.detect.via) + esc(t.detect.proof) });
    setTimeout(() => { t.fresh = false; refresh(); }, 6000);
  }
  function applyAgent() {
    if (S.onboarded) applyDetect();
    if (!vision() || !S.onboarded) return;
    let changed = false;
    S.tasks.forEach(t => {
      const k = agentKind(t); if (!k || t.status === 'done' || t.triage || t.dismissed) return;
      const st = t.agent || {};
      if (k === 'schedule' && autoBook() && st.booked == null && !st.sent && !st.manual) { t.agent = Object.assign({}, st, { booked: 0, slot: 0, auto: true }); t.status = 'done'; changed = true; }
      if (k === 'draft' && autoReply() && !st.sent) { t.agent = Object.assign({}, st, { sent: true, auto: true }); if (t.status === 'upnext') t.status = 'inprogress'; changed = true; }
    });
    if (changed) save();
  }
  function agentBadge(t) {
    const s = agentState(t); if (!s) return '';
    const B = { draft: ['', 'spark', 'Draft ready'], sent: ['sent', 'check', 'Reply sent'], autosent: ['auto', 'bolt', 'Replied automatically'],
      times: ['', 'cal', 'Times ready'], timessent: ['sent', 'check', 'Times sent'], booked: ['sent', 'cal', 'Meeting booked'], autobooked: ['auto', 'cal', 'Booked'] }[s];
    return `<span class="ag-badge ${B[0]}">${ic(B[1])}${B[2]}</span>`;
  }
  /* turn the task into the object being delivered: "Send Jen the two logo options" -> "the two logo options" */
  function objectOf(t) {
    const first = t.requester && D.PEOPLE[t.requester] ? fn(t.requester) : '';
    let o = t.title.replace(/^(send|share|add|approve|update)\s+/i, '');
    if (first) o = o.replace(new RegExp('^' + first + '\\s+', 'i'), '');
    if (!/^(the|a|an|my|our|your|three|two|\d)/i.test(o)) o = 'the ' + o;
    return o.charAt(0).toLowerCase() + o.slice(1);
  }
  const fileName = t => (projName(t.project).split(' ')[0] + '_' + objectOf(t).replace(/^(the|a|an)\s+/i, '').replace(/[^a-z0-9]+/gi, '_').replace(/_+$/, '')).slice(0, 48) + (/deck|timeline|slides|appendix/i.test(t.title) ? '.key' : /status report/i.test(t.title) ? '.pdf' : /illustration|logo|color|site|sign/i.test(t.title) ? '.zip' : '.pdf');
  const SLOTS = [[1, '10:00 AM'], [2, '2:00 PM'], [3, '11:30 AM']];
  function slotDate(n) { const d = addDays(n); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); return d; }
  const slotLabel = (n, time) => slotDate(n).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }) + ' · ' + time;
  function agentDraft(t) {
    const k = agentKind(t), st = t.agent || {}, first = fn(t.requester), proj = projName(t.project);
    const extra = (st.context || []).map(c => c.label);
    const due = t.due ? (daysOut(t.due) <= 1 ? dueInfo(t.due, 'upnext').label.toLowerCase() : fromISO(t.due).toLocaleDateString('en-US', { weekday: 'long' })) : '';
    const v = (st.v || 0) % 2;
    if (k === 'schedule') {
      const what = /book|visit|shoot/i.test(t.title) ? (/shoot/i.test(t.title) ? 'the shoot' : 'the visit') : /review/i.test(t.title) ? 'the review' : 'a call';
      const pick = st.slot == null ? null : SLOTS[st.slot];
      const lines = SLOTS.map(([n, time]) => '• ' + slotLabel(n, time)).join('\n');
      const body = v === 0
        ? `Hi ${first},\n\n${pick ? `Confirming ${what} for ${slotLabel(pick[0], pick[1])}. I’ve sent a calendar invite.` : `Here are a few times that work for ${what}:\n\n${lines}\n\nDo any of these work? I’ll send an invite as soon as you pick one.`}${/okafor/.test(t.project || '') ? '\n\nI’ll plan to meet you at the new office on Bleecker St.' : ''}${extra.length ? '\n\nI’ve also attached ' + extra.join(', ') + '.' : ''}\n\nThanks,\nMaya`
        : `Hey ${first}, ${pick ? `you’re booked for ${slotLabel(pick[0], pick[1])}. Invite on its way!` : `could any of these work for ${what}? ${SLOTS.map(([n, time]) => slotLabel(n, time)).join(', or ')}.`}${extra.length ? ' Also sharing ' + extra.join(', ') + '.' : ''}\n\nMaya`;
      return { kind: k, body, via: SENDVIA[t.source], context: contextOf(t), attach: [] };
    }
    const obj = objectOf(t);
    const plural = /s$|options|files|sizes|slides|assets|licenses/i.test(obj.split(' ').pop());
    const also = t.also && t.also.length ? ' I saw your follow-up too, so this covers both messages.' : '';
    const body = v === 0
      ? `Hi ${first},\n\nAs promised, here ${plural ? 'are' : 'is'} ${obj}.${also}\n\n${extra.length ? 'I’ve also included ' + extra.join(', ') + ' for reference.\n\n' : ''}Let me know if anything needs a tweak.${t.due && daysOut(t.due) > 1 ? ` I can turn changes around before ${due}.` : ''}\n\nBest,\nMaya`
      : `Hey ${first}! ${obj.charAt(0).toUpperCase() + obj.slice(1)} ${plural ? 'are' : 'is'} attached.${also}${extra.length ? ' Also linking ' + extra.join(', ') + '.' : ''} Shout if you want any changes.\n\nMaya`;
    return { kind: k, body, via: SENDVIA[t.source], context: contextOf(t), attach: [] };
  }
  function contextOf(t) {
    const out = [{ ic: t.source, label: (D.SOURCES[t.source] || {}).label + ' message from ' + fn(t.requester) }];
    (t.also || []).forEach(a => out.push({ ic: a.source, label: D.SOURCES[a.source].label + ' follow-up' }));
    out.push({ ic: 'feed', label: 'Past messages with ' + fn(t.requester) + ' about ' + projName(t.project) });
    if (agentKind(t) === 'schedule') out.push({ ic: 'cal', label: 'Your calendar (free slots this week)' });
    ((t.agent || {}).context || []).forEach(c => out.push({ ic: 'link', label: c.label }));
    return out;
  }
  function meetInfo(t) {
    const visit = /book|visit|shoot/i.test(t.title);
    const what = /shoot/i.test(t.title) ? 'Office photoshoot' : visit ? 'Site visit' : /review/i.test(t.title) ? 'Design review' : 'Call';
    return { title: projName(t.project) + ' · ' + what, mins: visit ? 60 : 30, where: /okafor/.test(t.project || '') ? 'Okafor Realty, 214 Bleecker St' : 'Google Meet link added' };
  }
  function slotRange(i, mins) {
    const [n, time] = SLOTS[i], d = slotDate(n);
    const [hm, ap] = time.split(' '); let [h, m] = hm.split(':').map(Number); if (ap === 'PM' && h !== 12) h += 12;
    const end = new Date(d); end.setHours(h, m + mins);
    const fmt = x => x.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(':00', '');
    const start = new Date(d); start.setHours(h, m);
    return { d, day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), date: d.getDate(), text: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }) + ' · ' + fmt(start) + '–' + fmt(end) };
  }
  function eventCard(t, i, auto) {
    const m = meetInfo(t), r = slotRange(i, m.mins);
    return `<div class="ev"><div class="ev-date"><b>${r.day}</b><span>${r.date}</span></div><div class="ev-txt"><b>${esc(m.title)}</b><span>${esc(r.text)}</span><span>${esc(m.where)}</span>
      <span class="ev-meta">${ic('cal')}${auto ? 'Booked automatically · ' : ''}On your Google Calendar · Invite sent to ${esc(fn(t.requester))}</span></div></div>`;
  }
  function msgDetails(t, d, label) {
    return `<details class="ag-msg"><summary>${esc(label)}</summary><div class="ag-to"><span>To</span>${av(t.requester)}${esc(personName(t.requester))} · ${esc(d.via)}</div><pre class="ag-body">${esc(((t.agent || {}).text) || d.body)}</pre></details>`;
  }
  function agentBlock(t) {
    const k = agentKind(t); if (!k) return '';
    const st = t.agent || {}, d = agentDraft(t), state = agentState(t);
    const ctx = `<details class="ag-ctx"><summary>Based on ${d.context.length} sources</summary><ul>${d.context.map(c => `<li>${P[c.ic] ? (D.SOURCES[c.ic] ? srcIc(c.ic) : `<span class="src-ic">${ic(c.ic)}</span>`) : ''}${esc(c.label)}</li>`).join('')}</ul></details>`;
    if (state === 'sent' || state === 'autosent') return `<section class="ag sent" id="agent"><div class="ag-h">${ic(state === 'autosent' ? 'bolt' : 'check')}<b>${state === 'autosent' ? 'Replied automatically' : 'Reply sent'}</b><span>${esc(d.via)} · just now</span></div>
      <div class="ag-to"><span>To</span>${av(t.requester)}${esc(personName(t.requester))}</div><pre class="ag-body">${esc(st.text || d.body)}</pre>${ctx}
      ${state === 'autosent' ? `<p class="ag-auto">${ic('bolt')}Sent in real time because “Reply automatically” is on. <button type="button" class="linkish" data-action="go-agent">Agent settings</button></p>` : ''}</section>`;
    if (state === 'booked' || state === 'autobooked') {
      const i = st.booked != null ? st.booked : 0;
      return `<section class="ag sent" id="agent"><div class="ag-h">${ic('cal')}<b>${state === 'autobooked' ? 'Keeper booked the meeting' : 'Meeting booked'}</b><span>Google Calendar</span></div>
        ${eventCard(t, i, state === 'autobooked')}${msgDetails(t, agentDraft(Object.assign({}, t, { agent: Object.assign({}, st, { slot: i }) })), 'Message sent with the invite')}
        ${state === 'autobooked' ? `<p class="ag-auto">${ic('bolt')}Booked in your first open slot because “Book automatically” is on. <button type="button" class="linkish" data-action="go-agent">Agent settings</button></p>` : ''}
        <div class="ag-tools"><button type="button" class="linkish" data-action="ag-unbook">Reschedule</button></div></section>`;
    }
    if (state === 'timessent') return `<section class="ag sent" id="agent"><div class="ag-h">${ic('check')}<b>Times sent</b><span>${esc(d.via)}</span></div><p class="ag-note">Keeper will book the meeting as soon as ${esc(fn(t.requester))} picks a time.</p>${msgDetails(t, d, 'Message sent')}</section>`;
    if (k === 'schedule') {
      const sel = st.slot == null ? 0 : st.slot, m = meetInfo(t);
      if (!calOn()) return `<section class="ag" id="agent"><div class="ag-h">${ic('cal')}<b>Connect your calendar to book this</b></div><p class="ag-note">Keeper needs your calendar to find free time and send invites.</p><div class="ag-acts"><button type="button" class="btn-primary" data-action="cal-connect">Connect Google Calendar</button></div></section>`;
      return `<section class="ag" id="agent">
        <div class="ag-h">${ic('cal')}<b>Keeper found times on your calendar</b><span>Google Calendar</span></div>
        <div class="ag-meet"><b>${esc(m.title)}</b><span>${m.mins} min · ${esc(m.where)}</span></div>
        <div class="ag-slots" role="radiogroup" aria-label="Free times">${SLOTS.map((x, i) => `<button type="button" role="radio" aria-checked="${sel === i}" class="slot ${sel === i ? 'on' : ''}" data-action="ag-slot" data-i="${i}"><span class="radio"></span>${esc(slotRange(i, m.mins).text)}<small>Free</small></button>`).join('')}</div>
        ${msgDetails(t, agentDraft(Object.assign({}, t, { agent: Object.assign({}, st, { slot: sel }) })), 'Invite message to ' + fn(t.requester))}
        ${ctx}
        <div class="ag-acts"><button type="button" class="btn-ghost" data-action="ag-sendtimes">Let ${esc(fn(t.requester))} pick</button><button type="button" class="btn-primary" data-action="ag-book">${ic('cal')}Book meeting</button></div>
      </section>`;
    }
    return `<section class="ag" id="agent">
      <div class="ag-h">${ic('spark')}<b>Keeper drafted a reply</b><span>${esc(d.via)}</span></div>
      <div class="ag-to"><span>To</span>${av(t.requester)}${esc(personName(t.requester))}</div>
      ${st.editing ? `<textarea class="ag-edit" aria-label="Edit draft">${esc(st.text || d.body)}</textarea>` : `<pre class="ag-body">${esc(st.text || d.body)}</pre>`}
      ${d.attach.length ? `<div class="ag-att">${d.attach.map(f => `<span class="att">${ic('clip')}${esc(f)}<small>from Drive</small></span>`).join('')}</div>` : ''}
      ${ctx}
      ${UI.addCtx === t.id ? `<form class="ag-add" data-tid="${t.id}"><input type="text" placeholder="Paste a link or doc name" aria-label="Add a link or document"><button type="submit" class="btn-ghost">Add</button></form>` : ''}
      <div class="ag-tools"><button type="button" class="linkish" data-action="ag-ctx">${ic('link')}Add link or doc</button><button type="button" class="linkish" data-action="ag-regen">${ic('spark')}Rewrite</button><button type="button" class="linkish" data-action="ag-edit">${st.editing ? 'Done editing' : 'Edit'}</button></div>
      <div class="ag-acts"><button type="button" class="btn-ghost" data-action="ag-discard">Discard</button><button type="button" class="btn-primary" data-action="ag-send">${ic('send')}${d.via.startsWith('Reply') ? 'Send reply' : 'Send'}</button></div>
    </section>`;
  }
  function agentStrip() {
    const list = agentTasks(); if (!vision() || !list.length) return '';
    const c = {}; list.forEach(t => { const s = agentState(t); c[s] = (c[s] || 0) + 1; });
    const pl = (n, a, b) => n + ' ' + (n === 1 ? a : b);
    const bits = [c.draft && pl(c.draft, 'reply drafted', 'replies drafted'), c.autosent && pl(c.autosent, 'reply sent automatically', 'replies sent automatically'),
      c.times && pl(c.times, 'meeting ready to book', 'meetings ready to book'), (c.autobooked || 0) + (c.booked || 0) && pl((c.autobooked || 0) + (c.booked || 0), 'meeting booked and marked done', 'meetings booked and marked done')].filter(Boolean);
    const todo = (c.draft || 0) + (c.times || 0);
    return `<button type="button" class="ag-strip" data-action="agent-list"><span class="ag-ic">${ic('spark')}</span><span class="o-txt"><b>Approve Keeper’s work</b><span>${bits.join(' · ')}.${todo ? ' Review and send.' : ''}</span></span>${ic('chev')}</button>`;
  }
  function agentSettings() {
    if (!vision()) return '';
    const g = AG();
    const opt = (key, v, label, sub, dis) => `<button type="button" class="ag-opt ${g[key] === v ? 'on' : ''}" data-action="ag-set" data-k="${key}" data-v="${v}" aria-pressed="${g[key] === v}" ${dis ? 'disabled' : ''}><span class="radio"></span><span class="vt"><b>${label}</b><span>${sub}</span></span></button>`;
    return `<section class="set-sec"><h2 class="sec-h">Keeper Agent: General replies</h2>
        <p class="sec-sub">How Keeper handles replies to emails, Slack and texts.</p>
        ${opt('draft', 'off', 'Off', 'Keeper only tracks tasks')}
        ${opt('draft', 'review', 'Draft for my review', 'Keeper writes the reply; you edit and send it')}
        ${opt('draft', 'auto', 'Reply automatically', 'Send automatic replies in real time')}
      </section>
      <section class="set-sec"><h2 class="sec-h">Keeper Agent: Scheduling</h2>
        <p class="sec-sub">Keeper finds free time on your calendar, books the meeting and sends the invite.</p>
        <div class="chan cal-row ${calOn() ? 'on' : ''}"><span class="src-ic" style="--c:#1A73E8">${ic('cal')}</span><span class="chan-txt"><b>Google Calendar</b><span>${calOn() ? 'Connected · maya@mayastudio.co' : 'Not connected'}</span></span>
          <button type="button" class="${calOn() ? 'btn-ghost' : 'btn-primary'} cal-btn" data-action="${calOn() ? 'cal-disconnect' : 'cal-connect'}">${calOn() ? 'Disconnect' : 'Connect'}</button></div>
        ${opt('schedule', 'off', 'Off', 'No scheduling help')}
        ${opt('schedule', 'suggest', 'Find times for me to book', 'Keeper picks free slots; you confirm with one tap')}
        ${opt('schedule', 'auto', 'Book automatically', 'Keeper books the first free slot and sends the invite', !calOn())}
      </section>
      <section class="set-sec"><h2 class="sec-h">Keeper Agent: Auto-complete tasks</h2>
        <p class="sec-sub">When Keeper sees in your channels that a task is done or has changed, like a reply you sent with the file attached or a client moving a due date.</p>
        ${opt('complete', 'ask', 'Ask me first', 'Keeper flags completions and changes; you confirm')}
        ${opt('complete', 'auto', 'Automatically', 'Keeper applies them for you. You can undo anytime')}
      </section>
      <p class="note">Automatic actions only go to people you’ve worked with before, and everything Keeper sends, books or completes is logged on the task.</p>`;
  }

  /* ---------- sheets ---------- */
  function renderLayer(instant) {
    const layer = $('#layer'); if (!layer) return;
    if (!UI.sheet) { layer.classList.remove('open'); layer.innerHTML = ''; return; }
    if (UI.sheet.type === 'task') {
      const t = task(UI.sheet.id); if (!t) { UI.sheet = null; return renderLayer(); }
      const d = taskDetail(t);
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Task details" data-tid="${t.id}">
        <div class="grab"></div>
        <div class="sh-h">${UI.sheet.from ? `<button class="back" data-action="sheet-back" aria-label="Back to ${UI.sheet.from === 'agents' ? 'Ready for you' : 'To review'}">${ic('back')}</button><span class="lab">${UI.sheet.from === 'agents' ? 'Ready for you' : 'To review'}</span>` : ''}<button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="sh-body">${d.body}</div>
        <div class="sh-foot">${d.foot}</div>
      </div>`;
    } else if (UI.sheet.type === 'src') {
      const t = task(UI.sheet.id); if (!t) { UI.sheet = null; return renderLayer(); }
      const o = ORIGIN[t.source] || {};
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Original ${esc(srcLabel(t.source))} message">
        <div class="grab"></div>
        <div class="sh-h"><button class="back" data-action="open" data-id="${t.id}" aria-label="Back to task">${ic('back')}</button><span class="lab">${srcIc(t.source)}Original ${esc(o.noun || 'message')}</span><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="sh-body">${sourceView(t)}<p class="sv-note">${esc(o.note || '')}</p></div>
        ${o.url ? `<div class="sh-foot"><a class="btn-primary" href="${o.url}" target="_blank" rel="noopener">${esc(o.cta)} ${ic('ext')}</a></div>` : ''}
      </div>`;
    } else if (UI.sheet.type === 'agents') {
      const list = agentTasks();
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Prepared by Keeper">
        <div class="grab"></div>
        <div class="sh-h"><b class="sh-name">Ready for you</b><span class="n">${list.length}</span><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="sh-body ag-list">${list.map(t => { const d = agentDraft(t); return `<button type="button" class="ag-item" data-action="open-agent" data-id="${t.id}">
          <span class="ag-row1">${agentBadge(t)}<span class="ag-via">${esc(d.via)}</span></span>
          <b>${esc(t.title)}</b><span class="ag-prev">${esc(d.body.replace(/\s+/g, ' ').slice(0, 110))}…</span></button>`; }).join('') || '<div class="empty">Nothing waiting. Keeper will prepare drafts as tasks come in.</div>'}</div>
      </div>`;
    } else if (UI.sheet.type === 'review') {
      const list = toReview();
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Tasks to review">
        <div class="grab"></div>
        <div class="sh-h"><b class="sh-name">To review</b><span class="n">${list.length}</span><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="sh-body rv-list">${list.map(reviewCard).join('') || '<div class="empty">All caught up.</div>'}</div>
      </div>`;
    } else if (UI.sheet.type === 'connect') {
      layer.innerHTML = `<div class="scrim"></div><div class="sheet connect" role="dialog" aria-modal="true" aria-label="Connect ${esc(D.SOURCES[UI.sheet.k].label)}">${connectHTML(UI.sheet.k)}</div>`;
    } else if (UI.sheet.type === 'voice') {
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Assistant voice"><div class="grab"></div>${voiceSheetHTML()}</div>`;
    } else if (UI.sheet.type === 'inc') {
      const list = incoming().slice(0, 12);
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Live Feed">
        <div class="grab"></div>
        <div class="sh-h"><span class="live-dot"></span><b>Live Feed</b><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="inc-list"><div class="feed-list">${list.map(t => feedRow(t, { status: true })).join('')}</div></div>
        <div class="sh-foot"><button class="btn-ghost" data-action="go" data-screen="feed">Open full feed</button></div>
      </div>`;
    } else if (UI.sheet.type === 'ask') {
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet ask ${UI.ask.msgs.length ? '' : 'blank'}" role="dialog" aria-modal="true" aria-label="Add a task">
        <div class="grab"></div>
        <div class="sh-h"><span class="logo-mark" aria-hidden="true"></span><b>New task</b><button type="button" class="vbtn" data-action="voice" aria-label="Choose assistant voice">${ic('wave')}Voice</button><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="ask-msgs" id="askMsgs">${askMsgsHTML()}</div>
        <div class="vstage ${UI.ask.msgs.length ? 'compact' : ''}" id="vstage">${vstageHTML()}</div>
        <div class="ask-acts" id="askActs">${askActsHTML()}</div>
        <form class="ask-in" id="askForm">
          <input id="askInput" type="text" autocomplete="off" placeholder="${askPlaceholder()}" aria-label="Type a task">
          <button type="submit" class="send" aria-label="Send">${ic('send')}</button>
        </form>
      </div>`;
    }
    if (instant) layer.classList.add('open');
    else requestAnimationFrame(() => layer.classList.add('open'));
    if (UI.sheet.type === 'ask') { const m = $('#askMsgs'); if (m) m.scrollTop = m.scrollHeight; }
  }
  const tidOf = el => { const h = el.closest('[data-tid]'); return h ? h.dataset.tid : UI.sheet && UI.sheet.id; };
  function afterReview() {
    refresh();
    if (UI.sheet && UI.sheet.type === 'task') { closeSheet(); return; }
    if (UI.sheet && UI.sheet.type === 'review') { if (!toReview().length) closeSheet(); else renderLayer(true); }
  }
  function openSheet(s) { UI.editField = null; return openSheet0(s); }
  function openSheet0(s) { UI.sheet = s; const l = $('#layer'); if (l) l.classList.remove('open'); renderLayer(); }
  /* a task opened from a review list returns to that list (if anything is left in it) */
  function backToList() {
    const from = UI.sheet && UI.sheet.from;
    const left = from === 'agents' ? agentTasks().filter(t => { const st = agentState(t); return st === 'draft' || st === 'times'; }).length : from === 'review' ? toReview().length : 0;
    if (from && left) openSheet({ type: from }); else closeSheet();
  }
  /* re-render onboarding without losing the scroll position of the page or the review list */
  function keepOnbScroll(fn) {
    const o = $('.onb'), l = $('.ob-list'); const so = o ? o.scrollTop : 0, sl = l ? l.scrollTop : 0;
    fn();
    const o2 = $('.onb'), l2 = $('.ob-list'); if (o2) o2.scrollTop = so; if (l2) l2.scrollTop = sl;
  }
  function closeSheet() {
    stopListening();
    const l = $('#layer'); if (!l) return;
    l.classList.remove('open');
    setTimeout(() => { if (!l.classList.contains('open')) { UI.sheet = null; l.innerHTML = ''; } }, 320);
    UI.sheet = null;
  }

  /* ---------- assistant: voice first, type as fallback ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ADDCOLS = ['upnext', 'inprogress'];
  function startAsk(voice) {
    if (!vision()) return;
    UI.ask = { msgs: [], draft: null, awaiting: null, listening: false, voice: !!voice || mode() === 'mobile', handsFree: !!voice, interim: '' };
    openSheet({ type: 'ask' });
    setTimeout(() => { if (voice && SR) startListening(); else { const i = $('#askInput'); if (i && mode() === 'desktop') i.focus(); } }, 380);
  }
  const askPlaceholder = () => !UI.ask ? '' : UI.ask.awaiting === 'requester' ? 'Or type a name' : /due/.test(UI.ask.awaiting || '') ? 'Or type any date' : UI.ask.awaiting === 'review' ? 'Or type a change' : 'Or type it here';
  function vstageHTML() {
    const A = UI.ask;
    const cap = A.listening || A.handsFree ? (A.speaking ? 'Keeper is talking…' : 'Listening… keep talking') : SR ? (A.msgs.length ? 'Tap to answer' : 'Tap to talk') : 'Voice needs Chrome, Edge or Safari. Type below.';
    return (A.msgs.length ? '' : `<div class="ask-empty">What do you need to keep track of?<small>Say it like you’d tell an assistant: “Send Jen the logo files by the 30th.”</small></div>`) + `<button type="button" class="orb ${A.listening || A.handsFree ? 'rec' : ''}" data-action="mic" aria-label="${A.listening ? 'Stop listening' : 'Start talking'}" ${SR ? '' : 'disabled'}><span class="orb-glow" aria-hidden="true"></span><span class="orb-swirl" aria-hidden="true"></span><span class="orb-swirl two" aria-hidden="true"></span><span class="orb-sheen" aria-hidden="true"></span></button>
      ${A.listening && A.interim ? `<div class="vlive" id="vlive">${esc(A.interim)}</div>` : `<div class="vcap">${cap}</div>`}`;
  }
  function paintVoice() { const v = $('#vstage'); if (v) { v.innerHTML = vstageHTML(); v.classList.toggle('compact', UI.ask.msgs.length > 0); const sh = v.closest('.sheet'); if (sh) sh.classList.toggle('blank', !UI.ask.msgs.length); } }
  function askMsgsHTML() {
    const A = UI.ask; const last = A.msgs.length - 1;
    if (!A.msgs.length) return '';
    return A.msgs.map((m, i) => {
      if (m.from === 'me') return `<div class="msg me ${i === last ? 'nw' : ''}"><div class="bub">${esc(m.text)}</div></div>`;
      let h = `<div class="msg ${i === last ? 'nw' : ''}"><span class="logo-mark k" aria-hidden="true"></span><div class="bub">${esc(m.text)}</div></div>`;
      if (m.draft) h += draftHTML(m.draft, i === last);
      if (m.chips && i === last) h += `<div class="qchips">${m.chips.map(c => `<button type="button" class="chip" data-action="qchip" data-v="${esc(c)}">${esc(c)}</button>`).join('')}${m.datePick ? `<label class="duepick chip">${ic('cal')}<input type="date" id="askDate" min="${iso(today0())}" aria-label="Pick any date"></label>` : ''}</div>`;
      return h;
    }).join('');
  }
  function draftHTML(d, live) {
    return `<div class="draft"><h3 class="sh-title">${esc(d.title)}</h3>
      <dl class="fields"><dt>Requested by</dt><dd>${d.requester && d.requester !== 'maya' ? av(d.requester) + esc(personName(d.requester)) : 'You'}</dd>
      <dt>Due</dt><dd>${live ? `<input type="date" id="draftDue" value="${d.due == null ? '' : iso(addDays(d.due))}" aria-label="Due date">` : ''}${live ? '' : d.due == null ? 'No date' : esc(dueInfo(iso(addDays(d.due)), 'upnext').label + (Math.abs(d.due) < 7 ? ' · ' + shortDate(addDays(d.due)) : ''))}</dd>
      <dt>Project</dt><dd>${projTag(d.project) || 'None'}</dd>${live ? '' : `<dt>Column</dt><dd>${esc(statusLabel(d.col))}</dd>`}</dl>
      ${live ? `<div><div class="fl">Add to</div><div class="statuses">${ADDCOLS.map(c => `<button type="button" class="s-${c} ${d.col === c ? 'on' : ''}" data-action="draft-col" data-v="${c}">${sdot(c)}${esc(statusLabel(c))}</button>`).join('')}</div></div>
` : ''}</div>`;
  }
  const askActsHTML = () => UI.ask && UI.ask.draft ? `<button type="button" class="btn-ghost" data-action="ask-cancel">Cancel</button><button type="button" class="btn-primary" data-action="draft-add">Add</button>` : '';
  function paintMsgs() { const el = $('#askMsgs'); if (el) { el.innerHTML = askMsgsHTML(); el.scrollTop = el.scrollHeight; } const ac = $('#askActs'); if (ac) ac.innerHTML = askActsHTML(); paintVoice(); }
  function pushMsg(m) { UI.ask.msgs.push(m); paintMsgs(); }
  function setAskPlaceholder() { const i = $('#askInput'); if (i) i.placeholder = askPlaceholder(); }
  /* in voice mode Keeper reads its question aloud, then listens for the answer */
  /* Keeper talks, pauses the mic while it speaks, then keeps listening until Add, Cancel or typing */
  function say(text, listenAfter) {
    const A = UI.ask; if (!A) return;
    const resume = () => { A.speaking = false; if (A.handsFree && UI.ask === A && UI.sheet && UI.sheet.type === 'ask' && !A.listening) startListening(); };
    if (!A.voice || !synth) { resume(); return; }
    A.speaking = true;
    if (rec && A.listening) { try { rec.abort(); } catch (e) {} }
    speakWith(text, currentVoice(), resume);
    setTimeout(() => { if (A.speaking && !synth.speaking) resume(); }, 8000);
  }
  const fn = k => personName(k).split(' ')[0];
  function spokenDue(days) { if (days == null) return 'no due date'; const l = dueInfo(iso(addDays(days)), 'upnext').label; return 'due ' + (l === 'Today' || l === 'Tomorrow' ? l.toLowerCase() : Math.abs(days) < 7 ? l.replace(/^(\w{3})$/, m => ({ Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' })[m] || m) : addDays(days).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })); }
  function summaryLine(d) {
    const bits = [];
    if (d.requesterSet) bits.push(d.requester === 'maya' ? 'for you' : 'for ' + (D.PEOPLE[d.requester] ? fn(d.requester) : d.requester));
    if (d.dueSet) bits.push(spokenDue(d.due));
    bits.push('in ' + statusLabel(d.col));
    return '“' + d.title + '”, ' + bits.join(', ') + '.';
  }
  /* step 1: read back what was understood and ask for changes */
  function askReview(updated) {
    const A = UI.ask, d = A.draft;
    if (VAGUE.test(d.title)) {
      A.awaiting = 'what';
      const who = d.requesterSet && d.requester !== 'maya' ? ' ' + fn(d.requester) : '';
      pushMsg({ from: 'k', text: 'Keeper tracks things you owe people, not messages to answer. What do you need to deliver' + (who ? ' to' + who : '') + '? For example, “send the logo files”.' });
      say('Got it. What do you need to deliver' + (who ? ' to' + who : '') + '? Like, send the logo files.', true);
      setAskPlaceholder(); return;
    }
    A.awaiting = 'review';
    const line = (updated ? 'Updated: ' : 'New task: ') + summaryLine(d);
    const q = updated ? 'Anything else to change?' : 'Anything you want to change?';
    pushMsg({ from: 'k', text: line + ' ' + q, draft: d });
    const spoken = summaryLine(d).replace(/[“”]/g, '');
    say(updated ? 'Sure, done. It’s now ' + spoken + ' Anything else?' : 'Okay, I’ve got ' + spoken + ' Want to change anything?', true);
    setAskPlaceholder();
  }
  /* step 2: ask only for what is still missing, then add */
  function askMissing() {
    const A = UI.ask, d = A.draft;
    if (!d.requesterSet) {
      A.awaiting = 'requester';
      const clients = Object.keys(D.PEOPLE).filter(k => D.PEOPLE[k].role === 'client').map(fn);
      pushMsg({ from: 'k', text: 'Who is this for?', chips: clients.concat('Just me') }); say('Got it. Who’s this one for?', true);
    } else if (!d.dueSet) {
      A.awaiting = 'due';
      pushMsg({ from: 'k', text: 'When is it due?', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'], datePick: true }); say('And when’s it due?', true);
    } else {
      A.awaiting = 'ready';
      pushMsg({ from: 'k', text: 'All set: ' + summaryLine(d) + ' Tap Add, or tell me what to change.', draft: d });
      say('All set. Say “add it”, or tell me what to change.', true);
    }
    setAskPlaceholder();
  }
  const NOCHANGE = /^(no|nope|nah|nothing|looks good|look(s)? great|all good|good|fine|it'?s fine|that'?s (it|right|good|fine|all)|perfect|correct|all set|we'?re good|sounds good|great|ok(ay)?|add it|save it|done)\b/i;
  /* apply spoken or typed edits: dates, people, collaborators, column, title */
  function applyChanges(text, d) {
    let changed = false;
    const t = ' ' + text + ' ';
    const ren = text.match(/\b(?:call it|rename (?:it )?(?:to)?|change the (?:title|name) to|title (?:it|is)?)\s+[“"]?(.+?)[”"]?\s*$/i);
    if (ren) { d.title = simplifyTitle(ren[1]); return true; }
    const cr = parseCol(t) || (() => { const m = COLWORDS.find(([, w]) => new RegExp('\\b(' + w + ')\\b', 'i').test(text)); return m ? { id: m[0] } : null; })();
    if (cr) { d.col = cr.id; changed = true; }
    if (/\bno (due )?date\b|\bno deadline\b|remove the (due )?date/i.test(text)) { d.due = null; d.dueSet = true; changed = true; }
    else { const r = parseDue(text); if (r) { d.due = r.days; d.dueSet = true; changed = true; } }
    const w = null;
    if (/\b(for|it'?s for)\s+(me|myself)\b|\bjust me\b/i.test(text)) { d.requester = 'maya'; d.requesterSet = true; changed = true; }
    else {
      const f = text.match(/\b(?:for|from|it'?s for|requester is)\s+([a-z]+)/i);
      const k = f && FIRST[f[1].toLowerCase()];
      const bare = !k && findPeople(text).find(p => D.PEOPLE[p.key].role === 'client' && !(w && new RegExp(personName(p.key).split(' ')[0], 'i').test(w[1])));
      const who = k || (bare && bare.key);
      if (who) { d.requester = who; d.requesterSet = true; if (D.PEOPLE[who].project) d.project = D.PEOPLE[who].project; changed = true; }
    }
    return changed;
  }
  function askSubmit(text, viaVoice) {
    text = (text || '').trim(); if (!text || !UI.ask) return;
    const A = UI.ask;
    pushMsg({ from: 'me', text });
    const d = A.draft;
    const ADDWORDS = /^(add|add it|save|save it|yes,? add it|that'?s it,? add it|go ahead|create it)\b/i;
    if (A.awaiting === 'what') {
      const p = parseTask(text);
      d.title = p.title;
      if (p.dueSet) { d.due = p.due; d.dueSet = true; }
      if (VAGUE.test(d.title)) d.title = 'Send ' + d.title.replace(VAGUE, '').replace(/^\s*(to|with)\s+/i, '').trim();
      if (d.requesterSet && D.PEOPLE[d.requester] && d.requester !== 'maya' && /^(send|share|deliver) (the|a|an|our|my|some) /i.test(d.title)) d.title = d.title.replace(/^(\w+) /, '$1 ' + fn(d.requester) + ' ');
      return setTimeout(() => askReview(true), 300);
    }
    if (A.awaiting === 'ready') {
      if (ADDWORDS.test(text) || NOCHANGE.test(text) || /^(yes|yeah|yep|sure)\b/i.test(text)) return addDraft();
      if (applyChanges(text, d)) return setTimeout(() => askReview(true), 300);
      pushMsg({ from: 'k', text: 'Say “add it”, or tell me what to change: a date, a person, a column, or “call it…”.' }); say('Sorry, should I add it, or change something?', true); return;
    }
    if (A.awaiting === 'review') {
      if (ADDWORDS.test(text)) return setTimeout(() => (d.requesterSet && d.dueSet ? addDraft() : askMissing()), 200);
      if (/^change the date$/i.test(text)) { A.awaiting = 'due-edit'; pushMsg({ from: 'k', text: 'What’s the new due date?', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'], datePick: true }); say('What’s the new due date?', true); return; }
      if (/^change the column$/i.test(text)) { A.awaiting = 'col-edit'; pushMsg({ from: 'k', text: 'Which column?', chips: ADDCOLS.map(statusLabel) }); say('Which column? Up next or in progress?', true); return; }
      if (applyChanges(text, d)) return setTimeout(() => askReview(true), 300);
      if (NOCHANGE.test(text) || /^yes,? (it'?s|that'?s|looks)/i.test(text)) return setTimeout(askMissing, 300);
      if (/^(yes|yeah|yep|sure)\b/i.test(text)) { pushMsg({ from: 'k', text: 'What should I change? Say a new date, a person, a column, or “call it…” for a new title.' }); say('What should I change?', true); return; }
      pushMsg({ from: 'k', text: 'Sorry, I didn’t catch a change. Try “due next Tuesday”, “for Marcus”, “move it to in progress” or “call it…”.' }); say('Sorry, what should I change?', true); return;
    }
    if (A.awaiting === 'due-edit' || A.awaiting === 'col-edit') {
      if (applyChanges(text, d)) return setTimeout(() => askReview(true), 300);
      pushMsg({ from: 'k', text: 'I didn’t catch that. Try again or pick one.', chips: A.awaiting === 'col-edit' ? ADDCOLS.map(statusLabel) : ['Today', 'Tomorrow', 'Next week', 'No due date'], datePick: A.awaiting === 'due-edit' }); say('Sorry, try again?', true); return;
    }
    if (A.awaiting === 'requester') {
      const s = text.toLowerCase();
      if (/^(just )?(me|myself)|no one|nobody|none|^mine/.test(s)) d.requester = 'maya';
      else { const p = findPeople(text)[0]; d.requester = p ? p.key : text.replace(/^(it'?s )?(for )?/i, '').replace(/\b\w/g, c => c.toUpperCase()); }
      if (!d.project && D.PEOPLE[d.requester] && D.PEOPLE[d.requester].project) d.project = D.PEOPLE[d.requester].project;
      d.requesterSet = true;
      return setTimeout(askMissing, 300);
    }
    if (A.awaiting === 'due') {
      if (/\bno( due)?( date)?\b|none|whenever|no rush|no deadline/i.test(text)) { d.due = null; d.dueSet = true; }
      else { const r = parseDue(text); if (r) { d.due = r.days; d.dueSet = true; } else { pushMsg({ from: 'k', text: 'I didn’t catch a date. Try “in 2 weeks”, “Nov 14” or “the 30th”, or pick one.', chips: ['Today', 'Tomorrow', 'Next week', 'No due date'], datePick: true }); say('Sorry, what date?', true); return; } }
      return setTimeout(askMissing, 300);
    }
    A.draft = parseTask(text);
    if (A.draft.col === 'done') A.draft.col = 'upnext';
    setTimeout(() => askReview(false), 350);
  }
  function addDraft() {
    const d = UI.ask.draft; if (!d) return;
    const t = mkTask({ title: d.title, source: 'keeper', category: d.category, project: d.project, requester: d.requester === 'maya' ? 'maya' : d.requester, collaborators: d.collaborators, due: d.due, status: d.col, snippet: '' });
    t.fresh = true;
    S.tasks.unshift(t); if (mode() === 'mobile') S.mstatus = d.col; save();
    refresh();
    toast(srcIc('keeper') + 'Added to ' + esc(statusLabel(d.col)) + ': ' + esc(d.title));
    UI.ask.awaiting = null; UI.ask.draft = null;
    const v = UI.ask.voice; stopListening();
    if (v) speakWith('Great, it’s in ' + statusLabel(d.col) + '.', currentVoice());
    closeSheet();
    setTimeout(() => { t.fresh = false; }, 4000);
  }
  /* voice */
  let rec = null;
  function startListening() {
    const A = UI.ask;
    if (!SR || !A) { paintVoice(); return; }
    if (A.speaking) return;
    try {
      const r = rec = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;
      r.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) { const t = res[0].transcript.trim(); A.interim = ''; if (t) askSubmit(t, true); }
          else interim += res[0].transcript;
        }
        if (interim) { A.interim = interim.trim(); const v = $('#vlive'); if (v) v.textContent = A.interim; else paintVoice(); }
      };
      r.onerror = e => { if (/not-allowed|service-not-allowed|audio-capture/.test(e.error)) { A.handsFree = false; pushMsg({ from: 'k', text: 'I need microphone permission to listen. Allow it in your browser, or type below.' }); } };
      r.onend = () => {
        if (rec !== r) return;
        A.interim = ''; setListening(false);
        if (A.handsFree && !A.speaking && UI.ask === A && UI.sheet && UI.sheet.type === 'ask') setTimeout(() => { if (!A.listening && !A.speaking && A.handsFree) startListening(); }, 250);
      };
      r.start(); setListening(true);
    } catch (e) { setListening(false); }
  }
  function stopListening() {
    if (UI.ask) { UI.ask.handsFree = false; UI.ask.speaking = false; }
    if (rec) { const r = rec; rec = null; try { r.abort(); } catch (e) {} }
    if (synth) try { synth.cancel(); } catch (e) {}
    if (UI.ask) setListening(false);
  }
  function setListening(on) { if (!UI.ask) return; UI.ask.listening = on; paintVoice(); }

  /* ---------- live arrivals ---------- */
  function arrive(manual) {
    if (!S.onboarded) return;
    const total = D.INCOMING.length;
    while (S.incomingIdx < total) {
      const tpl = D.INCOMING[S.incomingIdx++];
      if (!S.channels.includes(tpl.source)) continue;
      if (tpl.dupOf) {
        const orig = S.tasks.find(x => x.title === tpl.dupOf && !x.dismissed);
        if (!orig) continue;
        orig.also = (orig.also || []).concat({ source: tpl.source, snippet: tpl.snippet, captured: Date.now() });
        orig.fresh = true; save(); refresh();
        toast(esc(orig.title), { title: 'Duplicate merged', id: orig.id, sub: srcIc(tpl.source) + 'Same request from ' + esc(personName(tpl.requester)) + ' · ' + esc(D.SOURCES[tpl.source].label) });
        setTimeout(() => { orig.fresh = false; refresh(); }, 6000);
        return;
      }
      const t = mkTask(Object.assign({}, tpl, { status: 'upnext', ago: 0, triage: true }));
      t.fresh = true;
      S.tasks.push(t); S.unseen = (S.unseen || 0) + 1; save(); refresh();
      toast(esc(t.title), { title: 'New task to review', id: t.id, sub: srcIc(t.source) + 'From ' + esc(personName(t.requester) || 'you') + ' · ' + esc(D.SOURCES[t.source].label) });
      setTimeout(() => { t.fresh = false; refresh(); }, 6000);
      return;
    }
    save(); refresh();
  }
  let liveTimer = null;
  /* demo kickoff: guarantee one new task in To review shortly after onboarding */
  function firstArrival() {
    const n = toReview().length; let guard = 0;
    while (toReview().length === n && S.incomingIdx < D.INCOMING.length && guard++ < 12) arrive(false);
  }
  function scheduleLive() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { if (S.onboarded && S.live && !document.hidden && !UI.sheet && !(UI.drag && UI.drag.active)) arrive(false); scheduleLive(); }, 60000);
  }

  /* ---------- toasts ---------- */
  /* notification banners: inside the phone on mobile (like iOS), bottom-right on desktop */
  function toastHost() {
    if (mode() !== 'mobile') return $('#toasts');
    let w = $('#devToasts'); if (!w) { w = document.createElement('div'); w.id = 'devToasts'; w.className = 'dev-toasts'; w.setAttribute('aria-live', 'polite'); device.appendChild(w); }
    return w;
  }
  function toast(html, opt) {
    opt = opt || {};
    const w = toastHost(); const el = document.createElement(opt.id ? 'button' : 'div');
    el.className = 'toast' + (opt.title ? ' note' : '');
    if (opt.id) { el.type = 'button'; el.dataset.action = 'open'; el.dataset.id = opt.id; }
    el.innerHTML = opt.title
      ? `<span class="logo-mark t-ic" aria-hidden="true"></span><span class="t-txt"><span class="t-top"><b>${esc(opt.title)}</b><span>now</span></span><span class="t-body">${html}</span>${opt.sub ? `<span class="t-sub">${opt.sub}</span>` : ''}</span>`
      : html;
    w.appendChild(el);
    while (w.children.length > 2) w.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, opt.title ? 5000 : 3000);
  }

  /* ---------- menus ---------- */
  function openMenu(btn, kind) {
    closeMenu();
    let items = [];
    if (kind === 'due') items = DUEWORDS.map(([v, , label]) => ({ type: 'due', value: v, label }));
    if (kind === 'project') items = Object.keys(D.PROJECTS).map(k => ({ type: 'project', value: k, label: D.PROJECTS[k].name }));
    if (kind === 'person') items = Object.keys(D.PEOPLE).filter(k => D.PEOPLE[k].role === 'client').map(k => ({ type: 'person', value: k, label: D.PEOPLE[k].name }));
    if (kind === 'source') items = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'].filter(k => S.channels.includes(k)).map(k => ({ type: 'source', value: k, label: D.SOURCES[k].label }));
    const on = it => S.filter.tokens.some(t => t.type === it.type && t.value === it.value);
    const menu = document.createElement('div');
    menu.className = 'menu'; menu.id = 'menu';
    menu.innerHTML = items.map(it => `<button type="button" class="${on(it) ? 'on' : ''}" data-action="menu-pick" data-type="${it.type}" data-v="${it.value}" data-label="${esc(it.label)}">${it.type === 'person' ? av(it.value) : it.type === 'source' ? srcIc(it.value) : projTag(it.value).replace(esc(it.label), '')}${esc(it.label)}${it.sub ? ` <span style="color:var(--faint)">· ${esc(it.sub)}</span>` : ''}${on(it) ? ' ✓' : ''}</button>`).join('');
    const host = $('#filter'); host.appendChild(menu);
    const hb = host.getBoundingClientRect(), bb = btn.getBoundingClientRect();
    const z = UI.scale || 1;
    menu.style.top = (bb.bottom - hb.top + 6) / z + 'px';
    menu.style.left = Math.max(8, Math.min(bb.left - hb.left, hb.width - 230)) / z + 'px';
    UI.menu = kind;
  }
  function closeMenu() { const m = $('#menu'); if (m) m.remove(); UI.menu = null; }
  /* mobile shows one status at a time: when filtering, land on a status that has results */
  function jumpToMatches() {
    if (!$('#mList')) { const toks = activeTokens(); if (toks.length && colTasks('done', toks).length && !D.COLUMNS.some(c => c.id !== 'done' && colTasks(c.id, toks).length)) S.doneOpen = true; return; }
    const toks = activeTokens(); if (!toks.length) return;
    const has = s => colTasks(s, toks).length > 0;
    if (!has(S.mstatus)) { const c = D.COLUMNS.find(c => has(c.id)); if (c) S.mstatus = c.id; }
  }
  function toggleToken(tok) {
    const i = S.filter.tokens.findIndex(t => t.type === tok.type && t.value === tok.value);
    if (i >= 0) S.filter.tokens.splice(i, 1); else S.filter.tokens.push(tok);
    jumpToMatches(); save(); refresh();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    if (UI.suppressClick) { UI.suppressClick = false; e.preventDefault(); e.stopPropagation(); return; }
    const a = e.target.closest('[data-action]');
    if (UI.menu && !e.target.closest('#menu') && !(a && a.dataset.action === 'f-menu')) closeMenu();
    const card = e.target.closest('.card');
    if (!a && card) { openSheet({ type: 'task', id: card.dataset.id }); return; }
    if (!a) return;
    const act = a.dataset.action;
    switch (act) {
      case 'sort-due': S.manual = Object.assign({}, S.manual, { upnext: false }); save(); refresh(); break;
      case 'mode': S.mode = a.dataset.mode; save(); render(); break;
      case 'scope': S.scope = a.dataset.scope; save(); UI.sheet = null; render(); break;
      case 'about': $('#about').hidden = false; break;
      case 'about-close': $('#about').hidden = true; break;
      case 'reset': try { localStorage.removeItem(STORE); } catch (err) {} const sc = S.scope; S = fresh(); S.scope = sc; UI.sheet = null; render(); break;
      case 'onb-next':
        if (S.step < 2) { S.step++; save(); render(); }
        if (S.step === 2) setTimeout(() => {
          if (S.step !== 2) return;
          S.step = 3; S.onbPick = {}; save(); render();
        }, 2600);
        break;
      case 'ob-pick': { const id = tidOf(a); S.onbPick = S.onbPick || {}; S.onbPick[id] = S.onbPick[id] === a.dataset.v ? undefined : a.dataset.v; save(); keepOnbScroll(render); break; }
      case 'ob-all': { S.onbPick = S.onbPick || {}; foundTasks().forEach(t => { if (!S.onbPick[t.id]) S.onbPick[t.id] = 'keep'; }); save(); keepOnbScroll(render); break; }
      case 'ob-finish': {
        const pick = S.onbPick || {}; let kept = 0;
        foundTasks().forEach(t => { const p = pick[t.id]; if (p === 'keep') { t.triage = false; t.low = false; kept++; } else if (p === 'skip') { t.dismissed = true; t.triage = false; } else t.triage = true; });
        S.onboarded = true; S.screen = 'board'; S.onbPick = null; save(); render();
        toast(`${kept} task${kept === 1 ? '' : 's'} added to your list`, { title: 'You’re all set' });
        clearTimeout(liveTimer);
        liveTimer = setTimeout(() => { if (!S.onboarded) return; firstArrival(); scheduleLive(); }, 20000);
        setTimeout(detectEvent, 45000);
        break;
      }
      case 'chan': {
        const k = a.dataset.k, i = S.channels.indexOf(k);
        if (i < 0) { startConnect(k); break; }
        S.channels.splice(i, 1);
        save();
        if (!S.onboarded) render();
        else { a.classList.toggle('on', i < 0); a.setAttribute('aria-pressed', String(i < 0)); toast(srcIc(k) + 'Stopped listening to ' + esc(D.SOURCES[k].label)); const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); refresh(); }
        break;
      }
      case 'go': S.screen = a.dataset.screen; if (S.screen === 'feed') S.unseen = 0; UI.sheet = null; save(); closeMenu(); render(); if (S.screen === 'feed') setTimeout(() => { S.tasks.forEach(t => t.fresh = false); }, 5000); break;
      case 'inc': S.unseen = 0; save(); refresh(); openSheet({ type: 'inc' }); break;
      case 'mtab': S.mstatus = a.dataset.tab; save(); refresh(); { const mb = $('#mBody'), mt = $('#mTabs'); if (mb && mt && mb.scrollTop > mt.offsetTop) mb.scrollTop = mt.offsetTop; } break;
      case 'search': UI.search = !UI.search; render(); if (UI.search) { const i = $('#fInput'); if (i) i.focus(); } break;
      case 'f-close': UI.search = false; save(); render(); break;
      case 'open':
        if (mode() === 'desktop' && a.closest('#feedPage')) { UI.feedSel = a.dataset.id; refresh(); break; }
        { const from = UI.sheet && (UI.sheet.type === 'agents' || UI.sheet.type === 'review') ? UI.sheet.type : UI.sheet && UI.sheet.type === 'task' && UI.sheet.id === a.dataset.id ? UI.sheet.from : (UI.sheet && UI.sheet.type === 'src' ? UI.sheet.from : null);
          openSheet({ type: 'task', id: a.dataset.id, from }); } break;
      case 'done-toggle': S.doneOpen = !S.doneOpen; save(); refresh(); break;
      case 'sheet-back': backToList(); break;
      case 'close': if (UI.sheet && UI.sheet.type === 'task' && UI.sheet.from) { backToList(); break; }
        if (UI.sheet && UI.sheet.type === 'voice' && UI.prevAsk && UI.ask) { UI.prevAsk = false; UI.sheet = { type: 'ask' }; renderLayer(true); break; } closeSheet(); break;
      case 'set-status': { const t = task(tidOf(a)); t.status = a.dataset.v; if (t.status !== 'done') { t.doneBy = null; if (t.detect) t.detect.undone = true; } UI.editField = null; save(); refresh(); renderLayer(true); break; }
      case 'chg-apply': { const t = task(tidOf(a)); applyChange(t, false); t.fresh = true; save(); refresh(); renderLayer(true); setTimeout(() => { t.fresh = false; refresh(); }, 2500); break; }
      case 'chg-keep': { const t = task(tidOf(a)); if (t.change) t.change.state = 'kept'; save(); refresh(); renderLayer(true); break; }
      case 'chg-undo': { const t = task(tidOf(a)); undoChange(t); save(); refresh(); renderLayer(true); break; }
      case 'det-reject': { const t = task(tidOf(a)); if (t.detect) t.detect.rejected = true; save(); refresh(); renderLayer(true); break; }
      case 'det-reopen': { const t = task(tidOf(a)); t.status = 'inprogress'; t.doneBy = null; if (t.detect) t.detect.undone = true; save(); refresh(); renderLayer(true); break; }
      case 'set-due': { const t = task(tidOf(a)); t.due = a.dataset.n === 'none' ? null : iso(addDays(+a.dataset.n)); UI.editField = null; save(); refresh(); renderLayer(true); break; }
      case 'edit': UI.editField = UI.editField === a.dataset.f ? null : a.dataset.f; refresh(); if (UI.sheet) renderLayer(true); break;
      case 'rv-add': { const t = task(tidOf(a)); t.triage = false; t.low = false; t.fresh = true; save(); afterReview(); setTimeout(() => { t.fresh = false; refresh(); }, 2500); break; }
      case 'rv-dismiss': { const t = task(tidOf(a)); t.dismissed = true; t.triage = false; save(); afterReview(); break; }
      case 'review': openSheet({ type: 'review' }); break;
      case 'agent-list': openSheet({ type: 'agents' }); break;
      case 'open-agent': openSheet({ type: 'task', id: a.dataset.id, from: 'agents' }); setTimeout(() => { const el = $('.sheet #agent'); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 360); break;
      case 'ag-set': S.agent = Object.assign(AG(), { [a.dataset.k]: a.dataset.v }); save(); applyAgent(); { const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); } break;
      case 'go-agent': S.screen = 'sources'; UI.sheet = null; save(); render(); break;
      case 'ag-slot': { const t = task(tidOf(a)); t.agent = Object.assign({}, t.agent, { slot: +a.dataset.i, text: null }); save(); refresh(); renderLayer(true); break; }
      case 'ag-book': { const t = task(tidOf(a)); const i = (t.agent || {}).slot || 0; t.agent = Object.assign({}, t.agent, { booked: i, slot: i }); t.status = 'done'; save(); refresh(); renderLayer(true); toast('Added to your Google Calendar · invite sent to ' + esc(fn(t.requester)), { title: 'Meeting booked' }); break; }
      case 'ag-sendtimes': { const t = task(tidOf(a)); t.agent = Object.assign({}, t.agent, { sent: true, slot: null, text: null }); save(); refresh(); renderLayer(true); break; }
      case 'ag-unbook': { const t = task(tidOf(a)); t.agent = Object.assign({}, t.agent, { booked: null, sent: false, slot: 0, manual: true, auto: false }); if (t.status === 'done') t.status = 'inprogress'; save(); refresh(); renderLayer(true); break; }
      case 'cal-connect': startConnect('gcal'); break;
      case 'cal-disconnect': S.calendar = false; save(); { const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); } refresh(); break;
      case 'ag-regen': { const t = task(tidOf(a)); t.agent = Object.assign({}, t.agent, { v: ((t.agent || {}).v || 0) + 1, text: null, editing: false }); save(); refresh(); renderLayer(true); break; }
      case 'ag-edit': { const t = task(tidOf(a)); const st = t.agent || {}; const ta = a.closest('.ag').querySelector('.ag-edit'); t.agent = Object.assign({}, st, { editing: !st.editing, text: ta ? ta.value : st.text }); save(); refresh(); renderLayer(true); const n = $('.ag-edit'); if (n) n.focus(); break; }
      case 'ag-ctx': { const id = tidOf(a); UI.addCtx = UI.addCtx === id ? null : id; refresh(); renderLayer(true); const i = $('.ag-add input'); if (i) i.focus(); break; }
      case 'ag-discard': { const t = task(tidOf(a)); t.agent = Object.assign({}, t.agent, { text: null, editing: false, v: 0, slot: null, context: [] }); S.agent = S.agent || {}; t.agentOff = true; save(); refresh(); renderLayer(true); break; }
      case 'ag-send': { const t = task(tidOf(a)); const ta = a.closest('.ag').querySelector('.ag-edit'); const d = agentDraft(t); t.agent = Object.assign({}, t.agent, { sent: true, text: ta ? ta.value : (t.agent || {}).text || d.body, editing: false }); if (t.status === 'upnext') t.status = 'inprogress'; save(); refresh(); renderLayer(true); toast((d.kind === 'schedule' ? 'Times sent to ' : 'Reply sent to ') + esc(personName(t.requester)), { title: 'Sent by Keeper' }); break; }
      case 'src-tab': UI.srcTab[tidOf(a)] = +a.dataset.i; UI.expand[tidOf(a)] = false; refresh(); if (UI.sheet) renderLayer(true); break;
      case 'f-due': toggleToken({ type: 'due', value: a.dataset.v, label: a.dataset.v === 'today' ? 'Due today' : 'Overdue' }); break;
      case 'f-clear': S.filter = { text: '', tokens: [] }; save(); render(); break;
      case 'f-clear-text': S.filter.text = ''; save(); { const i = $('#fInput'); if (i) { i.value = ''; i.focus(); } a.hidden = true; } refresh(); break;
      case 'src': openSheet({ type: 'src', id: a.dataset.id, from: UI.sheet && UI.sheet.from }); break;
      case 'expand': { const id = tidOf(a); UI.expand[id] = !UI.expand[id]; if (UI.sheet) renderLayer(true); refresh(); break; }
      case 'connect-allow': finishConnect(); break;
      case 'connect-cancel': closeSheet(); break;
      case 'cx-pick': UI.sheet.pick = +a.dataset.i; renderLayer(true); break;
      case 'voice': if (UI.ask) stopListening(); UI.prevAsk = UI.sheet && UI.sheet.type === 'ask'; openSheet({ type: 'voice' }); break;
      case 'voice-play': { const v = voiceList()[+a.dataset.i]; speakWith(SAMPLE, v); break; }
      case 'voice-pick': { const v = voiceList()[+a.dataset.i]; S.voice = v.name; save(); renderLayer(true); speakWith('Hi Maya, I’ll sound like this from now on.', v); const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); break; }
      case 'draft-col': if (UI.ask && UI.ask.draft) { UI.ask.draft.col = a.dataset.v; paintMsgs(); } break;
      case 'f-proj': toggleToken({ type: 'project', value: a.dataset.v, label: D.PROJECTS[a.dataset.v].name }); break;
      case 'f-menu': if (UI.menu === a.dataset.menu) closeMenu(); else openMenu(a, a.dataset.menu); break;
      case 'menu-pick': toggleToken({ type: a.dataset.type, value: a.dataset.v, label: a.dataset.label }); openMenu($(`.chip[data-menu="${UI.menu || a.dataset.type}"]`) || a, a.dataset.type); break;
      case 'tok-x': {
        const toks = activeTokens(), tk = toks[+a.dataset.i];
        if (tk.auto) { // remove the words that produced it
          const words = S.filter.text;
          let next = words;
          if (tk.type === 'text') tk.value.split(' ').forEach(w => { next = next.replace(new RegExp('\\b' + w + '\\b', 'i'), ''); });
          else next = parseFilterRemove(words, tk);
          S.filter.text = next.replace(/\s+/g, ' ').trim();
          const i = $('#fInput'); if (i) i.value = S.filter.text;
        } else S.filter.tokens = S.filter.tokens.filter(t => !(t.type === tk.type && t.value === tk.value));
        save(); refresh(); break;
      }
      case 'ask': startAsk(false); break;
      case 'ask-voice': startAsk(true); break;
      case 'mic': if (!UI.ask) break; if (UI.ask.listening || UI.ask.handsFree) stopListening(); else { UI.ask.handsFree = true; UI.ask.voice = true; startListening(); } break;
      case 'ask-cancel': stopListening(); closeSheet(); break;
      case 'qchip': {
        const v = a.dataset.v;
        if (v === 'Done for now') { closeSheet(); break; }
        if (v === 'Just me') { askSubmit('Just me'); break; }
        if (UI.ask && UI.ask.awaiting === 'col-edit') { const c = ADDCOLS.find(c => statusLabel(c) === v); if (c) { UI.ask.draft.col = c; pushMsg({ from: 'me', text: v }); setTimeout(() => askReview(true), 300); break; } }
        askSubmit(v); break;
      }
      case 'draft-add': addDraft(); break;
      case 'draft-redo': UI.ask.draft = null; UI.ask.awaiting = null; pushMsg({ from: 'k', text: 'No problem. What’s the task?' }); setAskPlaceholder(); break;
      case 'simulate': arrive(true); break;
    }
  });
  function parseFilterRemove(text, tk) {
    const lists = { due: DUEWORDS, source: SRCWORDS };
    let re = null;
    if (lists[tk.type]) { const row = lists[tk.type].find(r => r[0] === tk.value); re = row && row[1]; }
    else if (tk.type === 'category') { const row = CATWORDS.find(r => r[0] === tk.value); re = row && row[1]; }
    else if (tk.type === 'project') re = new RegExp('\\b' + tk.value + '\\w*');
    else if (tk.type === 'person') re = new RegExp('\\b' + personName(tk.value).split(' ')[0].toLowerCase() + '(\'s|’s)?\\b');
    return re ? text.replace(new RegExp(re.source, 'gi'), ' ') : text;
  }
  document.addEventListener('input', e => {
    if (e.target.id === 'askInput' && UI.ask && (UI.ask.handsFree || UI.ask.listening)) stopListening();
    if (e.target.id === 'fInput') { S.filter.text = e.target.value; jumpToMatches(); save(); refresh(); const c = $('.fbox .clr'); if (c) c.hidden = !S.filter.text; }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'askDate' && e.target.value && UI.ask && UI.ask.awaiting === 'due-edit') { const d = fromISO(e.target.value); UI.ask.draft.due = daysOut(e.target.value); UI.ask.draft.dueSet = true; pushMsg({ from: 'me', text: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) }); setTimeout(() => askReview(true), 300); return; }
    if (e.target.id === 'askDate' && e.target.value && UI.ask) { const d = fromISO(e.target.value); askSubmit(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), false); return; }
    if (e.target.id === 'draftDue' && UI.ask && UI.ask.draft) { UI.ask.draft.due = e.target.value ? daysOut(e.target.value) : null; paintMsgs(); return; }
    if (e.target.classList.contains('dueInput')) { const t = task(tidOf(e.target)); t.due = e.target.value || null; UI.editField = null; save(); refresh(); renderLayer(true); }
  });
  document.addEventListener('submit', e => {
    if (e.target.classList.contains('ag-add')) { e.preventDefault(); const v = e.target.querySelector('input').value.trim(); if (!v) return; const t = task(e.target.dataset.tid); t.agent = Object.assign({}, t.agent, { context: ((t.agent || {}).context || []).concat({ label: v.replace(/^https?:\/\//, '') }), text: null }); UI.addCtx = null; save(); refresh(); renderLayer(true); return; }
    if (e.target.id === 'askForm') { e.preventDefault(); const i = $('#askInput'); const v = i.value; i.value = ''; askSubmit(v); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#about').hidden) { $('#about').hidden = true; return; } if (UI.menu) closeMenu(); else if (UI.sheet) closeSheet(); }
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (!typing && (e.key === 'n' || e.key === 'N') && S.onboarded && !UI.sheet) { e.preventDefault(); startAsk(false); }
    if (e.key === 'Enter' && document.activeElement.classList.contains('card')) openSheet({ type: 'task', id: document.activeElement.dataset.id });
  });

  /* ---------- drag & drop (mouse: immediate; touch: long-press) ---------- */
  document.addEventListener('pointerdown', e => {
    const card = e.target.closest('.card');
    if (!card || e.button > 0) return;
    const d = UI.drag = { card, id: card.dataset.id, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false, touch: e.pointerType !== 'mouse', pid: e.pointerId };
    if (d.touch) {
      d.timer = setTimeout(() => { if (UI.drag === d) { card.classList.add('lp'); beginDrag(d); if (navigator.vibrate) navigator.vibrate(12); } }, 320);
    }
  });
  document.addEventListener('pointermove', e => {
    const d = UI.drag; if (!d || e.pointerId !== d.pid) return;
    d.x = e.clientX; d.y = e.clientY;
    const dist = Math.hypot(d.x - d.x0, d.y - d.y0);
    if (d.swipe) { moveSwipe(d); return; }
    if (!d.active && canSwipe(d) && d.x - d.x0 > 10 && Math.abs(d.x - d.x0) > Math.abs(d.y - d.y0) * 1.4) { clearTimeout(d.timer); startSwipe(d); return; }
    if (!d.active) {
      if (d.touch) { if (dist > 10) { clearTimeout(d.timer); UI.drag = null; } return; }
      if (dist > 5) beginDrag(d); else return;
    }
    moveDrag(d);
  });
  document.addEventListener('touchmove', e => { if (UI.drag && UI.drag.active) e.preventDefault(); }, { passive: false });
  const endPointer = e => {
    const d = UI.drag; if (!d || (e.pointerId !== undefined && e.pointerId !== d.pid)) return;
    clearTimeout(d.timer);
    if (d.swipe) { endSwipe(d, e.type !== 'pointercancel'); UI.suppressClick = true; setTimeout(() => (UI.suppressClick = false), 60); UI.drag = null; return; }
    if (d.active) { finishDrag(d, e.type !== 'pointercancel'); UI.suppressClick = true; setTimeout(() => (UI.suppressClick = false), 50); }
    d.card.classList.remove('lp');
    UI.drag = null;
    if (UI.pending) { UI.pending = false; refresh(); }
  };
  document.addEventListener('pointerup', endPointer);
  document.addEventListener('pointercancel', endPointer);
  /* swipe right on a phone card to mark it done (Gmail-style reveal) */
  const canSwipe = d => mode() === 'mobile' && d.card.closest('#mList') && !d.card.classList.contains('done') && !d.card.closest('.dragging');
  function startSwipe(d) {
    d.swipe = true;
    const wrap = document.createElement('div'); wrap.className = 'swipe-wrap';
    const bg = document.createElement('div'); bg.className = 'swipe-bg'; bg.innerHTML = '<span class="sw-ic">' + ic('check') + '</span><span>Mark as done</span>';
    d.card.before(wrap); wrap.append(bg, d.card);
    d.wrap = wrap; d.w = d.card.getBoundingClientRect().width / (UI.scale || 1);
    d.card.classList.add('swiping');
  }
  function moveSwipe(d) {
    const dx = Math.max(0, (d.x - d.x0) / (UI.scale || 1));
    const eased = dx > d.w ? d.w + (dx - d.w) * 0.2 : dx;
    d.card.style.transform = 'translateX(' + eased + 'px)';
    d.wrap.style.setProperty('--p', Math.min(1, dx / (d.w * 0.4)).toFixed(3));
    d.wrap.classList.toggle('armed', dx > d.w * 0.4);
  }
  function endSwipe(d, commit) {
    const armed = commit && d.wrap.classList.contains('armed');
    d.card.classList.remove('swiping');
    d.card.style.transition = 'transform .22s ease';
    if (!armed) { d.card.style.transform = ''; setTimeout(() => refresh(), 230); return; }
    d.card.style.transform = 'translateX(' + (d.w + 40) + 'px)';
    const h = d.wrap.getBoundingClientRect().height / (UI.scale || 1);
    d.wrap.style.height = h + 'px';
    setTimeout(() => { d.wrap.classList.add('gone'); d.wrap.style.height = '0px'; }, 200);
    setTimeout(() => { const t = task(d.id); if (t) { t.status = 'done'; save(); } refresh(); }, 460);
  }
  function beginDrag(d) {
    d.active = true;
    const r = d.card.getBoundingClientRect(), z = UI.scale || 1;
    d.dx = d.x0 - r.left; d.dy = d.y0 - r.top;
    const g = d.card.cloneNode(true);
    g.classList.add('ghost'); g.classList.remove('lp', 'fresh');
    g.style.width = (r.width / z) + 'px'; g.style.left = r.left + 'px'; g.style.top = r.top + 'px';
    g.style.transformOrigin = '0 0'; g.style.transform = 'scale(' + z + ') rotate(2deg)';
    document.body.appendChild(g); d.ghost = g;
    const ph = document.createElement('div'); ph.className = 'ph'; ph.style.height = (r.height / z) + 'px'; d.ph = ph;
    d.card.after(ph);
    d.card.classList.add('dragging');
    $$('.empty').forEach(x => x.style.display = 'none');
    autoScroll(d);
  }
  /* drop targets: desktop columns, the mobile list (reorder) or a mobile status tab (move) */
  function moveDrag(d) {
    d.ghost.style.left = (d.x - d.dx) + 'px'; d.ghost.style.top = (d.y - d.dy) + 'px';
    const el = document.elementFromPoint(d.x, d.y);
    const tab = el && el.closest('.mtab');
    $$('.mtab.drop').forEach(t => t !== tab && t.classList.remove('drop'));
    d.tab = tab ? tab.dataset.tab : null;
    if (tab) { tab.classList.add('drop'); $$('.col.over').forEach(c => c.classList.remove('over')); return; }
    const col = el && el.closest('[data-col]');
    $$('.col.over').forEach(c => c !== col && c.classList.remove('over'));
    if (!col) return;
    if (col.classList.contains('col')) col.classList.add('over');
    const body = col.classList.contains('col-body') ? col : $('.col-body', col);
    const cards = $$('.card:not(.dragging)', body);
    let before = null;
    for (const c of cards) { const r = c.getBoundingClientRect(); if (d.y < r.top + r.height / 2) { before = c; break; } }
    if (before) { if (d.ph.nextSibling !== before) body.insertBefore(d.ph, before); }
    else if (d.ph.parentNode !== body || d.ph.nextSibling) body.appendChild(d.ph);
  }
  function autoScroll(d) {
    if (!d.active) return;
    const board = $('#board');
    if (board) {
      const r = board.getBoundingClientRect(), edge = 40;
      if (d.x < r.left + edge) board.scrollLeft -= 10; else if (d.x > r.right - edge) board.scrollLeft += 10;
    }
    const tabs = $('#mTabs');
    if (tabs) { const r = tabs.getBoundingClientRect(); if (d.y > r.top - 10 && d.y < r.bottom + 10) { if (d.x < r.left + 36) tabs.scrollLeft -= 6; else if (d.x > r.right - 36) tabs.scrollLeft += 6; } }
    const sc = $('#mBody') || $('#dMain');
    if (sc) { const r = sc.getBoundingClientRect(); if (d.y < r.top + 40) sc.scrollTop -= 8; else if (d.y > r.bottom - (sc.id === 'mBody' ? 100 : 40)) sc.scrollTop += 8; }
    moveDrag(d);
    requestAnimationFrame(() => autoScroll(d));
  }
  function finishDrag(d, commit) {
    d.active = false;
    const t = task(d.id), from = t.status;
    if (commit && d.tab) {
      S.tasks.splice(S.tasks.indexOf(t), 1);
      t.status = d.tab; S.tasks.push(t); save();
    } else if (commit) {
      const body = d.ph.parentNode, col = body && body.closest('[data-col]');
      if (col) {
        const to = col.dataset.col;
        if (from === 'upnext' && to === 'upnext' && !(S.manual && S.manual.upnext)) {
          /* first manual reorder: lock in the due-date order, then apply the move */
          const sorted = S.tasks.filter(x => x.status === 'upnext').sort(byDue);
          const slots = []; S.tasks.forEach((x, i) => { if (x.status === 'upnext') slots.push(i); });
          slots.forEach((slot, k) => { S.tasks[slot] = sorted[k]; });
          S.manual = Object.assign({}, S.manual, { upnext: true });
        }
        const next = d.ph.nextElementSibling && d.ph.nextElementSibling.classList.contains('card') ? d.ph.nextElementSibling.dataset.id : null;
        S.tasks.splice(S.tasks.indexOf(t), 1);
        t.status = to;
        if (next) S.tasks.splice(S.tasks.findIndex(x => x.id === next), 0, t);
        else { let last = -1; S.tasks.forEach((x, i) => { if (x.status === to) last = i; }); S.tasks.splice(last + 1, 0, t); }
        save();
      }
    }
    d.ghost.remove(); d.ph.remove();
    d.card.classList.remove('dragging');
    $$('.col.over').forEach(c => c.classList.remove('over'));
    $$('.mtab.drop').forEach(c => c.classList.remove('drop'));
    refresh();
  }

  /* ---------- boot ---------- */
  window.addEventListener('resize', () => { const was = device.classList.contains('is-mobile') ? 'mobile' : 'desktop'; if (was !== mode()) render(); else fitDevice(); });
  if (!S.onboarded && S.step === 3 && !S.onbPick) S.onbPick = {};
  if (!S.onboarded && S.step === 2) S.step = 1;
  render();
  /* app-style launch screen on phones */
  if (mode() === 'mobile') {
    const sp = document.createElement('div');
    sp.className = 'splash'; sp.setAttribute('aria-hidden', 'true');
    sp.innerHTML = '<div class="splash-in"><span class="logo-mark"></span><span class="wordmark">keeper</span></div>';
    device.appendChild(sp);
    setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 500); }, 1600);
  }
  if (S.onboarded) { scheduleLive(); if (!S.detectFired) setTimeout(detectEvent, 45000); }
  setInterval(() => { if (S.onboarded && !(UI.drag && UI.drag.active)) { const sm = $('#summary'); if (sm) sm.innerHTML = summary(); } }, 60000);
})();
