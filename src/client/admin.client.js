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
  let chats = null, chatCur = null, chatUnread = 0, pendRev = null, pendCount = 0;
  let dirty = false, tab = 'works', editIdx = null, editWork = null, quotes = null, quoteCount = 0, previewReady = false;

  const TABS = [['works', 'Latest work'], ['messages', 'Messages'], ['inbox', 'Quote requests'], ['reviews', 'Reviews'], ['hero', 'Hero'], ['company', 'Company & About'], ['systems', 'Systems'], ['content', 'Key points & numbers'], ['design', 'Colours'], ['media', 'Images & files'], ['account', 'Password']];
  // the ⋮ menu: every part of the website under its own heading
  const MENU = [
    ['Your work', [['works', 'Latest work', 'Add photos of finished jobs'], ['cats', 'Gallery categories', 'Sliding, Windows, Doors…']]],
    ['Customers', [['messages', 'Messages', 'Price questions and replies'], ['inbox', 'Quote requests', 'Requests from the quote form'], ['reviews', 'Reviews', 'Approve and manage customer reviews']]],
    ['Website pages', [['content', 'Key points & numbers', 'About points and counters'], ['hero', 'Hero', 'Top photo or video and headline'], ['company', 'Company & About', 'Phone, address, About text, owner profile'], ['systems', 'Systems', 'Your nine product categories']]],
    ['Look & files', [['design', 'Colours', 'Website colours'], ['media', 'Images & files', 'All uploaded photos, videos and PDFs']]],
    ['Account', [['account', 'Password', 'Change the admin password']]],
  ];
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
        </div>`).join('') || '<p class="empty">No work yet. The gallery is hidden until you add one.</p>'}</div></div>
      <div class="card" id="cats-card"><h2>Gallery categories</h2><p class="hint">The filter buttons above the gallery. A category shows on the website once at least one work uses it.</p>
        <div class="list">${C.map((c, i) => `<div class="item">${itemHead('galleryCats', i, C.length, c.name?.en || 'Category ' + (i + 1))}${pair(`galleryCats.${i}.name`, 'Name')}</div>`).join('') || '<p class="empty">No categories.</p>'}</div>
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
  function threadMsgs(th) {
    return th.msgs.map((m) => `<div class="tmsg ${m.from === 'admin' ? 'me' : 'them'}">${m.ref ? `<div class="tref">${m.ref.img ? `<img src="${esc(src(m.ref.img))}" alt="">` : ''}<span><small>Asked about this ${m.ref.type === 'system' ? 'system' : 'work'}</small><b>${esc(m.ref.title)}</b></span></div>` : ''}<p>${esc(m.text)}</p><time>${esc(new Date(m.ts).toLocaleString())}</time></div>`).join('');
  }
  function vMessages() {
    if (chatCur) {
      const th = chatCur;
      return `<div class="crumb"><button type="button" class="b b-sm" data-act="back-chat">← All messages</button><h2>${esc(th.name)} <small class="muted">${esc(th.phone)}</small></h2></div>
        <div class="card"><div class="thread" id="thread-msgs">${threadMsgs(th)}</div>
          <form id="reply-form" class="list"><textarea id="reply-t" rows="3" maxlength="1000" placeholder="Write your reply. The customer sees it on the website."></textarea>
            <div class="pick"><button type="submit" class="b b-pri">Send reply</button><a class="b b-sm" href="tel:${esc(th.phone)}">Call</a><a class="b b-sm" href="https://wa.me/${esc(waNum(th.phone))}" target="_blank" rel="noopener">WhatsApp</a><span style="flex:1"></span><button type="button" class="b b-sm b-danger" data-act="del-chat" data-id="${esc(th.id)}">Delete</button></div></form>
          <p class="hint" style="margin:0">The customer sees your reply when they open the website again. For a fast answer, call or use WhatsApp as well.</p></div>`;
    }
    if (!chats) { loadChats(); return '<div class="card"><p class="muted">Loading…</p></div>'; }
    return `<div class="card"><div class="item-head"><h2 class="grow">Messages (${chats.length})</h2><button type="button" class="b b-sm" data-act="reload-chats">Refresh</button></div>
      <p class="hint">Questions sent from “Ask the price” and “Ask a question” on the website. New ones are marked.</p>
      <div class="list">${chats.map((c) => `<button type="button" class="chat-row${c.ua ? ' unread' : ''}" data-act="open-chat" data-id="${esc(c.id)}"><span class="av">${esc((c.name || '?').trim().charAt(0).toUpperCase())}</span><span class="grow"><b>${esc(c.name)}</b><small>${esc(c.phone)}</small><em>${c.from === 'admin' ? 'You: ' : ''}${esc(c.last)}</em></span><span class="meta"><time>${esc(ago(c.updated))}</time>${c.ua ? `<span class="badge">${c.ua}</span>` : ''}</span></button>`).join('') || '<p class="empty">No messages yet.</p>'}</div></div>`;
  }
  /* ---------- reviews ---------- */
  function vReviews() {
    if (!pendRev) loadReviews();
    const P = pendRev || [], L = site.reviews;
    return `<div class="card"><div class="item-head"><h2 class="grow">Waiting for approval (${P.length})</h2><button type="button" class="b b-sm" data-act="reload-rev">Refresh</button></div>
        <p class="hint">Reviews sent from the website. Nothing is shown publicly until you approve it. Approving also saves your other unsaved changes.</p>
        <div class="list">${P.map((r) => `<div class="q"><div class="q-top"><b>${esc(r.name)}</b><span class="rstars">${stars(+r.rating || 5)}</span><time>${esc(new Date(r.ts).toLocaleDateString())}</time></div>${r.place ? `<div class="muted">${esc(r.place)}</div>` : ''}<p style="margin:4px 0;white-space:pre-line">${esc(r.text)}</p><div class="acts"><button type="button" class="b b-sm b-pri" data-act="rev-ok" data-id="${esc(r.id)}">Approve & publish</button><button type="button" class="b b-sm b-danger" data-act="rev-no" data-id="${esc(r.id)}">Delete</button></div></div>`).join('') || `<p class="empty">${pendRev ? 'No reviews waiting.' : 'Loading…'}</p>`}</div></div>
      <div class="card"><h2>Published reviews (${L.length})</h2><p class="hint">Shown on the website with the average rating. Only add reviews from real customers.</p>
        <div class="list">${L.map((r, i) => `<div class="item">${itemHead('reviews', i, L.length, (r.name || 'Review ' + (i + 1)) + '  ' + stars(+r.rating || 5))}<div class="row">${txt(`reviews.${i}.name`, 'Customer name')}${txt(`reviews.${i}.place`, 'Area / city (optional)')}${sel(`reviews.${i}.rating`, 'Rating', [5, 4, 3, 2, 1].map((n) => [n, stars(n)]))}</div>${area(`reviews.${i}.text`, 'Review')}</div>`).join('') || '<p class="empty">No published reviews yet.</p>'}</div>
        ${addBtn('reviews', 'review', 'Add a review yourself')}</div>`;
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
        <button type="button" class="b b-acc" data-act="save" id="save">Save</button>
        <button type="button" class="b b-icon menu-btn" data-act="menu" aria-expanded="false" aria-controls="amenu" aria-label="Menu">⋮</button></div>
        <div class="amenu" id="amenu" hidden></div></div>
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
  function renderMenu() {
    const m = $('#amenu');
    if (!m) return;
    m.innerHTML = MENU.map(([head, items]) => `<div class="amenu-g"><p>${esc(head)}</p>${items.map(([k, l, d]) => `<button type="button" data-act="goto" data-tab="${k}" class="${(k === 'cats' ? 'works' : k) === tab && k !== 'cats' ? 'on' : ''}"><b>${esc(l)}${k === 'inbox' && quoteCount ? ` <span class="badge">${quoteCount}</span>` : ''}${k === 'messages' && chatUnread ? ` <span class="badge">${chatUnread}</span>` : ''}${k === 'reviews' && pendCount ? ` <span class="badge">${pendCount}</span>` : ''}</b><small>${esc(d)}</small></button>`).join('')}</div>`).join('')
      + `<div class="amenu-g"><p>More</p><a href="/" target="_blank" rel="noopener"><b>View website</b><small>Opens in a new tab</small></a><button type="button" data-act="logout"><b>Sign out</b><small></small></button></div>`;
  }
  function setMenu(open) {
    const m = $('#amenu'), b = $('.menu-btn');
    if (!m) return;
    if (open) renderMenu();
    m.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
  }
  function goTab(k) {
    const toCats = k === 'cats';
    tab = toCats ? 'works' : k;
    editIdx = null;
    editWork = null;
    chatCur = null;
    renderTabs();
    renderEditor();
    scrollTo(0, 0);
    if (toCats) requestAnimationFrame(() => { const c = $('#cats-card'); if (c) c.scrollIntoView({ block: 'start' }); });
    if (tab === 'inbox') loadQuotes();
    if (tab === 'messages') loadChats();
    if (tab === 'reviews') loadReviews();
    previewGo(tab === 'reviews' ? 'reviews' : tab === 'systems' ? 'systems' : tab === 'works' ? 'projects' : tab === 'content' || tab === 'company' ? 'about' : 'top');
    const on = $('#tabs .on');
    if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(([k, l]) => `<button type="button" data-act="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}">${esc(l)}${k === 'inbox' && quoteCount ? `<span class="badge">${quoteCount}</span>` : ''}${k === 'messages' && chatUnread ? `<span class="badge">${chatUnread}</span>` : ''}${k === 'reviews' && pendCount ? `<span class="badge">${pendCount}</span>` : ''}</button>`).join('');
    document.title = (chatUnread ? '(' + chatUnread + ') ' : '') + 'Admin · Alu MRK TriEdge';
  }
  function renderEditor() {
    const views = { design: vDesign, company: vCompany, hero: vHero, systems: vSystems, works: vWorks, messages: vMessages, reviews: vReviews, content: vContent, inbox: vInbox, media: vMedia, account: vAccount };
    const y = scrollY;
    $('#editor').innerHTML = views[tab]();
    $('#main').classList.toggle('no-prev', tab === 'inbox' || tab === 'media' || tab === 'account' || tab === 'messages');
    if (tab === 'messages' && chatCur) { const t = $('#thread-msgs'); if (t) t.scrollTop = t.scrollHeight; }
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
  async function loadChats(quiet) {
    try {
      const j = await api('/api/admin/chats');
      const before = chatUnread;
      chats = j.items || [];
      chatUnread = chats.reduce((a, c) => a + (c.ua || 0), 0);
      pendCount = j.pendingReviews || 0;
      renderTabs();
      if (tab === 'messages' && !chatCur) renderEditor();
      if (quiet && chatUnread > before) toast('New message from a customer.', 'ok');
      if (chatCur) {
        const row = chats.find((c) => c.id === chatCur.id);
        if (row && row.n > chatCur.msgs.length) openChat(chatCur.id, true);
      }
    } catch (e) { if (!quiet) toast(e.message, 'err'); }
  }
  async function openChat(id, keepText) {
    try {
      const j = await api('/api/admin/chats/' + id);
      const typed = keepText && $('#reply-t') ? $('#reply-t').value : '';
      chatCur = j.thread;
      if (chats) { const row = chats.find((c) => c.id === id); if (row) row.ua = 0; chatUnread = chats.reduce((a, c) => a + (c.ua || 0), 0); }
      renderTabs();
      if (tab === 'messages') { renderEditor(); if (typed && $('#reply-t')) $('#reply-t').value = typed; }
    } catch (e) { toast(e.message, 'err'); }
  }
  async function loadReviews() {
    try {
      const j = await api('/api/admin/reviews');
      pendRev = j.items || [];
      pendCount = pendRev.length;
      renderTabs();
      if (tab === 'reviews') renderEditor();
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
    if ((!b || b.dataset.act !== 'menu') && $('#amenu') && !$('#amenu').hidden && !e.target.closest('#amenu')) setMenu(false);
    if (!b || !site) return;
    const act = b.dataset.act, p = b.dataset.path;
    switch (act) {
      case 'tab':
      case 'goto':
        setMenu(false);
        goTab(b.dataset.tab);
        break;
      case 'menu': setMenu($('#amenu').hidden); break;
      case 'open-chat': await openChat(b.dataset.id); scrollTo(0, 0); break;
      case 'back-chat': chatCur = null; renderEditor(); loadChats(true); break;
      case 'reload-chats': chats = null; renderEditor(); break;
      case 'del-chat': {
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Sure?'; break; }
        try { await api('/api/admin/chats/' + b.dataset.id, { method: 'DELETE' }); chatCur = null; chats = null; renderEditor(); toast('Conversation deleted.', 'ok'); } catch (err) { toast(err.message, 'err'); }
        break;
      }
      case 'reload-rev': pendRev = null; renderEditor(); break;
      case 'rev-ok': {
        const r = (pendRev || []).find((x) => x.id === b.dataset.id);
        if (!r) break;
        b.disabled = true;
        site.reviews.unshift({ id: r.id, name: r.name, place: r.place || '', rating: +r.rating || 5, text: r.text, ts: r.ts });
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
    if (e.target.id === 'reply-form') {
      e.preventDefault();
      const ta = $('#reply-t'), text = ta.value.trim(), btn = e.target.querySelector('button[type=submit]');
      if (!text || !chatCur) return;
      btn.disabled = true;
      try {
        const j = await api('/api/admin/chats/' + chatCur.id, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
        chatCur = j.thread;
        renderEditor();
        toast('Reply sent.', 'ok');
      } catch (err) { toast(err.message, 'err'); btn.disabled = false; }
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
    if (!Array.isArray(site.works)) site.works = clone(defaults.works || []);
    if (!Array.isArray(site.galleryCats)) site.galleryCats = clone(defaults.galleryCats || []);
    if (!Array.isArray(site.reviews)) site.reviews = [];
    if (!site.heroBadge) site.heroBadge = { en: '', el: '' };
    shell();
    loadQuotes();
    loadChats(true);
    clearInterval(pollT);
    pollT = setInterval(() => { if (!document.hidden && site) loadChats(true); }, 20000);
  }
  let pollT = null;
  boot();
})();
