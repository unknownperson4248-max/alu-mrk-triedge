/* Alu MRK TriEdge — public site script. Renders everything from window.SITE (saved by the admin panel). */
(() => {
  'use strict';
  let S = window.SITE;
  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => matchMedia('(max-width: 1100px)').matches;
  const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

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
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const UI = {
    en: {
      systems: 'Systems', engineering: 'Engineering', about: 'About', contact: 'Contact', quote: 'Request a quote', menu: 'Menu', search: 'Search', close: 'Close',
      main_menu: 'Main menu', m_systems: 'Aluminium Systems', m_engineering: 'Engineering & Quality', m_about: 'About Us', m_contact: 'Contact', view_all: 'View all systems',
      call: 'Call', leadership: 'Leadership', home: 'Home', projects: 'Projects', m_projects: 'Our Projects', get_quote: 'Get a quote',
      proj_eyebrow: 'Our projects', proj_title: 'Iconic projects. Lasting impact.', proj_body: 'A selection of our aluminium and glass work for homes, offices and shops.', view_projects: 'View all projects',
      band_title: 'Let’s build something great together', band_body: 'Get a free consultation and quote today.', contact_us: 'Contact us', quick_links: 'Quick links', follow: 'Follow us', contact_info: 'Contact info',
      search_ph: 'Search, e.g. sliding doors', no_results: 'No results for “{q}”.', popular: 'Popular searches', chips: ['Sliding', 'Windows', 'Doors', 'Folding', 'Glass'],
      hero_eyebrow: 'Premium aluminium solutions', explore_systems: 'Explore our products', watch: 'Watch video',
      about_eyebrow: 'About', survey: 'Book a free site survey', systems_eyebrow: 'Aluminium systems', explore: 'Explore system',
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
      address: 'Address', hours: 'Opening hours', rights: 'All rights reserved.', company: 'Company', zoom: 'Tap to zoom',
      wa_hello: 'Hello {c}, I would like a quote.', wa_system: 'Hello {c}, I am interested in {s}.',
    },
    el: {
      systems: 'Συστήματα', engineering: 'Τεχνολογία', about: 'Εταιρεία', contact: 'Επικοινωνία', quote: 'Ζητήστε προσφορά', menu: 'Μενού', search: 'Αναζήτηση', close: 'Κλείσιμο',
      main_menu: 'Κύριο μενού', m_systems: 'Συστήματα αλουμινίου', m_engineering: 'Τεχνολογία & ποιότητα', m_about: 'Η εταιρεία', m_contact: 'Επικοινωνία', view_all: 'Όλα τα συστήματα',
      call: 'Κλήση', leadership: 'Διοίκηση', home: 'Αρχική', projects: 'Έργα', m_projects: 'Τα έργα μας', get_quote: 'Ζητήστε προσφορά',
      proj_eyebrow: 'Τα έργα μας', proj_title: 'Εμβληματικά έργα. Διαρκές αποτύπωμα.', proj_body: 'Επιλογή από τις κατασκευές μας σε αλουμίνιο και γυαλί για σπίτια, γραφεία και καταστήματα.', view_projects: 'Όλα τα έργα',
      band_title: 'Ας φτιάξουμε κάτι σπουδαίο μαζί', band_body: 'Ζητήστε δωρεάν συμβουλή και προσφορά σήμερα.', contact_us: 'Επικοινωνία', quick_links: 'Σύνδεσμοι', follow: 'Ακολουθήστε μας', contact_info: 'Στοιχεία επικοινωνίας',
      search_ph: 'Αναζήτηση, π.χ. συρόμενες πόρτες', no_results: 'Δεν βρέθηκαν αποτελέσματα για «{q}».', popular: 'Δημοφιλείς αναζητήσεις', chips: ['Συρόμενα', 'Παράθυρα', 'Πόρτες', 'Πτυσσόμενα', 'Γυαλί'],
      hero_eyebrow: 'Λύσεις αλουμινίου υψηλής ποιότητας', explore_systems: 'Δείτε τα προϊόντα μας', watch: 'Δείτε το βίντεο',
      about_eyebrow: 'Σχετικά με την', survey: 'Κλείστε δωρεάν αυτοψία', systems_eyebrow: 'Συστήματα αλουμινίου', explore: 'Δείτε το σύστημα',
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
      address: 'Διεύθυνση', hours: 'Ωράριο', rights: 'Με επιφύλαξη παντός δικαιώματος.', company: 'Εταιρεία', zoom: 'Πατήστε για μεγέθυνση',
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
    window: '<rect x="4" y="3" width="16" height="18"/><path d="M12 3v18M4 12h16"/>',
    door: '<rect x="6" y="3" width="12" height="18"/><path d="M14.5 12v.5M3 21h18"/>',
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
    chev: '<path d="M6 9l6 6 6-6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    play: '<path d="M9 6.5v11l9-5.5z"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    diamond: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18 3-18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7"/>',
    handshake: '<path d="M2 11l4-4 3 1 3-2 3 2 3-1 4 4"/><path d="M6 7l-1 9 3 3M18 7l1 9-3 3M9 15l2 2M11 13l3 3M13 11l3 3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.sparkle}</svg>`;
  const WA_PATH = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z';
  const WA_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${WA_PATH}"/></svg>`;
  const waIcon = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="stroke:none"><path fill="currentColor" d="${WA_PATH}"/></svg>`;

  const KIND_ICON = { slide: 'arrowsH', vertical: 'arrowsV', window: 'window', swing: 'door', fold: 'fold', grid: 'building', none: 'sparkle' };
  const sysIcon = (s) => s.icon || (s.motor && s.kind === 'slide' ? 'motor' : KIND_ICON[s.kind] || 'sparkle');
  const sys = () => (S.systems || []).filter((s) => s.visible !== false);
  const bySlug = (sl) => sys().find((s) => s.slug === sl);
  const waLink = (msg) => {
    const n = digits(S.company.whatsapp || S.company.phone);
    return n ? `https://wa.me/${n}${msg ? '?text=' + encodeURIComponent(msg) : ''}` : '';
  };
  const telLink = () => (S.company.phone ? 'tel:+' + digits(S.company.phone).replace(/^00/, '') : '');

  /* ---------- header, mega menu, search, mobile menu ---------- */
  const searchBox = (id) => `<div class="sbox">${icon('search')}<input class="sq" id="${id}" type="search" placeholder="${esc(u('search_ph'))}" autocomplete="off" aria-label="${esc(u('search'))}"></div><div class="sres" aria-live="polite"></div>`;

  function socialLinks(cls) {
    const soc = Object.entries(S.company.socials || {}).filter(([, v]) => v);
    return soc.length ? `<div class="${cls}">${soc.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon(k)}</a>`).join('')}</div>` : '';
  }

  function langSelect() {
    return `<div class="lsel"><button type="button" class="lsel-btn" aria-expanded="false" aria-haspopup="true" aria-label="Language">${icon('globe')}<span>${lang === 'el' ? 'ΕΛ' : 'EN'}</span>${icon('chev')}</button>
      <div class="lsel-menu" role="menu" hidden><button type="button" role="menuitemradio" data-lang="en" aria-checked="${lang === 'en'}">English</button><button type="button" role="menuitemradio" data-lang="el" aria-checked="${lang === 'el'}">Ελληνικά</button></div></div>`;
  }

  function header() {
    const c = S.company, list = sys();
    const tb = [
      c.email ? `<a href="mailto:${esc(c.email)}">${icon('mail')}${esc(c.email)}</a>` : '',
      c.phone ? `<a href="${telLink()}">${icon('phone')}${esc(c.phone)}</a>` : '',
      t(c.address) ? `<span>${icon('pin')}${esc(t(c.address).split('\n')[0])}</span>` : '',
    ].join('');
    return `<header class="hdr" id="hdr">
      <div class="topbar"><div class="wrap topbar-in"><div class="tb-l">${tb}</div>${socialLinks('tb-r')}</div></div>
      <div class="wrap nav">
        <a class="brand" href="#top" aria-label="${esc(c.name)}"><img class="logo-l" src="/img/logo-light.png" alt="${esc(c.name)}" width="98" height="46"><img class="logo-d" src="/img/logo-dark.png" alt="" width="98" height="46"></a>
        <nav class="links" aria-label="Main">
          <a href="#top" class="is-home">${u('home')}</a>
          <button type="button" class="mega-btn" aria-expanded="false" aria-controls="mega">${u('m_systems')}${icon('chev')}</button>
          <a href="#projects">${u('m_projects')}</a><a href="#about">${u('m_about')}</a><a href="#quote">${u('contact')}</a>
        </nav>
        <button type="button" class="icon-btn srch-btn" aria-expanded="false" aria-controls="srch" aria-label="${u('search')}">${icon('search')}</button>
        ${langSelect()}
        <a class="btn btn-accent nav-cta" href="#quote">${u('get_quote')}${icon('arrow')}</a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="mnav" aria-label="${u('menu')}"><i><b></b><b></b><b></b></i></button>
      </div>
      <div class="mega" id="mega" hidden><div class="wrap mega-in">
        <div class="mega-intro"><p class="eyebrow">${u('systems_eyebrow')}</p><h3>${esc(t(S.text.systemsTitle))}</h3><p>${esc(t(S.text.systemsSub))}</p><a class="arrow-link" href="#systems">${u('view_all')}${icon('arrow')}</a></div>
        <ul class="mega-grid">${list.map((s, i) => `<li><a href="#${esc(s.slug)}"><img src="${esc(src(s.image))}" alt="" loading="lazy"><span><small>${pad(i + 1)}</small>${esc(t(s.name))}</span></a></li>`).join('')}</ul>
      </div></div>
      <div class="srch" id="srch" hidden><div class="wrap srch-in" data-search>${searchBox('sq-top')}</div></div>
    </header>
    <div class="mnav" id="mnav" aria-hidden="true">
      <div class="mnav-search" data-search>${searchBox('sq-menu')}</div>
      <div class="mnav-nav">
        <p class="mnav-label">${u('main_menu')}</p>
        <ul class="mnav-main">
          <li><button type="button" class="acc" aria-expanded="false" aria-controls="acc-sys"><span>${u('m_systems')}</span>${icon('chev')}</button>
            <div class="acc-panel" id="acc-sys"><ul>${list.map((s, i) => `<li><a href="#${esc(s.slug)}"><small>${pad(i + 1)}</small>${esc(t(s.name))}</a></li>`).join('')}</ul></div></li>
          <li><a href="#projects"><span>${u('m_projects')}</span>${icon('right')}</a></li>
          <li><a href="#about"><span>${u('m_about')}</span>${icon('right')}</a></li>
          <li><a href="#engineering"><span>${u('m_engineering')}</span>${icon('right')}</a></li>
          <li><a href="#quote"><span>${u('m_contact')}</span>${icon('right')}</a></li>
        </ul>
        <div class="mnav-short">
          ${c.phone ? `<a href="${telLink()}">${icon('phone')}<span>${u('call')}</span></a>` : ''}
          ${waLink() ? `<a href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener">${waIcon}<span>WhatsApp</span></a>` : ''}
          <a href="#quote">${icon('file')}<span>${u('quote')}</span></a>
        </div>
      </div>
    </div>`;
  }

  /* ---------- hero slider (video first if there is one, then photos) ---------- */
  function heroSlides() {
    const first = S.heroImage || 'img/hero-house.jpg';
    const out = [{ img: first, video: S.heroVideo || '' }];
    (S.hero || []).forEach((h) => { if (h && h.img && h.img !== first) out.push({ img: h.img }); });
    return out.slice(0, 6);
  }

  function hero() {
    const sl = heroSlides();
    const showText = S.heroText !== false;
    const badge = t(S.heroBadge);
    const many = sl.length > 1;
    return `<section class="hero${showText ? '' : ' no-text'}" id="top" aria-label="${esc(S.company.name)}" aria-roledescription="carousel">
      <div class="slides">${sl
        .map(
          (s, i) => `<div class="slide${i ? '' : ' on'}" aria-hidden="${i ? 'true' : 'false'}"><img src="${esc(src(s.img))}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>${s.video && !reduce ? `<video src="${esc(src(s.video))}" muted loop playsinline preload="${i ? 'none' : 'auto'}" aria-hidden="true"></video>` : ''}</div>`
        )
        .join('')}</div>
      <div class="hero-shade"></div>
      ${badge ? `<span class="seal"><span>${esc(badge)}</span></span>` : ''}
      ${many ? `<button type="button" class="hs-arrow prev" data-slide="-1" aria-label="Previous slide">${icon('back')}</button><button type="button" class="hs-arrow next" data-slide="1" aria-label="Next slide">${icon('arrow')}</button>` : ''}
      <div class="wrap hero-in">
        ${showText ? `<div class="hero-copy">
          <p class="eyebrow">${u('hero_eyebrow')}</p>
          <h1>${esc(t(S.text.heroTitle))}<span class="silver">${esc(t(S.text.heroAccent))}</span></h1>
          ${t(S.text.heroSub) ? `<p class="sub">${esc(t(S.text.heroSub))}</p>` : ''}
          <div class="hero-cta"><a class="btn btn-accent" href="#systems">${u('explore_systems')}${icon('arrow')}</a>${S.heroVideo ? `<button type="button" class="btn btn-play" data-video><span class="play">${icon('play')}</span>${u('watch')}</button>` : `<a class="btn btn-play" href="#quote"><span class="play">${icon('file')}</span>${u('get_quote')}</a>`}</div>
        </div>` : ''}
        ${many ? `<div class="hs-count"><b id="hs-n">01</b><span>/ ${pad(sl.length)}</span><i class="hs-bar"><i id="hs-fill"></i></i><span class="hs-mini"><button type="button" data-slide="-1" aria-label="Previous slide">${icon('back')}</button><button type="button" data-slide="1" aria-label="Next slide">${icon('arrow')}</button></span></div>` : ''}
      </div>
    </section>`;
  }

  // phone only: key points as small tiles right under the hero
  function featsM() {
    const v = (S.values || []).filter((x) => t(x.title));
    return v.length ? `<div class="feats-m"><div class="wrap"><ul>${v.map((x) => `<li>${icon(x.icon)}<span>${esc(t(x.title))}</span></li>`).join('')}</ul></div></div>` : '';
  }

  function cats() {
    const list = sys();
    return `<section class="cats" id="systems" aria-label="${u('systems_eyebrow')}">
      <div class="wrap cats-head"><p class="eyebrow">${u('systems_eyebrow')}</p></div>
      <div class="wrap cats-wrap">
        <button type="button" class="rail-btn prev" data-rail="-1" aria-label="Previous">${icon('back')}</button>
        <div class="rail" id="rail">${list
          .map(
            (s, i) => `<a class="card" href="#${esc(s.slug)}"><img src="${esc(src(s.image))}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}"><span class="card-n">${esc(t(s.name))}${icon('arrow')}</span></a>`
          )
          .join('')}</div>
        <button type="button" class="rail-btn next" data-rail="1" aria-label="Next">${icon('arrow')}</button>
      </div>
    </section>`;
  }

  /* ---------- about: image (with video button), text, key points ---------- */
  function about() {
    const img = S.aboutImage || 'img/house-windows.jpg';
    const v = (S.values || []).filter((x) => t(x.title));
    return `<section class="about" id="about">
      <div class="about-grid">
        <figure class="about-media"><img src="${esc(src(img))}" alt="" loading="lazy">${S.heroVideo ? `<button type="button" class="about-play" data-video aria-label="${u('watch')}">${icon('play')}</button>` : ''}</figure>
        <div class="about-text">
          <p class="eyebrow">${u('about_eyebrow')} ${esc(S.company.name)}</p>
          <h2>${esc(t(S.text.introTitle))}</h2>
          <p>${esc(t(S.text.introBody))}</p>
          <a class="btn btn-accent" href="#quote">${u('survey')}${icon('arrow')}</a>
        </div>
        ${v.length ? `<ul class="about-feats">${v.slice(0, 4).map((x) => `<li>${icon(x.icon)}<span>${esc(t(x.title))}</span></li>`).join('')}</ul>` : ''}
      </div>
      <div class="wrap">${founder()}</div>
    </section>`;
  }

  function projects() {
    const list = (S.projects || []).filter((p) => p.img);
    if (!list.length) return '';
    return `<section class="projects" id="projects">
      <div class="wrap proj-head"><div><p class="eyebrow">${u('proj_eyebrow')}</p><h2>${u('proj_title')}</h2></div><button type="button" class="link-sm" data-proj="0">${u('view_projects')}${icon('arrow')}</button></div>
      <div class="proj-strip">${list.slice(0, 6).map((p, i) => `<button type="button" class="proj" data-proj="${i}" aria-label="${esc(t(p.caption) || u('proj_title'))}"><img src="${esc(src(p.img))}" alt="" loading="lazy">${t(p.caption) ? `<span>${esc(t(p.caption))}</span>` : ''}</button>`).join('')}</div>
    </section>`;
  }

  function band() {
    const list = (S.testimonials || []).filter((x) => t(x.quote));
    return `<section class="band"><div class="wrap band-grid${list.length ? ' two' : ''}">
      ${list.length ? `<div class="tst" id="tst"><span class="tst-q" aria-hidden="true">“</span><div class="tst-slides">${list.map((x, i) => `<blockquote class="${i ? '' : 'on'}"><p>${esc(t(x.quote))}</p><cite>— ${esc(x.name)}${t(x.role) ? ', ' + esc(t(x.role)) : ''}</cite></blockquote>`).join('')}</div>${list.length > 1 ? `<div class="tst-dots">${list.map((x, i) => `<button type="button" data-tst="${i}" class="${i ? '' : 'on'}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}</div>` : ''}
      <div class="band-cta"><span class="band-ic">${icon('handshake')}</span><div><h3>${u('band_title')}</h3><p>${u('band_body')}</p></div><a class="btn btn-accent" href="#quote">${u('contact_us')}${icon('arrow')}</a></div>
    </div></section>`;
  }

  function founder() {
    const f = S.founder || {};
    if (!String(f.name || '').trim()) return '';
    return `<div class="founder${f.photo ? '' : ' no-photo'}">
      ${f.photo ? `<figure><img src="${esc(src(f.photo))}" alt="${esc(f.name)}" loading="lazy"></figure>` : ''}
      <div>
        <p class="eyebrow">${u('leadership')}</p>
        <h3>${esc(f.name)}</h3>
        ${t(f.role) ? `<p class="role">${esc(t(f.role))}</p>` : ''}
        ${t(f.bio) ? `<p class="bio">${esc(t(f.bio))}</p>` : ''}
        ${t(f.quote) ? `<blockquote>“${esc(t(f.quote))}”</blockquote>` : ''}
      </div>
    </div>`;
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
    const c = S.company, list = sys();
    const soc = socialLinks('socials');
    return `<footer class="foot"><div class="wrap foot-top${soc ? ' has-soc' : ''}">
      <div class="foot-brand"><img src="/img/logo-light.png" alt="${esc(c.name)}" width="111" height="52"><p>${esc(t(S.text.tagline))}</p></div>
      <div><h4>${u('quick_links')}</h4><ul><li><a href="#top">${u('home')}</a></li><li><a href="#about">${u('about')}</a></li><li><a href="#systems">${u('systems')}</a></li><li><a href="#projects">${u('projects')}</a></li><li><a href="#quote">${u('contact')}</a></li></ul></div>
      <div><h4>${u('systems')}</h4><ul>${list.slice(0, 6).map((s) => `<li><a href="#${esc(s.slug)}">${esc(t(s.name))}</a></li>`).join('')}</ul></div>
      <div><h4>${u('contact_info')}</h4><ul class="foot-contact">
        ${t(c.address) ? `<li>${icon('pin')}<span>${esc(t(c.address))}</span></li>` : ''}
        ${c.phone ? `<li>${icon('phone')}<a href="${telLink()}">${esc(c.phone)}</a></li>` : ''}
        ${c.email ? `<li>${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${t(c.hours) ? `<li>${icon('clock')}<span>${esc(t(c.hours))}</span></li>` : ''}
      </ul></div>
      ${soc ? `<div><h4>${u('follow')}</h4>${soc}</div>` : ''}
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
  let current = null, pendingSystem = null, panel = null;

  function render() {
    document.documentElement.lang = lang;
    $('#app').innerHTML = header() + '<main>' + hero() + featsM() + cats() + about() + projects() + engineering() + band() + quote() + '</main>' + footer();
    tstStart();
    hsShow(hsI);
    railArrows();
    syncPanels();
    if (pendingSystem) selectSystem(pendingSystem);
    updateWa();
  }

  // hero slider: cross-fade, slow zoom, 7 s per slide, video plays only on its own slide
  let hsI = 0, hsT = null;
  function hsShow(i) {
    const sl = $$('.slide');
    clearTimeout(hsT);
    if (!sl.length) return;
    hsI = (i + sl.length) % sl.length;
    sl.forEach((s, j) => {
      const on = j === hsI;
      s.classList.toggle('on', on);
      s.setAttribute('aria-hidden', String(!on));
      const v = s.querySelector('video');
      if (!v) return;
      if (on) {
        if (!v.paused && v.readyState > 2) v.classList.add('ready');
        v.addEventListener('playing', () => v.classList.add('ready'), { once: true });
        const pr = v.play && v.play();
        if (pr && pr.catch) pr.catch(() => {});
      } else v.pause();
    });
    const n = $('#hs-n');
    if (n) n.textContent = pad(hsI + 1);
    const f = $('#hs-fill');
    if (f) { f.classList.remove('run'); void f.offsetWidth; if (!reduce && sl.length > 1) f.classList.add('run'); }
    if (!reduce && sl.length > 1 && !document.hidden) hsT = setTimeout(() => hsShow(hsI + 1), 7000);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(hsT); else hsShow(hsI); });
  let hx0 = null;
  document.addEventListener('touchstart', (e) => { hx0 = e.target.closest('.hero') && !e.target.closest('.rail') ? e.touches[0].clientX : null; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (hx0 === null) return;
    const dx = e.changedTouches[0].clientX - hx0;
    hx0 = null;
    if (Math.abs(dx) > 60 && $$('.slide').length > 1) hsShow(hsI + (dx < 0 ? 1 : -1));
  });

  function openVideo() {
    if (!S.heroVideo) return;
    let m = $('#vm');
    if (!m) {
      m = document.createElement('div');
      m.id = 'vm';
      m.className = 'vm';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      document.body.appendChild(m);
      m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.lb-x')) closeVideo(); });
    }
    m.innerHTML = `<video src="${esc(src(S.heroVideo))}" controls autoplay playsinline></video><button type="button" class="lb-btn lb-x" aria-label="${u('close')}">&times;</button>`;
    m.hidden = false;
    lock(true, 'vm');
    m.querySelector('.lb-x').focus();
  }
  function closeVideo() { const m = $('#vm'); if (m) { m.hidden = true; m.innerHTML = ''; } lock(false, 'vm'); }

  // testimonials rotate every few seconds
  let tstTimer = null, tstI = 0;
  function tstShow(i) {
    const q = $$('#tst blockquote'), d = $$('#tst [data-tst]');
    if (!q.length) return;
    tstI = (i + q.length) % q.length;
    q.forEach((x, j) => x.classList.toggle('on', j === tstI));
    d.forEach((x, j) => x.classList.toggle('on', j === tstI));
  }
  function tstStart() {
    clearInterval(tstTimer);
    tstI = 0;
    if (!reduce && $$('#tst blockquote').length > 1) tstTimer = setInterval(() => tstShow(tstI + 1), 6500);
  }

  // system cards rail
  function railArrows() {
    const r = $('#rail');
    if (!r) return;
    const upd = () => {
      const max = r.scrollWidth - r.clientWidth - 2;
      const [a, b] = $$('[data-rail]');
      if (a) a.disabled = r.scrollLeft <= 2;
      if (b) b.disabled = r.scrollLeft >= max;
    };
    r.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  // panels: mobile menu, desktop mega menu, search
  function setPanel(p) { panel = p; syncPanels(); }
  function syncPanels() {
    const m = $('#mnav'), g = $('#mega'), s = $('#srch');
    if (!m) return;
    m.classList.toggle('open', panel === 'menu');
    m.setAttribute('aria-hidden', String(panel !== 'menu'));
    $('#burger').setAttribute('aria-expanded', String(panel === 'menu'));
    g.hidden = panel !== 'mega';
    $('.mega-btn').setAttribute('aria-expanded', String(panel === 'mega'));
    s.hidden = panel !== 'search';
    $('.srch-btn').setAttribute('aria-expanded', String(panel === 'search'));
    lock(panel === 'menu' || (panel === 'search' && mobile()), 'panel');
    onScroll();
  }
  function onScroll() {
    const h = $('#hdr');
    if (!h) return;
    h.classList.toggle('solid', scrollY > 40 && !panel);
    h.classList.toggle('open-panel', !!panel);
    document.documentElement.classList.toggle('past-hero', scrollY > innerHeight * 0.6);
  }
  const locks = new Set();
  function lock(on, who) {
    on ? locks.add(who) : locks.delete(who);
    document.documentElement.classList.toggle('lock', locks.size > 0);
  }

  // search
  function searchIndex() {
    const both = (o) => (o ? [o.en, o.el] : []);
    const items = sys().map((s, i) => ({
      href: '#' + s.slug, img: s.image, ic: sysIcon(s), title: t(s.name), sub: t(s.short), n: pad(i + 1),
      title_n: norm(both(s.name).join(' ')),
      hay: norm([...both(s.name), ...both(s.short), ...both(s.overview), ...(s.features || []).flatMap((f) => both(f.title)), ...(s.applications || []).flatMap(both), ...(s.specs || []).flatMap((r) => [...both(r.label), r.value])].join(' ')),
    }));
    const page = (href, ic, title, sub, words) => ({ href, ic, title, sub, title_n: norm(title), hay: norm(title + ' ' + sub + ' ' + words) });
    items.push(
      page('#engineering', 'layers', UI[lang].m_engineering, u('eng_title'), 'engineering quality thermal break profile glazing seals drainage insulation τεχνολογια ποιοτητα θερμοδιακοπη μονωση'),
      page('#about', 'home', UI[lang].m_about, t(S.text.introTitle), 'about company team founder owner εταιρεια ομαδα ιδρυτης'),
      page('#quote', 'file', u('quote'), u('quote_body'), 'contact quote price cost phone whatsapp email survey measure επικοινωνια προσφορα τιμη τηλεφωνο αυτοψια')
    );
    return items;
  }
  function runSearch(box) {
    const input = box.querySelector('.sq'), res = box.querySelector('.sres');
    const q = input.value;
    const n = norm(q).trim();
    if (box.closest('#mnav')) $('#mnav').classList.toggle('searching', !!n);
    if (!n) { res.innerHTML = `<p class="s-label">${u('popular')}</p><div class="s-chips">${u('chips').map((c) => `<button type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>`; return; }
    const words = n.split(/\s+/);
    const hits = searchIndex()
      .filter((e) => words.every((w) => e.hay.includes(w)))
      .map((e) => ({ e, score: words.filter((w) => e.title_n.includes(w)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.e);
    res.innerHTML = hits.length
      ? hits.map((e) => `<a class="sr" href="${esc(e.href)}">${e.img ? `<img src="${esc(src(e.img))}" alt="" loading="lazy">` : `<span class="sr-ic">${icon(e.ic)}</span>`}<span><b>${esc(e.title)}</b><small>${esc(e.sub)}</small></span>${icon('right')}</a>`).join('')
      : `<p class="s-empty">${esc(u('no_results', { q: q.trim() }))}</p><div class="s-chips">${u('chips').map((c) => `<button type="button" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
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
    sp.setAttribute('tabindex', '-1');
    setTimeout(() => sp.focus({ preventScroll: true }), 50);
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
    if (panel) setPanel(null);
    if (h && bySlug(h)) { openSystem(h, first); return; }
    if (current) closeSystem();
    if (h && !first) { const el = document.getElementById(h); if (el) setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 20); }
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
  let lbList = [], lbI = 0, lbCaps = [];
  function openLB(list, i, caps) {
    lbList = list; lbI = i; lbCaps = caps || [];
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
    const cap = lbCaps[lbI] || (current ? t(current.name) : '');
    img.alt = cap;
    lb.querySelector('.lb-cap').textContent = (cap ? cap + ' · ' : '') + (lbI + 1) + ' / ' + lbList.length;
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
    const y = scrollY, keep = panel;
    render();
    scrollTo(0, y);
    if (keep) setPanel(keep);
    if (current) { const slug = current.slug, top = $('#sp').scrollTop; openSystem(slug, true); $('#sp').scrollTop = top; }
  }

  /* ---------- events (delegated, bound once) ---------- */
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('[data-lang]');
    if (lb) { setLang(lb.dataset.lang); return; }
    const ls = e.target.closest('.lsel-btn');
    $$('.lsel-menu').forEach((m) => { if (!ls || !ls.parentElement.contains(m)) { m.hidden = true; m.previousElementSibling.setAttribute('aria-expanded', 'false'); } });
    if (ls) { const m = ls.nextElementSibling; m.hidden = !m.hidden; ls.setAttribute('aria-expanded', String(!m.hidden)); return; }
    const sb = e.target.closest('[data-slide]');
    if (sb) { hsShow(hsI + +sb.dataset.slide); return; }
    if (e.target.closest('#burger')) { setPanel(panel === 'menu' ? null : 'menu'); return; }
    if (e.target.closest('.mega-btn')) { setPanel(panel === 'mega' ? null : 'mega'); return; }
    if (e.target.closest('.srch-btn')) { setPanel(panel === 'search' ? null : 'search'); if (panel === 'search') setTimeout(() => { const i = $('#sq-top'); i.focus(); runSearch(i.closest('[data-search]')); }, 30); return; }
    const acc = e.target.closest('.acc');
    if (acc) { const open = acc.getAttribute('aria-expanded') !== 'true'; acc.setAttribute('aria-expanded', String(open)); $('#' + acc.getAttribute('aria-controls')).classList.toggle('open', open); return; }
    const chip = e.target.closest('[data-chip]');
    if (chip) { const box = chip.closest('[data-search]'), i = box.querySelector('.sq'); i.value = chip.dataset.chip; runSearch(box); i.focus(); return; }
    if (panel && e.target.closest('#mnav a, #mega a, #srch a')) { setPanel(null); return; }
    if (panel && panel !== 'menu' && !e.target.closest('#hdr')) setPanel(null);

    const rb = e.target.closest('[data-rail]');
    if (rb) { const r = $('#rail'); const card = r.querySelector('.card'); r.scrollBy({ left: +rb.dataset.rail * ((card ? card.offsetWidth : 300) + 16), behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (e.target.closest('[data-video]')) { openVideo(); return; }
    const pj = e.target.closest('[data-proj]');
    if (pj) { const L = (S.projects || []).filter((x) => x.img); openLB(L.map((x) => x.img), +pj.dataset.proj, L.map((x) => t(x.caption))); return; }
    const td = e.target.closest('[data-tst]');
    if (td) { tstShow(+td.dataset.tst); tstStart(); tstShow(+td.dataset.tst); return; }

    const pt = e.target.closest('#parts li');
    if (pt) { focusPart(pt.classList.contains('on') && !canHover() ? null : pt.dataset.p); return; }

    const consult = e.target.closest('[data-consult]');
    if (consult) {
      pendingSystem = consult.dataset.consult;
      selectSystem(pendingSystem);
      if (location.hash === '#quote') route(); else location.hash = 'quote';
      setTimeout(() => $('#q-name') && $('#q-name').focus({ preventScroll: true }), 800);
      return;
    }
    const go = e.target.closest('.sp-tabs [data-go]');
    if (go) { const el = document.getElementById(go.dataset.go); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
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
    if (e.target.classList.contains('sq')) { runSearch(e.target.closest('[data-search]')); return; }
    if (e.target.id === 'cfg-p' && current) { CFG[current.slug].p = e.target.value / 100; drawCfg(current); }
    if (e.target.closest('#qform')) updateWa();
  });
  document.addEventListener('focusin', (e) => { if (e.target.classList.contains('sq')) runSearch(e.target.closest('[data-search]')); });
  document.addEventListener('change', (e) => { if (e.target.closest('#qform')) updateWa(); });
  document.addEventListener('submit', (e) => { if (e.target.id === 'qform') { e.preventDefault(); submitQuote(e.target); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('sq')) { const first = e.target.closest('[data-search]').querySelector('.sr'); if (first) { e.preventDefault(); first.click(); } return; }
    if (e.key === 'Enter' && e.target.matches('[data-zoom][role=button]')) e.target.click();
    if ($('#vm') && !$('#vm').hidden && e.key === 'Escape') { closeVideo(); return; }
    if (!$('#lb').hidden) {
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') stepLB(1);
      else if (e.key === 'ArrowLeft') stepLB(-1);
      return;
    }
    if (e.key === 'Escape') {
      if (panel) setPanel(null);
      else if (current) location.hash = 'systems';
    }
  });
  // desktop: open the systems mega menu on hover
  let megaT;
  document.addEventListener('mouseover', (e) => {
    if (!canHover()) return;
    if (e.target.closest('.mega-btn')) { clearTimeout(megaT); if (panel !== 'mega' && panel !== 'search') setPanel('mega'); }
    else if (e.target.closest('#mega')) clearTimeout(megaT);
    else if (panel === 'mega' && !e.target.closest('#hdr')) { clearTimeout(megaT); megaT = setTimeout(() => { if (panel === 'mega') setPanel(null); }, 250); }
    const pt = e.target.closest('#parts li');
    if (pt) focusPart(pt.dataset.p);
  });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('#parts') && !e.relatedTarget?.closest?.('#parts')) focusPart(null); });
  addEventListener('scroll', onScroll, { passive: true });
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
    const hex = /^#[0-9a-f]{6}$/i.test(th.bg || '') ? th.bg : '#ffffff';
    const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255);
    document.documentElement.dataset.tone = 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45 ? 'dark' : 'light';
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
