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
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'
  };
  const ic = (n, cls) => '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>';
  const srcIc = s => { const src = D.SOURCES[s] || D.SOURCES.keeper; return '<span class="src-ic" style="--c:' + src.color + '">' + ic(s) + '</span>'; };
  const srcTag = s => { const src = D.SOURCES[s] || D.SOURCES.keeper; return '<span class="src" style="--c:' + src.color + '">' + srcIc(s) + esc(src.label) + '</span>'; };
  const AVC = ['#6E4BD8', '#D04F7C', '#2F8A63', '#C27C0E', '#2F6FD0', '#8A4FBF', '#0E8A7E', '#B4415E'];
  const personName = k => (D.PEOPLE[k] ? D.PEOPLE[k].name : k) || '';
  const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  function av(k) {
    const n = personName(k); if (!n) return '';
    let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return '<span class="av" style="--c:' + AVC[h % AVC.length] + '" title="' + esc(n) + '">' + esc(initials(n)) + '</span>';
  }
  const projTag = p => { const pr = D.PROJECTS[p]; return pr ? '<span class="proj" style="--c:' + pr.color + '"><i></i>' + esc(pr.name) + '</span>' : ''; };
  const COLC = { backlog: '#A39DB0', upnext: '#8B6CF0', inprogress: '#2F6FD0', blocked: '#D04F7C', done: '#2F9461' };

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
    return { onboarded: false, step: 0, channels: ['gmail', 'slack', 'sms', 'zoom'], screen: 'board', mode: 'mobile',
      tasks: D.SEED.map(t => mkTask(t)), incomingIdx: 0, live: true, filter: { text: '', tokens: [] } };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.tasks) { s.tasks.forEach(t => t.fresh = false); s.filter = s.filter || { text: '', tokens: [] }; return s; } } catch (e) {}
    return null;
  }
  let S = load() || fresh();
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  const UI = { sheet: null, menu: null, ask: null, drag: null, suppressClick: false };
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
  const STOP = new Set('a an the all my me show find tasks task for from with due and or in on to of what is are that any by about please items things stuff need needs who'.split(' '));
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
  function parseDue(text) {
    const s = text.toLowerCase();
    const pre = '(?:\\b(?:by|on|due|before|until|for)\\s+)?';
    const tries = [
      [new RegExp(pre + '\\b(today|tonight|end of (the )?day|eod)\\b'), () => 0],
      [new RegExp(pre + '\\btomorrow\\b'), () => 1],
      [new RegExp(pre + '\\b(end of (the )?week|this week|eow)\\b'), () => daysToDow(5, true)],
      [new RegExp(pre + '\\bnext week\\b'), () => daysToDow(1, false)],
      [new RegExp(pre + '\\bin (\\d{1,2}) days?\\b'), m => +m[m.length - 1] || +m[1]],
      [new RegExp(pre + '\\b(?:(next|this)\\s+)?(monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thur|thu|friday|fri|saturday|sat|sunday|sun)\\b'), m => {
        const w = m[2]; const idx = DOW.findIndex(d => d.startsWith(w.slice(0, 3)));
        return daysToDow(idx, false) + (m[1] === 'next' && daysToDow(idx, false) < 4 ? 7 : 0);
      }],
      [new RegExp(pre + '\\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b'), m => {
        const d = new Date(today0().getFullYear(), MON.indexOf(m[1].slice(0, 3)), +m[2]);
        if (d < today0()) d.setFullYear(d.getFullYear() + 1);
        return Math.round((d - today0()) / DAY);
      }],
      [new RegExp(pre + '\\b(\\d{1,2})/(\\d{1,2})\\b'), m => {
        const d = new Date(today0().getFullYear(), +m[1] - 1, +m[2]);
        if (d < today0()) d.setFullYear(d.getFullYear() + 1);
        return Math.round((d - today0()) / DAY);
      }]
    ];
    for (const [re, fn] of tries) {
      const m = s.match(re);
      if (m) {
        // re-run to get captures without the optional prefix group confusion
        const days = fn(m);
        return { days, start: m.index, end: m.index + m[0].length };
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
  function parseTask(text) {
    let w = ' ' + text.trim() + ' ';
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
    let title = w.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return { title: title || text.trim(), due, dueSet: due != null, requester, requesterSet: !!requester, collaborators, project, category: guessCategory(text) };
  }

  /* ---------- rendering ---------- */
  function setMode() {
    const m = mode();
    device.classList.toggle('is-mobile', m === 'mobile');
    device.classList.toggle('is-desktop', m === 'desktop');
    $$('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
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
    return `<span class="s-warn">${today} due today</span>${over ? `<span class="s-bad">${over} overdue</span>` : ''}${blocked ? `<span class="s-blk">${blocked} blocked</span>` : ''}<span>${open.length} open</span>`;
  }
  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    return `<div class="greet"><div class="date">${esc(date)}</div><h1>${g}, <em>Maya</em></h1><div class="sum" id="summary">${summary()}</div></div>`;
  }
  function filterBar() {
    const quick = ['Communication', 'Deliverables', 'Scheduling', 'Purchasing', 'Coordination'];
    const on = v => S.filter.tokens.some(t => t.type === 'category' && t.value === v);
    return `<div class="filter" id="filter">
      <label class="fbox">${ic('spark')}<input id="fInput" type="text" autocomplete="off" placeholder="Filter: try “Slack tasks for Brightside” or “anything from Marcus”" value="${esc(S.filter.text)}" aria-label="Filter the board in plain language">
      <button type="button" class="clr" data-action="f-clear" aria-label="Clear filter" ${S.filter.text || S.filter.tokens.length ? '' : 'hidden'}>${ic('x')}</button></label>
      <div class="chips">
        ${quick.map(c => `<button type="button" class="chip ${on(c) ? 'on' : ''}" data-action="f-cat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}
        <button type="button" class="chip" data-action="f-menu" data-menu="project">Project <span class="caret">▾</span></button>
        <button type="button" class="chip" data-action="f-menu" data-menu="person">Collaborators <span class="caret">▾</span></button>
        <button type="button" class="chip" data-action="f-menu" data-menu="source">Channel <span class="caret">▾</span></button>
      </div>
      <div class="tokens" id="tokens">${tokensHTML()}</div>
    </div>`;
  }
  function tokensHTML() {
    const toks = activeTokens();
    if (!toks.length) return '';
    const n = S.tasks.filter(t => matches(t, toks)).length;
    return `<span class="lbl">${n} match${n === 1 ? '' : 'es'}:</span>` + toks.map((t, i) =>
      `<button type="button" class="tok ${t.auto ? 'auto' : ''}" data-action="tok-x" data-i="${i}" title="Remove">${esc(t.label)}<span class="x">×</span></button>`).join('')
      + '<button type="button" class="clear-all" data-action="f-clear">Clear</button>';
  }

  function cardHTML(t) {
    const di = dueInfo(t.due, t.status);
    const ppl = [t.requester && t.requester !== 'maya' ? t.requester : null].concat(t.collaborators).filter(Boolean);
    return `<article class="card ${t.status === 'done' ? 'done' : ''} ${t.fresh ? 'fresh' : ''}" data-id="${t.id}" tabindex="0" aria-label="${esc(t.title)}">
      <div class="card-top">${srcTag(t.source)}<span class="due ${di.cls}">${t.status === 'done' ? '✓ ' : ''}${esc(di.label)}</span></div>
      <div class="card-title">${esc(t.title)}</div>
      <div class="card-meta">${projTag(t.project)}<span class="avs">${ppl.map(av).join('')}</span></div>
    </article>`;
  }
  function boardHTML() {
    const toks = activeTokens();
    return D.COLUMNS.map(c => {
      const list = S.tasks.filter(t => t.status === c.id && matches(t, toks));
      return `<section class="col" data-col="${c.id}">
        <div class="col-h" style="--c:${COLC[c.id]}"><i></i>${esc(c.name)}<span class="n">${list.length}</span></div>
        <div class="col-body">${list.length ? list.map(cardHTML).join('') : `<div class="empty">${toks.length ? 'No matching tasks' : 'Drop tasks here'}</div>`}</div>
      </section>`;
    }).join('');
  }
  const incoming = () => S.tasks.filter(t => t.source !== 'keeper').sort((a, b) => b.captured - a.captured);
  function statusLabel(s) { const c = D.COLUMNS.find(c => c.id === s); return c ? c.name : s; }
  function feedRow(t, opts) {
    const di = dueInfo(t.due, t.status);
    const req = t.requester && t.requester !== 'maya' ? 'from ' + esc(personName(t.requester)) : 'from you';
    const proj = D.PROJECTS[t.project] ? esc(D.PROJECTS[t.project].name) : '';
    return `<button type="button" class="frow ${t.fresh ? 'new' : ''}" data-action="open" data-id="${t.id}">
      ${srcIc(t.source)}
      <span class="frow-txt"><span class="frow-title">${t.fresh ? '<span class="newtag">NEW</span> ' : ''}${esc(t.title)}</span>
        <span class="frow-meta"><span>${req}</span>${proj ? `<span class="sep">•</span><span>${proj}</span>` : ''}<span class="due ${di.cls}">${esc(di.label)}</span>${t.collaborators.length ? `<span class="avs">${t.collaborators.map(av).join('')}</span>` : ''}</span>
        ${opts && opts.snip ? `<span class="snip">“${esc(t.snippet)}”</span>` : ''}
      </span>
      <span class="when">${ago(t.captured)}${opts && opts.status ? `<br><span class="st">${esc(statusLabel(t.status))}</span>` : ''}</span>
    </button>`;
  }
  function feedPreviewHTML(n) {
    const list = incoming().slice(0, n);
    const newCount = S.tasks.filter(t => t.fresh).length;
    return `<div class="fprev-h"><span class="live-dot ${S.live ? '' : 'off'}"></span><b>Incoming</b><span class="cnt">${S.live ? 'Live' : 'Paused'}${newCount ? ' · ' + newCount + ' new' : ''}</span>
      <button type="button" class="see" data-action="go" data-screen="feed">See all ${ic('chev')}</button></div>
      <div class="fprev-list">${list.map(t => feedRow(t)).join('')}</div>`;
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
      return `<div class="feed-sec"><h3>${name === 'Live now' ? '<span class="live-dot ' + (S.live ? '' : 'off') + '"></span>' : ''}${name}</h3><div class="feed-list">${items.map(t => feedRow(t, { snip: true, status: true })).join('')}</div></div>`;
    }).join('');
    const left = D.INCOMING.length - S.incomingIdx;
    return `<div class="feed-tools">
        <button type="button" class="live-tog" data-action="live"><span class="live-dot ${S.live ? '' : 'off'}"></span>${S.live ? 'Live · pause' : 'Paused · resume'}</button>
        <button type="button" class="btn-ghost" data-action="simulate" ${left > 0 ? '' : 'disabled'}>${ic('bolt')} ${left > 0 ? 'Simulate incoming task' : 'All caught up'}</button>
      </div>${secs}`;
  }
  function sourcesHTML() {
    const keys = ['gmail', 'outlook', 'slack', 'sms', 'zoom', 'meet'];
    return `<div class="src-page">${keys.map(k => {
      const s = D.SOURCES[k], on = S.channels.includes(k);
      const n = S.tasks.filter(t => t.source === k).length;
      return `<button type="button" class="chan ${on ? 'on' : ''}" data-action="chan" data-k="${k}" aria-pressed="${on}">
        <span class="src-ic" style="--c:${s.color}">${ic(k)}</span>
        <span class="chan-txt"><b>${esc(k === 'sms' ? 'Keeper business line' : s.label)}</b><span>${on ? n + ' tasks caught · listening' : esc(s.desc)}</span>${k === 'sms' && on ? '<span class="num">(917) 555-0142</span>' : ''}</span>
        <span class="tog" aria-hidden="true"></span></button>`;
    }).join('')}<p class="note">Prototype: connections are simulated. New incoming tasks only come from channels that are on.</p></div>`;
  }

  function renderMobile() {
    const newCount = S.tasks.filter(t => t.fresh).length;
    let body;
    if (S.screen === 'feed') body = `<div class="page-h"><button class="back" data-action="go" data-screen="board" aria-label="Back">${ic('back')}</button><h1>Feed</h1></div><div id="feedPage">${feedPageHTML()}</div>`;
    else if (S.screen === 'sources') body = `<div class="page-h"><h1>Channels</h1></div>${sourcesHTML()}`;
    else body = `${greeting()}${filterBar()}<div class="fprev" id="feedPreview">${feedPreviewHTML(2)}</div>
      <div class="board-h"><h2>Board</h2><span class="hint">Hold a card to drag · swipe for more</span></div>
      <div class="board" id="board">${boardHTML()}</div>`;
    return `<div class="m-home">
      <div class="m-top"><div class="shell-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div><button class="m-me" data-action="go" data-screen="sources" aria-label="Channels">M</button></div>
      <div class="m-body" id="mBody">${body}</div>
      <nav class="m-nav">
        <button class="${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('board')}Board</button>
        <button class="${S.screen === 'feed' ? 'on' : ''}" data-action="go" data-screen="feed"><span class="navi">${ic('feed')}<span class="badge" id="navBadge" ${newCount ? '' : 'hidden'}>${newCount}</span></span>Feed</button>
        <button class="fab" data-action="ask" aria-label="Ask Keeper: add a task by typing or voice">${ic('plus')}</button>
        <button class="${S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="sources">${ic('plug')}Channels</button>
        <button data-action="ask-voice">${ic('mic')}Voice</button>
      </nav>
    </div>`;
  }
  function renderDesktop() {
    const newCount = S.tasks.filter(t => t.fresh).length;
    const projOn = p => S.filter.tokens.some(t => t.type === 'project' && t.value === p);
    const projects = Object.keys(D.PROJECTS).map(p => `<button type="button" class="d-proj ${projOn(p) ? 'on' : ''}" data-action="f-proj" data-v="${p}" style="--c:${D.PROJECTS[p].color}"><i></i>${esc(D.PROJECTS[p].name)}<span class="n">${S.tasks.filter(t => t.project === p && t.status !== 'done').length}</span></button>`).join('');
    let main;
    if (S.screen === 'feed') main = `<div class="d-content"><div class="page-h"><h1>Feed</h1></div><div id="feedPage">${feedPageHTML()}</div></div>`;
    else if (S.screen === 'sources') main = `<div class="d-content"><div class="page-h"><h1>Channels</h1></div>${sourcesHTML()}</div>`;
    else main = `<div class="d-head">${greeting()}<button class="btn-ask" data-action="ask">${ic('spark')} Ask Keeper <kbd>N</kbd></button></div>
      ${filterBar()}<div class="fprev" id="feedPreview">${feedPreviewHTML(3)}</div><div class="board-h"><h2>Board</h2><span class="hint">Drag cards between columns · click to edit</span></div>
      <div class="board" id="board">${boardHTML()}</div>`;
    return `<div class="d-layout">
      <aside class="d-side">
        <div class="d-brand"><span class="logo-mark" aria-hidden="true"></span><span class="wordmark">keeper</span></div>
        <button class="d-nav ${S.screen === 'board' ? 'on' : ''}" data-action="go" data-screen="board">${ic('board')}Board</button>
        <button class="d-nav ${S.screen === 'feed' ? 'on' : ''}" data-action="go" data-screen="feed">${ic('feed')}Feed<span class="badge" id="navBadge" ${newCount ? '' : 'hidden'}>${newCount}</span></button>
        <button class="d-nav ${S.screen === 'sources' ? 'on' : ''}" data-action="go" data-screen="sources">${ic('plug')}Channels</button>
        <div class="d-sh">Projects</div>${projects}
        <div class="d-me"><span class="m-me" aria-hidden="true">M</span><span><b>Maya</b><span>Brand strategist</span></span></div>
      </aside>
      <section class="d-main">${main}</section>
    </div>`;
  }
  /* refresh data-driven regions without touching inputs */
  function refresh() {
    if (!S.onboarded) return;
    if (UI.drag && UI.drag.active) { UI.pending = true; return; }
    const b = $('#board'); if (b) { const sl = b.scrollLeft, st = b.scrollTop; b.innerHTML = boardHTML(); b.scrollLeft = sl; b.scrollTop = st; }
    const fp = $('#feedPreview'); if (fp) fp.innerHTML = feedPreviewHTML(mode() === 'mobile' ? 2 : 3);
    const fpg = $('#feedPage'); if (fpg) fpg.innerHTML = feedPageHTML();
    const sm = $('#summary'); if (sm) sm.innerHTML = summary();
    const tk = $('#tokens'); if (tk) tk.innerHTML = tokensHTML();
    const clr = $('.fbox .clr'); if (clr) clr.hidden = !(S.filter.text || S.filter.tokens.length);
    $$('.chips .chip[data-action="f-cat"]').forEach(c => c.classList.toggle('on', S.filter.tokens.some(t => t.type === 'category' && t.value === c.dataset.v)));
    $$('.d-proj').forEach(c => c.classList.toggle('on', S.filter.tokens.some(t => t.type === 'project' && t.value === c.dataset.v)));
    const nb = $('#navBadge'); if (nb) { const n = S.tasks.filter(t => t.fresh).length; nb.textContent = n; nb.hidden = !n; }
    if (UI.sheet && UI.sheet.type === 'task') renderLayer();
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
          ${t.snippet ? `<div class="quote"><span class="from">Caught ${ago(t.captured)} ago from ${esc((D.SOURCES[t.source] || {}).label)}</span>“${esc(t.snippet)}”</div>` : ''}
          <dl class="fields"><dt>Requested by</dt><dd>${req}</dd><dt>Collaborators</dt><dd>${collabs}</dd><dt>Project</dt><dd>${projTag(t.project) || '—'}</dd><dt>Type</dt><dd>${esc(t.category)}</dd></dl>
          <div><div class="fl">Status</div><div class="statuses">${D.COLUMNS.map(c => `<button type="button" class="${t.status === c.id ? 'on' : ''}" data-action="set-status" data-v="${c.id}" style="--c:${COLC[c.id]}"><i></i>${esc(c.name)}</button>`).join('')}</div></div>
          <div><div class="fl">Due date</div><div class="duebox">
            <input type="date" id="dueInput" value="${t.due || ''}" aria-label="Due date">
            ${quick.map(([l, n]) => `<button type="button" class="chip ${t.due === iso(addDays(n)) ? 'on' : ''}" data-action="set-due" data-n="${n}">${l}</button>`).join('')}
            <button type="button" class="chip ${!t.due ? 'on' : ''}" data-action="set-due" data-n="none">No date</button>
          </div></div>
        </div>
        <div class="sh-foot">${t.status === 'done' ? `<button class="btn-ghost" data-action="set-status" data-v="upnext">Reopen</button>` : `<button class="btn-primary" data-action="set-status" data-v="done">${ic('check')} Mark done</button>`}</div>
      </div>`;
    } else if (UI.sheet.type === 'ask') {
      layer.innerHTML = `<div class="scrim" data-action="close"></div><div class="sheet ask" role="dialog" aria-modal="true" aria-label="Ask Keeper">
        <div class="grab"></div>
        <div class="sh-h"><span class="logo-mark" aria-hidden="true"></span><b>Ask Keeper</b><button class="x" data-action="close" aria-label="Close">${ic('x')}</button></div>
        <div class="ask-msgs" id="askMsgs">${askMsgsHTML()}</div>
        <div class="listen" id="listen" ${UI.ask.listening ? '' : 'hidden'}><span class="wave"><i></i><i></i><i></i><i></i></span>Listening… speak your task</div>
        <form class="ask-in" id="askForm">
          <input id="askInput" type="text" autocomplete="off" placeholder="${UI.ask.awaiting === 'requester' ? 'Type a name…' : UI.ask.awaiting === 'due' ? 'e.g. Friday, Oct 30, next week' : 'Type a task, e.g. “Send Jen the logo by Friday”'}" aria-label="Message Keeper">
          <button type="button" class="mic ${UI.ask.listening ? 'rec' : ''}" data-action="mic" aria-label="Voice input">${ic('mic')}</button>
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

  /* ---------- assistant ---------- */
  const SUGGEST = ['Send Jen the revised logo by Friday with Leo', 'Order business cards for Okafor', 'Schedule a call with Raj next Tuesday'];
  function startAsk(voice) {
    UI.ask = { msgs: [{ from: 'k', text: 'What do you need to keep track of? Type it or tap the mic, and I’ll fill in the details.', chips: SUGGEST, chipType: 'suggest' }], draft: null, awaiting: null, listening: false };
    openSheet({ type: 'ask' });
    setTimeout(() => { if (voice) startListening(); else { const i = $('#askInput'); if (i && mode() === 'desktop') i.focus(); } }, 350);
  }
  function askMsgsHTML() {
    const A = UI.ask; const last = A.msgs.length - 1;
    return A.msgs.map((m, i) => {
      if (m.from === 'me') return `<div class="msg me"><div class="bub">${esc(m.text)}</div></div>`;
      let h = `<div class="msg"><span class="logo-mark k" aria-hidden="true"></span><div class="bub">${esc(m.text)}</div></div>`;
      if (m.draft) h += draftHTML(m.draft, i === last);
      if (m.chips && i === last) h += `<div class="qchips">${m.chips.map(c => `<button type="button" class="chip" data-action="qchip" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
      return h;
    }).join('');
  }
  function draftHTML(d, live) {
    const due = d.due == null ? 'No date' : dueInfo(iso(addDays(d.due)), 'upnext').label + ' · ' + shortDate(addDays(d.due));
    return `<div class="draft"><h3 class="sh-title">${esc(d.title)}</h3>
      <dl class="fields"><dt>Requested by</dt><dd>${d.requester && d.requester !== 'maya' ? av(d.requester) + esc(personName(d.requester)) : 'You'}</dd>
      <dt>Due</dt><dd>${esc(due)}</dd>
      <dt>Collaborators</dt><dd>${d.collaborators.length ? d.collaborators.map(c => av(c) + esc(personName(c))).join(' ') : 'None'}</dd>
      <dt>Project</dt><dd>${projTag(d.project) || 'None'}</dd><dt>Type</dt><dd>${esc(d.category)}</dd></dl>
      ${live ? `<div class="draft-acts"><button type="button" class="btn-primary" data-action="draft-add">Add to Up Next</button><button type="button" class="btn-ghost" data-action="draft-redo">Start over</button></div>` : ''}</div>`;
  }
  function pushMsg(m) { UI.ask.msgs.push(m); const el = $('#askMsgs'); if (el) { el.innerHTML = askMsgsHTML(); el.scrollTop = el.scrollHeight; } }
  function setAskPlaceholder() { const i = $('#askInput'); if (i) i.placeholder = UI.ask.awaiting === 'requester' ? 'Type a name…' : UI.ask.awaiting === 'due' ? 'e.g. Friday, Oct 30, next week' : 'Type a task, e.g. “Send Jen the logo by Friday”'; }
  function askNext() {
    const A = UI.ask, d = A.draft;
    if (!d.requesterSet) {
      A.awaiting = 'requester';
      const clients = Object.keys(D.PEOPLE).filter(k => D.PEOPLE[k].role === 'client').map(k => D.PEOPLE[k].name.split(' ')[0]);
      pushMsg({ from: 'k', text: 'Who is this for?', chips: clients.concat('Just me') });
    } else if (!d.dueSet) {
      A.awaiting = 'due';
      pushMsg({ from: 'k', text: 'When is it due?', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'] });
    } else {
      A.awaiting = 'confirm';
      const proj = d.project && D.PROJECTS[d.project] ? ` I filed it under ${D.PROJECTS[d.project].name}.` : '';
      pushMsg({ from: 'k', text: 'Here’s the task.' + proj + ' Add it to your board?', draft: Object.assign({}, d) });
    }
    setAskPlaceholder();
  }
  function askSubmit(text) {
    text = (text || '').trim(); if (!text || !UI.ask) return;
    const A = UI.ask;
    pushMsg({ from: 'me', text });
    if (A.awaiting === 'requester') {
      const s = text.toLowerCase();
      if (/^(just )?(me|myself)|no one|nobody|none|^mine/.test(s)) A.draft.requester = 'maya';
      else { const p = findPeople(text)[0]; A.draft.requester = p ? p.key : text.replace(/^(it'?s )?(for )?/i, '').replace(/\b\w/g, c => c.toUpperCase()); }
      if (!A.draft.project && D.PEOPLE[A.draft.requester] && D.PEOPLE[A.draft.requester].project) A.draft.project = D.PEOPLE[A.draft.requester].project;
      A.draft.requesterSet = true;
      return setTimeout(askNext, 350);
    }
    if (A.awaiting === 'due') {
      if (/\bno( due)?( date)?\b|none|whenever|no rush/i.test(text)) { A.draft.due = null; A.draft.dueSet = true; }
      else { const r = parseDue(text); if (r) { A.draft.due = r.days; A.draft.dueSet = true; } else { pushMsg({ from: 'k', text: 'I didn’t catch a date. Try “Friday”, “tomorrow” or “Oct 30”.', chips: ['Today', 'Tomorrow', 'Friday', 'Next week', 'No due date'] }); return; } }
      return setTimeout(askNext, 350);
    }
    A.draft = parseTask(text);
    const bits = [];
    if (A.draft.requesterSet) bits.push('for ' + personName(A.draft.requester).split(' ')[0]);
    if (A.draft.dueSet) bits.push('due ' + dueInfo(iso(addDays(A.draft.due)), 'upnext').label.toLowerCase());
    if (A.draft.collaborators.length) bits.push('with ' + A.draft.collaborators.map(c => personName(c).split(' ')[0]).join(' and '));
    pushMsg({ from: 'k', text: 'Got it: “' + A.draft.title + '”' + (bits.length ? ', ' + bits.join(', ') : '') + '.' });
    setTimeout(askNext, 450);
  }
  function addDraft() {
    const d = UI.ask.draft; if (!d) return;
    const t = mkTask({ title: d.title, source: 'keeper', category: d.category, project: d.project, requester: d.requester === 'maya' ? 'maya' : d.requester, collaborators: d.collaborators, due: d.due, status: 'upnext', snippet: '' });
    t.fresh = true;
    S.tasks.unshift(t); save();
    refresh();
    toast(srcIc('keeper') + 'Added to Up Next: ' + esc(d.title));
    UI.ask.awaiting = null; UI.ask.draft = null;
    pushMsg({ from: 'k', text: 'Added to Up Next. Anything else?', chips: ['Done for now'], chipType: 'done' });
    setAskPlaceholder();
    setTimeout(() => { t.fresh = false; }, 4000);
  }
  /* voice */
  let rec = null;
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { pushMsg({ from: 'k', text: 'Voice input isn’t available in this browser. Try Chrome, Edge or Safari, or type your task instead.' }); return; }
    try {
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
      let finalText = '';
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript; }
        const inp = $('#askInput'); if (inp) inp.value = (finalText + interim).trim();
      };
      rec.onerror = e => { setListening(false); if (e.error === 'not-allowed' || e.error === 'service-not-allowed') pushMsg({ from: 'k', text: 'I need microphone permission to listen. Allow it in your browser, or type instead.' }); };
      rec.onend = () => { setListening(false); const inp = $('#askInput'); const v = (finalText || (inp && inp.value) || '').trim(); if (v) { if (inp) inp.value = ''; askSubmit(v); } };
      rec.start(); setListening(true);
    } catch (e) { setListening(false); }
  }
  function stopListening() { if (rec) { try { rec.stop(); } catch (e) {} } }
  function setListening(on) {
    if (!UI.ask) return; UI.ask.listening = on;
    const l = $('#listen'); if (l) l.hidden = !on;
    const m = $('.mic'); if (m) m.classList.toggle('rec', on);
  }

  /* ---------- live arrivals ---------- */
  function arrive(manual) {
    if (!S.onboarded) return;
    const total = D.INCOMING.length;
    while (S.incomingIdx < total) {
      const tpl = D.INCOMING[S.incomingIdx++];
      if (!manual && S.channels.length && !S.channels.includes(tpl.source)) continue;
      const t = mkTask(Object.assign({}, tpl, { status: 'backlog', ago: 0 }));
      t.fresh = true;
      S.tasks.push(t); save(); refresh();
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
    menu.innerHTML = items.map(it => `<button type="button" class="${on(it) ? 'on' : ''}" data-action="menu-pick" data-type="${it.type}" data-v="${it.value}" data-label="${esc(it.label)}">${it.type === 'person' ? av(it.value) : it.type === 'source' ? srcIc(it.value) : projTag(it.value).replace(esc(it.label), '')}${esc(it.label)}${it.sub ? ` <span style="color:var(--faint);font-size:12px">· ${esc(it.sub)}</span>` : ''}${on(it) ? ' ✓' : ''}</button>`).join('');
    const host = $('#filter'); host.appendChild(menu);
    const hb = host.getBoundingClientRect(), bb = btn.getBoundingClientRect();
    const z = 1;
    menu.style.top = (bb.bottom - hb.top + 6) / z + 'px';
    menu.style.left = Math.max(8, Math.min(bb.left - hb.left, hb.width - 230)) / z + 'px';
    UI.menu = kind;
  }
  function closeMenu() { const m = $('#menu'); if (m) m.remove(); UI.menu = null; }
  function toggleToken(tok) {
    const i = S.filter.tokens.findIndex(t => t.type === tok.type && t.value === tok.value);
    if (i >= 0) S.filter.tokens.splice(i, 1); else S.filter.tokens.push(tok);
    save(); refresh();
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
      case 'go': S.screen = a.dataset.screen; save(); closeMenu(); render(); if (S.screen === 'feed') setTimeout(() => { S.tasks.forEach(t => t.fresh = false); }, 5000); break;
      case 'open': openSheet({ type: 'task', id: a.dataset.id }); break;
      case 'close': closeSheet(); break;
      case 'set-status': { const t = task(UI.sheet.id); t.status = a.dataset.v; save(); refresh(); renderLayer(true); toast('Moved to ' + esc(statusLabel(t.status))); break; }
      case 'set-due': { const t = task(UI.sheet.id); t.due = a.dataset.n === 'none' ? null : iso(addDays(+a.dataset.n)); save(); refresh(); renderLayer(true); toast(t.due ? 'Due ' + esc(dueInfo(t.due, t.status).label.toLowerCase()) : 'Due date cleared'); break; }
      case 'f-clear': S.filter = { text: '', tokens: [] }; save(); { const i = $('#fInput'); if (i) i.value = ''; } refresh(); break;
      case 'f-cat': toggleToken({ type: 'category', value: a.dataset.v, label: a.dataset.v }); break;
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
      case 'mic': if (UI.ask && UI.ask.listening) stopListening(); else startListening(); break;
      case 'qchip': {
        const v = a.dataset.v;
        if (v === 'Done for now') { closeSheet(); break; }
        if (v === 'Just me') { askSubmit('Just me'); break; }
        askSubmit(v); break;
      }
      case 'draft-add': addDraft(); break;
      case 'draft-redo': UI.ask.draft = null; UI.ask.awaiting = null; pushMsg({ from: 'k', text: 'No problem. What’s the task?', chips: SUGGEST }); setAskPlaceholder(); break;
      case 'live': S.live = !S.live; save(); refresh(); toast(S.live ? 'Live feed resumed' : 'Live feed paused'); break;
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
    if (e.target.id === 'fInput') { S.filter.text = e.target.value; save(); refresh(); }
  });
  document.addEventListener('change', e => {
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
    const r = d.card.getBoundingClientRect();
    d.dx = d.x0 - r.left; d.dy = d.y0 - r.top;
    const g = d.card.cloneNode(true);
    g.classList.add('ghost'); g.classList.remove('lp', 'fresh');
    g.style.width = r.width + 'px'; g.style.left = r.left + 'px'; g.style.top = r.top + 'px';
    document.body.appendChild(g); d.ghost = g;
    const ph = document.createElement('div'); ph.className = 'ph'; ph.style.height = r.height + 'px'; d.ph = ph;
    d.card.after(ph);
    d.card.classList.add('dragging');
    $$('.empty').forEach(x => x.style.display = 'none');
    autoScroll(d);
  }
  function moveDrag(d) {
    d.ghost.style.left = (d.x - d.dx) + 'px'; d.ghost.style.top = (d.y - d.dy) + 'px';
    const el = document.elementFromPoint(d.x, d.y);
    const col = el && el.closest('.col');
    $$('.col.over').forEach(c => c !== col && c.classList.remove('over'));
    if (!col) return;
    col.classList.add('over');
    const body = $('.col-body', col);
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
    const over = $('.col.over .col-body');
    if (over && over.scrollHeight > over.clientHeight) { const r = over.getBoundingClientRect(); if (d.y < r.top + 30) over.scrollTop -= 8; else if (d.y > r.bottom - 30) over.scrollTop += 8; }
    const mb = $('#mBody');
    if (mb) { const r = mb.getBoundingClientRect(); if (d.y < r.top + 40) mb.scrollTop -= 8; else if (d.y > r.bottom - 100) mb.scrollTop += 8; }
    if (d.x !== d.lx || d.y !== d.ly) { d.lx = d.x; d.ly = d.y; }
    moveDrag(d);
    requestAnimationFrame(() => autoScroll(d));
  }
  function finishDrag(d, commit) {
    d.active = false;
    const body = d.ph.parentNode, col = body && body.closest('.col');
    if (commit && col) {
      const t = task(d.id), from = t.status, to = col.dataset.col;
      const next = d.ph.nextElementSibling && d.ph.nextElementSibling.classList.contains('card') ? d.ph.nextElementSibling.dataset.id : null;
      S.tasks.splice(S.tasks.indexOf(t), 1);
      t.status = to;
      if (next) S.tasks.splice(S.tasks.findIndex(x => x.id === next), 0, t);
      else { let last = -1; S.tasks.forEach((x, i) => { if (x.status === to) last = i; }); S.tasks.splice(last + 1, 0, t); }
      save();
      if (from !== to) toast('Moved to ' + esc(statusLabel(to)));
    }
    d.ghost.remove(); d.ph.remove();
    d.card.classList.remove('dragging');
    $$('.col.over').forEach(c => c.classList.remove('over'));
    refresh();
  }

  /* ---------- boot ---------- */
  window.addEventListener('resize', () => { const was = device.classList.contains('is-mobile') ? 'mobile' : 'desktop'; if (was !== mode()) render(); });
  if (S.onboarded && S.step === 2) { S.onboarded = true; S.step = 3; }
  if (!S.onboarded && S.step === 2) S.step = 1;
  render();
  if (S.onboarded) scheduleLive();
  setInterval(() => { if (S.onboarded && !(UI.drag && UI.drag.active)) { const sm = $('#summary'); if (sm) sm.innerHTML = summary(); } }, 60000);
})();
