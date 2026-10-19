/* Keeper prototype: plain JS, no build step. */
(function () {
  'use strict';
  const D = window.KEEPER_DATA;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const app = $('#app'), device = $('#device');
  const STORE = 'keeper-demo-v1';
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
    if (status === 'done') return { label: shortDate(d), cls: '' };
    if (n < 0) return { label: n === -1 ? 'Yesterday' : 'Overdue', cls: 'overdue' };
    if (n === 0) return { label: 'Today', cls: 'today' };
    if (n === 1) return { label: 'Tomorrow', cls: 'soon' };
    if (n < 7) return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), cls: 'soon' };
    return { label: shortDate(d), cls: '' };
  }
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
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  const ic = (n, cls) => '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';
  /* colour is reserved for actions: sources, people and projects are neutral */
  const srcLabel = s => (D.SOURCES[s] || D.SOURCES.keeper).label;
  const srcIc = s => '<span class="src-ic" style="--c:' + (D.SOURCES[s] || D.SOURCES.keeper).color + '" title="' + esc(srcLabel(s)) + '">' + ic(s) + '</span>';
  const sdot = st => '<span class="sdot"></span>';
  const spill = st => '<span class="spill s-' + st + '">' + esc(statusLabel(st)) + '</span>';
  const srcTag = s => '<span class="lab">' + srcIc(s) + esc(srcLabel(s)) + '</span>';
  const personName = k => (D.PEOPLE[k] ? D.PEOPLE[k].name : k) || '';
  const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const av = k => { const n = personName(k); return n ? '<span class="av" title="' + esc(n) + '">' + esc(initials(n)) + '</span>' : ''; };
  const projName = p => (D.PROJECTS[p] ? D.PROJECTS[p].name : '');
  const projTag = p => esc(projName(p));

  /* ---------- state ---------- */
  let uid = 1;
  const nid = () => 't' + Date.now().toString(36) + (uid++);
  function mkTask(t, extra) {
    return Object.assign({
      id: nid(), title: t.title, source: t.source, category: t.category, project: t.project || null,
      requester: t.requester || null, collaborators: t.collaborators || [],
      due: t.due == null ? null : iso(addDays(t.due)), status: t.status || 'backlog',
      snippet: t.snippet || '', captured: Date.now() - (t.ago || 0) * 60000, fresh: false
    }, extra || {});
  }
  const narrow = () => window.innerWidth < 720;
  function fresh() {
    return { onboarded: false, step: 0, channels: ['gmail', 'slack', 'sms', 'zoom'], screen: 'board', mode: 'mobile', mstatus: 'upnext',
      tasks: D.SEED.map(t => mkTask(t)), incomingIdx: 0, live: true, unseen: 0, filter: { text: '', tokens: [] } };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.tasks) { s.tasks.forEach(t => t.fresh = false); s.filter = s.filter || { text: '', tokens: [] }; s.mstatus = 'upnext'; s.live = true; s.unseen = s.unseen || 0; if (s.screen === 'feed') s.screen = 'board'; return s; } } catch (e) {}
    return null;
  }
  let S = load() || fresh();
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  const UI = { sheet: null, menu: null, ask: null, drag: null, suppressClick: false, search: false, scale: 1 };
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
    ['slack', /\bslack\b/, 'Slack'], ['sms', /\b(texts?|sms|keeper line)\b/, 'Texts'],
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
      && ok('person', v => tk.requester === v || tk.collaborators.includes(v))
      && ok('due', v => {
        if (v === 'nodate') return !tk.due;
        if (!tk.due) return false;
        const n = daysOut(tk.due), toSun = 7 - today0().getDay();
        return v === 'overdue' ? n < 0 && tk.status !== 'done' : v === 'today' ? n === 0 : v === 'tomorrow' ? n === 1
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
    const s = text.toLowerCase().replace(/[’']/g, '');
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
  const COLWORDS = [['upnext', 'up next|next up'], ['backlog', 'backlog|later|someday'], ['inprogress', 'in progress|doing|working on'], ['blocked', 'blocked|waiting']];
  function parseCol(text) {
    for (const [id, words] of COLWORDS) {
      const m = text.match(new RegExp('\\s*(?:,|\\band\\b|\\bthen\\b)?\\s*\\b(?:(?:add|put|move|file|drop)(?: (?:it|this))? )?(?:to|in|into|on|under)\\s+(?:the\\s+|my\\s+)?(?:' + words + ')(?:\\s+(?:column|list|lane))?\\b', 'i'));
      if (m) return { id, start: m.index, end: m.index + m[0].length };
    }
    return null;
  }
  function parseTask(text) {
    let w = ' ' + text.trim() + ' ';
    const cr = parseCol(w); let col = 'upnext';
    if (cr) { col = cr.id; w = w.slice(0, cr.start) + ' ' + w.slice(cr.end); }
    w = w.replace(/^\s*(please\s+)?(can you\s+)?(remind me to|i need to|i have to|need to|i should|add (a )?task (to )?|todo:?|to-do:?)\s+/i, ' ');
    const dr = parseDue(w);
    let due = null;
    if (dr) { due = dr.days; w = w.slice(0, dr.start) + ' ' + w.slice(dr.end); }
    let collaborators = [];
    w = w.replace(/\bwith\s+([a-z]+(?:\s*(?:,|and|&)\s*[a-z]+)*)/i, (m, names) => {
      const keys = names.split(/\s*(?:,|and|&)\s*/i).map(n => FIRST[n.toLowerCase()]).filter(Boolean);
      if (!keys.length) return m;
      collaborators = keys; return ' ';
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
    let title = w.replace(/\s+(and|then)\s*$/i, ' ').replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return { title: title || text.trim(), due, dueSet: due != null, requester, requesterSet: !!requester, collaborators, project, category: guessCategory(text), col };
  }

  /* ---------- rendering ---------- */
  function setMode() {
    const m = mode();
    device.classList.toggle('is-mobile', m === 'mobile');
    device.classList.toggle('is-desktop', m === 'desktop');
    $$('.seg-view button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    fitDevice();
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
    setMode();
    UI.menu = null;
    if (!S.onboarded) app.innerHTML = renderOnboarding();
    else app.innerHTML = mode() === 'mobile' ? renderMobile() : renderDesktop();
    app.insertAdjacentHTML('beforeend', '<div class="layer" id="layer"></div>');
    renderLayer(true);
    if (S.onboarded && S.step === 3) { /* noop */ }
  }

  function renderOnboarding() {
    const steps = n => '<div class="steps">' + [0, 1, 2].map(i => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</div>';
    if (S.step === 0) return `<div class="onb"><div class="onb-inner">
      <div class="onb-hero"><span class="logo-mark" aria-hidden="true"></span>
      <h1>Every commitment, <em>kept.</em></h1>
      <p class="lead">Keeper listens across your inboxes, chats, texts and calls, catches every promise you make, and keeps it on one simple board.</p></div>
      <div class="onb-me"><span class="m-me" aria-hidden="true">M</span><span><b>Maya</b> · Independent brand strategist · 5 clients</span></div>
      <div class="onb-foot"><button class="btn-primary" data-action="onb-next">Get started</button><span class="small">Takes about a minute</span></div>
    </div></div>`;
    if (S.step === 1) {
      const keys = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'];
      const rows = keys.map(k => {
        const s = D.SOURCES[k], on = S.channels.includes(k);
        const extra = k === 'sms' ? '<span class="num">New number: (917) 555-0142</span>' : '';
        return `<button type="button" class="chan ${on ? 'on' : ''}" data-action="chan" data-k="${k}" aria-pressed="${on}">
          <span class="src-ic" style="--c:${s.color}">${ic(k)}</span>
          <span class="chan-txt"><b>${esc(k === 'sms' ? 'Keeper business line (texts)' : s.label)}</b><span>${esc(s.desc)}</span>${extra}</span>
          <span class="tog" aria-hidden="true"></span></button>`;
      }).join('');
      return `<div class="onb"><div class="onb-inner">${steps(1)}
        <h2>Where do your tasks come from?</h2>
        <p class="lead">Pick the channels Keeper should listen to. You can change these anytime.</p>
        <div class="chan-list">${rows}</div>
        <div class="onb-foot"><button class="btn-primary" data-action="onb-next" ${S.channels.length ? '' : 'disabled'}>Connect ${S.channels.length} channel${S.channels.length === 1 ? '' : 's'}</button>
        <span class="small">Prototype: connections are simulated</span></div>
      </div></div>`;
    }
    const counts = S.channels.map(k => S.tasks.filter(t => t.source === k).length);
    const rows = S.channels.map((k, i) => `<div class="scan-row" style="--k:${i}">${srcIc(k)}<b>${esc(D.SOURCES[k].label)}</b><span class="bar"><i style="--k:${i}"></i></span><span class="cnt">${counts[i] || 1} found</span></div>`).join('');
    return `<div class="onb"><div class="onb-inner">${steps(2)}
      <h2>Catching your tasks…</h2>
      <p class="lead">Keeper is reading the last week of messages and meetings for anything you owe someone.</p>
      <div class="scan">${rows}</div></div></div>`;
  }

  function summary() {
    const open = S.tasks.filter(t => t.status !== 'done');
    const today = open.filter(t => t.due && daysOut(t.due) === 0).length;
    const over = open.filter(t => t.due && daysOut(t.due) < 0).length;
    const blocked = open.filter(t => t.status === 'blocked').length;
    const sep = '<span class="sep">·</span>';
    return `<b>${today}</b> due today${over ? sep + `<span class="bad"><b>${over}</b> overdue</span>` : ''}${blocked ? sep + `<b>${blocked}</b> blocked` : ''}${sep}<b>${open.length}</b> open`;
  }
  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `<div class="greet"><div class="date">${esc(date)}</div><h1>${g}, <em>Maya</em></h1><div class="sum" id="summary">${summary()}</div></div>`;
  }
  const searchBtn = () => { const n = S.filter.tokens.length + (S.filter.text.trim() ? 1 : 0);
    return `<button type="button" class="icon-btn ${UI.search || n ? 'on' : ''}" id="searchBtn" data-action="search" aria-label="Filters" aria-expanded="${UI.search}">${ic('filter')}${n && !UI.search ? `<span class="dot-badge">${n}</span>` : ''}</button>`; };
  function filterChips() {
    const cnt = type => S.filter.tokens.filter(t => t.type === type).length;
    const chip = (menu, label) => `<button type="button" class="chip ${cnt(menu) ? 'on' : ''}" data-action="f-menu" data-menu="${menu}">${label}${cnt(menu) ? ' · ' + cnt(menu) : ''} <span class="caret">▾</span></button>`;
    return chip('project', 'Project') + chip('person', 'People') + chip('source', 'Channel');
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

  function cardHTML(t) {
    const di = dueInfo(t.due, t.status);
    const who = t.requester && t.requester !== 'maya' ? personName(t.requester) : 'You';
    const where = [projName(t.project), who].filter(Boolean).join(' · ');
    return `<article class="card ${t.status === 'done' ? 'done' : ''} ${t.status === 'blocked' ? 'blocked' : ''} ${t.fresh ? 'fresh' : ''}" data-id="${t.id}" tabindex="0" aria-label="${esc(t.title)}">
      <div class="card-title">${esc(t.title)}</div>
      <div class="card-meta"><span class="where">${srcIc(t.source)}<span>${esc(where)}</span></span>
        <span class="due ${di.cls}">${t.status === 'done' ? '✓ ' : ''}${esc(di.label)}</span></div>
    </article>`;
  }
  function boardHTML() {
    const toks = activeTokens();
    return D.COLUMNS.map(c => {
      const list = S.tasks.filter(t => t.status === c.id && matches(t, toks));
      return `<section class="col" data-col="${c.id}">
        <div class="col-h"><span class="spill s-${c.id}">${esc(c.name)}</span><span class="n">${list.length}</span></div>
        <div class="col-body">${list.length ? list.map(cardHTML).join('') : `<div class="empty">${toks.length ? 'No matching tasks' : 'Drop tasks here'}</div>`}</div>
      </section>`;
    }).join('');
  }
  /* mobile: one status at a time, full-width cards */
  function mTabsHTML() {
    const toks = activeTokens();
    return D.COLUMNS.map(c => {
      const n = S.tasks.filter(t => t.status === c.id && matches(t, toks)).length;
      return `<button type="button" class="mtab s-${c.id} ${S.mstatus === c.id ? 'on' : ''}" data-action="mtab" data-tab="${c.id}">${sdot(c.id)}${esc(c.name)}<span class="n">${n}</span></button>`;
    }).join('');
  }
  function mListHTML() {
    const toks = activeTokens();
    const list = S.tasks.filter(t => t.status === S.mstatus && matches(t, toks));
    return list.length ? list.map(cardHTML).join('') : `<div class="empty">${toks.length ? 'No matching tasks here' : 'Nothing in ' + esc(statusLabel(S.mstatus))}</div>`;
  }
  const incoming = () => S.tasks.filter(t => t.source !== 'keeper').sort((a, b) => b.captured - a.captured);
  function statusLabel(s) { const c = D.COLUMNS.find(c => c.id === s); return c ? c.name : s; }
  function feedRow(t, opts) {
    const di = dueInfo(t.due, t.status);
    const req = t.requester && t.requester !== 'maya' ? 'From ' + esc(personName(t.requester)) : 'From you';
    const proj = projName(t.project);
    return `<button type="button" class="frow ${t.fresh ? 'new' : ''}" data-action="open" data-id="${t.id}">
      ${srcIc(t.source)}
      <span class="frow-txt"><span class="frow-title">${t.fresh ? '<span class="newtag">NEW</span> ' : ''}${esc(t.title)}</span>
        <span class="frow-meta">${req}${proj ? ' · ' + esc(proj) : ''} · <span class="due ${di.cls}">${esc(di.label)}</span></span>
        ${opts && opts.snip && t.snippet ? `<span class="snip">“${esc(t.snippet)}”</span>` : ''}
      </span>
      <span class="when">${ago(t.captured)}${opts && opts.status ? spill(t.status) : ''}</span>
    </button>`;
  }
  function feedPageHTML() {
    const list = incoming();
    const now = Date.now(), t0 = today0().getTime();
    const groups = [['Live now', t => now - t.captured < 20 * 60000], ['Earlier today', t => t.captured >= t0], ['Yesterday', t => t.captured >= t0 - DAY], ['Earlier this week', () => true]];
    const used = new Set();
    const secs = groups.map(([name, fn]) => {
      const items = list.filter(t => !used.has(t.id) && fn(t));
      items.forEach(t => used.add(t.id));
      if (!items.length) return '';
      return `<div class="feed-sec"><h3>${name === 'Live now' ? '<span class="live-dot"></span>' : ''}${name}</h3><div class="feed-list">${items.map(t => feedRow(t, { snip: true, status: true })).join('')}</div></div>`;
    }).join('');
    const left = D.INCOMING.length - S.incomingIdx;
    const on = S.channels.filter(k => D.SOURCES[k]);
    const chanRow = `<button type="button" class="chan-link" data-action="go" data-screen="sources">
        <span class="chan-ics">${on.map(srcIc).join('')}</span>
        <span class="o-txt"><b>${on.length} channel${on.length === 1 ? '' : 's'} on</b><span>${on.length ? esc(on.map(k => k === 'sms' ? 'Keeper Line' : D.SOURCES[k].label).join(', ')) : 'Turn on a channel to catch tasks'}</span></span>
        <span class="manage">Manage ${ic('chev')}</span></button>`;
    return chanRow + `<div class="feed-tools">
        <span class="live-pill"><span class="live-dot"></span>Live</span>
        <button type="button" class="btn-ghost" data-action="simulate" ${left > 0 ? '' : 'disabled'}>${ic('bolt')} ${left > 0 ? 'Simulate a new task' : 'All caught up'}</button>
      </div>${secs}`;
  }
  function sourcesHTML() {
    const keys = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'];
    return `<div class="src-page">${keys.map(k => {
      const s = D.SOURCES[k], on = S.channels.includes(k);
      const n = S.tasks.filter(t => t.source === k).length;
      return `<button type="button" class="chan ${on ? 'on' : ''}" data-action="chan" data-k="${k}" aria-pressed="${on}">
        ${srcIc(k)}
        <span class="chan-txt"><b>${esc(k === 'sms' ? 'Keeper business line' : s.label)}</b><span>${on ? n + ' tasks caught · listening' : esc(s.desc)}</span>${k === 'sms' && on ? '<span class="num">(917) 555-0142</span>' : ''}</span>
        <span class="tog" aria-hidden="true"></span></button>`;
    }).join('')}<p class="note">Prototype: connections are simulated. New incoming tasks only come from channels that are on.</p></div>`;
  }
  const badge = id => `<span class="dot-badge" id="${id}" ${S.unseen ? '' : 'hidden'}>${S.unseen}</span>`;

  function renderMobile() {
    let body;
    if (S.screen === 'feed') body = `<div class="page-h"><h1>Task Feed</h1></div><div id="feedPage">${feedPageHTML()}</div>`;
    else if (S.screen === 'sources') body = `<div class="page-h"><button class="back" data-action="go" data-screen="feed" aria-label="Back to Task Feed">${ic('back')}</button><h1>Channels</h1></div>${sourcesHTML()}`;
    else body = `${greeting()}${filterBar()}
      <div class="m-tabs" id="mTabs">${mTabsHTML()}</div>
      <div class="m-list col-body" id="mList" data-col="${S.mstatus}">${mListHTML()}</div>
      <p class="m-hint">Tap to edit · hold and drag onto a tab to move</p>`;
    return `<div class="m-home">
      <div class="m-top"><div class="shell-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div>
        ${S.screen === 'board' ? searchBtn() : ''}<span class="m-me" aria-label="Maya">M</span></div>
      <div class="m-body" id="mBody">${body}</div>
      <nav class="m-nav">
        <button class="${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('board')}Board</button>
        <button class="fab" data-action="ask-voice" aria-label="Add a task by voice">${ic('plus')}</button>
        <button class="${S.screen === 'feed' || S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="feed" ${S.screen === 'sources' ? 'data-sub="1"' : ''}><span class="navi">${ic('feed')}${badge('navBadge')}</span>Task Feed</button>
      </nav>
    </div>`;
  }
  function renderDesktop() {
    let main;
    if (S.screen === 'feed') main = `<div class="screen"><div class="page-h"><h1>Task Feed</h1></div><div id="feedPage">${feedPageHTML()}</div></div>`;
    else if (S.screen === 'sources') main = `<div class="screen"><div class="page-h"><h1>Channels</h1></div>${sourcesHTML()}</div>`;
    else main = `<div class="d-head">${greeting()}<div class="d-acts">${searchBtn()}
        <button type="button" class="btn-inc" data-action="inc">${ic('feed')}Task Feed${S.unseen ? ` <b id="incCount">${S.unseen} new</b>` : '<b id="incCount"></b>'}</button>
        <button class="btn-ask" data-action="ask">${ic('plus')} Add task <kbd>N</kbd></button></div></div>
      ${filterBar()}
      <div class="board" id="board">${boardHTML()}</div>`;
    return `<div class="d-layout">
      <aside class="d-side">
        <div class="d-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div>
        <button class="d-nav ${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('board')}Board</button>
        <button class="d-nav ${S.screen === 'feed' ? 'on' : ''}" data-action="go" data-screen="feed">${ic('feed')}Task Feed<span class="cnt" id="navBadge" ${S.unseen ? '' : 'hidden'}>${S.unseen}</span></button>
        <button class="d-nav ${S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="sources">${ic('plug')}Channels</button>
        <div class="d-me"><span class="m-me" aria-hidden="true">M</span><span><b>Maya</b><small>Brand strategist</small></span></div>
      </aside>
      <section class="d-main" id="dMain">${main}</section>
    </div>`;
  }
  /* refresh data-driven regions without touching inputs */
  function refresh() {
    if (!S.onboarded) return;
    if (UI.drag && UI.drag.active) { UI.pending = true; return; }
    const b = $('#board'); if (b) { const sl = b.scrollLeft; b.innerHTML = boardHTML(); b.scrollLeft = sl; }
    const mt = $('#mTabs'); if (mt) { const sl = mt.scrollLeft; mt.innerHTML = mTabsHTML(); mt.scrollLeft = sl; }
    const ml = $('#mList'); if (ml) { ml.dataset.col = S.mstatus; ml.innerHTML = mListHTML(); }
    const fpg = $('#feedPage'); if (fpg) fpg.innerHTML = feedPageHTML();
    const sm = $('#summary'); if (sm) sm.innerHTML = summary();
    const tk = $('#tokens'); if (tk) tk.innerHTML = tokensHTML();
    const sb = $('#searchBtn'); if (sb) sb.classList.toggle('on', UI.search || filterOn());
    const fc = $('#fChips'); if (fc) fc.innerHTML = filterChips();
    const sb2 = $('#searchBtn'); if (sb2 && !UI.search) sb2.outerHTML = searchBtn();
    const nb = $('#navBadge'); if (nb) { nb.textContent = S.unseen; nb.hidden = !S.unseen; }
    const ic2 = $('#incCount'); if (ic2) ic2.textContent = S.unseen ? S.unseen + ' new' : '';
    if (UI.sheet && (UI.sheet.type === 'task' || UI.sheet.type === 'inc')) renderLayer(true);
  }

  /* ---------- original source (deeplink) ---------- */
  const ORIGIN = {
    gmail: { noun: 'email', cta: 'Open in Gmail', url: 'https://mail.google.com/mail/u/0/#inbox', note: 'In the real product this button opens this exact email (Gmail links each message by its ID). Gmail’s phone app can’t open a single message from a link, so on mobile it opens Gmail on the web.' },
    outlook: { noun: 'email', cta: 'Open in Outlook', url: 'https://outlook.office.com/mail/', note: 'In the real product this button uses the link Microsoft provides for each message, so it opens this exact email in Outlook.' },
    slack: { noun: 'Slack message', cta: 'Open in Slack', url: 'https://app.slack.com/client', note: 'In the real product this button uses the message’s Slack permalink: it opens the Slack app at this message on phones and desktop.' },
    sms: { noun: 'text thread', note: 'Clients text your Keeper Line, a business number Keeper owns, so the thread lives here in Keeper rather than in Messages. Replies go out from the same number, keeping your personal number private.' },
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
  function origRow(t) {
    if (t.source === 'keeper' || !t.snippet) return '';
    const o = origin(t), meta = ORIGIN[t.source] || {};
    return `<button type="button" class="orig" data-action="src" data-id="${t.id}">${srcIc(t.source)}
      <span class="o-txt"><b>View original ${esc(meta.noun || 'message')}</b><span>${esc(o.mine ? 'You' : o.fromName)} · ${esc(srcLabel(t.source))} · ${ago(t.captured)} ago</span></span>${ic('chev')}</button>`;
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
      return `<div class="sv"><div class="sv-bar">${srcIc('sms')}${esc(otherName)} · Keeper Line (917) 555-0142<small>${esc(date)}</small></div><div class="sv-pad"><div class="tx">
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

  /* ---------- sheets ---------- */
  function renderLayer(instant) {
    const layer = $('#layer'); if (!layer) return;
    if (!UI.sheet) { layer.classList.remove('open'); layer.innerHTML = ''; return; }
    if (UI.sheet.type === 'task') {
      const t = task(UI.sheet.id); if (!t) { UI.sheet = null; return renderLayer(); }
      const req = t.requester && t.requester !== 'maya' ? `<span class="person">${av(t.requester)}${esc(personName(t.requester))} <small>${esc((D.PEOPLE[t.requester] || {}).title || '')}</small></span>` : '<span class="person">You</span>';
      const collabs = t.collaborators.length ? t.collaborators.map(c => `<span class="person">${av(c)}${esc(personName(c))}</span>`).join('') : '<span style="color:var(--faint)">None</span>';
      const quick = [['Today', 0], ['Tomorrow', 1], ['Friday', daysToDow(5, true)], ['Next Mon', daysToDow(1, false)]];
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Task details">
        <div class="grab"></div>
        <div class="sh-h">${srcTag(t.source)}<button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="sh-body">
          <h2 class="sh-title">${esc(t.title)}</h2>
          ${t.snippet ? `<div class="quote"><span class="from">Caught ${ago(t.captured)} ago from ${esc(srcLabel(t.source))}</span>“${esc(t.snippet)}”</div>` : ''}
          ${origRow(t)}
          <dl class="fields"><dt>Requested by</dt><dd>${req}</dd><dt>Collaborators</dt><dd>${collabs}</dd><dt>Project</dt><dd>${projTag(t.project) || '—'}</dd><dt>Type</dt><dd>${esc(t.category)}</dd></dl>
          <div><div class="fl">Status</div><div class="statuses">${D.COLUMNS.map(c => `<button type="button" class="s-${c.id} ${t.status === c.id ? 'on' : ''}" data-action="set-status" data-v="${c.id}">${sdot(c.id)}${esc(c.name)}</button>`).join('')}</div></div>
          <div><div class="fl">Due date</div><div class="duebox">
            <input type="date" id="dueInput" value="${t.due || ''}" aria-label="Due date">
            ${quick.map(([l, n]) => `<button type="button" class="chip ${t.due === iso(addDays(n)) ? 'on' : ''}" data-action="set-due" data-n="${n}">${l}</button>`).join('')}
            <button type="button" class="chip ${!t.due ? 'on' : ''}" data-action="set-due" data-n="none">No date</button>
          </div></div>
        </div>
        <div class="sh-foot">${t.status === 'done' ? `<button class="btn-ghost" data-action="set-status" data-v="upnext">Reopen</button>` : `<button class="btn-primary" data-action="set-status" data-v="done">${ic('check')} Mark done</button>`}</div>
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
    } else if (UI.sheet.type === 'inc') {
      const list = incoming().slice(0, 12);
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Task Feed">
        <div class="grab"></div>
        <div class="sh-h"><span class="live-dot"></span><b>Task Feed</b><span class="lab">Live</span><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="inc-list"><div class="feed-list">${list.map(t => feedRow(t, { status: true })).join('')}</div></div>
        <div class="sh-foot"><button class="btn-ghost" data-action="simulate">${ic('bolt')} Simulate</button><button class="btn-ghost" data-action="go" data-screen="feed">Open full feed</button></div>
      </div>`;
    } else if (UI.sheet.type === 'ask') {
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet ask" role="dialog" aria-modal="true" aria-label="Add a task">
        <div class="grab"></div>
        <div class="sh-h"><span class="logo-mark" aria-hidden="true"></span><b>New task</b><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="ask-msgs" id="askMsgs">${askMsgsHTML()}</div>
        <div class="vstage ${UI.ask.msgs.length ? 'compact' : ''}" id="vstage">${vstageHTML()}</div>
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
  function openSheet(s) { UI.sheet = s; const l = $('#layer'); if (l) l.classList.remove('open'); renderLayer(); }
  function closeSheet() {
    stopListening();
    const l = $('#layer'); if (!l) return;
    l.classList.remove('open');
    setTimeout(() => { if (!l.classList.contains('open')) { UI.sheet = null; l.innerHTML = ''; } }, 320);
    UI.sheet = null;
  }

  /* ---------- assistant: voice first, type as fallback ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const ADDCOLS = ['upnext', 'backlog', 'inprogress', 'blocked'];
  function startAsk(voice) {
    UI.ask = { msgs: [], draft: null, awaiting: null, listening: false, voice: !!voice || mode() === 'mobile', listenBack: !!voice, interim: '' };
    openSheet({ type: 'ask' });
    setTimeout(() => { if (voice && SR) startListening(); else { const i = $('#askInput'); if (i && mode() === 'desktop') i.focus(); } }, 380);
  }
  const askPlaceholder = () => !UI.ask ? '' : UI.ask.awaiting === 'requester' ? 'Or type a name' : /due/.test(UI.ask.awaiting || '') ? 'Or type any date' : UI.ask.awaiting === 'review' ? 'Or type a change' : 'Or type it here';
  function vstageHTML() {
    const A = UI.ask;
    const cap = A.listening ? 'Listening… tap to stop' : SR ? (A.msgs.length ? 'Tap to answer' : 'Tap to talk') : 'Voice needs Chrome, Edge or Safari. Type below.';
    return `<button type="button" class="orb ${A.listening ? 'rec' : ''}" data-action="mic" aria-label="${A.listening ? 'Stop listening' : 'Start talking'}" ${SR ? '' : 'disabled'}>${ic('mic')}</button>
      ${A.listening && A.interim ? `<div class="vlive" id="vlive">${esc(A.interim)}</div>` : `<div class="vcap">${cap}</div>`}`;
  }
  function paintVoice() { const v = $('#vstage'); if (v) { v.innerHTML = vstageHTML(); v.classList.toggle('compact', UI.ask.msgs.length > 0); } }
  function askMsgsHTML() {
    const A = UI.ask; const last = A.msgs.length - 1;
    if (!A.msgs.length) return `<div class="ask-empty">What do you need to keep track of?<small>Say it like you’d tell an assistant: “Send Jen the logo by the 30th with Leo.”</small></div>`;
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
      <dt>Collaborators</dt><dd>${d.collaborators.length ? d.collaborators.map(c => av(c) + esc(personName(c))).join(' ') : 'None'}</dd>
      <dt>Project</dt><dd>${projTag(d.project) || 'None'}</dd>${live ? '' : `<dt>Column</dt><dd>${esc(statusLabel(d.col))}</dd>`}</dl>
      ${live ? `<div><div class="fl">Add to</div><div class="statuses">${ADDCOLS.map(c => `<button type="button" class="s-${c} ${d.col === c ? 'on' : ''}" data-action="draft-col" data-v="${c}">${sdot(c)}${esc(statusLabel(c))}</button>`).join('')}</div></div>
      <div class="draft-acts"><button type="button" class="btn-primary" data-action="draft-add">Add to ${esc(statusLabel(d.col))}</button><button type="button" class="btn-ghost" data-action="draft-redo">Start over</button></div>` : ''}</div>`;
  }
  function paintMsgs() { const el = $('#askMsgs'); if (el) { el.innerHTML = askMsgsHTML(); el.scrollTop = el.scrollHeight; } paintVoice(); }
  function pushMsg(m) { UI.ask.msgs.push(m); paintMsgs(); }
  function setAskPlaceholder() { const i = $('#askInput'); if (i) i.placeholder = askPlaceholder(); }
  /* in voice mode Keeper reads its question aloud, then listens for the answer */
  function say(text, listenAfter) {
    const A = UI.ask;
    if (!A || !A.voice || !window.speechSynthesis) { if (listenAfter && A && A.listenBack && SR) setTimeout(() => { if (UI.ask === A && !A.listening) startListening(); }, 300); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.rate = 1.05;
      u.onend = () => { if (listenAfter && A.listenBack && UI.ask === A && UI.sheet && UI.sheet.type === 'ask' && !A.listening) startListening(); };
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const fn = k => personName(k).split(' ')[0];
  function spokenDue(days) { if (days == null) return 'no due date'; const l = dueInfo(iso(addDays(days)), 'upnext').label; return 'due ' + (l === 'Today' || l === 'Tomorrow' ? l.toLowerCase() : Math.abs(days) < 7 ? l.replace(/^(\w{3})$/, m => ({ Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' })[m] || m) : addDays(days).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })); }
  function summaryLine(d) {
    const bits = [];
    if (d.requesterSet) bits.push(d.requester === 'maya' ? 'for you' : 'for ' + (D.PEOPLE[d.requester] ? fn(d.requester) : d.requester));
    if (d.dueSet) bits.push(spokenDue(d.due));
    if (d.collaborators.length) bits.push('with ' + d.collaborators.map(fn).join(' and '));
    bits.push('in ' + statusLabel(d.col));
    return '“' + d.title + '”, ' + bits.join(', ') + '.';
  }
  /* step 1: read back what was understood and ask for changes */
  function askReview(updated) {
    const A = UI.ask, d = A.draft;
    A.awaiting = 'review';
    const line = (updated ? 'Updated: ' : 'New task: ') + summaryLine(d);
    const q = updated ? 'Anything else to change?' : 'Anything you want to change?';
    pushMsg({ from: 'k', text: line + ' ' + q, draft: d, chips: ['Looks good', 'Change the date', 'Change the column'] });
    say(line + ' ' + q, true);
    setAskPlaceholder();
  }
  /* step 2: ask only for what is still missing, then add */
  function askMissing() {
    const A = UI.ask, d = A.draft;
    if (!d.requesterSet) {
      A.awaiting = 'requester';
      const clients = Object.keys(D.PEOPLE).filter(k => D.PEOPLE[k].role === 'client').map(fn);
      pushMsg({ from: 'k', text: 'Who is this for?', chips: clients.concat('Just me') }); say('Who is this for?', true);
    } else if (!d.dueSet) {
      A.awaiting = 'due';
      pushMsg({ from: 'k', text: 'When is it due?', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'], datePick: true }); say('When is it due?', true);
    } else addDraft();
    setAskPlaceholder();
  }
  const NOCHANGE = /^(no|nope|nah|nothing|looks good|look(s)? great|all good|good|fine|it'?s fine|that'?s (it|right|good|fine|all)|perfect|correct|all set|we'?re good|sounds good|great|ok(ay)?|add it|save it|done)\b/i;
  /* apply spoken or typed edits: dates, people, collaborators, column, title */
  function applyChanges(text, d) {
    let changed = false;
    const t = ' ' + text + ' ';
    const ren = text.match(/\b(?:call it|rename (?:it )?(?:to)?|change the (?:title|name) to|title (?:it|is)?)\s+[“"]?(.+?)[”"]?\s*$/i);
    if (ren) { d.title = ren[1].charAt(0).toUpperCase() + ren[1].slice(1); return true; }
    const cr = parseCol(t) || (() => { const m = COLWORDS.find(([, w]) => new RegExp('\\b(' + w + ')\\b', 'i').test(text)); return m ? { id: m[0] } : null; })();
    if (cr) { d.col = cr.id; changed = true; }
    if (/\bno (due )?date\b|\bno deadline\b|remove the (due )?date/i.test(text)) { d.due = null; d.dueSet = true; changed = true; }
    else { const r = parseDue(text); if (r) { d.due = r.days; d.dueSet = true; changed = true; } }
    if (/\b(no|remove( the)?) collaborators?\b/i.test(text)) { d.collaborators = []; changed = true; }
    const w = text.match(/\b(?:with|add)\s+([a-z]+(?:\s*(?:,|and|&)\s*[a-z]+)*)/i);
    if (w) { const ks = w[1].split(/\s*(?:,|and|&)\s*/i).map(n => FIRST[n.toLowerCase()]).filter(Boolean).filter(k => D.PEOPLE[k].role !== 'client'); if (ks.length) { d.collaborators = Array.from(new Set(d.collaborators.concat(ks))); changed = true; } }
    const rm = text.match(/\bremove\s+([a-z]+)/i);
    if (rm && FIRST[rm[1].toLowerCase()]) { d.collaborators = d.collaborators.filter(k => k !== FIRST[rm[1].toLowerCase()]); changed = true; }
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
    const A = UI.ask; A.listenBack = !!viaVoice;
    pushMsg({ from: 'me', text });
    const d = A.draft;
    if (A.awaiting === 'review') {
      if (/^change the date$/i.test(text)) { A.awaiting = 'due-edit'; pushMsg({ from: 'k', text: 'What’s the new due date?', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'], datePick: true }); say('What’s the new due date?', true); return; }
      if (/^change the column$/i.test(text)) { A.awaiting = 'col-edit'; pushMsg({ from: 'k', text: 'Which column?', chips: ADDCOLS.map(statusLabel) }); say('Which column? Up next, backlog, in progress, or blocked?', true); return; }
      if (applyChanges(text, d)) return setTimeout(() => askReview(true), 300);
      if (NOCHANGE.test(text) || /^yes,? (it'?s|that'?s|looks)/i.test(text)) return setTimeout(askMissing, 300);
      if (/^(yes|yeah|yep|sure)\b/i.test(text)) { pushMsg({ from: 'k', text: 'What should I change? Say a new date, a person, a column, or “call it…” for a new title.' }); say('What should I change?', true); return; }
      pushMsg({ from: 'k', text: 'Sorry, I didn’t catch a change. Try “due next Tuesday”, “for Marcus”, “put it in backlog” or “call it…”.', chips: ['Looks good'] }); say('Sorry, what should I change?', true); return;
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
    paintMsgs();
    pushMsg({ from: 'k', text: 'Added to ' + statusLabel(d.col) + '. Tap the mic to add another, or close.', chips: ['Done for now'] });
    say('Done. I added it to ' + statusLabel(d.col) + '.', false);
    setAskPlaceholder();
    setTimeout(() => { t.fresh = false; }, 4000);
  }
  /* voice */
  let rec = null;
  function startListening() {
    if (!SR) { paintVoice(); return; }
    if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
    try {
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
      let finalText = '';
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; }
        UI.ask.interim = (finalText + ' ' + interim).trim();
        const v = $('#vlive'); if (v) v.textContent = UI.ask.interim; else paintVoice();
      };
      rec.onerror = e => { setListening(false); if (e.error === 'not-allowed' || e.error === 'service-not-allowed') pushMsg({ from: 'k', text: 'I need microphone permission to listen. Allow it in your browser, or type below.' }); };
      rec.onend = () => { const v = (finalText || UI.ask.interim || '').trim(); UI.ask.interim = ''; setListening(false); if (v) askSubmit(v, true); };
      rec.start(); setListening(true);
    } catch (e) { setListening(false); }
  }
  function stopListening() { if (rec) { try { rec.stop(); } catch (e) {} } if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} }
  function setListening(on) { if (!UI.ask) return; UI.ask.listening = on; paintVoice(); }

  /* ---------- live arrivals ---------- */
  function arrive(manual) {
    if (!S.onboarded) return;
    const total = D.INCOMING.length;
    while (S.incomingIdx < total) {
      const tpl = D.INCOMING[S.incomingIdx++];
      if (!manual && S.channels.length && !S.channels.includes(tpl.source)) continue;
      const t = mkTask(Object.assign({}, tpl, { status: 'backlog', ago: 0 }));
      t.fresh = true;
      S.tasks.push(t); S.unseen = (S.unseen || 0) + 1; save(); refresh();
      toast(srcIc(t.source) + 'Caught from ' + esc(D.SOURCES[t.source].label) + ': ' + esc(t.title));
      setTimeout(() => { t.fresh = false; refresh(); }, 6000);
      return;
    }
    save(); refresh();
  }
  let liveTimer = null;
  function scheduleLive() {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { if (S.onboarded && S.live && !document.hidden && !(UI.drag && UI.drag.active)) arrive(false); scheduleLive(); }, 11000);
  }

  /* ---------- toasts ---------- */
  function toast(html) {
    const w = $('#toasts'); const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = html; w.appendChild(el);
    while (w.children.length > 3) w.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3400);
  }

  /* ---------- menus ---------- */
  function openMenu(btn, kind) {
    closeMenu();
    let items = [];
    if (kind === 'project') items = Object.keys(D.PROJECTS).map(k => ({ type: 'project', value: k, label: D.PROJECTS[k].name }));
    if (kind === 'person') items = Object.keys(D.PEOPLE).filter(k => k !== 'maya').map(k => ({ type: 'person', value: k, label: D.PEOPLE[k].name, sub: D.PEOPLE[k].title }));
    if (kind === 'source') items = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'].map(k => ({ type: 'source', value: k, label: D.SOURCES[k].label }));
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
    if (!$('#mList')) return;
    const toks = activeTokens(); if (!toks.length) return;
    const has = s => S.tasks.some(t => t.status === s && matches(t, toks));
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
      case 'mode': S.mode = a.dataset.mode; save(); render(); break;
      case 'scope': $$('.seg-scope button').forEach(b => b.setAttribute('aria-pressed', String(b === a))); toast(a.dataset.scope === 'vision' ? 'Vision view is coming soon' : 'Showing the MVP'); break;
      case 'about': $('#about').hidden = false; break;
      case 'about-close': $('#about').hidden = true; break;
      case 'reset': try { localStorage.removeItem(STORE); } catch (err) {} S = fresh(); UI.sheet = null; render(); toast('Demo reset'); break;
      case 'onb-next':
        if (S.step < 2) { S.step++; save(); render(); }
        if (S.step === 2) setTimeout(() => {
          if (S.step !== 2) return;
          S.onboarded = true; S.step = 3; S.screen = 'board'; save(); render();
          const n = S.tasks.filter(t => t.status !== 'done').length;
          toast(srcIc('keeper') + `Keeper caught ${n} open tasks across ${S.channels.length} channels`);
          scheduleLive();
        }, 2600);
        break;
      case 'chan': {
        const k = a.dataset.k, i = S.channels.indexOf(k);
        if (i >= 0) S.channels.splice(i, 1); else S.channels.push(k);
        save();
        if (!S.onboarded) render();
        else { a.classList.toggle('on', i < 0); a.setAttribute('aria-pressed', String(i < 0)); toast(srcIc(k) + (i < 0 ? 'Listening to ' : 'Paused ') + esc(D.SOURCES[k].label)); const m = $('.src-page'); if (m) m.outerHTML = sourcesHTML(); }
        break;
      }
      case 'go': S.screen = a.dataset.screen; if (S.screen === 'feed') S.unseen = 0; UI.sheet = null; save(); closeMenu(); render(); if (S.screen === 'feed') setTimeout(() => { S.tasks.forEach(t => t.fresh = false); }, 5000); break;
      case 'inc': S.unseen = 0; save(); refresh(); openSheet({ type: 'inc' }); break;
      case 'mtab': S.mstatus = a.dataset.tab; save(); refresh(); { const mb = $('#mBody'), mt = $('#mTabs'); if (mb && mt && mb.scrollTop > mt.offsetTop) mb.scrollTop = mt.offsetTop; } break;
      case 'search': UI.search = !UI.search; render(); if (UI.search) { const i = $('#fInput'); if (i) i.focus(); } break;
      case 'f-close': UI.search = false; save(); render(); break;
      case 'open': openSheet({ type: 'task', id: a.dataset.id }); break;
      case 'close': closeSheet(); break;
      case 'set-status': { const t = task(UI.sheet.id); t.status = a.dataset.v; save(); refresh(); renderLayer(true); toast('Moved to ' + esc(statusLabel(t.status))); break; }
      case 'set-due': { const t = task(UI.sheet.id); t.due = a.dataset.n === 'none' ? null : iso(addDays(+a.dataset.n)); save(); refresh(); renderLayer(true); toast(t.due ? 'Due ' + esc(dueInfo(t.due, t.status).label.toLowerCase()) : 'Due date cleared'); break; }
      case 'f-clear': S.filter = { text: '', tokens: [] }; save(); render(); break;
      case 'f-clear-text': S.filter.text = ''; save(); { const i = $('#fInput'); if (i) { i.value = ''; i.focus(); } a.hidden = true; } refresh(); break;
      case 'src': openSheet({ type: 'src', id: a.dataset.id }); break;
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
      case 'mic': if (UI.ask && UI.ask.listening) { if (rec) try { rec.stop(); } catch (err) {} } else startListening(); break;
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
    if (e.target.id === 'fInput') { S.filter.text = e.target.value; jumpToMatches(); save(); refresh(); const c = $('.fbox .clr'); if (c) c.hidden = !S.filter.text; }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'askDate' && e.target.value && UI.ask && UI.ask.awaiting === 'due-edit') { const d = fromISO(e.target.value); UI.ask.draft.due = daysOut(e.target.value); UI.ask.draft.dueSet = true; pushMsg({ from: 'me', text: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) }); setTimeout(() => askReview(true), 300); return; }
    if (e.target.id === 'askDate' && e.target.value && UI.ask) { const d = fromISO(e.target.value); askSubmit(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), false); return; }
    if (e.target.id === 'draftDue' && UI.ask && UI.ask.draft) { UI.ask.draft.due = e.target.value ? daysOut(e.target.value) : null; paintMsgs(); return; }
    if (e.target.id === 'dueInput' && UI.sheet) { const t = task(UI.sheet.id); t.due = e.target.value || null; save(); refresh(); renderLayer(true); toast(t.due ? 'Due date updated' : 'Due date cleared'); }
  });
  document.addEventListener('submit', e => {
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
    if (d.active) { finishDrag(d, e.type !== 'pointercancel'); UI.suppressClick = true; setTimeout(() => (UI.suppressClick = false), 50); }
    d.card.classList.remove('lp');
    UI.drag = null;
    if (UI.pending) { UI.pending = false; refresh(); }
  };
  document.addEventListener('pointerup', endPointer);
  document.addEventListener('pointercancel', endPointer);
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
      if (from !== d.tab) toast('Moved to ' + esc(statusLabel(d.tab)));
    } else if (commit) {
      const body = d.ph.parentNode, col = body && body.closest('[data-col]');
      if (col) {
        const to = col.dataset.col;
        const next = d.ph.nextElementSibling && d.ph.nextElementSibling.classList.contains('card') ? d.ph.nextElementSibling.dataset.id : null;
        S.tasks.splice(S.tasks.indexOf(t), 1);
        t.status = to;
        if (next) S.tasks.splice(S.tasks.findIndex(x => x.id === next), 0, t);
        else { let last = -1; S.tasks.forEach((x, i) => { if (x.status === to) last = i; }); S.tasks.splice(last + 1, 0, t); }
        save();
        if (from !== to) toast('Moved to ' + esc(statusLabel(to)));
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
  if (S.onboarded && S.step === 2) { S.onboarded = true; S.step = 3; }
  if (!S.onboarded && S.step === 2) S.step = 1;
  render();
  /* app-style launch screen on phones */
  if (mode() === 'mobile') {
    const sp = document.createElement('div');
    sp.className = 'splash'; sp.setAttribute('aria-hidden', 'true');
    sp.innerHTML = '<span class="logo-mark"></span><span class="wordmark">keeper</span><span class="spin"></span>';
    device.appendChild(sp);
    setTimeout(() => { sp.classList.add('out'); setTimeout(() => sp.remove(), 500); }, 1600);
  }
  if (S.onboarded) scheduleLive();
  setInterval(() => { if (S.onboarded && !(UI.drag && UI.drag.active)) { const sm = $('#summary'); if (sm) sm.innerHTML = summary(); } }, 60000);
})();
