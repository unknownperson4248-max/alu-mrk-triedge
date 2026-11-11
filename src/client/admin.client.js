/* Admin panel: edits the site JSON, uploads media, shows quote requests. Live preview via postMessage. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const src = (p) => (!p ? '' : /^https?:/.test(p) ? p : '/' + String(p).replace(/^\//, ''));

  let site = null, media = [], builtin = [], presets = {}, defaults = null;
  let pvMode = innerWidth < 700 ? 'mob' : 'desk';
  let pendRev = null, pendCount = 0, editProd = null, uRev = null;
  let dirty = false, tab = 'dash', editIdx = null, editWork = null, quotes = null, quoteCount = 0, previewReady = false;

  // sidebar: every part of the website under its own heading
  const NAV = [
    ['Overview', [['dash', 'Dashboard', 'dash']]],
    ['Customers', [['inbox', 'Quote requests', 'inbox'], ['reviews', 'Reviews', 'star']]],
    ['Your work', [['works', 'Latest work', 'images'], ['cats', 'Gallery categories', 'tag']]],
    ['Website', [['hero', 'Hero', 'home'], ['company', 'Company & About', 'building'], ['products', 'Profile Systems', 'layers'], ['systems', 'Aluminium Systems', 'grid'], ['content', 'Key points & numbers', 'chart']]],
    ['Design & files', [['design', 'Colours', 'palette'], ['media', 'Images & files', 'folder']]],
    ['Account', [['account', 'Password', 'key']]],
  ];
  const NAV_NAME = Object.fromEntries(NAV.flatMap(([, items]) => items.map(([k, l]) => [k, l])));
  const NI = {
    dash: '<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>',
    inbox: '<path d="M4 13l2.5-7h11L20 13v6H4z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    images: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
    building: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-2-.5-1.3.4-2.5 1.8-2.5H18a3 3 0 0 0 3-3C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    out: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  };
  const ni = (n) => `<svg class="ni" viewBox="0 0 24 24" aria-hidden="true">${NI[n] || ''}</svg>`;
  const ICONS = ['motor', 'remote', 'maximize', 'shield', 'thermo', 'droplet', 'lock', 'sun', 'wind', 'layers', 'ruler', 'sparkle', 'building', 'fold', 'arrowsV', 'arrowsH', 'grid', 'window', 'door', 'palette', 'key', 'home', 'check', 'diamond', 'globe', 'users', 'handshake'];
  const KINDS = [['slide', 'Sliding panels'], ['vertical', 'Vertical sliding'], ['fold', 'Folding'], ['swing', 'Doors (swing)'], ['window', 'Windows'], ['grid', 'Curtain wall / facade grid'], ['none', 'No configurator']];
  const COLORS = [['navy', 'Navy (dark sections)'], ['accent', 'Accent (buttons, highlights)'], ['bg', 'Background'], ['surface', 'Light panels'], ['ink', 'Text']];
  const PRESET_NAMES = { 'black-silver-gold': 'Black, Silver & Gold', 'night-gold': 'Night & Gold (dark)', 'navy-gold': 'Navy & Gold', 'graphite-bronze': 'Graphite & Bronze', 'midnight-orange': 'Midnight & Orange', 'black-silver': 'Black & Silver', 'green-brass': 'Green & Brass' };
  const T = () => ({ en: '', el: '' });
  const TPL = {
    feature: () => ({ icon: 'sparkle', title: T() }),
    spec: () => ({ label: T(), value: '' }),
    app: () => T(),
    hero: () => ({ img: 'img/house-windows.jpg', caption: T() }),
    cat: () => ({ id: 'c' + Date.now().toString(36), name: T() }),
    pspec: () => ({ label: T(), value: '' }),
    review: () => ({ id: 'r' + Date.now().toString(36), name: '', place: '', rating: 5, text: '', ts: Date.now() }),
    stat: () => ({ value: '', label: T() }),
    value: () => ({ icon: 'sparkle', title: T(), body: T() }),
    testimonial: () => ({ name: '', role: T(), quote: T() }),
  };

  /* ---------- helpers ---------- */
  const parts = (p) => p.split('.').map((k) => (/^\d+$/.test(k) ? +k : k));
  function getP(o, p) { return parts(p).reduce((a, k) => (a == null ? a : a[k]), o); }
  function setP(o, p, v) {
    const ks = parts(p);
    let a = o;
    ks.slice(0, -1).forEach((k, i) => { if (a[k] == null) a[k] = typeof ks[i + 1] === 'number' ? [] : {}; a = a[k]; });
    a[ks[ks.length - 1]] = v;
  }
  let toastT;
  function toast(msg, kind) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (el.hidden = true), kind === 'err' ? 6000 : 3200);
  }
  async function api(path, opts = {}) {
    const r = await fetch(path, { credentials: 'same-origin', ...opts, headers: { 'x-requested-with': 'admin', ...(opts.headers || {}) } });
    if (r.status === 401 && !path.endsWith('/login')) { showLogin(); throw new Error('Signed out'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.ok === false) throw new Error(j.error || 'Request failed (' + r.status + ')');
    return j;
  }
  function markDirty() {
    dirty = true;
    const s = $('#state');
    if (s) { s.textContent = 'Unsaved changes'; s.classList.add('dirty'); }
    schedulePreview();
  }
  let pvT;
  function schedulePreview() { clearTimeout(pvT); pvT = setTimeout(sendPreview, 120); }
  function sendPreview() {
    const f = $('#pv');
    if (f && previewReady && f.contentWindow) f.contentWindow.postMessage({ type: 'preview', site }, location.origin);
  }
  // Preview follows what you are editing: each tab, and each card inside it, points at its part of the website.
  const PV_TAB = { dash: 'top', inbox: '#quote', reviews: '#reviews', works: '#projects', cats: '#projects', hero: 'top', company: '#about', products: '#products', systems: '#systems', content: '#about', design: 'top', media: 'top', account: 'top' };
  const PV_CARD = [
    [/^Company details/, '#quote'], [/^Owner|founder/i, '.founder|#about'], [/^About section image|^Main text/, '#about'],
    [/^Hero/, 'top'], [/^About: key points/, '.about-feats|#about'], [/^Numbers/, '.about-stats|#about'],
    [/^Gallery categories|^Latest work/, '#projects'], [/^Product categories|^Profile Systems/, '#products'],
    [/review|Google sign-in/i, '#reviews'], [/^Systems/, '#systems'], [/^Website colours/, 'top'],
  ];
  function cardTarget(card) {
    const h = card && card.querySelector('h2');
    const name = h ? h.textContent.trim() : '';
    for (const [re, t] of PV_CARD) if (re.test(name)) return t;
    return '';
  }
  function pvTarget(card) {
    if (tab === 'products' && editProd != null && site.products[editProd]) return site.products[editProd].id;
    if (tab === 'systems' && editIdx != null && site.systems[editIdx]) return site.systems[editIdx].slug;
    if (tab === 'works' && (editWork != null)) return '#projects';
    if (!card && lastCard && lastCard.isConnected) { const r = lastCard.getBoundingClientRect(); if (r.bottom > 80 && r.top < innerHeight) card = lastCard; }
    if (!card) {
      const top = ($('.top') || { offsetHeight: 64 }).offsetHeight + 24;
      card = $$('#editor .card').find((el) => el.getBoundingClientRect().bottom > top + 60);
    }
    return cardTarget(card) || PV_TAB[tab] || 'top';
  }
  let pvLast = '', pvPending = '', lastCard = null;
  const needTr = new Set(), manualEl = new Set(), grOpen = new Set();
  function previewGo(target) {
    target = target || pvTarget();
    pvLast = target;
    const f = $('#pv');
    if (!f || !f.contentWindow || !previewReady) { pvPending = target; return; }
    f.contentWindow.postMessage({ type: 'preview-go', target }, location.origin);
  }

  /* ---------- field builders ---------- */
  const val = (p) => getP(site, p) ?? '';
  const fld = (label, inner, hint) => `<div class="fld">${label ? `<label>${esc(label)}</label>` : ''}${inner}${hint ? `<small class="muted">${esc(hint)}</small>` : ''}</div>`;
  const txt = (p, label, type = 'text', ph = '', hint = '') => fld(label, `<input type="${type}" data-path="${p}" value="${esc(val(p))}" placeholder="${esc(ph)}">`, hint);
  const area = (p, label) => fld(label, `<textarea data-path="${p}">${esc(val(p))}</textarea>`);
  // Bilingual text: you write English; the Greek line under it is translated automatically when you save.
  const grLine = (p) => {
    const elv = String(val(p + '.el') || ''), pend = needTr.has(getP(site, p));
    if (!elv && !String(val(p + '.en') || '').trim() && !grOpen.has(p)) return '';
    if (grOpen.has(p)) return `<div class="gr open"><span class="gr-l">ΕΛ</span><input type="text" data-path="${p}.el" value="${esc(elv)}" aria-label="Greek"><button type="button" class="gr-b" data-act="gr-done" data-p="${p}">Done</button></div>`;
    return `<div class="gr"><span class="gr-l">ΕΛ</span><span class="gr-t${elv && !pend ? '' : ' none'}" data-grt="${p}">${esc(pend ? 'Greek updates when you save' : elv || 'Greek is added when you save')}</span><button type="button" class="gr-b" data-act="gr-edit" data-p="${p}">Edit</button></div>`;
  };
  const pair = (p, label, multi) => fld(label, `${multi ? `<textarea data-path="${p}.en" rows="3">${esc(val(p + '.en'))}</textarea>` : `<input type="text" data-path="${p}.en" value="${esc(val(p + '.en'))}">`}${grLine(p)}`);
  const check = (p, label) => `<label class="check"><input type="checkbox" data-path="${p}" ${val(p) ? 'checked' : ''}>${esc(label)}</label>`;
  const sel = (p, label, opts) => fld(label, `<select data-path="${p}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(val(p)) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`);
  const imgPick = (p, label, removable) => fld(label, `<div class="pick">${val(p) ? `<img src="${esc(src(val(p)))}" alt="">` : '<span class="noimg">No photo</span>'}<button type="button" class="b b-sm" data-act="pick" data-path="${p}">${val(p) ? 'Change' : 'Choose'} photo</button>${removable && val(p) ? `<button type="button" class="b b-sm b-danger" data-act="clear" data-path="${p}">Remove</button>` : ''}</div>`);
  const itemHead = (listPath, i, len, title) => `<div class="item-head"><span class="grow">${esc(title)}</span>
    <button type="button" class="b b-sm b-icon" data-act="move" data-path="${listPath}" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
    <button type="button" class="b b-sm b-icon" data-act="move" data-path="${listPath}" data-i="${i}" data-d="1" ${i === len - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
    <button type="button" class="b b-sm b-icon b-danger" data-act="del" data-path="${listPath}" data-i="${i}" aria-label="Remove" title="Remove">${ni('trash')}</button></div>`;
  const addBtn = (listPath, tpl, label) => `<div><button type="button" class="b b-sm" data-act="add" data-path="${listPath}" data-tpl="${tpl}">+ ${esc(label)}</button></div>`;

  /* ---------- tabs ---------- */
  function vDesign() {
    const th = site.theme;
    return `<div class="card"><h2>Website colours</h2><p class="hint">Changes show in the preview at once. Press Save to put them on the live website.</p>
      <div class="presets">${Object.entries(presets).map(([k, p]) => `<button type="button" class="preset" data-act="preset" data-k="${k}"><i>${['navy', 'accent', 'surface'].map((c) => `<b style="background:${p[c]}"></b>`).join('')}</i>${esc(PRESET_NAMES[k] || k)}</button>`).join('')}</div>
      <div class="colors">${COLORS.map(([k, l]) => `<div class="color"><small>${esc(l)}</small><div class="sw"><input type="color" data-path="theme.${k}" value="${esc(th[k])}" aria-label="${esc(l)}"><input type="text" data-path="theme.${k}" data-color value="${esc(th[k])}" maxlength="7" aria-label="${esc(l)} hex"></div></div>`).join('')}</div>
      <div><button type="button" class="b b-sm" data-act="reset-theme">Reset to default colours</button></div></div>`;
  }
  function vCompany() {
    return `<div class="card"><h2>Company details</h2>
        <div class="row">${txt('company.name', 'Company name')}${txt('company.phone', 'Phone (shown on site)', 'tel', '+357 99 000000')}</div>
        <div class="row">${txt('company.whatsapp', 'WhatsApp number (digits with country code)', 'tel', '35799000000')}${txt('company.email', 'Email', 'email')}</div>
        ${pair('company.address', 'Address', true)}
        ${pair('company.hours', 'Opening hours', true)}
        <div class="row">${txt('company.socials.facebook', 'Facebook link', 'url', 'https://facebook.com/…')}${txt('company.socials.instagram', 'Instagram link', 'url', 'https://instagram.com/…')}${txt('company.socials.linkedin', 'LinkedIn link', 'url', 'https://linkedin.com/…')}</div>
        <p class="hint">Empty fields are hidden on the website.</p></div>
      <div class="card"><h2>Owner / founder profile</h2><p class="hint">Shown in the About section. Hidden while the name is empty.</p>
        ${imgPick('founder.photo', 'Photo (portrait works best)', true)}
        ${txt('founder.name', 'Name')}
        ${pair('founder.role', 'Role, e.g. Founder & Managing Director')}
        ${pair('founder.bio', 'Short bio (2–4 sentences)', true)}
        ${pair('founder.quote', 'Personal message (optional)', true)}</div>
      <div class="card"><h2>About section image</h2>${imgPick('aboutImage', 'Image next to the About text')}</div>
      <div class="card"><h2>Main text</h2>
        ${pair('text.tagline', 'Tagline (footer and browser title)')}
        ${pair('text.introTitle', 'About: title', true)}
        ${pair('text.introBody', 'About: text', true)}
        ${pair('text.systemsTitle', 'Systems: title')}
        ${pair('text.systemsSub', 'Systems: text', true)}</div>`;
  }
  function vHero() {
    const v = site.heroVideo;
    return `<div class="card"><h2>Hero background</h2><p class="hint">The full-screen picture at the top of the website. A video plays on a loop without sound. The photo shows while the video loads.</p>
        <div class="fld"><span class="lbl">Video (live wallpaper)</span>
          ${v ? `<video class="vprev" src="${esc(src(v))}" muted loop autoplay playsinline></video><div class="pick"><button type="button" class="b b-sm" data-act="upload-video">Replace video</button><button type="button" class="b b-sm b-danger" data-act="clear" data-path="heroVideo">Remove video</button></div>`
              : `<div><button type="button" class="b b-sm b-pri" data-act="upload-video">Upload video</button></div>`}
          <small class="muted">MP4, up to 24 MB. Best: 10 to 20 seconds, 1920×1080, no sound.</small></div>
        ${imgPick('heroImage', 'Photo (shown when there is no video, and while the video loads)')}</div>
      <div class="card"><h2>Hero text</h2>
        ${check('heroText', 'Show the headline and button on top of the video')}
        ${pair('text.heroTitle', 'Headline (first line)')}
        ${pair('text.heroAccent', 'Headline (accent line)')}
        ${pair('text.heroSub', 'Short line under the headline', true)}
        ${pair('heroBadge', 'Gold badge on the photo (leave empty to hide)')}</div>`;
  }
  const NEW_DAYS = 45;
  const isNew = (w) => !!w.ts && Date.now() - w.ts < NEW_DAYS * 864e5;
  const catLabel = (id) => { const c = (site.galleryCats || []).find((x) => x.id === id); return c ? c.name.en || c.name.el || id : 'No category'; };
  function vWorks() {
    if (editWork != null && site.works[editWork]) return vWorkEdit(editWork);
    const L = site.works, C = site.galleryCats;
    return `<div class="card"><div class="item-head"><h2 class="grow">Latest work</h2><button type="button" class="b b-pri" data-act="add-work">+ Add new work</button></div>
        <p class="hint">Finished a job? Tap “Add new work”, choose the photos, add a title and category, then press Save. It goes first on the website with a NEW label for ${NEW_DAYS} days.</p>
        <div class="list">${L.map((w, i) => `<div class="sys-row">
          <span class="mono muted">${String(i + 1).padStart(2, '0')}</span>
          ${w.images && w.images[0] ? `<img src="${esc(src(w.images[0]))}" alt="">` : '<span class="noimg" style="width:64px;height:48px">No photo</span>'}
          <div style="min-width:0"><div class="nm">${esc(w.title?.en || w.title?.el || 'Untitled')} ${isNew(w) ? '<em class="tag" style="background:#c98a3c;color:#1a1206">new</em>' : ''}</div><div class="sub">${esc(catLabel(w.cat))}${w.date ? ' · ' + esc(w.date) : ''} · ${(w.images || []).length} photo${(w.images || []).length === 1 ? '' : 's'}</div></div>
          <div class="acts"><button type="button" class="b b-sm b-icon" data-act="move" data-path="works" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" class="b b-sm b-icon" data-act="move" data-path="works" data-i="${i}" data-d="1" ${i === L.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="b b-sm b-pri" data-act="edit-work" data-i="${i}">Edit</button></div>
        </div>`).join('') || '<p class="empty">No work yet. The gallery is hidden until you add one.</p>'}</div></div>`;
  }
  function vCats() {
    const C = site.galleryCats;
    return `<div class="card" id="cats-card"><h2>Gallery categories</h2><p class="hint">The filter buttons above the gallery. A category shows once a work uses it.</p>
        <div class="list">${C.map((c, i) => `<div class="cat-row"><div class="cat-in"><input type="text" data-path="galleryCats.${i}.name.en" value="${esc(c.name?.en || '')}" placeholder="Category name" aria-label="Category ${i + 1}">${grLine(`galleryCats.${i}.name`)}</div>
          <div class="acts"><button type="button" class="b b-sm b-icon" data-act="move" data-path="galleryCats" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" class="b b-sm b-icon" data-act="move" data-path="galleryCats" data-i="${i}" data-d="1" ${i === C.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="b b-sm b-icon b-danger" data-act="del" data-path="galleryCats" data-i="${i}" aria-label="Remove">${ni('trash')}</button></div></div>`).join('') || '<p class="empty">No categories.</p>'}</div>
        ${addBtn('galleryCats', 'cat', 'Add category')}</div>`;
  }
  function vWorkEdit(i) {
    const w = site.works[i], p = `works.${i}`;
    return `<div class="crumb"><button type="button" class="b b-sm" data-act="back-work">← All work</button><h2>${esc(w.title?.en || 'New work')}</h2></div>
      <div class="card"><h2>Photos</h2><p class="hint">The first photo is the cover. Tap ★ on another photo to make it the cover.</p>
        <div class="thumbs">${(w.images || []).map((g, k) => `<div class="thumb"><img src="${esc(src(g))}" alt=""><button type="button" class="x" data-act="del" data-path="${p}.images" data-i="${k}" data-now="1" aria-label="Remove">×</button>${k ? `<button type="button" class="first" data-act="work-cover" data-i="${k}" aria-label="Make cover">★</button>` : '<span class="cover">Cover</span>'}</div>`).join('') || '<span class="muted">No photos yet.</span>'}</div>
        <div class="pick"><button type="button" class="b b-pri" data-act="work-photos">Upload photos</button><button type="button" class="b b-sm" data-act="pick-add" data-path="${p}.images">Choose from library</button></div></div>
      <div class="card"><h2>Details</h2>
        ${pair(`${p}.title`, 'Title, e.g. Sliding doors, villa in Limassol')}
        <div class="row">${sel(`${p}.cat`, 'Category', [['', 'No category'], ...site.galleryCats.map((c) => [c.id, c.name.en || c.name.el || c.id])])}${fld('Month finished', `<input type="month" data-path="${p}.date" value="${esc(w.date || '')}">`)}</div>
        ${pair(`${p}.place`, 'Place (optional), e.g. Limassol')}
        <label class="check"><input type="checkbox" data-act="toggle-new" ${isNew(w) ? 'checked' : ''}>Show the NEW label (${NEW_DAYS} days from today)</label></div>
      <div class="card"><h2>Delete</h2><div><button type="button" class="b b-danger" data-act="del-work" data-i="${i}">Delete this work</button></div></div>`;
  }
  /* ---------- messages ---------- */
  const ago = (ts) => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'now' : m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : new Date(ts).toLocaleDateString(); };
  const waNum = (ph) => { let d = String(ph || '').replace(/\D/g, '').replace(/^00/, ''); if (d.length === 8) d = '357' + d; return d; };
  const stars = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  function vReviews() {
    if (!pendRev) loadReviews();
    if (!uRev) loadUReviews();
    const P = pendRev || [], L = site.reviews, U = uRev || [], on = !!String((site.reviewSettings || {}).googleClientId || '').trim();
    const origins = [location.origin, 'https://alu-mrk-triedge.rahatwize.workers.dev', 'https://alu-mrk-triedge-preview.rahatwize.workers.dev'].filter((v, i, a) => a.indexOf(v) === i);
    return `<div class="card"><h2>Google sign-in for reviews ${on ? '<span class="tag ok">On</span>' : '<span class="tag">Off</span>'}</h2>
        <p class="hint">${on ? 'Customers sign in with Google and their review is shown at once (one review per Google account, which they can edit or delete). You can reply to, hide or delete any review below.' : 'While this is empty, reviews from the website wait below for your approval. Paste a Google Client ID to switch to instant reviews with Google sign-in.'}</p>
        ${txt('reviewSettings.googleClientId', 'Google OAuth Client ID', 'text', '1234567890-abc...apps.googleusercontent.com')}
        <details class="howto"><summary>How to get a Client ID (free, about 10 minutes)</summary><ol>
          <li>Open <b>console.cloud.google.com</b> and sign in with the company Google account.</li>
          <li>Create a project (any name, e.g. "Alu MRK website").</li>
          <li>Go to <b>APIs &amp; Services → OAuth consent screen</b>: choose <b>External</b>, enter the app name and the company email, save, then <b>Publish app</b>.</li>
          <li>Go to <b>Credentials → Create credentials → OAuth client ID</b>, type <b>Web application</b>.</li>
          <li>Under <b>Authorised JavaScript origins</b> add:<br>${origins.map((o) => `<code>${esc(o)}</code>`).join('<br>')}</li>
          <li>Create, copy the <b>Client ID</b> (it ends with <code>.apps.googleusercontent.com</code>), paste it above and press <b>Save</b>. The Client ID is not a secret.</li>
        </ol></details></div>
      <div class="card"><div class="item-head"><h2 class="grow">Reviews from Google accounts (${U.length})</h2><button type="button" class="b b-sm" data-act="reload-urev">Refresh</button></div>
        <p class="hint">Shown on the website at once. Reply as the company, or hide/delete a review only if it is abusive or fake. Emails are private.</p>
        <div class="list">${U.map((r) => `<div class="q${r.hidden ? ' is-hidden' : ''}"><div class="q-top"><b>${esc(r.name)}</b><span class="rstars">${stars(+r.rating || 5)}</span><time>${esc(new Date(r.uts || r.ts).toLocaleDateString())}</time></div>
          <div class="muted">${esc(r.email || '')} ${r.verified ? '<span class="tag ok">Verified customer</span>' : ''} ${r.reports ? `<span class="tag warn">Reported ${r.reports}×</span>` : ''} ${r.hidden ? '<span class="tag">Hidden</span>' : ''} ${r.helpful ? `<span class="tag">${r.helpful} helpful</span>` : ''}</div>
          <p style="margin:6px 0;white-space:pre-line">${esc(r.text)}</p>
          ${(r.photos || []).length ? `<div class="thumbs">${r.photos.map((p) => `<a class="thumb" href="/${esc(p)}" target="_blank" rel="noopener"><img src="/${esc(p)}" alt=""></a>`).join('')}</div>` : ''}
          <div class="fld"><label for="urr-${esc(r.id)}">Your reply (shown under the review)</label><textarea id="urr-${esc(r.id)}" rows="2" maxlength="1500">${esc((r.reply && r.reply.text) || '')}</textarea></div>
          <div class="acts"><button type="button" class="b b-sm b-pri" data-act="ur-reply" data-id="${esc(r.id)}">Save reply</button><button type="button" class="b b-sm" data-act="ur-hide" data-id="${esc(r.id)}">${r.hidden ? 'Show again' : 'Hide'}</button>${r.reports ? `<button type="button" class="b b-sm" data-act="ur-clear" data-id="${esc(r.id)}">Clear reports</button>` : ''}<button type="button" class="b b-sm b-danger" data-act="ur-del" data-id="${esc(r.id)}">Delete</button></div></div>`).join('') || `<p class="empty">${uRev ? 'No reviews yet.' : 'Loading…'}</p>`}</div></div>
      <div class="card"><div class="item-head"><h2 class="grow">Waiting for approval (${P.length})</h2><button type="button" class="b b-sm" data-act="reload-rev">Refresh</button></div>
        <p class="hint">Reviews sent from the website. Nothing is shown publicly until you approve it. Approving also saves your other unsaved changes.</p>
        <div class="list">${P.map((r) => `<div class="q"><div class="q-top"><b>${esc(r.name)}</b><span class="rstars">${stars(+r.rating || 5)}</span><time>${esc(new Date(r.ts).toLocaleDateString())}</time></div>${r.place ? `<div class="muted">${esc(r.place)}</div>` : ''}${r.title ? `<b style="display:block;margin-top:4px">${esc(r.title)}</b>` : ''}<p style="margin:4px 0;white-space:pre-line">${esc(r.text)}</p>${r.project ? `<div class="muted">Project: ${esc(r.project)}</div>` : ''}${(r.photos || []).length ? `<div class="thumbs">${r.photos.map((id) => `<a class="thumb" href="/api/admin/file/${esc(id)}" target="_blank" rel="noopener"><img src="/api/admin/file/${esc(id)}" alt=""></a>`).join('')}</div>` : ''}<div class="acts"><button type="button" class="b b-sm b-pri" data-act="rev-ok" data-id="${esc(r.id)}">Approve & publish</button><button type="button" class="b b-sm b-danger" data-act="rev-no" data-id="${esc(r.id)}">Delete</button></div></div>`).join('') || `<p class="empty">${pendRev ? 'No reviews waiting.' : 'Loading…'}</p>`}</div></div>
      <div class="card"><h2>Published reviews (${L.length})</h2><p class="hint">Shown on the website with the average rating. Only add reviews from real customers.</p>
        <div class="list">${L.map((r, i) => `<div class="item">${itemHead('reviews', i, L.length, (r.name || 'Review ' + (i + 1)) + '  ' + stars(+r.rating || 5))}<div class="row">${txt(`reviews.${i}.name`, 'Customer name')}${txt(`reviews.${i}.place`, 'Area / city (optional)')}${txt(`reviews.${i}.title`, 'Title (optional)')}${txt(`reviews.${i}.project`, 'Project (optional)')}${sel(`reviews.${i}.rating`, 'Rating', [5, 4, 3, 2, 1].map((n) => [n, stars(n)]))}</div>${area(`reviews.${i}.text`, 'Review')}</div>`).join('') || '<p class="empty">No published reviews yet.</p>'}</div>
        ${addBtn('reviews', 'review', 'Add a review yourself')}</div>`;
  }
  /* ---------- dashboard ---------- */
  function vDash() {
    const Q = quotes || [], U = (uRev || []).filter((r) => !r.hidden), L = site.reviews || [];
    const all = [...U, ...L], avg = all.length ? all.reduce((a, r) => a + (+r.rating || 5), 0) / all.length : 0;
    const week = Q.filter((q) => Date.now() - q.ts < 7 * 864e5).length;
    const reported = (uRev || []).filter((r) => r.reports && !r.hidden).length;
    const works = (site.works || []).length, prods = (site.products || []).filter((x) => x.visible !== false).length;
    const gOn = !!String((site.reviewSettings || {}).googleClientId || '').trim();
    const mail = Q.length ? Q[0].email : '';
    const card = (k, ic, label, big, sub, tone) => `<button type="button" class="dcard ${tone || ''}" data-act="goto" data-tab="${k}"><span class="dcard-ic">${ni(ic)}</span><span class="dcard-l">${esc(label)}</span><b>${big}</b><small>${sub}</small></button>`;
    const when = (ts) => new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `<div class="dash-hi"><h2>Hello 👋</h2><p class="hint">Here is what is happening on your website.</p></div>
      <div class="dgrid">
        ${card('inbox', 'inbox', 'Quote requests', quotes ? Q.length : '…', `${week} in the last 7 days`, 'gold')}
        ${card('reviews', 'star', 'Reviews', uRev ? all.length : '…', all.length ? `★ ${avg.toFixed(1)} average${pendCount ? ` · ${pendCount} waiting` : ''}${reported ? ` · ${reported} reported` : ''}` : 'No reviews yet', 'blue')}
        ${card('works', 'images', 'Latest work', works, 'Projects in the gallery', 'green')}
        ${card('products', 'layers', 'Profile Systems', prods, 'Models on the website', 'violet')}
      </div>
      <div class="card"><div class="item-head"><h2 class="grow">Latest quote requests</h2><button type="button" class="b b-sm" data-act="goto" data-tab="inbox">View all${ni('right')}</button></div>
        ${Q.length ? `<div class="dlist">${Q.slice(0, 5).map((q) => { const c = qCust(q); return `<button type="button" class="drow" data-act="goto" data-tab="inbox"><span class="drow-av">${esc((c.name || '?').trim().charAt(0).toUpperCase())}</span><span class="drow-b"><b>${esc(c.name || 'Customer')}</b><small>${esc(q.ref || '')} · ${(q.items || []).length} product${(q.items || []).length === 1 ? '' : 's'}${c.location ? ' · ' + esc(c.location) : ''}</small></span><time>${esc(when(q.ts))}</time></button>`; }).join('')}</div>` : `<p class="empty">${quotes ? 'No quote requests yet. They appear here as soon as a customer sends one.' : 'Loading…'}</p>`}</div>
      <div class="card"><h2>Setup</h2><div class="dlist">
        <button type="button" class="drow" data-act="goto" data-tab="reviews"><span class="dot ${gOn ? 'ok' : 'warn'}"></span><span class="drow-b"><b>Google sign-in for reviews</b><small>${gOn ? 'On: customers post reviews with their Google account.' : 'Off: reviews wait for your approval. Add a Google Client ID to turn it on.'}</small></span>${ni('right')}</button>
        <div class="drow"><span class="dot ${mail === 'sent' ? 'ok' : mail ? 'warn' : ''}"></span><span class="drow-b"><b>Email notifications</b><small>${mail === 'sent' ? 'On: new requests are emailed to you.' : mail === 'not-configured' ? 'Not set up yet: requests are only shown here. Add RESEND_API_KEY in Cloudflare to get emails.' : mail ? 'The last email could not be sent (' + esc(mail) + ').' : 'Shown after the first quote request.'}</small></span></div>
        <button type="button" class="drow" data-act="goto" data-tab="account"><span class="dot"></span><span class="drow-b"><b>Admin password</b><small>Use your own password that only you know.</small></span>${ni('right')}</button>
      </div></div>`;
  }
  /* ---------- aluminium profile systems (models) ---------- */
  function vProducts() {
    if (editProd != null && site.products[editProd]) return vProductEdit(editProd);
    const L = site.products;
    const catName = (id) => { const c = site.productCats.find((x) => x.id === id); return c ? c.name.en : id; };
    return `<div class="card"><h2>Profile Systems</h2><p class="hint">Shown in the Profile Systems section and in the quotation form. Only enter specifications from the profile manufacturer’s (MUSKITA) catalogue. Hidden products (unticked) are not shown.</p>
      <div class="list">${L.map((x, i) => `<div class="sys-row${x.visible === false ? ' off' : ''}">
        <input type="checkbox" data-path="products.${i}.visible" ${x.visible !== false ? 'checked' : ''} aria-label="Show on website" style="width:18px;height:18px;accent-color:#0e1b2e">
        <img src="${esc(src(x.image))}" alt="">
        <div style="min-width:0"><div class="nm">${esc(x.model)} · ${esc(x.name?.en || '')}</div><div class="sub">${esc(catName(x.cat))} · ${x.visible === false ? 'Hidden' : 'Shown'}${(x.specs || []).filter((r) => r.value).length ? '' : ' · no specs yet'}</div></div>
        <div class="acts"><button type="button" class="b b-sm b-icon" data-act="move" data-path="products" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" class="b b-sm b-icon" data-act="move" data-path="products" data-i="${i}" data-d="1" ${i === L.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="b b-sm b-pri" data-act="edit-prod" data-i="${i}">Edit</button></div>
      </div>`).join('')}</div>
      <div><button type="button" class="b b-sm" data-act="add-prod">+ Add product</button></div></div>
      <div class="card"><h2>Product categories</h2><p class="hint">Used for the product filter and the first question of the quotation form.</p>
        <div class="list">${site.productCats.map((c, i) => `<div class="item">${itemHead('productCats', i, site.productCats.length, c.name?.en || 'Category')}${pair(`productCats.${i}.name`, 'Name')}</div>`).join('')}</div>
        ${addBtn('productCats', 'cat', 'Add category')}</div>`;
  }
  function vProductEdit(i) {
    const x = site.products[i], p = `products.${i}`;
    return `<div class="crumb"><button type="button" class="b b-sm" data-act="back-prod">← All products</button><h2>${esc(x.model || 'New product')}</h2></div>
      <div class="card"><h2>Basics</h2>${check(`${p}.visible`, 'Show on website')}
        <div class="row">${txt(`${p}.model`, 'Model, e.g. MU 2000')}${sel(`${p}.cat`, 'Category', site.productCats.map((c) => [c.id, c.name.en]))}</div>
        ${pair(`${p}.name`, 'Name, e.g. Sliding window system')}
        ${pair(`${p}.short`, 'Short description (card)', true)}
        ${pair(`${p}.desc`, 'Full description', true)}
        ${imgPick(`${p}.image`, 'Photo')}</div>
      <div class="card"><h2>Technical specifications</h2><p class="hint">Copy only from the manufacturer’s (MUSKITA) catalogue. Rows without a value are hidden.</p>
        <div class="list">${(x.specs || []).map((r, k) => `<div class="item">${itemHead(`${p}.specs`, k, x.specs.length, r.label?.en || 'Row ' + (k + 1))}${pair(`${p}.specs.${k}.label`, 'Label')}${txt(`${p}.specs.${k}.value`, 'Value', 'text', 'e.g. 200 kg')}</div>`).join('') || '<p class="empty">No specifications yet. The page says “Technical details on request”.</p>'}</div>
        ${addBtn(`${p}.specs`, 'pspec', 'Add row')}</div>
      <div class="card"><h2>Colours, applications and source</h2>${pair(`${p}.colours`, 'Colours & finishes', true)}
        <div class="list">${(x.applications || []).map((a, k) => `<div class="item">${itemHead(`${p}.applications`, k, x.applications.length, a.en || 'Application')}${pair(`${p}.applications.${k}`, 'Text')}</div>`).join('')}</div>${addBtn(`${p}.applications`, 'app', 'Add application')}
        ${txt(`${p}.source`, 'Source link (manufacturer product page)', 'url', 'https://')}</div>
      <div class="card"><h2>Delete</h2><div><button type="button" class="b b-danger" data-act="del-prod" data-i="${i}">Delete ${esc(x.model || 'product')}</button></div></div>`;
  }
  function vSystems() {
    if (editIdx != null && site.systems[editIdx]) return vSystemEdit(editIdx);
    const L = site.systems;
    return `<div class="card"><h2>Systems (categories)</h2><p class="hint">Turn a system off to hide it. Use the arrows to change the order.</p>
      <div class="list">${L.map((s, i) => `<div class="sys-row${s.visible === false ? ' off' : ''}">
        <input type="checkbox" data-path="systems.${i}.visible" ${s.visible !== false ? 'checked' : ''} aria-label="Show on website" style="width:18px;height:18px;accent-color:#0e1b2e">
        <img src="${esc(src(s.image))}" alt="">
        <div style="min-width:0"><div class="nm">${String(i + 1).padStart(2, '0')} · ${esc(s.name?.en || s.slug)}</div><div class="sub">${s.visible === false ? 'Hidden' : 'Shown'} · /#${esc(s.slug)}</div></div>
        <div class="acts"><button type="button" class="b b-sm b-icon" data-act="move" data-path="systems" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button><button type="button" class="b b-sm b-icon" data-act="move" data-path="systems" data-i="${i}" data-d="1" ${i === L.length - 1 ? 'disabled' : ''} aria-label="Move down">↓</button><button type="button" class="b b-sm b-pri" data-act="edit-sys" data-i="${i}">Edit</button></div>
      </div>`).join('')}</div>
      <div><button type="button" class="b b-sm" data-act="add-sys">+ Add system</button></div></div>`;
  }
  function vSystemEdit(i) {
    const s = site.systems[i], p = `systems.${i}`;
    const list = (key, tpl, label, render) => `<div class="list">${(s[key] || []).map((x, j) => `<div class="item">${itemHead(`${p}.${key}`, j, s[key].length, label + ' ' + (j + 1))}${render(`${p}.${key}.${j}`, x)}</div>`).join('') || '<p class="empty">None yet</p>'}</div>${addBtn(`${p}.${key}`, tpl, 'Add ' + label.toLowerCase())}`;
    return `<div class="crumb"><button type="button" class="b b-sm" data-act="back-sys">← All systems</button><h2>${esc(s.name?.en || s.slug)}</h2></div>
      <div class="card"><h2>Basics</h2>
        ${check(`${p}.visible`, 'Show on website')}
        ${pair(`${p}.name`, 'Name')}
        <div class="row">${sel(`${p}.icon`, 'Card icon', ICONS.map((x) => [x, x]))}</div>
        ${pair(`${p}.short`, 'Short description (one line)')}
        ${pair(`${p}.overview`, 'Overview', true)}
        ${txt(`${p}.slug`, 'Web address', 'text', '', 'Letters, numbers and dashes. The page opens at /#' + s.slug)}</div>
      <div class="card"><h2>Photos</h2>${imgPick(`${p}.image`, 'Main photo')}
        <div class="fld"><span class="lbl">Gallery</span><div class="thumbs">${(s.gallery || []).map((g, j) => `<div class="thumb"><img src="${esc(src(g))}" alt=""><button type="button" class="x" data-act="del" data-path="${p}.gallery" data-i="${j}" data-now="1" aria-label="Remove">×</button></div>`).join('')}</div>
        <div><button type="button" class="b b-sm" data-act="pick-add" data-path="${p}.gallery">+ Add photo</button></div></div></div>
      <div class="card"><h2>Key features</h2>${list('features', 'feature', 'Feature', (q) => `<div class="row">${sel(q + '.icon', 'Icon', ICONS.map((x) => [x, x]))}</div>${pair(q + '.title', 'Text')}`)}</div>
      <div class="card"><h2>Technical specifications</h2><p class="hint">Rows without a value are hidden on the website, and the whole table is hidden until one row has a value. Only enter values you have checked.</p>
        ${list('specs', 'spec', 'Row', (q) => `${pair(q + '.label', 'Label')}${txt(q + '.value', 'Value (same in both languages)', 'text', 'e.g. 3000 mm')}`)}</div>
      <div class="card"><h2>Configurator</h2>
        <div class="row">${sel(`${p}.kind`, 'Drawing type', KINDS)}${fld('Panel options (comma separated)', `<input type="text" data-path="${p}.configs" data-numlist value="${esc((s.configs || []).join(', '))}" placeholder="2, 3, 4">`)}</div>
        ${check(`${p}.motor`, 'Motorized (shows a motor box and tag)')}</div>
      <div class="card"><h2>Applications</h2>${list('applications', 'app', 'Application', (q) => pair(q, 'Text'))}</div>
      <div class="card"><h2>Brochure (PDF)</h2>
        ${s.brochure ? `<div class="pick"><a class="b b-sm" href="${esc(src(s.brochure))}" target="_blank" rel="noopener">Open current PDF</a><button type="button" class="b b-sm b-danger" data-act="clear" data-path="${p}.brochure">Remove from page</button></div>` : '<p class="hint" style="margin:0">No brochure. The download button is hidden until you add one.</p>'}
        <div><button type="button" class="b b-sm" data-act="upload-pdf" data-path="${p}.brochure">Upload PDF</button></div></div>
      <div class="card"><h2>Delete system</h2><div><button type="button" class="b b-danger" data-act="del-sys" data-i="${i}">Delete ${esc(s.name?.en || 'system')}</button></div></div>`;
  }
  function vContent() {
    const v = site.values || [], st = site.stats || [], ts = site.testimonials || [];
    return `<div class="card"><h2>About: key points</h2><p class="hint">The short points with gold icons next to the About text.</p>
        <div class="list">${v.map((x, i) => `<div class="item">${itemHead('values', i, v.length, x.title?.en || 'Item ' + (i + 1))}<div class="row">${sel(`values.${i}.icon`, 'Icon', ICONS.map((k) => [k, k]))}</div>${pair(`values.${i}.title`, 'Title')}${pair(`values.${i}.body`, 'Text', true)}</div>`).join('')}</div>${addBtn('values', 'value', 'Add item')}</div>
      <div class="card"><h2>Numbers (optional)</h2><p class="hint">Shown under the About text and counted up when they scroll into view, e.g. “15+” Years of experience. Use real numbers only. Hidden when empty.</p>
        <div class="list">${st.map((x, i) => `<div class="item">${itemHead('stats', i, st.length, x.value || 'Number ' + (i + 1))}<div class="row">${txt(`stats.${i}.value`, 'Number', 'text', '15+')}${sel(`stats.${i}.icon`, 'Icon', [['', 'none'], ...ICONS.map((k) => [k, k])])}</div>${pair(`stats.${i}.label`, 'Label')}</div>`).join('') || '<p class="empty">No numbers. The section is hidden.</p>'}</div>${addBtn('stats', 'stat', 'Add number')}</div>`;
  }
  const fmtD = (ts) => new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const qCust = (q) => q.customer || { name: q.name, email: q.email, phone: q.phone, location: q.area, message: q.message };
  function vInbox() {
    if (!quotes) { loadQuotes(); return '<div class="card"><p class="muted">Loading…</p></div>'; }
    const mailNote = (q) => !q.email ? '' : q.email === 'sent' ? '<span class="tag" style="background:#e2f3e8;color:#1f7a4a">emailed</span>' : q.email === 'not-configured' ? '<span class="tag">email not set up</span>' : `<span class="tag" style="background:#fbe9e7;color:#b3261e">email ${esc(q.email)}</span>`;
    return `<div class="card"><div class="item-head"><h2 class="grow">Quotation requests (${quotes.length})</h2><button type="button" class="b b-sm" data-act="reload-q">Refresh</button></div>
      <p class="hint">Requests from the quotation form. Open “Create quotation” to prepare a priced quotation and save it as PDF. Requests are kept for about a year.</p>
      <div class="list">${quotes.map((q) => { const c = qCust(q); const items = q.items || []; return `<div class="q"><div class="q-top"><b>${esc(c.name)}</b>${q.ref ? `<span class="tag mono">${esc(q.ref)}</span>` : ''}${mailNote(q)}<time>${esc(fmtD(q.ts))}</time></div>
        <dl><dt>Phone</dt><dd>${esc(c.phone)}</dd>${c.email ? `<dt>Email</dt><dd>${esc(c.email)}</dd>` : ''}${c.company ? `<dt>Company</dt><dd>${esc(c.company)}</dd>` : ''}${c.location ? `<dt>Location</dt><dd>${esc(c.location)}</dd>` : ''}${c.type ? `<dt>Project</dt><dd>${esc(c.type)}</dd>` : ''}${c.message ? `<dt>Message</dt><dd>${esc(c.message)}</dd>` : ''}${q.system ? `<dt>System</dt><dd>${esc(q.system)}</dd>` : ''}</dl>
        ${items.length ? `<table class="qtab"><thead><tr><th>#</th><th>Product</th><th>W × H (mm)</th><th>Qty</th><th>Details</th></tr></thead><tbody>${items.map((it, k) => `<tr><td>${k + 1}</td><td><b>${esc(it.model || '—')}</b><br><small>${esc(it.catName)}</small></td><td>${it.width} × ${it.height}</td><td>${it.qty}</td><td><small>${esc([it.colour, it.glass, it.glassThk, it.opening].filter(Boolean).join(' · '))}${it.specs ? '<br>' + esc(it.specs) : ''}${it.notes ? '<br>' + esc(it.notes) : ''}</small>${(it.files || []).map((f) => `<br><a href="/api/admin/file/${esc(f.id)}" target="_blank" rel="noopener">📎 ${esc(f.name)}</a>`).join('')}</td></tr>`).join('')}</tbody></table>` : ''}
        <div class="acts">${items.length ? `<button type="button" class="b b-sm b-pri" data-act="q-doc" data-key="${esc(q.key)}">Create quotation (PDF)</button>` : ''}<a class="b b-sm" href="tel:${esc(c.phone)}">Call</a><a class="b b-sm" href="https://wa.me/${esc(waNum(c.phone))}" target="_blank" rel="noopener">WhatsApp</a>${c.email ? `<a class="b b-sm" href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Quotation ' + (q.ref || ''))}">Email</a>` : ''}<button type="button" class="b b-sm b-danger" data-act="q-del" data-key="${esc(q.key)}">Delete</button></div></div>`; }).join('') || '<p class="empty">No requests yet.</p>'}</div></div>
      <div class="card"><h2>Quotation document defaults</h2><p class="hint">Filled into every new quotation. Leave empty what you have not decided; you can still type it on each quotation.</p>
        <div class="row">${txt('quoteSettings.currency', 'Currency symbol', 'text', '€')}${txt('quoteSettings.vat', 'VAT rate %', 'text', 'e.g. 19')}${txt('quoteSettings.validity', 'Valid for', 'text', 'e.g. 30 days')}</div>
        ${area('quoteSettings.payment', 'Payment terms')}${area('quoteSettings.delivery', 'Delivery / installation')}${area('quoteSettings.terms', 'Terms and conditions')}</div>`;
  }
  // printable quotation (Save as PDF from the browser's print dialog)
  function quoteDoc(q) {
    const c = qCust(q), st = site.quoteSettings || {}, co = site.company, cur = st.currency || '€';
    const addr = (co.address && (co.address.en || co.address.el)) || '';
    const today = new Date().toISOString().slice(0, 10);
    const rows = (q.items || []).map((it, k) => `<tr data-row><td>${k + 1}</td><td><div contenteditable="true" class="qd-ed"><b>${esc(it.model || it.catName)}</b> · ${esc(it.catName)}<br><small>${esc([it.colour, it.glass, it.glassThk, it.opening, it.specs].filter(Boolean).join(' · '))}</small></div></td><td class="num">${it.width} × ${it.height}</td><td class="num"><input class="qd-qty" type="number" min="0" step="1" value="${it.qty}"></td><td class="num"><input class="qd-price" type="number" min="0" step="0.01" placeholder="0.00"></td><td class="num qd-line">–</td></tr>`).join('');
    return `<div class="qd-tools no-print"><b>Quotation ${esc(q.ref || '')}</b><span class="sp"></span><button type="button" class="b b-sm" data-act="qd-row">+ Add line</button><button type="button" class="b b-sm b-pri" data-act="qd-print">Save as PDF / Print</button><button type="button" class="b b-sm" data-act="qd-close">Close</button></div>
      <article class="qdoc" id="qdoc">
        <header class="qd-head"><img src="/img/logo-dark.png" alt="${esc(co.name)}"><div class="qd-co"><b>${esc(co.name)}</b>${addr ? `<span>${esc(addr)}</span>` : ''}${co.phone ? `<span>${esc(co.phone)}</span>` : ''}${co.email ? `<span>${esc(co.email)}</span>` : ''}</div></header>
        <h1>QUOTATION</h1>
        <div class="qd-meta"><div><small>Quotation no.</small><input value="${esc(q.ref || '')}"></div><div><small>Date</small><input type="date" value="${today}"></div><div><small>Valid for</small><input value="${esc(st.validity || '')}" placeholder="e.g. 30 days"></div></div>
        <div class="qd-to"><small>Prepared for</small><b>${esc(c.name)}</b>${c.company ? `<span>${esc(c.company)}</span>` : ''}${c.location ? `<span>${esc(c.location)}</span>` : ''}<span>${esc(c.phone || '')}${c.email ? ' · ' + esc(c.email) : ''}</span></div>
        <table class="qd-tab"><thead><tr><th>#</th><th>Description</th><th class="num">Size (mm)</th><th class="num">Qty</th><th class="num">Unit price (${esc(cur)})</th><th class="num">Total (${esc(cur)})</th></tr></thead><tbody id="qd-rows">${rows}</tbody></table>
        <div class="qd-sum"><div><span>Subtotal</span><b id="qd-sub">–</b></div><div><span>VAT <input id="qd-vat" type="number" min="0" step="0.1" value="${esc(st.vat || '')}" placeholder="–">%</span><b id="qd-vatv">–</b></div><div class="qd-total"><span>Total (${esc(cur)})</span><b id="qd-tot">–</b></div></div>
        <section class="qd-terms">${[['Payment terms', st.payment], ['Delivery / installation', st.delivery], ['Terms and conditions', st.terms]].map(([h, v]) => `<div><h3>${h}</h3><div class="qd-ed" contenteditable="true">${esc(v || '')}</div></div>`).join('')}</section>
        <footer class="qd-foot"><div><small>For ${esc(co.name)}</small><div class="qd-sign" contenteditable="true"></div></div><span>${esc([co.name, co.phone, co.email].filter(Boolean).join(' · '))}</span></footer>
      </article>`;
  }
  function qdCalc() {
    const cur = (site.quoteSettings || {}).currency || '€', f = (n) => n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let sub = 0, any = false;
    $$('#qd-rows [data-row]').forEach((tr) => {
      const q = +(tr.querySelector('.qd-qty') || {}).value || 0, pr = (tr.querySelector('.qd-price') || {}).value;
      const line = q * (+pr || 0);
      if (pr !== '' && pr != null) any = true;
      sub += line;
      tr.querySelector('.qd-line').textContent = pr === '' ? '–' : f(line);
    });
    const vr = $('#qd-vat') ? $('#qd-vat').value : '', vat = vr === '' ? 0 : sub * (+vr / 100);
    $('#qd-sub').textContent = any ? cur + ' ' + f(sub) : '–';
    $('#qd-vatv').textContent = any && vr !== '' ? cur + ' ' + f(vat) : '–';
    $('#qd-tot').textContent = any ? cur + ' ' + f(sub + vat) : '–';
  }

  function usedPaths() { return JSON.stringify(site); }
  function vMedia() {
    const used = usedPaths();
    const all = [...media, ...builtin];
    return `<div class="card"><div class="item-head"><h2 class="grow">Images & files</h2><button type="button" class="b b-sm b-pri" data-act="upload">Upload images</button></div>
      <p class="hint">Photos are resized automatically before upload. Uploaded files can be deleted when no page uses them.</p>
      <div class="media">${all.map((m) => mediaTile(m, used.includes(m.path))).join('')}</div></div>`;
  }
  function mediaTile(m, inUse, selectable) {
    const pdf = /\.pdf$/.test(m.path), vid = /\.(mp4|webm)$/.test(m.path);
    const pic = pdf ? '<div class="pdf">PDF</div>' : vid ? `<video class="pdf" src="${esc(src(m.path))}" muted preload="metadata"></video>` : `<img src="${esc(src(m.path))}" alt="" loading="lazy">`;
    return `<div class="m">${selectable ? `<button type="button" class="sel" data-act="choose" data-v="${esc(m.path)}" aria-label="Choose ${esc(m.name || m.path)}">${pic}</button>` : pic}
      <div class="meta"><span title="${esc(m.name || m.path)}">${esc(m.name || m.path)}</span>${m.builtin ? '<em class="tag">built-in</em>' : inUse ? '<em class="tag">in use</em>' : selectable ? '' : `<button type="button" class="b b-sm b-danger" data-act="del-media" data-v="${esc(m.path)}">Delete</button>`}</div></div>`;
  }
  function vAccount() {
    return `<div class="card"><h2>Change password</h2>
      <form id="pw-form" class="list" style="max-width:420px">
        ${fld('Current password', '<input type="password" id="pw-cur" autocomplete="current-password" required>')}
        ${fld('New password (at least 8 characters)', '<input type="password" id="pw-new" autocomplete="new-password" minlength="8" required>')}
        ${fld('Repeat new password', '<input type="password" id="pw-rep" autocomplete="new-password" minlength="8" required>')}
        <div><button type="submit" class="b b-pri">Change password</button></div>
      </form></div>
      <div class="card"><h2>Sign out</h2><div><button type="button" class="b" data-act="logout">Sign out</button></div></div>`;
  }

  /* ---------- shell ---------- */
  function showLogin() {
    $('#app').hidden = true;
    $('#login').hidden = false;
    setTimeout(() => $('#pw').focus(), 30);
  }
  function shell() {
    $('#login').hidden = true;
    const app = $('#app');
    app.hidden = false;
    app.innerHTML = `<aside class="side" id="side" aria-label="Admin menu">
        <div class="side-top"><span>Menu</span><button type="button" class="side-x" data-act="side-close" aria-label="Close menu">${ni('x')}</button></div>
        <div class="side-brand"><img src="/img/icon-dark.png" alt=""><div><b>${esc((site.company && site.company.name) || 'Alu MRK TriEdge Ltd')}</b><small>Admin Panel</small></div></div>
        <nav class="side-nav" id="side-nav" aria-label="Sections"></nav>
        <div class="side-foot"><a href="/" target="_blank" rel="noopener">${ni('ext')}<span>View website</span></a><button type="button" class="out" data-act="logout">${ni('out')}<span>Logout</span></button></div>
      </aside>
      <div class="scrim" id="scrim" data-act="side-close"></div>
      <div class="shell">
        <header class="top"><div class="top-in">
          <button type="button" class="b b-icon side-btn" data-act="side-open" aria-label="Open menu" aria-controls="side" aria-expanded="false">${ni('menu')}</button>
          <div class="top-t"><h1 id="page-title">${esc(NAV_NAME[tab] || '')}</h1><span class="state" id="state">All changes saved</span></div>
          <span class="sp"></span>
          <a class="b b-sm hide-m" href="/" target="_blank" rel="noopener">${ni('ext')}View site</a>
          <button type="button" class="b b-sm prev-toggle" data-act="prev-toggle">${ni('eye')}<span class="hide-s">Preview</span></button>
          <button type="button" class="b b-acc" data-act="save" id="save">Save</button>
        </div></header>
        <div class="main" id="main"><div class="editor" id="editor"></div>
          <aside class="preview" id="preview" aria-label="Preview"><div class="preview-bar"><span>Live preview</span><span class="sp"></span><div class="pv-mode" role="group" aria-label="Preview size"><button type="button" data-act="pv-mode" data-m="desk" aria-pressed="${pvMode === 'desk'}">Desktop</button><button type="button" data-act="pv-mode" data-m="mob" aria-pressed="${pvMode === 'mob'}">Mobile</button></div><button type="button" class="b b-sm prev-toggle" data-act="prev-toggle">Close</button></div><div class="pv-wrap" id="pv-wrap"><iframe id="pv" src="/?preview=1" title="Website preview"></iframe></div></aside></div>
      </div>`;
    fitPreview();
    renderTabs();
    renderEditor();
  }
  function fitPreview() {
    const w = $('#pv-wrap'), f = $('#pv');
    if (!w || !f) return;
    w.classList.toggle('mob', pvMode === 'mob');
    $$('.pv-mode button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === pvMode)));
    if (pvMode === 'mob') { f.style.width = f.style.height = f.style.transform = ''; return; }
    const W = 1280, k = Math.min(1, w.clientWidth / W);
    f.style.width = W + 'px';
    f.style.height = w.clientHeight / k + 'px';
    f.style.transform = 'scale(' + k + ')';
  }
  addEventListener('resize', () => requestAnimationFrame(fitPreview));
  function setSide(open) {
    document.documentElement.classList.toggle('side-open', open);
    const b = $('.side-btn');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  function goTab(k) {
    tab = k;
    editIdx = null;
    editWork = null;
    editProd = null;
    renderTabs();
    renderEditor();
    scrollTo(0, 0);
    if (tab === 'inbox') loadQuotes();
    if (tab === 'reviews') { loadReviews(); loadUReviews(); }
    if (tab === 'dash') { loadQuotes(true); loadReviews(); loadUReviews(); }
    previewGo(PV_TAB[tab] || 'top');
    const pt = $('#page-title');
    if (pt) pt.textContent = NAV_NAME[tab] || '';
  }
  function renderTabs() {
    const nav = $('#side-nav');
    const reported = (uRev || []).filter((r) => r.reports && !r.hidden).length;
    const badge = (k) => (k === 'inbox' && quoteCount ? quoteCount : k === 'reviews' && pendCount + reported ? pendCount + reported : 0);
    if (nav) nav.innerHTML = NAV.map(([head, items]) => `<div class="side-g"><p>${esc(head)}</p>${items.map(([k, l, ic]) => `<button type="button" data-act="goto" data-tab="${k}" class="${k === tab ? 'on' : ''}"${k === tab ? ' aria-current="page"' : ''}>${ni(ic)}<span>${esc(l)}</span>${badge(k) ? `<em class="badge">${badge(k)}</em>` : ''}</button>`).join('')}</div>`).join('');
    document.title = (quoteCount ? '(' + quoteCount + ') ' : '') + 'Admin · Alu MRK TriEdge';
  }
  function renderEditor() {
    const views = { cats: vCats, dash: vDash, design: vDesign, company: vCompany, hero: vHero, systems: vSystems, works: vWorks, products: vProducts, reviews: vReviews, content: vContent, inbox: vInbox, media: vMedia, account: vAccount };
    const y = scrollY;
    $('#editor').innerHTML = views[tab]();
    $('#main').classList.toggle('no-prev', tab === 'dash' || tab === 'inbox' || tab === 'media' || tab === 'account');
    requestAnimationFrame(fitPreview);
    scrollTo(0, y);
    lastCard = null;
    // an eye button on every card that has a matching part on the website
    if (!['dash', 'inbox', 'media', 'account'].includes(tab)) $$('#editor .card').forEach((c) => { if (!/Delete|Sign out/.test((c.querySelector('h2') || {}).textContent || '')) c.insertAdjacentHTML('afterbegin', `<button type="button" class="card-pv" data-act="pv-card" title="Show this part in the preview">${ni('eye')}<span>Preview</span></button>`); });
  }

  /* ---------- data actions ---------- */
  async function loadQuotes(quiet) {
    try {
      const j = await api('/api/admin/quotes');
      quotes = j.items || [];
      quoteCount = quotes.length;
      renderTabs();
      if (tab === 'inbox' || tab === 'dash') renderEditor();
    } catch (e) { toast(e.message, 'err'); }
  }
  async function loadUReviews() {
    try {
      const j = await api('/api/admin/ureviews');
      uRev = j.items || [];
      renderTabs();
      if (tab === 'reviews' || tab === 'dash') renderEditor();
    } catch (e) { toast(e.message, 'err'); }
  }
  async function loadReviews() {
    try {
      const j = await api('/api/admin/reviews');
      pendRev = j.items || [];
      pendCount = pendRev.length;
      renderTabs();
      if (tab === 'reviews' || tab === 'dash') renderEditor();
    } catch (e) { toast(e.message, 'err'); }
  }
  // finds every English/Greek text pair in the site data
  function eachT(o, fn) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach((x) => eachT(x, fn)); return; }
    const k = Object.keys(o);
    if (k.length === 2 && 'en' in o && 'el' in o && typeof o.en === 'string') { fn(o); return; }
    k.forEach((x) => eachT(o[x], fn));
  }
  async function autoGreek(b) {
    const jobs = [];
    eachT(site, (o) => { if (o.en.trim() && !manualEl.has(o) && (needTr.has(o) || !String(o.el || '').trim())) jobs.push(o); });
    if (!jobs.length) return;
    b.textContent = 'Translating…';
    try {
      for (let i = 0; i < jobs.length; i += 15) {
        const part = jobs.slice(i, i + 15);
        const j = await api('/api/admin/translate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ texts: part.map((o) => o.en) }) });
        (j.out || []).forEach((v, k) => { if (v && part[k]) { part[k].el = v; needTr.delete(part[k]); } });
      }
    } catch (e) { toast('Greek could not be translated right now (' + e.message + '). English is saved; try Save again later.', 'err'); }
    b.textContent = 'Saving…';
  }
  async function save() {
    const b = $('#save');
    b.disabled = true;
    b.textContent = 'Saving…';
    try {
      await autoGreek(b);
      await api('/api/admin/site', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(site) });
      dirty = false;
      manualEl.clear();
      if (!$('.qdoc-wrap:not([hidden])')) renderEditor();
      const s = $('#state');
      s.textContent = 'All changes saved';
      s.classList.remove('dirty');
      toast('Saved. The live website is updated.', 'ok');
      return true;
    } catch (e) {
      toast('Not saved: ' + e.message, 'err');
      return false;
    } finally {
      b.disabled = false;
      b.textContent = 'Save';
    }
  }
  async function prepFile(file) {
    if (file.type === 'application/pdf') return { blob: file, type: file.type };
    if (/^video\//.test(file.type)) {
      if (!/^video\/(mp4|webm)$/.test(file.type)) throw new Error(file.name + ': use an MP4 video.');
      if (file.size > 24 * 1024 * 1024) throw new Error(file.name + ' is ' + Math.round(file.size / 1048576) + ' MB. The limit is 24 MB. Export it shorter or at a lower quality.');
      return { blob: file, type: file.type };
    }
    if (!/^image\//.test(file.type)) throw new Error(file.name + ' is not an image');
    let bmp = null;
    try { bmp = await createImageBitmap(file); } catch (e) {}
    if (!bmp) { if (/^image\/(jpeg|png|webp)$/.test(file.type)) return { blob: file, type: file.type }; throw new Error(file.name + ': this image format is not supported. Use JPG or PNG.'); }
    const max = 2000, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size < 900 * 1024 && /^image\/(jpeg|png|webp)$/.test(file.type)) return { blob: file, type: file.type };
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const png = file.type === 'image/png' && file.size < 1.5e6;
    const type = png ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((r) => c.toBlob(r, type, 0.84));
    return { blob, type };
  }
  async function uploadFiles(files) {
    const out = [];
    for (const f of files) {
      try {
        toast('Uploading ' + f.name + '…');
        const { blob, type } = await prepFile(f);
        const j = await api('/api/admin/media', { method: 'POST', headers: { 'content-type': type, 'x-filename': encodeURIComponent(f.name) }, body: blob });
        media.unshift({ path: j.path, name: j.name, type: j.type, size: j.size, ts: j.ts });
        out.push(j.path);
      } catch (e) { toast(e.message, 'err'); }
    }
    if (out.length) toast(out.length === 1 ? 'Uploaded.' : out.length + ' files uploaded.', 'ok');
    return out;
  }
  function chooseFiles(accept, multiple) {
    return new Promise((resolve) => {
      const i = document.createElement('input');
      i.type = 'file';
      i.accept = accept;
      i.multiple = !!multiple;
      i.onchange = () => resolve([...i.files]);
      i.click();
    });
  }
  function picker(title) {
    return new Promise((resolve) => {
      const m = $('#modal');
      const draw = () => {
        const imgs = [...media.filter((x) => /\.(jpg|png|webp)$/.test(x.path)), ...builtin];
        m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="b b-sm b-pri" data-m="upload">Upload new</button><button type="button" class="b b-sm" data-m="close">Cancel</button></div>
          <div class="media">${imgs.map((x) => mediaTile(x, false, true)).join('')}</div></div>`;
      };
      draw();
      m.hidden = false;
      const done = (v) => { m.hidden = true; m.innerHTML = ''; m.onclick = null; resolve(v); };
      m.onclick = async (e) => {
        const c = e.target.closest('[data-act="choose"]');
        if (c) return done(c.dataset.v);
        if (e.target.closest('[data-m="close"]') || e.target === m) return done(null);
        if (e.target.closest('[data-m="upload"]')) {
          const files = await chooseFiles('image/*', false);
          const up = await uploadFiles(files);
          if (up[0]) return done(up[0]);
          draw();
        }
      };
    });
  }

  /* ---------- events ---------- */
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.closest && el.closest('#qdoc')) { qdCalc(); return; }
    const p = el.dataset && el.dataset.path;
    if (!p || !site) return;
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if ('numlist' in el.dataset) v = el.value.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 12);
    else if ('color' in el.dataset) { if (!/^#[0-9a-f]{6}$/i.test(el.value)) return; v = el.value.toLowerCase(); }
    else v = el.value;
    if (p.endsWith('.slug')) { v = String(v).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+/, '').slice(0, 60); }
    setP(site, p, v);
    if (/\.(en|el)$/.test(p)) {
      const o = getP(site, p.slice(0, -3));
      if (o && typeof o === 'object') {
        if (p.endsWith('.en')) { if (!manualEl.has(o)) needTr.add(o); const g = $(`[data-grt="${p.slice(0, -3)}"]`); if (g) { g.textContent = 'Greek updates when you save'; g.classList.add('none'); } }
        else { manualEl.add(o); needTr.delete(o); }
      }
    }
    if (p.startsWith('theme.')) $$(`[data-path="${p}"]`).forEach((x) => { if (x !== el) x.value = v; });
    markDirty();
    if (el.type === 'checkbox' && ((tab === 'systems' && editIdx == null) || (tab === 'products' && editProd == null))) renderEditor();
  });
  document.addEventListener('change', (e) => {
    const p = e.target.dataset && e.target.dataset.path;
    if (p && p.endsWith('.slug')) { const s = site.systems[editIdx]; if (s && !s.slug) s.slug = 'system-' + (editIdx + 1); renderEditor(); }
  });

  document.addEventListener('focusin', (e) => {
    const card = e.target.closest && e.target.closest('#editor .card');
    if (!card) return;
    lastCard = card;
    const t = pvTarget(card);
    if (t !== pvLast) previewGo(t);
  });
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !site) return;
    const act = b.dataset.act, p = b.dataset.path;
    switch (act) {
      case 'tab':
      case 'goto':
        setSide(false);
        goTab(b.dataset.tab);
        break;
      case 'side-open': setSide(true); break;
      case 'side-close': setSide(false); break;
      case 'edit-prod': editProd = +b.dataset.i; renderEditor(); scrollTo(0, 0); previewGo(site.products[editProd].id); break;
      case 'back-prod': editProd = null; renderEditor(); previewGo('#products'); break;
      case 'add-prod': {
        let n = site.products.length + 1, id = 'product-' + n;
        while (site.products.some((x) => x.id === id)) id = 'product-' + ++n;
        site.products.push({ id, model: '', visible: false, cat: (site.productCats[0] || {}).id || '', image: 'img/house-windows.jpg', name: T(), short: T(), desc: T(), colours: T(), specs: [], applications: [], source: '' });
        editProd = site.products.length - 1; markDirty(); renderEditor(); scrollTo(0, 0); break;
      }
      case 'del-prod': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Click again to delete'; break; }
        site.products.splice(+b.dataset.i, 1); editProd = null; markDirty(); renderEditor(); break;
      }
      case 'reload-rev': pendRev = null; renderEditor(); break;
      case 'reload-urev': uRev = null; renderEditor(); break;
      case 'ur-reply': case 'ur-hide': case 'ur-clear': {
        const r0 = (uRev || []).find((x) => x.id === b.dataset.id);
        if (!r0) break;
        const body = act === 'ur-reply' ? { reply: ($('#urr-' + r0.id) || {}).value || '' } : act === 'ur-hide' ? { hidden: !r0.hidden } : { clearReports: true };
        b.disabled = true;
        try { const j = await api('/api/admin/ureviews/' + r0.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); uRev = uRev.map((x) => (x.id === r0.id ? j.review : x)); toast(act === 'ur-reply' ? (body.reply ? 'Reply saved. It is shown on the website.' : 'Reply removed.') : 'Saved.', 'ok'); renderEditor(); } catch (err) { toast(err.message, 'err'); b.disabled = false; }
        break;
      }
      case 'ur-del': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; break; }
        try { await api('/api/admin/ureviews/' + b.dataset.id, { method: 'DELETE' }); uRev = (uRev || []).filter((x) => x.id !== b.dataset.id); renderEditor(); toast('Review deleted.', 'ok'); } catch (err) { toast(err.message, 'err'); }
        break;
      }
      case 'rev-ok': {
        const r0 = (pendRev || []).find((x) => x.id === b.dataset.id);
        if (!r0) break;
        b.disabled = true;
        let r;
        try { r = (await api('/api/admin/reviews/' + r0.id + '/publish', { method: 'POST' })).review; } catch (err) { toast(err.message, 'err'); b.disabled = false; break; }
        site.reviews.unshift(r);
        if (await save()) {
          try { await api('/api/admin/reviews/' + r.id, { method: 'DELETE' }); } catch (err) {}
          pendRev = pendRev.filter((x) => x.id !== r.id);
          pendCount = pendRev.length;
          toast('Review published on the website.', 'ok');
        } else site.reviews.shift();
        renderTabs(); renderEditor(); schedulePreview();
        break;
      }
      case 'rev-no': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; break; }
        try { await api('/api/admin/reviews/' + b.dataset.id, { method: 'DELETE' }); pendRev = (pendRev || []).filter((x) => x.id !== b.dataset.id); pendCount = pendRev.length; renderTabs(); renderEditor(); } catch (err) { toast(err.message, 'err'); }
        break;
      }
      case 'add-work': {
        const files = await chooseFiles('image/*', true);
        if (!files.length) break;
        const up = await uploadFiles(files);
        if (!up.length) break;
        const d = new Date();
        site.works.unshift({ id: 'w' + Date.now().toString(36), title: T(), cat: '', place: T(), date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), images: up, ts: Date.now() });
        editWork = 0;
        markDirty(); renderEditor(); scrollTo(0, 0);
        toast('Photos added. Add a title and category, then press Save.', 'ok');
        break;
      }
      case 'edit-work': editWork = +b.dataset.i; renderEditor(); scrollTo(0, 0); break;
      case 'back-work': editWork = null; renderEditor(); break;
      case 'work-photos': {
        const files = await chooseFiles('image/*', true);
        const up = await uploadFiles(files);
        if (up.length && site.works[editWork]) { (site.works[editWork].images || (site.works[editWork].images = [])).push(...up); markDirty(); renderEditor(); }
        break;
      }
      case 'work-cover': {
        const im = site.works[editWork] && site.works[editWork].images, k = +b.dataset.i;
        if (im && im[k]) { im.unshift(im.splice(k, 1)[0]); markDirty(); renderEditor(); }
        break;
      }
      case 'toggle-new': if (site.works[editWork]) { site.works[editWork].ts = b.checked ? Date.now() : 0; markDirty(); } break;
      case 'del-work': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Click again to delete'; break; }
        site.works.splice(+b.dataset.i, 1); editWork = null; markDirty(); renderEditor(); toast('Work deleted. Press Save to apply.'); break;
      }
      case 'save': save(); break;
      case 'gr-edit': grOpen.add(b.dataset.p); renderEditor(); { const i = $(`[data-path="${b.dataset.p}.el"]`); if (i) i.focus(); } break;
      case 'gr-done': grOpen.delete(b.dataset.p); renderEditor(); break;
      case 'pv-card': {
        const card = b.closest('.card');
        lastCard = card;
        $('#preview').classList.add('show');
        requestAnimationFrame(fitPreview);
        previewGo(pvTarget(card));
        break;
      }
      case 'prev-toggle': {
        const show = $('#preview').classList.toggle('show');
        requestAnimationFrame(fitPreview);
        if (show) previewGo(pvTarget());
        break;
      }
      case 'pv-mode': pvMode = b.dataset.m; fitPreview(); break;
      case 'preset': site.theme = { ...presets[b.dataset.k] }; markDirty(); renderEditor(); break;
      case 'reset-theme': site.theme = { ...defaults.theme }; markDirty(); renderEditor(); break;
      case 'add': getP(site, p) || setP(site, p, []); getP(site, p).push(TPL[b.dataset.tpl]()); markDirty(); renderEditor(); break;
      case 'del': {
        if (!b.dataset.now && !b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = 'Remove'; } }, 3000); break; }
        getP(site, p).splice(+b.dataset.i, 1); markDirty(); renderEditor(); break;
      }
      case 'move': {
        const a = getP(site, p), i = +b.dataset.i, j = i + +b.dataset.d;
        if (j < 0 || j >= a.length) break;
        [a[i], a[j]] = [a[j], a[i]];
        markDirty(); renderEditor(); break;
      }
      case 'pick': { const v = await picker('Choose image'); if (v) { setP(site, p, v); markDirty(); renderEditor(); } break; }
      case 'pick-add': { const v = await picker('Add photo to gallery'); if (v) { (getP(site, p) || setP(site, p, []) || getP(site, p)).push(v); markDirty(); renderEditor(); } break; }
      case 'clear': setP(site, p, ''); markDirty(); renderEditor(); break;
      case 'edit-sys': editIdx = +b.dataset.i; renderEditor(); scrollTo(0, 0); previewGo(site.systems[editIdx].slug); break;
      case 'back-sys': editIdx = null; renderEditor(); previewGo('#systems'); break;
      case 'add-sys': {
        let n = site.systems.length + 1, slug = 'new-system-' + n;
        while (site.systems.some((s) => s.slug === slug)) slug = 'new-system-' + ++n;
        site.systems.push({ slug, visible: false, kind: 'none', motor: false, configs: [], name: { en: 'New system', el: 'Νέο σύστημα' }, short: T(), overview: T(), image: 'img/house-windows.jpg', gallery: [], features: [], specs: [], applications: [], brochure: '' });
        editIdx = site.systems.length - 1; markDirty(); renderEditor(); scrollTo(0, 0); break;
      }
      case 'del-sys': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Click again to delete'; break; }
        site.systems.splice(+b.dataset.i, 1); editIdx = null; markDirty(); renderEditor(); toast('System deleted. Press Save to apply.'); break;
      }
      case 'upload-pdf': {
        const files = await chooseFiles('application/pdf', false);
        const up = await uploadFiles(files);
        if (up[0]) { setP(site, p, up[0]); markDirty(); renderEditor(); }
        break;
      }
      case 'upload-video': {
        const files = await chooseFiles('video/mp4,video/webm', false);
        const up = await uploadFiles(files);
        if (up[0]) { site.heroVideo = up[0]; markDirty(); renderEditor(); }
        break;
      }
      case 'upload': { const files = await chooseFiles('image/*', true); if (files.length) { await uploadFiles(files); renderEditor(); } break; }
      case 'del-media': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; break; }
        const path = b.dataset.v;
        if (usedPaths().includes(path)) { toast('This file is used on the website. Remove it there first.', 'err'); break; }
        try { await api('/api/admin/' + path.replace(/^media\//, 'media/'), { method: 'DELETE' }); media = media.filter((m) => m.path !== path); renderEditor(); toast('Deleted.', 'ok'); } catch (err) { toast(err.message, 'err'); }
        break;
      }
      case 'q-doc': {
        const q = (quotes || []).find((x) => x.key === b.dataset.key);
        if (!q) break;
        const m = $('#qdoc-wrap') || Object.assign(document.createElement('div'), { id: 'qdoc-wrap', className: 'qdoc-wrap' });
        document.body.appendChild(m);
        m.innerHTML = quoteDoc(q);
        m.hidden = false;
        document.documentElement.classList.add('qd-open');
        qdCalc();
        break;
      }
      case 'qd-close': { const m = $('#qdoc-wrap'); if (m) { m.hidden = true; m.innerHTML = ''; } document.documentElement.classList.remove('qd-open'); break; }
      case 'qd-print': window.print(); break;
      case 'qd-row': {
        const tb = $('#qd-rows'), n = tb.children.length + 1;
        tb.insertAdjacentHTML('beforeend', `<tr data-row class="qd-added"><td>${n}</td><td><div contenteditable="true" class="qd-ed" data-ph="Description"></div></td><td class="num" contenteditable="true"></td><td class="num"><input class="qd-qty" type="number" min="0" step="1" value="1"></td><td class="num"><input class="qd-price" type="number" min="0" step="0.01" placeholder="0.00"></td><td class="num qd-line">–</td></tr>`);
        qdCalc();
        break;
      }
      case 'reload-q': quotes = null; renderEditor(); break;
      case 'q-del': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; break; }
        try { await api('/api/admin/quotes/' + encodeURIComponent(b.dataset.key), { method: 'DELETE' }); quotes = quotes.filter((q) => q.key !== b.dataset.key); quoteCount = quotes.length; renderTabs(); renderEditor(); } catch (err) { toast(err.message, 'err'); }
        break;
      }
      case 'logout':
        if (dirty && !b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'You have unsaved changes. Click again to sign out'; break; }
        await fetch('/api/admin/logout', { method: 'POST', headers: { 'x-requested-with': 'admin' } });
        dirty = false; location.reload(); break;
    }
  });

  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'login-form') {
      e.preventDefault();
      const msg = $('#login-msg'), btn = e.target.querySelector('button');
      msg.textContent = '';
      btn.disabled = true;
      try { await api('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) }); $('#pw').value = ''; await boot(); }
      catch (err) { msg.textContent = err.message === 'Signed out' ? 'Wrong password' : err.message; }
      finally { btn.disabled = false; }
    }
    if (e.target.id === 'pw-form') {
      e.preventDefault();
      const cur = $('#pw-cur').value, nw = $('#pw-new').value, rep = $('#pw-rep').value;
      if (nw !== rep) return toast('The new passwords do not match.', 'err');
      try { await api('/api/admin/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ current: cur, next: nw }) }); e.target.reset(); toast('Password changed.', 'ok'); }
      catch (err) { toast(err.message, 'err'); }
    }
  });

  addEventListener('message', (e) => {
    if (e.origin === location.origin && e.data && e.data.type === 'preview-ready') { previewReady = true; sendPreview(); previewGo(pvPending || pvTarget()); pvPending = ''; }
  });
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's' && site) { e.preventDefault(); save(); } });

  async function boot() {
    let r;
    try { r = await fetch('/api/admin/site', { credentials: 'same-origin' }); } catch (e) { return toast('Could not reach the server.', 'err'); }
    if (r.status === 401) return showLogin();
    const j = await r.json();
    site = j.site; media = j.media || []; builtin = j.builtin || []; presets = j.presets || {}; defaults = j.defaults;
    if (!site.stats) site.stats = [];
    if (!site.testimonials) site.testimonials = [];
    if (!site.values) site.values = [];
    if (!site.founder) site.founder = clone(defaults.founder);
    if (!Array.isArray(site.works)) site.works = clone(defaults.works || []);
    if (!Array.isArray(site.galleryCats)) site.galleryCats = clone(defaults.galleryCats || []);
    if (!Array.isArray(site.reviews)) site.reviews = [];
    if (!Array.isArray(site.products)) site.products = clone(defaults.products || []);
    if (!Array.isArray(site.productCats)) site.productCats = clone(defaults.productCats || []);
    site.quoteSettings = { ...(defaults.quoteSettings || {}), ...(site.quoteSettings || {}) };
    site.reviewSettings = { ...(defaults.reviewSettings || {}), ...(site.reviewSettings || {}) };
    if (!site.heroBadge) site.heroBadge = { en: '', el: '' };
    shell();
    loadQuotes();
    loadReviews();
    loadUReviews();
    clearInterval(pollT);
    pollT = setInterval(() => { if (!document.hidden && site && tab !== 'inbox') loadQuotes(true); }, 60000);
  }
  let pollT = null;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.documentElement.classList.contains('side-open')) setSide(false); });
  boot();
})();
