/* Alu MRK TriEdge — public site script. Renders everything from window.SITE (saved by the admin panel). */
(() => {
  'use strict';
  let S = window.SITE;
  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 900px)').matches;

  let lang = '';
  try { lang = localStorage.getItem('lang') || ''; } catch (e) {}
  if (lang !== 'en' && lang !== 'el') lang = (navigator.language || '').toLowerCase().startsWith('el') ? 'el' : 'en';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] || o.en || '');
  const src = (p) => (!p ? '' : /^https?:\/\//.test(p) ? p : '/' + String(p).replace(/^\//, ''));
  const pad = (n) => String(n).padStart(2, '0');
  const digits = (s) => String(s || '').replace(/\D/g, '');

  const UI = {
    en: {
      systems: 'Systems', engineering: 'Engineering', about: 'About', contact: 'Contact', quote: 'Request a quote', menu: 'Menu',
      m_systems: 'Aluminium Systems', m_engineering: 'Engineering & Quality', m_about: 'About Us', m_contact: 'Contact', our_systems: 'Our systems',
      hero_eyebrow: 'Aluminium & glass systems · Cyprus', explore_systems: 'Explore systems', scroll: 'Scroll',
      about_eyebrow: 'About us', survey: 'Book a free site survey', systems_eyebrow: 'Aluminium systems', explore: 'Explore system',
      all_systems: 'All systems', system_n: 'System {n} / {t}', overview: 'Overview', features: 'Features', specs: 'Specifications',
      config: 'Configurator', gallery: 'Gallery', related: 'Related systems', applications: 'Applications',
      on_request: 'On request', specs_note: 'Values depend on the size and design of each project. Ask us for the technical sheet.',
      consult: 'Request technical consultation', brochure: 'Download brochure', whatsapp: 'WhatsApp',
      panels: 'Panels', leaves: 'Leaves', sashes: 'Sashes', columns: 'Columns', rows: 'Rows', open: 'Opening', type: 'Type',
      sliding: 'Sliding', casement: 'Casement', single: 'Single', double: 'Double',
      clear_opening: 'Clear opening', glass_panes: 'Glass panes', front: 'Front view', plan: 'Plan view', motor: 'Motor',
      illustrative: 'Illustration only. We design the final configuration around your opening.',
      cta_title: 'Need advice for your project?', cta_body: 'Send us your sizes or drawings and we will suggest the right system.',
      eng_eyebrow: 'Engineering', eng_title: 'Quality you can’t see, but will feel.', eng_body: 'A section through a thermal-break aluminium window. Tap a part to see what it does.',
      exterior: 'EXTERIOR', interior: 'INTERIOR',
      why_eyebrow: 'Why choose us', why_title: 'Precision from survey to installation.',
      tst_eyebrow: 'Clients', tst_title: 'What our clients say',
      quote_eyebrow: 'Contact', quote_title: 'Request a quote', quote_body: 'Tell us about your project. We will contact you to arrange a free site survey.',
      form_title: 'Project details', name: 'Name', phone: 'Phone', email: 'Email', area: 'Area / city', system: 'System', other: 'Other / not sure',
      message: 'Message', msg_ph: 'Sizes, number of openings, timeline…', send: 'Send request', sending: 'Sending…',
      sent: 'Thank you. Your request has been sent. We will contact you soon.', send_err: 'Could not send. Please call or message us on WhatsApp.',
      required: 'Please add your name and phone number.', or_wa: 'Send on WhatsApp',
      address: 'Address', hours: 'Opening hours', rights: 'All rights reserved.', company: 'Company', close: 'Close', zoom: 'Tap to zoom',
      wa_hello: 'Hello {c}, I would like a quote.', wa_system: 'Hello {c}, I am interested in {s}.',
    },
    el: {
      systems: 'Συστήματα', engineering: 'Τεχνολογία', about: 'Εταιρεία', contact: 'Επικοινωνία', quote: 'Ζητήστε προσφορά', menu: 'Μενού',
      m_systems: 'Συστήματα αλουμινίου', m_engineering: 'Τεχνολογία & ποιότητα', m_about: 'Η εταιρεία', m_contact: 'Επικοινωνία', our_systems: 'Τα συστήματά μας',
      hero_eyebrow: 'Συστήματα αλουμινίου & γυαλιού · Κύπρος', explore_systems: 'Δείτε τα συστήματα', scroll: 'Κύλιση',
      about_eyebrow: 'Η εταιρεία', survey: 'Κλείστε δωρεάν αυτοψία', systems_eyebrow: 'Συστήματα αλουμινίου', explore: 'Δείτε το σύστημα',
      all_systems: 'Όλα τα συστήματα', system_n: 'Σύστημα {n} / {t}', overview: 'Επισκόπηση', features: 'Χαρακτηριστικά', specs: 'Τεχνικά στοιχεία',
      config: 'Διαμόρφωση', gallery: 'Φωτογραφίες', related: 'Σχετικά συστήματα', applications: 'Εφαρμογές',
      on_request: 'Κατόπιν αιτήματος', specs_note: 'Οι τιμές εξαρτώνται από το μέγεθος και τον σχεδιασμό κάθε έργου. Ζητήστε μας το τεχνικό φυλλάδιο.',
      consult: 'Ζητήστε τεχνική συμβουλή', brochure: 'Λήψη φυλλαδίου', whatsapp: 'WhatsApp',
      panels: 'Φύλλα', leaves: 'Φύλλα', sashes: 'Φύλλα', columns: 'Στήλες', rows: 'Σειρές', open: 'Άνοιγμα', type: 'Τύπος',
      sliding: 'Συρόμενο', casement: 'Ανοιγόμενο', single: 'Μονόφυλλη', double: 'Δίφυλλη',
      clear_opening: 'Ελεύθερο άνοιγμα', glass_panes: 'Υαλοπίνακες', front: 'Όψη', plan: 'Κάτοψη', motor: 'Μοτέρ',
      illustrative: 'Ενδεικτική απεικόνιση. Την τελική διαμόρφωση τη σχεδιάζουμε για το δικό σας άνοιγμα.',
      cta_title: 'Χρειάζεστε συμβουλή για το έργο σας;', cta_body: 'Στείλτε μας διαστάσεις ή σχέδια και θα σας προτείνουμε το κατάλληλο σύστημα.',
      eng_eyebrow: 'Τεχνολογία', eng_title: 'Ποιότητα που δεν φαίνεται, αλλά νιώθεται.', eng_body: 'Τομή παραθύρου αλουμινίου με θερμοδιακοπή. Πατήστε ένα μέρος για να δείτε τι κάνει.',
      exterior: 'ΕΞΩΤΕΡΙΚΟ', interior: 'ΕΣΩΤΕΡΙΚΟ',
      why_eyebrow: 'Γιατί εμάς', why_title: 'Ακρίβεια από την αυτοψία ως την τοποθέτηση.',
      tst_eyebrow: 'Πελάτες', tst_title: 'Τι λένε οι πελάτες μας',
      quote_eyebrow: 'Επικοινωνία', quote_title: 'Ζητήστε προσφορά', quote_body: 'Πείτε μας για το έργο σας. Θα επικοινωνήσουμε μαζί σας για δωρεάν αυτοψία.',
      form_title: 'Στοιχεία έργου', name: 'Όνομα', phone: 'Τηλέφωνο', email: 'Email', area: 'Περιοχή / πόλη', system: 'Σύστημα', other: 'Άλλο / δεν είμαι σίγουρος',
      message: 'Μήνυμα', msg_ph: 'Διαστάσεις, αριθμός ανοιγμάτων, χρονοδιάγραμμα…', send: 'Αποστολή αιτήματος', sending: 'Αποστολή…',
      sent: 'Ευχαριστούμε. Το αίτημά σας στάλθηκε. Θα επικοινωνήσουμε σύντομα μαζί σας.', send_err: 'Η αποστολή απέτυχε. Καλέστε μας ή στείλτε μήνυμα στο WhatsApp.',
      required: 'Συμπληρώστε όνομα και τηλέφωνο.', or_wa: 'Αποστολή στο WhatsApp',
      address: 'Διεύθυνση', hours: 'Ωράριο', rights: 'Με επιφύλαξη παντός δικαιώματος.', company: 'Εταιρεία', close: 'Κλείσιμο', zoom: 'Πατήστε για μεγέθυνση',
      wa_hello: 'Γεια σας, θα ήθελα μια προσφορά.', wa_system: 'Γεια σας, ενδιαφέρομαι για: {s}.',
    },
  };
  const u = (k, v) => {
    let s = (UI[lang] && UI[lang][k]) || UI.en[k] || k;
    if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  };

  const ICONS = {
    motor: '<circle cx="12" cy="12" r="9"/><path d="M13 6l-4 7h4l-2 5"/>',
    remote: '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="8" r="2"/><path d="M10 14h4M10 17h4"/>',
    maximize: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    thermo: '<path d="M10 4a2 2 0 1 1 4 0v10a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    building: '<rect x="4" y="3" width="16" height="18"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>',
    fold: '<path d="M3 5l5 3v11l-5-3zM8 8l5-3v11l-5 3zM13 5l5 3v11l-5-3z"/>',
    arrowsV: '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
    arrowsH: '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',
    grid: '<rect x="3" y="3" width="18" height="18"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-1.9-.4-1.1.3-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    phone: '<path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.sparkle}</svg>`;
  const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';

  const sys = () => (S.systems || []).filter((s) => s.visible !== false);
  const bySlug = (sl) => sys().find((s) => s.slug === sl);
  const waLink = (msg) => {
    const n = digits(S.company.whatsapp || S.company.phone);
    return n ? `https://wa.me/${n}${msg ? '?text=' + encodeURIComponent(msg) : ''}` : '';
  };
  const telLink = () => (S.company.phone ? 'tel:+' + digits(S.company.phone).replace(/^00/, '') : '');

  /* ---------- sections ---------- */
  function header() {
    const c = S.company;
    const list = sys();
    return `<header class="hdr" id="hdr">
      <div class="wrap nav">
        <a class="brand" href="#top" aria-label="${esc(c.name)}"><img class="logo-l" src="/img/logo-light.png" alt="${esc(c.name)}" width="98" height="46"><img class="logo-d" src="/img/logo-dark.png" alt="" width="98" height="46"></a>
        <nav class="links" aria-label="Main">
          <a href="#systems">${u('systems')}</a><a href="#engineering">${u('engineering')}</a><a href="#about">${u('about')}</a><a href="#quote">${u('contact')}</a>
        </nav>
        <div class="lang" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button><button type="button" data-lang="el" aria-pressed="${lang === 'el'}">ΕΛ</button></div>
        <a class="btn btn-accent nav-cta" href="#quote">${u('quote')}</a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="mnav" aria-label="${u('menu')}"><i><b></b><b></b></i></button>
      </div>
    </header>
    <div class="mnav" id="mnav" aria-hidden="true"><div class="mnav-in">
      <p class="mnav-label">${u('menu')}</p>
      <ul class="mnav-main">
        <li><a href="#systems"><span>${u('m_systems')}</span>${icon('arrow')}</a></li>
        <li><a href="#engineering"><span>${u('m_engineering')}</span>${icon('arrow')}</a></li>
        <li><a href="#about"><span>${u('m_about')}</span>${icon('arrow')}</a></li>
        <li><a href="#quote"><span>${u('m_contact')}</span>${icon('arrow')}</a></li>
      </ul>
      ${list.length ? `<p class="mnav-label">${u('our_systems')}</p><ul class="mnav-sys">${list.map((s, i) => `<li><a href="#${esc(s.slug)}"><small>${pad(i + 1)}</small><span>${esc(t(s.name))}</span></a></li>`).join('')}</ul>` : ''}
      <div class="mnav-cta"><a class="btn btn-accent" href="#quote">${u('quote')}${icon('arrow')}</a>${waLink() ? `<a class="btn btn-wa" href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener">${WA_SVG.replace('<svg', '<svg class="ic"')}WhatsApp</a>` : ''}</div>
      <div class="mnav-foot">
        ${c.phone ? `<a href="${telLink()}">${icon('phone')}<span>${esc(c.phone)}</span></a>` : ''}
        ${c.email ? `<a href="mailto:${esc(c.email)}">${icon('mail')}<span>${esc(c.email)}</span></a>` : ''}
      </div>
    </div></div>`;
  }

  function hero() {
    const img = S.heroImage || ((S.hero || [])[0] || {}).img || 'img/house-windows.jpg';
    const vid = S.heroVideo;
    const showText = S.heroText !== false;
    return `<section class="hero" id="top" aria-label="${esc(S.company.name)}">
      <div class="hero-media"><img class="${vid ? '' : 'drift'}" src="${esc(src(img))}" alt="" fetchpriority="high">${vid && !reduce ? `<video id="hero-video" src="${esc(src(vid))}" muted autoplay loop playsinline preload="auto" aria-hidden="true"></video>` : ''}</div>
      <div class="hero-shade${showText ? '' : ' light'}"></div>
      ${showText ? `<div class="wrap hero-in"><h1>${esc(t(S.text.heroTitle))}<span>${esc(t(S.text.heroAccent))}</span></h1><div class="hero-cta"><a class="btn btn-accent" href="#systems">${u('explore_systems')}${icon('arrow')}</a></div></div>` : ''}
    </section>`;
  }

  function about() {
    const stats = (S.stats || []).filter((s) => s.value);
    return `<section class="about" id="about"><div class="wrap">
      <div class="about-grid rv">
        <div><p class="eyebrow">${u('about_eyebrow')}</p><h2>${esc(t(S.text.introTitle))}</h2></div>
        <div><p class="lead">${esc(t(S.text.introBody))}</p><a class="arrow-link" href="#quote">${u('survey')}${icon('arrow')}</a></div>
      </div>
      ${stats.length ? `<div class="stats rv">${stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(t(s.label))}</span></div>`).join('')}</div>` : ''}
    </div></section>`;
  }

  function systemsIndex() {
    const list = sys();
    const total = pad(list.length);
    return `<section class="sx" id="systems"><div class="wrap">
      <div class="sx-head rv">
        <div><p class="eyebrow">${u('systems_eyebrow')}</p><h2>${esc(t(S.text.systemsTitle))}</h2></div>
        <p>${esc(t(S.text.systemsSub))}</p>
      </div>
      <div class="sx-body">
        <ol class="sx-list" id="sx-list">
          <li class="sx-track" aria-hidden="true"><span class="sx-roller"></span></li>
          ${list
            .map(
              (s, i) => `<li class="sx-item${i === 0 ? ' on' : ''}" data-i="${i}">
              <button type="button" class="sx-btn" data-slug="${esc(s.slug)}"><span class="sx-num">${pad(i + 1)}</span><span class="sx-name">${esc(t(s.name))}</span>${icon('arrow')}</button>
              <div class="sx-m"><div><div class="sx-m-in">
                <figure><img src="${esc(src(s.image))}" alt="${esc(t(s.name))}" loading="lazy"></figure>
                <p>${esc(t(s.short))}</p>
                <a class="arrow-link" href="#${esc(s.slug)}">${u('explore')}${icon('arrow')}</a>
              </div></div></div>
            </li>`
            )
            .join('')}
        </ol>
        <div class="sx-stage" id="sx-stage" aria-hidden="true">
          ${list.map((s, i) => `<figure class="sx-pane${i === 0 ? ' on' : ''}" data-i="${i}"><img src="${esc(src(s.image))}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}"></figure>`).join('')}
          <div class="sx-wipe"></div><div class="sx-frame"></div>
          <span class="sx-count" id="sx-count">01 / ${total}</span>
          <div class="sx-cap" id="sx-cap">${sxCap(list[0])}</div>
        </div>
      </div>
    </div></section>`;
  }
  function sxCap(s) {
    if (!s) return '';
    const tg = [s.motor ? u('motor') : '', ...(s.applications || []).slice(0, 2).map(t)].filter(Boolean);
    return `<h3>${esc(t(s.name))}</h3><p>${esc(t(s.short))}</p>${tg.length ? `<div class="tags">${tg.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}<a class="btn btn-accent" href="#${esc(s.slug)}" tabindex="-1">${u('explore')}${icon('arrow')}</a>`;
  }

  const PARTS = {
    en: [['Double glazing', 'Two panes with an insulating gap keep heat and noise out.'], ['EPDM seals', 'Rubber gaskets stop dust, wind and rain getting in.'], ['Thermal break', 'Polyamide strips separate the outside metal from the inside, so the frame stays cool in summer.'], ['Multi-chamber frame', 'Hollow chambers make the frame rigid and add insulation.'], ['Hidden drainage', 'Any water that gets in runs straight back outside.']],
    el: [['Διπλά τζάμια', 'Δύο υαλοπίνακες με μονωτικό κενό κρατούν έξω τη ζέστη και τον θόρυβο.'], ['Λάστιχα EPDM', 'Τα λάστιχα στεγάνωσης σταματούν σκόνη, αέρα και βροχή.'], ['Θερμοδιακοπή', 'Ράβδοι πολυαμιδίου χωρίζουν το εξωτερικό από το εσωτερικό μέταλλο, έτσι το πλαίσιο μένει δροσερό το καλοκαίρι.'], ['Πλαίσιο πολλαπλών θαλάμων', 'Οι θάλαμοι κάνουν το πλαίσιο άκαμπτο και προσθέτουν μόνωση.'], ['Κρυφή αποστράγγιση', 'Όποιο νερό μπει, βγαίνει αμέσως έξω.']],
  };
  function engineering() {
    const parts = PARTS[lang] || PARTS.en;
    return `<section class="eng" id="engineering"><div class="wrap">
      <div class="eng-head rv"><div><p class="eyebrow">${u('eng_eyebrow')}</p><h2>${u('eng_title')}</h2></div><p>${u('eng_body')}</p></div>
      <div class="eng-grid">
        <div class="drawing rv" id="drawing">
          <svg viewBox="0 0 460 360" role="img" aria-label="Thermal-break aluminium window section">
            <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#9aa3a8"/><line x1="0" y1="0" x2="0" y2="6" stroke="#7d878d" stroke-width="2"/></pattern></defs>
            <text class="d-txt" x="20" y="28">${u('exterior')}</text><text class="d-txt" x="440" y="28" text-anchor="end">${u('interior')}</text>
            <g class="part" data-p="1"><rect class="d-gas" x="196" y="40" width="40" height="150"/><rect class="d-glass" x="188" y="40" width="8" height="150"/><rect class="d-glass" x="236" y="40" width="8" height="150"/><rect class="d-spacer" x="196" y="172" width="40" height="18"/></g>
            <g class="part" data-p="2"><path class="d-gasket" d="M176 160h12v34h-12zM244 160h12v34h-12z"/><circle class="d-gasket" cx="158" cy="246" r="5"/><circle class="d-gasket" cx="292" cy="246" r="5"/></g>
            <g class="part" data-p="4"><path class="d-alu" d="M150 194h50v56h-50z"/><path class="d-void" d="M162 206h26v32h-26z"/><path class="d-alu" d="M232 194h70v56h-70z"/><path class="d-void" d="M244 206h20v32h-20zM270 206h20v32h-20z"/><path class="d-alu" d="M126 254h74v70h-74z"/><path class="d-void" d="M138 266h50v20h-50zM138 292h50v20h-50z"/><path class="d-alu" d="M232 254h92v70h-92z"/><path class="d-void" d="M244 266h30v46h-30zM280 266h32v46h-32z"/></g>
            <g class="part" data-p="3"><rect class="d-break" x="200" y="200" width="32" height="10"/><rect class="d-break" x="200" y="234" width="32" height="10"/><rect class="d-break" x="200" y="262" width="32" height="10"/><rect class="d-break" x="200" y="306" width="32" height="10"/></g>
            <g class="part" data-p="5"><rect class="d-void" x="140" y="320" width="16" height="6"/><path class="d-water" d="M148 300v44M141 337l7 8 7-8"/></g>
            ${[[1, 216, 90, 330, 70, 342, 68], [2, 250, 176, 330, 140, 342, 134], [3, 216, 239, 100, 200, 88, 196], [4, 300, 290, 390, 270, 402, 268], [5, 148, 336, 90, 320, 78, 318]]
              .map(([n, x1, y1, x2, y2, cx, cy]) => `<g class="part" data-p="${n}"><line class="d-lead" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="d-dot" cx="${cx}" cy="${cy}" r="12"/><text class="d-num" x="${cx}" y="${cy + 4}">${n}</text></g>`)
              .join('')}
          </svg>
        </div>
        <ul class="parts rv" id="parts">${parts.map((p, i) => `<li data-p="${i + 1}"><button type="button"><span class="num">${i + 1}</span><b>${esc(p[0])}</b><span>${esc(p[1])}</span></button></li>`).join('')}</ul>
      </div>
    </div></section>`;
  }

  function why() {
    const v = (S.values || []).filter((x) => t(x.title));
    if (!v.length) return '';
    return `<section class="why" id="why"><div class="wrap">
      <p class="eyebrow">${u('why_eyebrow')}</p><h2>${u('why_title')}</h2>
      <div class="why-grid rv">${v.map((x) => `<div class="why-item"><span class="tile">${icon(x.icon)}</span><h3>${esc(t(x.title))}</h3><p>${esc(t(x.body))}</p></div>`).join('')}</div>
    </div></section>`;
  }

  function testimonials() {
    const list = (S.testimonials || []).filter((x) => t(x.quote));
    if (!list.length) return '';
    return `<section class="tst"><div class="wrap">
      <p class="eyebrow">${u('tst_eyebrow')}</p>
      <div class="tst-grid rv">${list.map((x) => `<blockquote><p>“${esc(t(x.quote))}”</p><cite><b>${esc(x.name)}</b>${x.role ? ' · ' + esc(t(x.role)) : ''}</cite></blockquote>`).join('')}</div>
    </div></section>`;
  }

  function quote() {
    const c = S.company;
    const lines = [];
    if (c.phone) lines.push(`<a class="q-line" href="${telLink()}">${icon('phone')}<div><small>${u('phone')}</small><span>${esc(c.phone)}</span></div></a>`);
    if (waLink()) lines.push(`<a class="q-line" href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none">${WA_SVG.match(/<path[^>]*>/)[0]}</svg><div><small>WhatsApp</small><span>${esc(c.phone || '+' + digits(c.whatsapp))}</span></div></a>`);
    if (c.email) lines.push(`<a class="q-line" href="mailto:${esc(c.email)}">${icon('mail')}<div><small>${u('email')}</small><span>${esc(c.email)}</span></div></a>`);
    if (t(c.address)) lines.push(`<div class="q-line">${icon('pin')}<div><small>${u('address')}</small><span>${esc(t(c.address))}</span></div></div>`);
    if (t(c.hours)) lines.push(`<div class="q-line">${icon('clock')}<div><small>${u('hours')}</small><span>${esc(t(c.hours))}</span></div></div>`);
    return `<section class="quote" id="quote"><div class="wrap q-grid">
      <div class="rv"><p class="eyebrow">${u('quote_eyebrow')}</p><h2>${u('quote_title')}</h2><p class="lead">${u('quote_body')}</p><div class="q-lines">${lines.join('')}</div></div>
      <form class="q-form rv" id="qform" novalidate>
        <h3>${u('form_title')}</h3>
        <div class="q-row">
          <div class="f"><label for="q-name">${u('name')} *</label><input id="q-name" name="name" autocomplete="name" required maxlength="100"></div>
          <div class="f"><label for="q-phone">${u('phone')} *</label><input id="q-phone" name="phone" type="tel" autocomplete="tel" required maxlength="40"></div>
        </div>
        <div class="q-row">
          <div class="f"><label for="q-email">${u('email')}</label><input id="q-email" name="email" type="email" autocomplete="email" maxlength="120"></div>
          <div class="f"><label for="q-area">${u('area')}</label><input id="q-area" name="area" autocomplete="address-level2" maxlength="80"></div>
        </div>
        <div class="f"><label for="q-system">${u('system')}</label><select id="q-system" name="system">${sys().map((s) => `<option value="${esc(t(s.name))}" data-slug="${esc(s.slug)}">${esc(t(s.name))}</option>`).join('')}<option value="${esc(u('other'))}">${u('other')}</option></select></div>
        <div class="f"><label for="q-msg">${u('message')}</label><textarea id="q-msg" name="message" maxlength="2000" placeholder="${esc(u('msg_ph'))}"></textarea></div>
        <div class="hp" aria-hidden="true"><label for="q-web">Website</label><input id="q-web" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="q-actions">
          <button type="submit" class="btn btn-navy" id="q-send">${u('send')}${icon('arrow')}</button>
          ${waLink() ? `<a class="btn btn-wa" id="q-wa" href="${esc(waLink())}" target="_blank" rel="noopener">${WA_SVG.replace('<svg', '<svg class="ic"')}${u('or_wa')}</a>` : ''}
        </div>
        <p class="q-status" id="q-status" role="status" aria-live="polite"></p>
      </form>
    </div></section>`;
  }

  function footer() {
    const c = S.company;
    const soc = Object.entries(c.socials || {}).filter(([, v]) => v);
    return `<footer class="foot"><div class="wrap foot-top">
      <div class="foot-brand"><img src="/img/logo-light.png" alt="${esc(c.name)}" width="111" height="52"><p>${esc(t(S.text.tagline))}</p>
        ${soc.length ? `<div class="socials">${soc.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon(k)}</a>`).join('')}</div>` : ''}</div>
      <div><h4>${u('systems')}</h4><ul>${sys().map((s) => `<li><a href="#${esc(s.slug)}">${esc(t(s.name))}</a></li>`).join('')}</ul></div>
      <div><h4>${u('company')}</h4><ul><li><a href="#about">${u('about')}</a></li><li><a href="#engineering">${u('engineering')}</a></li><li><a href="#quote">${u('quote')}</a></li></ul></div>
      <div><h4>${u('contact')}</h4><ul>
        ${c.phone ? `<li><a href="${telLink()}">${esc(c.phone)}</a></li>` : ''}
        ${c.email ? `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${t(c.address) ? `<li style="white-space:pre-line">${esc(t(c.address))}</li>` : ''}
        ${t(c.hours) ? `<li style="white-space:pre-line">${esc(t(c.hours))}</li>` : ''}
      </ul></div>
    </div><div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(c.name)}. ${u('rights')}</span><span>${esc(t(S.text.tagline))}</span></div></footer>
    ${waLink() ? `<a class="fab" href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener" aria-label="WhatsApp">${WA_SVG}</a>` : ''}`;
  }

  /* ---------- system detail page ---------- */
  function systemPage(s) {
    const list = sys();
    const i = list.indexOf(s);
    const imgs = [s.image, ...(s.gallery || [])].filter(Boolean);
    const specs = (s.specs || []).filter((r) => t(r.label));
    const hasCfg = s.kind && s.kind !== 'none';
    const related = [1, 2, 3].map((k) => list[(i + k) % list.length]).filter((x, j, a) => x && x !== s && a.indexOf(x) === j);
    const tabs = [['sp-overview', u('overview')], specs.length ? ['sp-specs', u('specs')] : null, hasCfg ? ['sp-config', u('config')] : null, imgs.length > 1 ? ['sp-gallery', u('gallery')] : null, related.length ? ['sp-related', u('related')] : null].filter(Boolean);
    const msg = u('wa_system', { c: S.company.name, s: t(s.name) });
    return `<div class="sp-bar"><div class="wrap">
        <a class="sp-back" href="#systems">${icon('back')}${u('all_systems')}</a>
        <span class="sp-title">${esc(t(s.name))}</span>
        <button type="button" class="btn btn-accent" data-consult="${esc(s.slug)}">${u('quote')}</button>
      </div></div>
      <section class="sp-hero"><div class="wrap sp-hero-grid">
        <div>
          <p class="eyebrow">${u('system_n', { n: pad(i + 1), t: pad(list.length) })}</p>
          <h1>${esc(t(s.name))}</h1>
          <p class="lead">${esc(t(s.short))}</p>
          <div class="sp-cta">
            <button type="button" class="btn btn-navy" data-consult="${esc(s.slug)}">${u('consult')}${icon('arrow')}</button>
            ${s.brochure ? `<a class="btn btn-ghost" href="${esc(src(s.brochure))}" target="_blank" rel="noopener">${icon('download')}${u('brochure')}</a>` : ''}
            ${waLink() ? `<a class="btn btn-wa" href="${esc(waLink(msg))}" target="_blank" rel="noopener">${WA_SVG.replace('<svg', '<svg class="ic"')}WhatsApp</a>` : ''}
          </div>
          ${(s.applications || []).length ? `<ul class="sp-apps" aria-label="${u('applications')}">${s.applications.map((a) => `<li>${esc(t(a))}</li>`).join('')}</ul>` : ''}
        </div>
        ${imgs[0] ? `<figure class="sp-hero-img" data-zoom="0" tabindex="0" role="button" aria-label="${u('zoom')}"><img src="${esc(src(imgs[0]))}" alt="${esc(t(s.name))}"><span class="zoom-hint">${icon('zoom')}${u('zoom')}</span></figure>` : ''}
      </div></section>
      <nav class="sp-tabs" aria-label="${esc(t(s.name))}"><div class="wrap">${tabs.map(([id, l], k) => `<button type="button" data-go="${id}" class="${k === 0 ? 'on' : ''}">${l}</button>`).join('')}</div></nav>
      <section class="sp-sec" id="sp-overview"><div class="wrap sp-two">
        <div><p class="eyebrow">${u('overview')}</p><h2>${esc(t(s.name))}</h2></div>
        <div><p class="sp-overview">${esc(t(s.overview))}</p>
          ${(s.features || []).length ? `<div class="feat-grid">${s.features.map((f) => `<div class="feat"><span class="tile">${icon(f.icon)}</span><span>${esc(t(f.title))}</span></div>`).join('')}</div>` : ''}
        </div>
      </div></section>
      ${specs.length ? `<section class="sp-sec" id="sp-specs"><div class="wrap sp-two">
        <div><p class="eyebrow">${u('specs')}</p><h2>${u('specs')}</h2></div>
        <div><table class="spec-table"><tbody>${specs.map((r) => (String(r.value || '').trim() ? `<tr><th scope="row">${esc(t(r.label))}</th><td>${esc(r.value)}</td></tr>` : `<tr><th scope="row">${esc(t(r.label))}</th><td class="req">${u('on_request')}</td></tr>`)).join('')}</tbody></table>
          <p class="spec-note">${icon('info')}<span>${u('specs_note')}</span></p></div>
      </div></section>` : ''}
      ${hasCfg ? `<section class="sp-sec" id="sp-config"><div class="wrap"><p class="eyebrow">${u('config')}</p><h2>${u('config')}</h2><div class="cfg" id="cfg"></div></div></section>` : ''}
      ${imgs.length > 1 ? `<section class="sp-sec" id="sp-gallery"><div class="wrap"><p class="eyebrow">${u('gallery')}</p><h2>${u('gallery')}</h2>
        <div class="gal n${Math.min(imgs.length, 4)}">${imgs.map((im, k) => `<button type="button" data-zoom="${k}" aria-label="${u('zoom')}"><img src="${esc(src(im))}" alt="${esc(t(s.name))}" loading="lazy"></button>`).join('')}</div></div></section>` : ''}
      ${related.length ? `<section class="sp-sec" id="sp-related"><div class="wrap"><p class="eyebrow">${u('related')}</p><h2>${u('related')}</h2>
        <div class="rel">${related.map((r) => `<a href="#${esc(r.slug)}"><figure><img src="${esc(src(r.image))}" alt="" loading="lazy"></figure><small>${pad(list.indexOf(r) + 1)}</small><h3>${esc(t(r.name))}</h3></a>`).join('')}</div></div></section>` : ''}
      <section class="sp-band"><div class="wrap"><div><h2>${u('cta_title')}</h2><p>${u('cta_body')}</p></div>
        <div class="btns"><button type="button" class="btn btn-accent" data-consult="${esc(s.slug)}">${u('consult')}</button>${S.company.phone ? `<a class="btn btn-ghost" href="${telLink()}">${icon('phone')}${esc(S.company.phone)}</a>` : ''}</div></div></section>
      ${footerMini()}`;
  }
  const footerMini = () => `<div class="foot"><div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(S.company.name)}</span><span>${esc(t(S.text.tagline))}</span></div></div>`;

  /* ---------- configurator ---------- */
  const CFG = {};
  function cfgDefaults(s) {
    const opts = (s.configs || []).map(Number).filter((n) => n > 0);
    const kind = s.kind;
    const fallback = { slide: [2, 3, 4], vertical: [2, 3], fold: [3, 4, 5], swing: [1, 2], window: [1, 2, 3], grid: [3, 4, 5] }[kind] || [2];
    const o = opts.length ? opts : fallback;
    return { kind, opts: o, n: o[Math.min(1, o.length - 1)], p: kind === 'grid' ? 0 : 0.55, type: 'sliding', rows: 2, motor: !!s.motor };
  }
  function renderCfg(s) {
    const box = $('#cfg');
    if (!box) return;
    const st = CFG[s.slug] || (CFG[s.slug] = cfgDefaults(s));
    const nLabel = { swing: u('leaves'), window: u('sashes'), grid: u('columns') }[st.kind] || u('panels');
    const seg = (name, vals, cur, label) => `<div><span class="lbl">${label}</span><div class="seg" role="group" aria-label="${esc(label)}">${vals.map(([v, l]) => `<button type="button" data-set="${name}" data-v="${v}" aria-pressed="${String(v) === String(cur)}">${l}</button>`).join('')}</div></div>`;
    let ctl = '';
    if (st.kind === 'window') ctl += seg('type', [['sliding', u('sliding')], ['casement', u('casement')]], st.type, u('type'));
    if (st.kind === 'swing') ctl += seg('n', st.opts.map((v) => [v, v === 1 ? u('single') : v === 2 ? u('double') : v]), st.n, nLabel);
    else ctl += seg('n', st.opts.map((v) => [v, v]), st.n, nLabel);
    if (st.kind === 'grid') ctl += seg('rows', [1, 2, 3, 4].map((v) => [v, v]), st.rows, u('rows'));
    else ctl += `<div><label for="cfg-p">${u('open')} <span id="cfg-pv">${Math.round(st.p * 100)}%</span></label><input type="range" id="cfg-p" min="0" max="100" value="${Math.round(st.p * 100)}"></div>`;
    ctl += `<div class="cfg-read"><b id="cfg-read"></b><span id="cfg-read-l"></span></div>`;
    box.innerHTML = `<div class="cfg-ctl">${ctl}</div><div class="cfg-draw"><div class="cfg-cap"><span>${u('front')}</span><span>${esc(t(s.name))}</span></div><svg id="cfg-front" viewBox="0 0 640 360" role="img" aria-label="${u('front')}"></svg>
      <div class="cfg-cap" id="cfg-plan-cap"><span>${u('plan')}</span></div><svg id="cfg-plan" viewBox="0 0 640 110" role="img" aria-label="${u('plan')}"></svg><p class="cfg-note">${u('illustrative')}</p></div>`;
    drawCfg(s);
  }
  function union(iv) {
    iv = iv.map((a) => [Math.min(a[0], a[1]), Math.max(a[0], a[1])]).sort((a, b) => a[0] - b[0]);
    let tot = 0, cs = null, ce = null;
    for (const [s0, e0] of iv) {
      if (cs === null) { cs = s0; ce = e0; } else if (s0 <= ce) ce = Math.max(ce, e0); else { tot += ce - cs; cs = s0; ce = e0; }
    }
    return cs === null ? tot : tot + ce - cs;
  }
  function drawCfg(s) {
    const st = CFG[s.slug];
    const front = $('#cfg-front'), plan = $('#cfg-plan');
    if (!front) return;
    const X = 40, Y = 40, W = 560, H = 280, f = 12;
    const ix = X + f / 2, iy = Y + f / 2, iw = W - f, ih = H - f;
    const n = st.n, p = st.p;
    let g = '', pg = '', readout = '', readLabel = u('clear_opening'), showPlan = true;
    const glassPanel = (x, y, w, h, handleSide) => {
      const hx = handleSide === 'r' ? x + w - 12 : x + 6;
      return `<g><rect class="c-sash" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(w, 2).toFixed(1)}" height="${h.toFixed(1)}"/>${w > 16 ? `<rect class="c-glass" x="${(x + 7).toFixed(1)}" y="${(y + 7).toFixed(1)}" width="${(w - 14).toFixed(1)}" height="${(h - 14).toFixed(1)}"/><line class="c-shine" x1="${(x + w * 0.25).toFixed(1)}" y1="${(y + 20).toFixed(1)}" x2="${(x + w * 0.12).toFixed(1)}" y2="${(y + 70).toFixed(1)}"/>` : ''}${handleSide && w > 24 ? `<rect class="c-handle" x="${hx.toFixed(1)}" y="${(y + h / 2 - 18).toFixed(1)}" width="6" height="36" rx="2"/>` : ''}</g>`;
    };
    const head = st.motor ? `<rect class="c-head" x="${X}" y="${Y - 26}" width="${W}" height="20"/><text class="c-headtxt" x="${X + W / 2}" y="${Y - 12}">${esc(u('motor').toUpperCase())}</text>` : '';

    if (st.kind === 'slide' || (st.kind === 'window' && st.type === 'sliding')) {
      const pw = iw / n, stack = 9, xs = [];
      for (let i = 0; i < n; i++) { const xc = ix + i * pw, xo = ix + i * stack; xs.push(xc + (xo - xc) * p); }
      xs.forEach((x, i) => (g += glassPanel(x, iy, pw, ih, i === n - 1 ? 'l' : i ? 'l' : null)));
      readout = Math.round((1 - union(xs.map((x) => [x, x + pw])) / iw) * 100) + '%';
      for (let i = 0; i < n; i++) pg += `<line class="c-track" x1="${ix}" y1="${30 + (i % 3) * 14}" x2="${ix + iw}" y2="${30 + (i % 3) * 14}"/>`;
      xs.forEach((x, i) => (pg += `<line class="c-plan" x1="${(x + 3).toFixed(1)}" y1="${30 + (i % 3) * 14}" x2="${(x + pw - 3).toFixed(1)}" y2="${30 + (i % 3) * 14}"/>`));
    } else if (st.kind === 'vertical') {
      const ph = ih / n, stack = 8, ys = [];
      for (let i = 0; i < n; i++) { const yc = iy + i * ph, yo = iy + i * stack; ys.push(yc + (yo - yc) * p); }
      ys.forEach((y) => (g += glassPanel(ix, y, iw, ph, null)));
      readout = Math.round((1 - union(ys.map((y) => [y, y + ph])) / ih) * 100) + '%';
      showPlan = false;
    } else if (st.kind === 'fold') {
      const pw = iw / n, th = (p * 82 * Math.PI) / 180, w2 = pw * Math.cos(th), d = pw * Math.sin(th);
      for (let i = 0; i < n; i++) {
        const x = ix + i * w2, inset = Math.min(ih * 0.12, d * 0.12);
        const pts = i % 2 === 0 ? [[x, iy], [x + w2, iy + inset], [x + w2, iy + ih - inset], [x, iy + ih]] : [[x, iy + inset], [x + w2, iy], [x + w2, iy + ih], [x, iy + ih - inset]];
        g += `<polygon class="c-sash" points="${pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`;
        if (w2 > 18) g += `<polygon class="c-glass" points="${pts.map((q, k) => [q[0] + (k === 0 || k === 3 ? 7 : -7), q[1] + (k < 2 ? 7 : -7)].map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`;
      }
      readout = Math.round((1 - (n * w2) / iw) * 100) + '%';
      const yb = 80, sc = 60 / pw;
      let px = ix, py = yb, pts = [[px, py]];
      for (let i = 0; i < n; i++) { px += w2; py = i % 2 === 0 ? yb - d * sc : yb; pts.push([px, py]); }
      for (let i = 0; i < n; i++) pg += `<line class="c-plan" x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${pts[i + 1][0].toFixed(1)}" y2="${pts[i + 1][1].toFixed(1)}"/>`;
      pts.forEach((q) => (pg += `<circle class="c-hinge" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="3.5"/>`));
    } else if (st.kind === 'swing' || (st.kind === 'window' && st.type === 'casement')) {
      const door = st.kind === 'swing';
      const lw = iw / n, th = (p * 90 * Math.PI) / 180, w2 = lw * Math.cos(th);
      let covered = 0;
      for (let i = 0; i < n; i++) {
        const hingeLeft = n === 1 ? true : i < n / 2;
        const x0 = ix + i * lw, x = hingeLeft ? x0 : x0 + lw - w2;
        covered += w2;
        if (door) {
          g += `<rect class="c-door" x="${x.toFixed(1)}" y="${iy}" width="${Math.max(w2, 2).toFixed(1)}" height="${ih}"/>`;
          if (w2 > 30) for (let k = 1; k <= 5; k++) { const gy = iy + (ih * k) / 6; g += `<line class="c-groove" x1="${(x + w2 * 0.16).toFixed(1)}" y1="${gy.toFixed(1)}" x2="${(x + w2 * 0.84).toFixed(1)}" y2="${(gy - 4).toFixed(1)}"/>`; }
          if (w2 > 20) g += `<rect class="c-handle" x="${(hingeLeft ? x + w2 - 14 : x + 8).toFixed(1)}" y="${(iy + ih * 0.5 - 22).toFixed(1)}" width="6" height="44" rx="2"/>`;
        } else g += glassPanel(x, iy, w2, ih, hingeLeft ? 'r' : 'l');
        const hx = hingeLeft ? x0 : x0 + lw, yb = 92, r = Math.min(lw * 0.32, 80), sgn = hingeLeft ? 1 : -1;
        pg += `<path class="c-arc" d="M${hx + sgn * r} ${yb} A${r} ${r} 0 0 ${hingeLeft ? 0 : 1} ${hx} ${yb - r}"/>`;
        pg += `<line class="c-plan" x1="${hx}" y1="${yb}" x2="${(hx + sgn * r * Math.cos(th)).toFixed(1)}" y2="${(yb - r * Math.sin(th)).toFixed(1)}"/><circle class="c-hinge" cx="${hx}" cy="${yb}" r="3.5"/>`;
      }
      pg = `<line class="c-track" x1="${ix}" y1="92" x2="${ix + iw}" y2="92"/>` + pg;
      readout = Math.round((1 - covered / iw) * 100) + '%';
    } else if (st.kind === 'grid') {
      const cols = n, rows = st.rows, cw = iw / cols, rh = ih / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g += `<rect class="c-glass" x="${(ix + c * cw + 4).toFixed(1)}" y="${(iy + r * rh + 4).toFixed(1)}" width="${(cw - 8).toFixed(1)}" height="${(rh - 8).toFixed(1)}"/>`;
      for (let c = 1; c < cols; c++) g += `<rect class="c-mull" x="${(ix + c * cw - 4).toFixed(1)}" y="${iy}" width="8" height="${ih}"/>`;
      for (let r = 1; r < rows; r++) g += `<rect class="c-mull" x="${ix}" y="${(iy + r * rh - 3).toFixed(1)}" width="${iw}" height="6"/>`;
      g += `<line class="c-shine" x1="${ix + cw * 0.3}" y1="${iy + 20}" x2="${ix + cw * 0.15}" y2="${iy + 70}"/>`;
      readout = String(cols * rows);
      readLabel = u('glass_panes');
      pg = `<line class="c-track" x1="${ix}" y1="60" x2="${ix + iw}" y2="60"/>`;
      for (let c = 0; c <= cols; c++) { const x = ix + c * cw; pg += `<rect class="c-mull" x="${(x - 4).toFixed(1)}" y="48" width="8" height="26"/>`; }
    }
    front.innerHTML = `${head}<rect class="c-frame" x="${X}" y="${Y}" width="${W}" height="${H}"/><g>${g}</g><line class="c-floor" x1="0" y1="${Y + H + 14}" x2="640" y2="${Y + H + 14}"/>`;
    plan.innerHTML = pg;
    plan.hidden = !showPlan;
    const pc = $('#cfg-plan-cap');
    if (pc) pc.hidden = !showPlan;
    $('#cfg-read').textContent = readout;
    $('#cfg-read-l').textContent = readLabel;
    const pv = $('#cfg-pv');
    if (pv) pv.textContent = Math.round(p * 100) + '%';
  }

  /* ---------- render + behaviour ---------- */
  let current = null, pendingSystem = null, sxI = 0, zTop = 5, sxTimer = null;

  function render() {
    document.documentElement.lang = lang;
    $('#app').innerHTML = header() + '<main>' + hero() + about() + systemsIndex() + engineering() + why() + testimonials() + quote() + '</main>' + footer();
    if (sxI >= sys().length) sxI = 0;
    if (sxI) sxActivate(sxI, true, true);
    heroVideo();
    onScroll();
    requestAnimationFrame(roller);
    if (pendingSystem) selectSystem(pendingSystem);
    updateWa();
  }

  // hero background video: fade in once it is actually playing
  function heroVideo() {
    const v = $('#hero-video');
    if (!v) return;
    const on = () => v.classList.add('ready');
    v.addEventListener('playing', on, { once: true });
    if (!v.paused && v.readyState > 2) on();
    const pr = v.play && v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }

  // systems index
  function roller() {
    const list = $('#sx-list'), it = $$('.sx-item')[sxI];
    if (!list || !it) return;
    const b = it.querySelector('.sx-btn');
    list.style.setProperty('--ry', it.offsetTop + 'px');
    list.style.setProperty('--rh', b.offsetHeight + 'px');
  }
  function sxActivate(i, force, instant) {
    const items = $$('.sx-item');
    if (!items.length || (i === sxI && !force)) return;
    sxI = i;
    items.forEach((it, j) => it.classList.toggle('on', j === i));
    const panes = $$('.sx-pane');
    const s = sys()[i];
    if (panes.length && s) {
      const p = panes[i];
      p.style.zIndex = ++zTop;
      if (instant) { panes.forEach((q, j) => q.classList.toggle('on', j === i)); }
      else {
        p.classList.remove('on'); void p.offsetWidth; p.classList.add('on');
        const w = $('.sx-wipe'), stage = $('#sx-stage');
        if (w && stage && !reduce) { stage.style.setProperty('--sw', stage.offsetWidth + 16 + 'px'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); }
        clearTimeout(sxTimer);
        sxTimer = setTimeout(() => panes.forEach((q, j) => { if (j !== sxI) q.classList.remove('on'); }), 1050);
      }
      const cap = $('#sx-cap');
      if (cap) { cap.innerHTML = sxCap(s); cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap'); }
      const c = $('#sx-count');
      if (c) c.textContent = pad(i + 1) + ' / ' + pad(sys().length);
    }
    roller();
    if (mobile()) setTimeout(roller, 560);
  }

  // header + menu
  function onScroll() {
    const h = $('#hdr');
    if (!h) return;
    const open = !!($('#mnav') && $('#mnav').classList.contains('open'));
    h.classList.toggle('solid', scrollY > 40 && !open);
    h.classList.toggle('on-menu', open);
  }
  function setMenu(open) {
    const m = $('#mnav'), b = $('#burger');
    if (!m) return;
    m.classList.toggle('open', open);
    m.setAttribute('aria-hidden', String(!open));
    b.setAttribute('aria-expanded', String(open));
    lock(open, 'menu');
    onScroll();
  }
  const locks = new Set();
  function lock(on, who) {
    on ? locks.add(who) : locks.delete(who);
    document.documentElement.classList.toggle('lock', locks.size > 0);
  }

  // engineering drawing
  function focusPart(p) {
    const d = $('#drawing');
    if (!d) return;
    d.classList.toggle('focus', !!p);
    $$('.part', d).forEach((g) => g.classList.toggle('on', g.dataset.p === p));
    $$('#parts li').forEach((li) => li.classList.toggle('on', li.dataset.p === p));
  }

  // system page routing
  function openSystem(slug, instant) {
    const s = bySlug(slug);
    if (!s) return;
    current = s;
    const sp = $('#sp');
    sp.innerHTML = systemPage(s);
    sp.setAttribute('role', 'dialog');
    sp.setAttribute('aria-modal', 'true');
    sp.setAttribute('aria-label', t(s.name));
    sp.hidden = false;
    sp.scrollTop = 0;
    if (instant || reduce) sp.classList.add('open');
    else requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.add('open')));
    lock(true, 'sp');
    renderCfg(s);
    document.title = `${t(s.name)} · ${S.company.name}`;
    setTimeout(() => { const b = sp.querySelector('.sp-back'); b && b.focus({ preventScroll: true }); }, 50);
  }
  function closeSystem() {
    const sp = $('#sp');
    if (!current) return;
    current = null;
    sp.classList.remove('open');
    lock(false, 'sp');
    document.title = `${S.company.name} · ${t(S.text.tagline)}`;
    setTimeout(() => { if (!current) { sp.hidden = true; sp.innerHTML = ''; } }, reduce ? 0 : 720);
  }
  function route(first) {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && bySlug(h)) { openSystem(h, first); return; }
    if (current) closeSystem();
    if (h && !first) { const el = document.getElementById(h); if (el) setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), current ? 0 : 20); }
  }

  // quote form
  function selectSystem(slug) {
    const sel = $('#q-system');
    if (!sel) return;
    const opt = [...sel.options].find((o) => o.dataset.slug === slug);
    if (opt) sel.value = opt.value;
    updateWa();
  }
  function updateWa() {
    const a = $('#q-wa'), f = $('#qform');
    if (!a || !f) return;
    const d = Object.fromEntries(new FormData(f));
    const lines = [u('wa_hello', { c: S.company.name }), d.name && `${u('name')}: ${d.name}`, d.area && `${u('area')}: ${d.area}`, d.system && `${u('system')}: ${d.system}`, d.message && `${u('message')}: ${d.message}`].filter(Boolean);
    a.href = waLink(lines.join('\n'));
  }
  async function submitQuote(form) {
    const st = $('#q-status'), btn = $('#q-send');
    const d = Object.fromEntries(new FormData(form));
    st.className = 'q-status';
    if (!String(d.name || '').trim() || !String(d.phone || '').trim()) { st.textContent = u('required'); st.classList.add('err'); return; }
    if (PREVIEW) { st.textContent = u('sent'); st.classList.add('ok'); return; }
    btn.disabled = true;
    st.textContent = u('sending');
    try {
      const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...d, lang }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error('send');
      form.reset();
      pendingSystem = null;
      st.textContent = u('sent');
      st.classList.add('ok');
    } catch (e) {
      st.textContent = u('send_err');
      st.classList.add('err');
    } finally {
      btn.disabled = false;
      updateWa();
    }
  }

  // lightbox
  let lbList = [], lbI = 0;
  function openLB(list, i) {
    lbList = list; lbI = i;
    const lb = $('#lb');
    lb.hidden = false;
    lock(true, 'lb');
    showLB();
    lb.querySelector('.lb-x').focus();
  }
  function showLB() {
    const lb = $('#lb'), img = lb.querySelector('img');
    img.classList.remove('zoom');
    img.src = src(lbList[lbI]);
    img.alt = current ? t(current.name) : '';
    lb.querySelector('.lb-cap').textContent = (current ? t(current.name) + ' · ' : '') + (lbI + 1) + ' / ' + lbList.length;
    lb.querySelector('.lb-pv').hidden = lb.querySelector('.lb-nx').hidden = lbList.length < 2;
  }
  function closeLB() { $('#lb').hidden = true; lock(false, 'lb'); }
  function stepLB(d) { lbI = (lbI + d + lbList.length) % lbList.length; showLB(); }
  function setupLB() {
    const lb = $('#lb'), img = lb.querySelector('img');
    let x0 = null, moved = false;
    lb.addEventListener('click', (e) => {
      if (e.target.closest('.lb-x') || e.target === lb || e.target.classList.contains('lb-stage')) closeLB();
      else if (e.target.closest('.lb-pv')) stepLB(-1);
      else if (e.target.closest('.lb-nx')) stepLB(1);
    });
    img.addEventListener('click', (e) => {
      if (moved) { moved = false; return; }
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      img.classList.toggle('zoom');
    });
    img.addEventListener('pointermove', (e) => {
      if (!img.classList.contains('zoom')) return;
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = `${Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))}% ${Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))}%`;
    });
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; moved = false; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null || img.classList.contains('zoom')) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50 && lbList.length > 1) { moved = true; stepLB(dx < 0 ? 1 : -1); }
      x0 = null;
    });
  }

  function setLang(l) {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    const y = scrollY;
    render();
    scrollTo(0, y);
    if (current) { const slug = current.slug, top = $('#sp').scrollTop; openSystem(slug, true); $('#sp').scrollTop = top; }
  }

  /* ---------- events (delegated, bound once) ---------- */
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('[data-lang]');
    if (lb) { setLang(lb.dataset.lang); return; }
    if (e.target.closest('#burger')) { setMenu(!$('#mnav').classList.contains('open')); return; }
    if (e.target.closest('#mnav a')) setMenu(false);

    const sx = e.target.closest('.sx-btn');
    if (sx) {
      const i = +sx.parentElement.dataset.i;
      if (mobile() && i !== sxI) sxActivate(i);
      else location.hash = sx.dataset.slug;
      return;
    }
    const pt = e.target.closest('#parts li');
    if (pt) { focusPart(pt.classList.contains('on') && mobile() ? null : pt.dataset.p); return; }

    const consult = e.target.closest('[data-consult]');
    if (consult) {
      pendingSystem = consult.dataset.consult;
      selectSystem(pendingSystem);
      if (location.hash === '#quote') route(); else location.hash = 'quote';
      setTimeout(() => $('#q-name') && $('#q-name').focus({ preventScroll: true }), 800);
      return;
    }
    const go = e.target.closest('.sp-tabs [data-go]');
    if (go) {
      const el = document.getElementById(go.dataset.go);
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    const z = e.target.closest('[data-zoom]');
    if (z && current) { openLB([current.image, ...(current.gallery || [])].filter(Boolean), +z.dataset.zoom); return; }

    const set = e.target.closest('[data-set]');
    if (set && current) {
      const st = CFG[current.slug];
      const k = set.dataset.set, v = set.dataset.v;
      st[k] = k === 'type' ? v : +v;
      if (k === 'type') st.p = 0.55;
      renderCfg(current);
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'cfg-p' && current) { CFG[current.slug].p = e.target.value / 100; drawCfg(current); }
    if (e.target.closest('#qform')) updateWa();
  });
  document.addEventListener('change', (e) => { if (e.target.closest('#qform')) updateWa(); });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'qform') { e.preventDefault(); submitQuote(e.target); }
  });
  document.addEventListener('mouseover', (e) => {
    if (mobile()) return;
    const sx = e.target.closest('.sx-btn');
    if (sx) sxActivate(+sx.parentElement.dataset.i);
    const pt = e.target.closest('#parts li');
    if (pt) focusPart(pt.dataset.p);
  });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('#parts') && !e.relatedTarget?.closest?.('#parts')) focusPart(null); });
  document.addEventListener('focusin', (e) => {
    const sx = e.target.closest('.sx-btn');
    if (sx && !mobile()) sxActivate(+sx.parentElement.dataset.i);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-zoom][role=button]')) e.target.click();
    if (!$('#lb').hidden) {
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') stepLB(1);
      else if (e.key === 'ArrowLeft') stepLB(-1);
      return;
    }
    if (e.key === 'Escape') {
      if ($('#mnav')?.classList.contains('open')) setMenu(false);
      else if (current) location.hash = 'systems';
    }
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(roller));
  addEventListener('hashchange', () => route(false));
  $('#sp').addEventListener('scroll', () => {
    const tabs = $$('.sp-tabs [data-go]');
    if (!tabs.length) return;
    let on = tabs[0];
    for (const b of tabs) { const el = document.getElementById(b.dataset.go); if (el && el.getBoundingClientRect().top < 200) on = b; }
    tabs.forEach((b) => b.classList.toggle('on', b === on));
  }, { passive: true });

  /* ---------- live preview from the admin panel ---------- */
  function applyTheme(th) {
    const ok = (v) => /^#[0-9a-f]{6}$/i.test(v || '');
    const css = ['navy', 'accent', 'bg', 'surface', 'ink'].filter((k) => ok(th[k])).map((k) => `--${k}:${th[k]}`).join(';');
    $('#theme').textContent = `:root{${css}}`;
  }
  if (PREVIEW) {
    addEventListener('message', (e) => {
      if (e.origin !== location.origin || !e.data || e.data.type !== 'preview') return;
      S = e.data.site;
      applyTheme(S.theme || {});
      const slug = current && current.slug, y = scrollY;
      render();
      scrollTo(0, y);
      if (slug && bySlug(slug)) openSystem(slug, true);
      else if (slug) closeSystem();
    });
    if (parent !== window) parent.postMessage({ type: 'preview-ready' }, location.origin);
  }

  setupLB();
  render();
  route(true);
})();
