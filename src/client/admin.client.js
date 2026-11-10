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
  let dirty = false, tab = 'design', editIdx = null, quotes = null, quoteCount = 0, previewReady = false;

  const TABS = [['design', 'Colours'], ['company', 'Company & text'], ['hero', 'Hero'], ['systems', 'Systems'], ['content', 'Why us & reviews'], ['inbox', 'Quote requests'], ['media', 'Images & files'], ['account', 'Password']];
  const ICONS = ['motor', 'remote', 'maximize', 'shield', 'thermo', 'droplet', 'lock', 'sun', 'wind', 'layers', 'ruler', 'sparkle', 'building', 'fold', 'arrowsV', 'arrowsH', 'grid', 'window', 'door', 'palette', 'key', 'home', 'check'];
  const KINDS = [['slide', 'Sliding panels'], ['vertical', 'Vertical sliding'], ['fold', 'Folding'], ['swing', 'Doors (swing)'], ['window', 'Windows'], ['grid', 'Curtain wall / facade grid'], ['none', 'No configurator']];
  const COLORS = [['navy', 'Navy (dark sections)'], ['accent', 'Accent (buttons, highlights)'], ['bg', 'Background'], ['surface', 'Light panels'], ['ink', 'Text']];
  const PRESET_NAMES = { 'navy-gold': 'Navy & Gold', 'graphite-bronze': 'Graphite & Bronze', 'midnight-orange': 'Midnight & Orange', 'black-silver': 'Black & Silver', 'green-brass': 'Green & Brass' };
  const T = () => ({ en: '', el: '' });
  const TPL = {
    feature: () => ({ icon: 'sparkle', title: T() }),
    spec: () => ({ label: T(), value: '' }),
    app: () => T(),
    hero: () => ({ img: 'img/house-windows.jpg', caption: T() }),
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
  function previewGo(hash) {
    const f = $('#pv');
    try { if (f && f.contentWindow) f.contentWindow.location.hash = hash || 'top'; } catch (e) {}
  }

  /* ---------- field builders ---------- */
  const val = (p) => getP(site, p) ?? '';
  const fld = (label, inner, hint) => `<div class="fld">${label ? `<label>${esc(label)}</label>` : ''}${inner}${hint ? `<small class="muted">${esc(hint)}</small>` : ''}</div>`;
  const txt = (p, label, type = 'text', ph = '', hint = '') => fld(label, `<input type="${type}" data-path="${p}" value="${esc(val(p))}" placeholder="${esc(ph)}">`, hint);
  const area = (p, label) => fld(label, `<textarea data-path="${p}">${esc(val(p))}</textarea>`);
  const pair = (p, label, multi) => fld(label, `<div class="pair">${['en', 'el'].map((l) => `<div class="lang">${multi ? `<textarea data-path="${p}.${l}" rows="3">${esc(val(p + '.' + l))}</textarea>` : `<input type="text" data-path="${p}.${l}" value="${esc(val(p + '.' + l))}">`}<span>${l === 'en' ? 'EN' : 'ΕΛ'}</span></div>`).join('')}</div>`);
  const check = (p, label) => `<label class="check"><input type="checkbox" data-path="${p}" ${val(p) ? 'checked' : ''}>${esc(label)}</label>`;
  const sel = (p, label, opts) => fld(label, `<select data-path="${p}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(val(p)) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`);
  const imgPick = (p, label, removable) => fld(label, `<div class="pick">${val(p) ? `<img src="${esc(src(val(p)))}" alt="">` : '<span class="noimg">No photo</span>'}<button type="button" class="b b-sm" data-act="pick" data-path="${p}">${val(p) ? 'Change' : 'Choose'} photo</button>${removable && val(p) ? `<button type="button" class="b b-sm b-danger" data-act="clear" data-path="${p}">Remove</button>` : ''}</div>`);
  const itemHead = (listPath, i, len, title) => `<div class="item-head"><span class="grow">${esc(title)}</span>
    <button type="button" class="b b-sm b-icon" data-act="move" data-path="${listPath}" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
    <button type="button" class="b b-sm b-icon" data-act="move" data-path="${listPath}" data-i="${i}" data-d="1" ${i === len - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
    <button type="button" class="b b-sm b-danger" data-act="del" data-path="${listPath}" data-i="${i}">Remove</button></div>`;
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
        ${imgPick('heroImage', 'Photo')}</div>
      <div class="card"><h2>Hero text</h2>
        ${check('heroText', 'Show the headline and button on top of the video')}
        ${pair('text.heroTitle', 'Headline (first line)')}
        ${pair('text.heroAccent', 'Headline (accent line)')}
        ${pair('text.heroSub', 'Short line under the headline', true)}</div>`;
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
      <div class="card"><h2>Technical specifications</h2><p class="hint">Leave a value empty to show “On request”. Only enter values you have checked.</p>
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
    return `<div class="card"><h2>Why choose us</h2>
        <div class="list">${v.map((x, i) => `<div class="item">${itemHead('values', i, v.length, x.title?.en || 'Item ' + (i + 1))}<div class="row">${sel(`values.${i}.icon`, 'Icon', ICONS.map((k) => [k, k]))}</div>${pair(`values.${i}.title`, 'Title')}${pair(`values.${i}.body`, 'Text', true)}</div>`).join('')}</div>${addBtn('values', 'value', 'Add item')}</div>
      <div class="card"><h2>Numbers (optional)</h2><p class="hint">Shown in the hero under the buttons, e.g. “15+” Years of experience. Use real numbers only. Hidden when empty.</p>
        <div class="list">${st.map((x, i) => `<div class="item">${itemHead('stats', i, st.length, x.value || 'Number ' + (i + 1))}${txt(`stats.${i}.value`, 'Number', 'text', '15+')}${pair(`stats.${i}.label`, 'Label')}</div>`).join('') || '<p class="empty">No numbers. The section is hidden.</p>'}</div>${addBtn('stats', 'stat', 'Add number')}</div>
      <div class="card"><h2>Client reviews (optional)</h2><p class="hint">Only add real reviews with the client’s permission. Hidden when empty.</p>
        <div class="list">${ts.map((x, i) => `<div class="item">${itemHead('testimonials', i, ts.length, x.name || 'Review ' + (i + 1))}${txt(`testimonials.${i}.name`, 'Client name')}${pair(`testimonials.${i}.role`, 'Role or place (optional)')}${pair(`testimonials.${i}.quote`, 'Review', true)}</div>`).join('') || '<p class="empty">No reviews. The section is hidden.</p>'}</div>${addBtn('testimonials', 'testimonial', 'Add review')}</div>`;
  }
  function vInbox() {
    if (!quotes) { loadQuotes(); return '<div class="card"><p class="muted">Loading…</p></div>'; }
    const fmt = (ts) => new Date(ts).toLocaleString();
    const wa = (ph) => 'https://wa.me/' + String(ph || '').replace(/\D/g, '').replace(/^00/, '');
    return `<div class="card"><div class="item-head"><h2 class="grow">Quote requests (${quotes.length})</h2><button type="button" class="b b-sm" data-act="reload-q">Refresh</button></div>
      <p class="hint">Requests sent from the form on the website. They are kept for about a year.</p>
      <div class="list">${quotes.map((q) => `<div class="q"><div class="q-top"><b>${esc(q.name)}</b>${q.system ? `<span class="tag">${esc(q.system)}</span>` : ''}<time>${esc(fmt(q.ts))}</time></div>
        <dl><dt>Phone</dt><dd>${esc(q.phone)}</dd>${q.email ? `<dt>Email</dt><dd>${esc(q.email)}</dd>` : ''}${q.area ? `<dt>Area</dt><dd>${esc(q.area)}</dd>` : ''}${q.message ? `<dt>Message</dt><dd>${esc(q.message)}</dd>` : ''}${q.lang ? `<dt>Language</dt><dd>${q.lang === 'el' ? 'Greek' : 'English'}</dd>` : ''}</dl>
        <div class="acts"><a class="b b-sm" href="tel:${esc(q.phone)}">Call</a><a class="b b-sm" href="${esc(wa(q.phone))}" target="_blank" rel="noopener">WhatsApp</a>${q.email ? `<a class="b b-sm" href="mailto:${esc(q.email)}">Email</a>` : ''}<button type="button" class="b b-sm b-danger" data-act="q-del" data-key="${esc(q.key)}">Delete</button></div></div>`).join('') || '<p class="empty">No requests yet.</p>'}</div></div>`;
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
    app.innerHTML = `<div class="top"><div class="top-in"><img src="/img/logo-light.png" alt=""><span class="title">Website admin</span><span class="state" id="state">All changes saved</span><span class="sp"></span>
        <a class="b b-sm hide-m" href="/" target="_blank" rel="noopener">View website</a>
        <button type="button" class="b b-sm prev-toggle" data-act="prev-toggle">Preview</button>
        <button type="button" class="b b-acc" data-act="save" id="save">Save</button></div></div>
      <nav class="tabs" id="tabs" aria-label="Sections"></nav>
      <div class="main" id="main"><div class="editor" id="editor"></div>
        <aside class="preview" id="preview" aria-label="Preview"><div class="preview-bar"><span>Live preview</span><span class="sp"></span><div class="pv-mode" role="group" aria-label="Preview size"><button type="button" data-act="pv-mode" data-m="desk" aria-pressed="${pvMode === 'desk'}">Desktop</button><button type="button" data-act="pv-mode" data-m="mob" aria-pressed="${pvMode === 'mob'}">Mobile</button></div><button type="button" class="b b-sm prev-toggle" data-act="prev-toggle">Close</button></div><div class="pv-wrap" id="pv-wrap"><iframe id="pv" src="/?preview=1" title="Website preview"></iframe></div></aside></div>`;
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
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(([k, l]) => `<button type="button" data-act="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${esc(l)}${k === 'inbox' && quoteCount ? `<span class="badge">${quoteCount}</span>` : ''}</button>`).join('');
  }
  function renderEditor() {
    const views = { design: vDesign, company: vCompany, hero: vHero, systems: vSystems, content: vContent, inbox: vInbox, media: vMedia, account: vAccount };
    const y = scrollY;
    $('#editor').innerHTML = views[tab]();
    $('#main').classList.toggle('no-prev', tab === 'inbox' || tab === 'media' || tab === 'account');
    requestAnimationFrame(fitPreview);
    scrollTo(0, y);
  }

  /* ---------- data actions ---------- */
  async function loadQuotes() {
    try {
      const j = await api('/api/admin/quotes');
      quotes = j.items || [];
      quoteCount = quotes.length;
      renderTabs();
      if (tab === 'inbox') renderEditor();
    } catch (e) { toast(e.message, 'err'); }
  }
  async function save() {
    const b = $('#save');
    b.disabled = true;
    b.textContent = 'Saving…';
    try {
      await api('/api/admin/site', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(site) });
      dirty = false;
      const s = $('#state');
      s.textContent = 'All changes saved';
      s.classList.remove('dirty');
      toast('Saved. The live website is updated.', 'ok');
    } catch (e) {
      toast('Not saved: ' + e.message, 'err');
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
    const p = el.dataset && el.dataset.path;
    if (!p || !site) return;
    let v;
    if (el.type === 'checkbox') v = el.checked;
    else if ('numlist' in el.dataset) v = el.value.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 12);
    else if ('color' in el.dataset) { if (!/^#[0-9a-f]{6}$/i.test(el.value)) return; v = el.value.toLowerCase(); }
    else v = el.value;
    if (p.endsWith('.slug')) { v = String(v).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+/, '').slice(0, 60); }
    setP(site, p, v);
    if (p.startsWith('theme.')) $$(`[data-path="${p}"]`).forEach((x) => { if (x !== el) x.value = v; });
    markDirty();
    if (el.type === 'checkbox' && tab === 'systems' && editIdx == null) renderEditor();
  });
  document.addEventListener('change', (e) => {
    const p = e.target.dataset && e.target.dataset.path;
    if (p && p.endsWith('.slug')) { const s = site.systems[editIdx]; if (s && !s.slug) s.slug = 'system-' + (editIdx + 1); renderEditor(); }
  });

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !site) return;
    const act = b.dataset.act, p = b.dataset.path;
    switch (act) {
      case 'tab':
        tab = b.dataset.tab;
        editIdx = null;
        renderTabs();
        renderEditor();
        scrollTo(0, 0);
        if (tab === 'inbox') loadQuotes();
        previewGo(tab === 'systems' ? 'systems' : tab === 'content' ? 'why' : 'top');
        break;
      case 'save': save(); break;
      case 'prev-toggle': $('#preview').classList.toggle('show'); requestAnimationFrame(fitPreview); break;
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
      case 'back-sys': editIdx = null; renderEditor(); previewGo('systems'); break;
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
    if (e.origin === location.origin && e.data && e.data.type === 'preview-ready') { previewReady = true; sendPreview(); }
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
    shell();
    loadQuotes();
  }
  boot();
})();
