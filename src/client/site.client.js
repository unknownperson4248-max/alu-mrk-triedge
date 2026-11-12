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
  if (lang !== 'en' && lang !== 'el') {
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((x) => String(x).toLowerCase().slice(0, 2));
    lang = prefs.find((x) => x === 'el' || x === 'en') || 'en';
  }

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
      call: 'Call', leadership: 'Leadership',
      ask_price: 'Ask the price', ask_wa_msg: 'Hello {c}, I would like the price for this:', wa_note: 'Opens WhatsApp with the message ready. You only need to press send.',
      products: 'Profile Systems', m_products: 'Profile Systems', prod_eyebrow: 'Profile Systems', view_all_prof: 'View all profile systems', prod_title: 'Our profile models', prod_sub: 'We fabricate and install these aluminium profile systems to measure. Profiles are supplied by MUSKITA.', prod_maker: 'Profile manufacturer: MUSKITA',
      details: 'Details', add_quote: 'Add to quotation', added_quote: 'Added to your quotation', tech_data: 'Technical data', tech_source: 'Source: MUSKITA product information. Values vary by version and configuration; we confirm the exact figures for your project.', tech_on_request: 'Technical details on request.', colours: 'Colours & finishes', all_products: 'All models',
      qb_title: 'Request a quotation', qb_sub: 'Add every door, window or system you need. We review the measurements and send you a written quotation.',
      qb_step1: 'Products', qb_step2: 'Details', qb_step3: 'Review', qb_product: 'Product {n}', qb_edit_product: 'Edit product {n}',
      qb_cat: 'Product category', qb_model: 'Model', qb_model_other: 'Other / not sure', qb_choose: 'Choose…', qb_width: 'Width (mm)', qb_height: 'Height (mm)', qb_qty: 'Quantity',
      qb_colour: 'Colour / finish', qb_glass: 'Glass type', qb_glass_thk: 'Glass thickness', qb_glass_thk_ph: 'e.g. 4-16-4', qb_opening: 'Opening type', qb_specs: 'Additional specifications', qb_specs_ph: 'Handles, locks, mosquito nets, thresholds…', qb_notes: 'Notes', qb_notes_ph: 'Anything else we should know about this item',
      qb_files: 'Photo or drawing (optional)', qb_files_hint: 'JPG, PNG or PDF, up to 10 MB, max 3 files.', qb_add_file: 'Add file', qb_uploading: 'Uploading…',
      qb_add: 'Add to quotation', qb_save: 'Save changes', qb_cancel: 'Cancel', qb_add_more: 'Add another product', qb_edit: 'Edit', qb_remove: 'Remove', qb_continue: 'Continue', qb_back: 'Back', qb_review: 'Review request', qb_submit: 'Send quotation request',
      qb_list: 'Your quotation ({n})', qb_empty: 'No products added yet.', qb_need: 'Please enter width, height and quantity.', qb_need_items: 'Add at least one product first.',
      qb_fullname: 'Full name', qb_email: 'Email', qb_phone: 'Phone (with country code)', qb_phone_ph: '+357 99 000000', qb_company: 'Company name', qb_location: 'Project location', qb_ptype: 'Project type', qb_msg: 'Additional message', optional: 'optional',
      qb_privacy: 'I agree that {c} uses these details only to answer my quotation request.', qb_privacy_note: 'We use your details only to prepare and send your quotation. We do not share them with anyone else.',
      qb_err_name: 'Please enter your full name.', qb_err_email: 'Please enter a valid email address.', qb_err_phone: 'Please enter your phone number with the country code, e.g. +357.', qb_err_privacy: 'Please accept the privacy notice.',
      qb_customer: 'Customer details', qb_done_title: 'Thank you, your request has been sent.', qb_done_body: 'Your reference is {r}. We will review your products and measurements and contact you with a written quotation.', qb_done_wa: 'Also send it on WhatsApp', qb_new: 'Start a new request', qb_wa_msg: 'Hello {c}, I have sent quotation request {r}.',
      qb_sending: 'Sending…', qb_err_send: 'Your request could not be sent. Please try again, or contact us by phone or WhatsApp.', qb_err_file: 'This file could not be uploaded. Use JPG, PNG or PDF up to 10 MB.', qb_items_n: '{n} products', qb_item_1: '1 product',
      qb_eyebrow: 'Get a quote', qb_h: 'Build your quotation', qb_lead: 'Choose your aluminium products, add the sizes and we prepare a written quotation for you.',
      qg_doors: 'Doors', qg_windows: 'Windows', qg_sliding: 'Sliding systems', qg_glass: 'Glass', qg_custom: 'Custom solution', qb_other_cat: 'Something else? Tell us what you need.',
      qb_choose_prod: 'Choose product', qb_choose_model: 'Choose model', qb_change: 'Change', qb_not_sure: 'Not sure / other', qb_not_sure_sub: 'We help you choose the right system.',
      qb_sec_size: 'Measurements', qb_sec_finish: 'Colour, glass & opening', qb_sec_extra: 'Extra details', qb_qty_s: 'Qty', qb_pcs: '{n} pcs', qb_added: 'Added', qb_dup: 'Duplicate',
      qb_list_t: 'Your quotation list', qb_cont_details: 'Continue to your details', qb_sec_contact: 'Contact details', qb_sec_project: 'About the project', qb_cc: 'Country code',
      qb_need_prod: 'Please choose a product.', qb_pname: 'Product name', qb_pname_ph: 'e.g. glass railing, pergola', qb_need_pname: 'Please write the product you need.', qb_width_s: 'Width', qb_height_s: 'Height', qb_more: 'Notes, extras or a photo', qb_need_model: 'Please choose a model, or “Not sure”.', qb_talk: 'Prefer to talk to us?',
      colour_opts: ['White', 'Black', 'Anthracite grey', 'Silver (anodised)', 'Bronze', 'Wood effect', 'Other RAL colour (write in notes)', 'Not sure'],
      glass_opts: ['Double glazed', 'Triple glazed', 'Single glass', 'Laminated safety glass', 'Tempered glass', 'Frosted glass', 'No glass', 'Not sure'],
      opening_opts: ['Sliding', 'Lift & slide', 'Hinged / casement', 'Tilt & turn', 'Folding', 'Fixed', 'Not sure'],
      ptype_opts: ['New house', 'Renovation', 'Apartment building', 'Office / commercial', 'Other'],
      rev_title_f: 'Review title', rev_project: 'Project or product (optional)', rev_photos: 'Project photos (optional)', rev_photos_hint: 'Up to 3 photos.',
      reviews: 'Reviews', rev_title: 'What our clients say', rev_title_empty: 'Worked with us?', rev_empty: 'Tell others about your experience. Your review appears here after we check it.',
      rev_write: 'Write a review', rev_count: '{n} reviews', rev_one: '1 review', rev_form_title: 'Your review', rev_rating: 'Your rating', rev_text: 'Your experience', rev_place: 'Area / city (optional)',
      rv_h: 'Ratings and reviews', rv_rate: 'Rate our work', rv_rate_sub: 'Tell others what you think', rv_see_all: 'See all reviews', rv_empty_g: 'No reviews yet. Be the first to tell others about your experience.',
      rv_helpful_n: '{n} people found this helpful', rv_helpful_1: '1 person found this helpful', rv_was: 'Was this review helpful?', yes: 'Yes', no: 'No',
      rv_verified: 'Verified customer', rv_reply_from: 'Response from {c}', rv_edited: 'Edited', rv_more: 'More options', rv_report: 'Report review', rv_reported: 'Thank you. We will check this review.',
      rv_signin_t: 'Sign in to write a review', rv_signin_b: 'Use your Google account. You can write one review and edit or delete it at any time.', rv_privacy: 'Your Google name and photo are shown with your review. Your email is never shown.',
      rv_posting_as: 'Posting publicly as', rv_signout: 'Sign out', rv_signed_out: 'You are signed out.', rv_your: 'Your review', rv_edit: 'Edit your review', rv_delete: 'Delete', rv_sure: 'Sure?',
      rv_post: 'Post review', rv_update: 'Update review', rv_live: 'Thank you! Your review is now on the website.', rv_updated: 'Your review was updated.', rv_deleted: 'Your review was deleted.',
      rv_desc_ph: 'Describe your experience (at least 10 characters)', rv_need: 'Please choose a rating and write at least 10 characters.', rv_err_login: 'Sign-in did not work. Please try again.',
      rv_sort_rel: 'Most relevant', rv_sort_new: 'Newest', rv_none_filter: 'No reviews with this rating yet.', rv_page_sub: 'Reviews from customers signed in with a Google account.', rv_photo_n: 'Photo {n}', rv_hidden: 'This review is hidden by the company.',
      rev_send: 'Send review', rev_thanks: 'Thank you! Your review will appear on the website after we check it.', rev_need: 'Please choose a rating, add your name and write a few words.',
      help: 'Need help?', help_quote: 'Request a quote', help_email: 'Email us', help_call: 'Call us', close_help: 'Close',
      gal_eyebrow: 'Latest work', gal_title: 'Recently completed projects', gal_view: 'View full gallery', gallery: 'Gallery', all: 'All', new_label: 'New',
      gal_page_title: 'Our work', gal_page_sub: 'New projects are added here as we complete them.', back_home: 'Back to website', no_work: 'No projects in this category yet.', photos: 'photos', home: 'Home', projects: 'Projects', m_projects: 'Gallery', get_quote: 'Get a quote',
      proj_eyebrow: 'Our projects', proj_title: 'Iconic projects. Lasting impact.', proj_body: 'A selection of our aluminium and glass work for homes, offices and shops.', view_projects: 'View all projects',
      band_title: 'Let’s build something great together', band_body: 'Get a free consultation and quote today.', contact_us: 'Contact us', quick_links: 'Quick links', follow: 'Follow us', contact_info: 'Contact info',
      search_ph: 'Search, e.g. sliding doors', no_results: 'No results for “{q}”.', popular: 'Popular searches', chips: ['Sliding', 'Windows', 'Doors', 'Folding', 'Glass'],
      hero_eyebrow: 'Windows · Doors · Glass', explore_systems: 'Explore our products', watch: 'Watch video',
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
      call: 'Κλήση', leadership: 'Διοίκηση',
      ask_price: 'Ρωτήστε τιμή', ask_wa_msg: 'Γεια σας, θα ήθελα την τιμή για αυτό:', wa_note: 'Ανοίγει το WhatsApp με έτοιμο μήνυμα. Πατήστε μόνο αποστολή.',
      products: 'Συστήματα προφίλ', m_products: 'Συστήματα προφίλ', prod_eyebrow: 'Συστήματα προφίλ', view_all_prof: 'Όλα τα συστήματα προφίλ', prod_title: 'Τα μοντέλα προφίλ μας', prod_sub: 'Κατασκευάζουμε και τοποθετούμε αυτά τα συστήματα προφίλ αλουμινίου στα μέτρα σας. Τα προφίλ προμηθεύει η MUSKITA.', prod_maker: 'Κατασκευαστής προφίλ: MUSKITA',
      details: 'Λεπτομέρειες', add_quote: 'Προσθήκη στην προσφορά', added_quote: 'Προστέθηκε στην προσφορά σας', tech_data: 'Τεχνικά στοιχεία', tech_source: 'Πηγή: στοιχεία προϊόντος MUSKITA. Οι τιμές διαφέρουν ανά έκδοση και διαμόρφωση· επιβεβαιώνουμε τα ακριβή στοιχεία για το έργο σας.', tech_on_request: 'Τεχνικά στοιχεία κατόπιν αιτήματος.', colours: 'Χρώματα & φινιρίσματα', all_products: 'Όλα τα μοντέλα',
      qb_title: 'Ζητήστε προσφορά', qb_sub: 'Προσθέστε κάθε πόρτα, παράθυρο ή σύστημα που χρειάζεστε. Ελέγχουμε τις διαστάσεις και σας στέλνουμε γραπτή προσφορά.',
      qb_step1: 'Προϊόντα', qb_step2: 'Στοιχεία', qb_step3: 'Έλεγχος', qb_product: 'Προϊόν {n}', qb_edit_product: 'Επεξεργασία προϊόντος {n}',
      qb_cat: 'Κατηγορία προϊόντος', qb_model: 'Μοντέλο', qb_model_other: 'Άλλο / δεν είμαι σίγουρος', qb_choose: 'Επιλέξτε…', qb_width: 'Πλάτος (mm)', qb_height: 'Ύψος (mm)', qb_qty: 'Ποσότητα',
      qb_colour: 'Χρώμα / φινίρισμα', qb_glass: 'Τύπος γυαλιού', qb_glass_thk: 'Πάχος γυαλιού', qb_glass_thk_ph: 'π.χ. 4-16-4', qb_opening: 'Τύπος ανοίγματος', qb_specs: 'Επιπλέον προδιαγραφές', qb_specs_ph: 'Χερούλια, κλειδαριές, σήτες, κατωκάσια…', qb_notes: 'Σημειώσεις', qb_notes_ph: 'Οτιδήποτε άλλο πρέπει να γνωρίζουμε για αυτό το προϊόν',
      qb_files: 'Φωτογραφία ή σχέδιο (προαιρετικά)', qb_files_hint: 'JPG, PNG ή PDF, έως 10 MB, έως 3 αρχεία.', qb_add_file: 'Προσθήκη αρχείου', qb_uploading: 'Μεταφόρτωση…',
      qb_add: 'Προσθήκη στην προσφορά', qb_save: 'Αποθήκευση αλλαγών', qb_cancel: 'Ακύρωση', qb_add_more: 'Προσθήκη άλλου προϊόντος', qb_edit: 'Επεξεργασία', qb_remove: 'Αφαίρεση', qb_continue: 'Συνέχεια', qb_back: 'Πίσω', qb_review: 'Έλεγχος αιτήματος', qb_submit: 'Αποστολή αιτήματος προσφοράς',
      qb_list: 'Η προσφορά σας ({n})', qb_empty: 'Δεν έχετε προσθέσει προϊόντα ακόμη.', qb_need: 'Συμπληρώστε πλάτος, ύψος και ποσότητα.', qb_need_items: 'Προσθέστε πρώτα τουλάχιστον ένα προϊόν.',
      qb_fullname: 'Ονοματεπώνυμο', qb_email: 'Email', qb_phone: 'Τηλέφωνο (με κωδικό χώρας)', qb_phone_ph: '+357 99 000000', qb_company: 'Εταιρεία', qb_location: 'Τοποθεσία έργου', qb_ptype: 'Είδος έργου', qb_msg: 'Επιπλέον μήνυμα', optional: 'προαιρετικό',
      qb_privacy: 'Συμφωνώ η {c} να χρησιμοποιήσει αυτά τα στοιχεία μόνο για να απαντήσει στο αίτημα προσφοράς μου.', qb_privacy_note: 'Χρησιμοποιούμε τα στοιχεία σας μόνο για να ετοιμάσουμε και να σας στείλουμε την προσφορά. Δεν τα μοιραζόμαστε με κανέναν.',
      qb_err_name: 'Συμπληρώστε το ονοματεπώνυμό σας.', qb_err_email: 'Συμπληρώστε έγκυρη διεύθυνση email.', qb_err_phone: 'Συμπληρώστε τηλέφωνο με κωδικό χώρας, π.χ. +357.', qb_err_privacy: 'Αποδεχτείτε τη σημείωση απορρήτου.',
      qb_customer: 'Στοιχεία πελάτη', qb_done_title: 'Ευχαριστούμε, το αίτημά σας στάλθηκε.', qb_done_body: 'Ο αριθμός αναφοράς σας είναι {r}. Θα ελέγξουμε τα προϊόντα και τις διαστάσεις και θα επικοινωνήσουμε μαζί σας με γραπτή προσφορά.', qb_done_wa: 'Στείλτε το και στο WhatsApp', qb_new: 'Νέο αίτημα', qb_wa_msg: 'Γεια σας, έστειλα το αίτημα προσφοράς {r}.',
      qb_sending: 'Αποστολή…', qb_err_send: 'Το αίτημα δεν στάλθηκε. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας τηλεφωνικά ή στο WhatsApp.', qb_err_file: 'Το αρχείο δεν ανέβηκε. Χρησιμοποιήστε JPG, PNG ή PDF έως 10 MB.', qb_items_n: '{n} προϊόντα', qb_item_1: '1 προϊόν',
      qb_eyebrow: 'Προσφορά', qb_h: 'Δημιουργήστε την προσφορά σας', qb_lead: 'Επιλέξτε τα προϊόντα αλουμινίου, προσθέστε τις διαστάσεις και ετοιμάζουμε γραπτή προσφορά για εσάς.',
      qg_doors: 'Πόρτες', qg_windows: 'Παράθυρα', qg_sliding: 'Συρόμενα συστήματα', qg_glass: 'Γυαλί', qg_custom: 'Ειδική κατασκευή', qb_other_cat: 'Κάτι άλλο; Πείτε μας τι χρειάζεστε.',
      qb_choose_prod: 'Επιλέξτε προϊόν', qb_choose_model: 'Επιλέξτε μοντέλο', qb_change: 'Αλλαγή', qb_not_sure: 'Δεν είμαι σίγουρος / άλλο', qb_not_sure_sub: 'Σας βοηθάμε να επιλέξετε το σωστό σύστημα.',
      qb_sec_size: 'Διαστάσεις', qb_sec_finish: 'Χρώμα, γυαλί & άνοιγμα', qb_sec_extra: 'Επιπλέον στοιχεία', qb_qty_s: 'Ποσ.', qb_pcs: '{n} τεμ.', qb_added: 'Προστέθηκε', qb_dup: 'Αντιγραφή',
      qb_list_t: 'Η λίστα προσφοράς σας', qb_cont_details: 'Συνέχεια στα στοιχεία σας', qb_sec_contact: 'Στοιχεία επικοινωνίας', qb_sec_project: 'Για το έργο', qb_cc: 'Κωδικός χώρας',
      qb_need_prod: 'Επιλέξτε προϊόν.', qb_pname: 'Όνομα προϊόντος', qb_pname_ph: 'π.χ. γυάλινο κάγκελο, πέργκολα', qb_need_pname: 'Γράψτε το προϊόν που χρειάζεστε.', qb_width_s: 'Πλάτος', qb_height_s: 'Ύψος', qb_more: 'Σημειώσεις, επιπλέον ή φωτογραφία', qb_need_model: 'Επιλέξτε μοντέλο ή «Δεν είμαι σίγουρος».', qb_talk: 'Προτιμάτε να μιλήσουμε;',
      colour_opts: ['Λευκό', 'Μαύρο', 'Ανθρακί', 'Ασημί (ανοδίωση)', 'Μπρονζέ', 'Απομίμηση ξύλου', 'Άλλο χρώμα RAL (γράψτε στις σημειώσεις)', 'Δεν είμαι σίγουρος'],
      glass_opts: ['Διπλό τζάμι', 'Τριπλό τζάμι', 'Μονό τζάμι', 'Laminated γυαλί ασφαλείας', 'Σκληρυμένο γυαλί', 'Αμμοβολή / θαμπό', 'Χωρίς γυαλί', 'Δεν είμαι σίγουρος'],
      opening_opts: ['Συρόμενο', 'Ανυψούμενο-συρόμενο', 'Ανοιγόμενο', 'Ανοιγοανακλινόμενο', 'Πτυσσόμενο', 'Σταθερό', 'Δεν είμαι σίγουρος'],
      ptype_opts: ['Νέα κατοικία', 'Ανακαίνιση', 'Πολυκατοικία', 'Γραφείο / επαγγελματικός χώρος', 'Άλλο'],
      rev_title_f: 'Τίτλος κριτικής', rev_project: 'Έργο ή προϊόν (προαιρετικά)', rev_photos: 'Φωτογραφίες έργου (προαιρετικά)', rev_photos_hint: 'Έως 3 φωτογραφίες.',
      reviews: 'Κριτικές', rev_title: 'Τι λένε οι πελάτες μας', rev_title_empty: 'Συνεργαστήκατε μαζί μας;', rev_empty: 'Μοιραστείτε την εμπειρία σας. Η κριτική σας εμφανίζεται εδώ μετά από έλεγχο.',
      rev_write: 'Γράψτε κριτική', rev_count: '{n} κριτικές', rev_one: '1 κριτική', rev_form_title: 'Η κριτική σας', rev_rating: 'Η βαθμολογία σας', rev_text: 'Η εμπειρία σας', rev_place: 'Περιοχή / πόλη (προαιρετικά)',
      rv_h: 'Αξιολογήσεις και κριτικές', rv_rate: 'Βαθμολογήστε τη δουλειά μας', rv_rate_sub: 'Πείτε στους άλλους τη γνώμη σας', rv_see_all: 'Όλες οι κριτικές', rv_empty_g: 'Δεν υπάρχουν κριτικές ακόμη. Γίνετε ο πρώτος που θα μοιραστεί την εμπειρία του.',
      rv_helpful_n: '{n} άτομα το βρήκαν χρήσιμο', rv_helpful_1: '1 άτομο το βρήκε χρήσιμο', rv_was: 'Ήταν χρήσιμη αυτή η κριτική;', yes: 'Ναι', no: 'Όχι',
      rv_verified: 'Επαληθευμένος πελάτης', rv_reply_from: 'Απάντηση από {c}', rv_edited: 'Επεξεργασμένη', rv_more: 'Περισσότερα', rv_report: 'Αναφορά κριτικής', rv_reported: 'Ευχαριστούμε. Θα ελέγξουμε αυτή την κριτική.',
      rv_signin_t: 'Συνδεθείτε για να γράψετε κριτική', rv_signin_b: 'Χρησιμοποιήστε τον λογαριασμό σας Google. Γράφετε μία κριτική και μπορείτε να την αλλάξετε ή να τη διαγράψετε όποτε θέλετε.', rv_privacy: 'Το όνομα και η φωτογραφία σας από το Google εμφανίζονται με την κριτική. Το email σας δεν εμφανίζεται ποτέ.',
      rv_posting_as: 'Δημοσίευση ως', rv_signout: 'Αποσύνδεση', rv_signed_out: 'Αποσυνδεθήκατε.', rv_your: 'Η κριτική σας', rv_edit: 'Επεξεργασία κριτικής', rv_delete: 'Διαγραφή', rv_sure: 'Σίγουρα;',
      rv_post: 'Δημοσίευση κριτικής', rv_update: 'Ενημέρωση κριτικής', rv_live: 'Ευχαριστούμε! Η κριτική σας δημοσιεύτηκε.', rv_updated: 'Η κριτική σας ενημερώθηκε.', rv_deleted: 'Η κριτική σας διαγράφηκε.',
      rv_desc_ph: 'Περιγράψτε την εμπειρία σας (τουλάχιστον 10 χαρακτήρες)', rv_need: 'Επιλέξτε βαθμολογία και γράψτε τουλάχιστον 10 χαρακτήρες.', rv_err_login: 'Η σύνδεση δεν πέτυχε. Δοκιμάστε ξανά.',
      rv_sort_rel: 'Πιο σχετικές', rv_sort_new: 'Νεότερες', rv_none_filter: 'Δεν υπάρχουν ακόμη κριτικές με αυτή τη βαθμολογία.', rv_page_sub: 'Κριτικές από πελάτες συνδεδεμένους με λογαριασμό Google.', rv_photo_n: 'Φωτογραφία {n}', rv_hidden: 'Αυτή η κριτική έχει αποκρυφτεί από την εταιρεία.',
      rev_send: 'Αποστολή κριτικής', rev_thanks: 'Ευχαριστούμε! Η κριτική σας θα εμφανιστεί στην ιστοσελίδα μετά από έλεγχο.', rev_need: 'Επιλέξτε βαθμολογία, γράψτε το όνομά σας και λίγα λόγια.',
      help: 'Χρειάζεστε βοήθεια;', help_quote: 'Ζητήστε προσφορά', help_email: 'Στείλτε email', help_call: 'Καλέστε μας', close_help: 'Κλείσιμο',
      gal_eyebrow: 'Πρόσφατα έργα', gal_title: 'Έργα που ολοκληρώσαμε πρόσφατα', gal_view: 'Δείτε όλα τα έργα', gallery: 'Έργα', all: 'Όλα', new_label: 'Νέο',
      gal_page_title: 'Τα έργα μας', gal_page_sub: 'Εδώ προσθέτουμε τα νέα έργα μόλις ολοκληρωθούν.', back_home: 'Πίσω στην ιστοσελίδα', no_work: 'Δεν υπάρχουν ακόμη έργα σε αυτή την κατηγορία.', photos: 'φωτογραφίες', home: 'Αρχική', projects: 'Έργα', m_projects: 'Έργα', get_quote: 'Ζητήστε προσφορά',
      proj_eyebrow: 'Τα έργα μας', proj_title: 'Εμβληματικά έργα. Διαρκές αποτύπωμα.', proj_body: 'Επιλογή από τις κατασκευές μας σε αλουμίνιο και γυαλί για σπίτια, γραφεία και καταστήματα.', view_projects: 'Όλα τα έργα',
      band_title: 'Ας φτιάξουμε κάτι σπουδαίο μαζί', band_body: 'Ζητήστε δωρεάν συμβουλή και προσφορά σήμερα.', contact_us: 'Επικοινωνία', quick_links: 'Σύνδεσμοι', follow: 'Ακολουθήστε μας', contact_info: 'Στοιχεία επικοινωνίας',
      search_ph: 'Αναζήτηση, π.χ. συρόμενες πόρτες', no_results: 'Δεν βρέθηκαν αποτελέσματα για «{q}».', popular: 'Δημοφιλείς αναζητήσεις', chips: ['Συρόμενα', 'Παράθυρα', 'Πόρτες', 'Πτυσσόμενα', 'Γυαλί'],
      hero_eyebrow: 'Παράθυρα · Πόρτες · Γυαλί', explore_systems: 'Δείτε τα προϊόντα μας', watch: 'Δείτε το βίντεο',
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
    if (Array.isArray(s)) return s;
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
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    phone: '<path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    dots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    play: '<path d="M9 6.5v11l9-5.5z"/>',
    chat: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/><path d="M11 13l9-9"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6.5" rx="1.6"/><rect x="17.5" y="13" width="4" height="6.5" rx="1.6"/><path d="M19.5 19.5a4 4 0 0 1-4 3H13"/>',
    images: '<rect x="3" y="6" width="15" height="13" rx="1.5"/><path d="M7 3h12a2 2 0 0 1 2 2v10M3 16l4.5-4.5 3.5 3.5 2.5-2.5 4.5 4.5"/>',
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
  // WhatsApp message about one item; the /p/ link shows the photo and title as a preview card inside WhatsApp
  const askWa = (kind, id, title) => waLink(`${u('ask_wa_msg', { c: S.company.name })}\n${title}\n${location.origin}/p/${kind}/${encodeURIComponent(id)}`);
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
          <button type="button" class="mega-btn" data-p="mega" aria-expanded="false" aria-controls="mega">${u('m_systems')}${icon('chev')}</button>
          ${prods().length ? `<button type="button" class="mega-btn" data-p="pmega" aria-expanded="false" aria-controls="pmega">${u('products')}${icon('chev')}</button>` : ''}<a href="#projects">${u('m_projects')}</a><a href="#about">${u('m_about')}</a><a href="#quote">${u('contact')}</a>
        </nav>
        <button type="button" class="icon-btn srch-btn" aria-expanded="false" aria-controls="srch" aria-label="${u('search')}">${icon('search')}</button>
        ${langSelect()}
        <a class="btn btn-ghost nav-cta" href="#quote">${u('get_quote')}${icon('arrow')}</a>
        <button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="mnav" aria-label="${u('menu')}"><i><b></b><b></b><b></b></i></button>
      </div>
      <div class="mega" id="mega" hidden><div class="wrap mega-in">
        <div class="mega-intro"><p class="eyebrow">${u('systems_eyebrow')}</p><h3>${esc(t(S.text.systemsTitle))}</h3><p>${esc(t(S.text.systemsSub))}</p><a class="arrow-link" href="#systems">${u('view_all')}${icon('arrow')}</a></div>
        <ul class="mega-grid">${list.map((s, i) => `<li><a href="#${esc(s.slug)}"><img src="${esc(src(s.image))}" alt="" loading="lazy"><span><small>${pad(i + 1)}</small>${esc(t(s.name))}</span></a></li>`).join('')}</ul>
      </div></div>
      ${prods().length ? `<div class="mega" id="pmega" hidden><div class="wrap mega-in">
        <div class="mega-intro"><p class="eyebrow">${u('prod_eyebrow')}</p><h3>${u('prod_title')}</h3><p>${u('prod_sub')}</p><a class="arrow-link" href="#products">${u('view_all_prof')}${icon('arrow')}</a></div>
        <ul class="mega-grid">${prods().map((x) => `<li><a href="#${esc(x.id)}"><img src="${esc(src(x.image))}" alt="" loading="lazy"><span><small>${esc(x.model)}</small>${esc(t(x.name))}</span></a></li>`).join('')}</ul>
      </div></div>` : ''}
      <div class="srch" id="srch" hidden><div class="wrap srch-in" data-search>${searchBox('sq-top')}</div></div>
    </header>
    <div class="mnav" id="mnav" aria-hidden="true">
      <div class="mnav-search" data-search>${searchBox('sq-menu')}</div>
      <div class="mnav-nav">
        <p class="mnav-label">${u('main_menu')}</p>
        <ul class="mnav-main">
          <li><a href="#top"><span><i class="mi">${icon('home')}</i>${u('home')}</span>${icon('right')}</a></li>
          <li><button type="button" class="acc" aria-expanded="false" aria-controls="acc-sys"><span><i class="mi">${icon('grid')}</i>${u('m_systems')}</span>${icon('chev')}</button>
            <div class="acc-panel" id="acc-sys"><ul>${list.map((s, i) => `<li><a href="#${esc(s.slug)}"><small>${pad(i + 1)}</small>${esc(t(s.name))}</a></li>`).join('')}</ul></div></li>
          ${prods().length ? `<li><button type="button" class="acc" aria-expanded="false" aria-controls="acc-prof"><span><i class="mi">${icon('layers')}</i>${u('m_products')}</span>${icon('chev')}</button>
            <div class="acc-panel" id="acc-prof"><ul>${prods().map((x) => `<li><a href="#${esc(x.id)}"><small class="mdl">${esc(x.model)}</small>${esc(t(x.name))}</a></li>`).join('')}<li><a class="acc-all" href="#products">${u('view_all_prof')}${icon('arrow')}</a></li></ul></div></li>` : ''}
          <li><a href="#projects"><span><i class="mi">${icon('images')}</i>${u('m_projects')}</span>${icon('right')}</a></li>
          <li><a href="#reviews"><span><i class="mi">${icon('star')}</i>${u('reviews')}</span>${icon('right')}</a></li>
          <li><a href="#about"><span><i class="mi">${icon('users')}</i>${u('m_about')}</span>${icon('right')}</a></li>
          <li><a href="#quote"><span><i class="mi">${icon('mail')}</i>${u('m_contact')}</span>${icon('right')}</a></li>
        </ul>
        <div class="mnav-short">
          ${c.phone ? `<a href="${telLink()}">${icon('phone')}<span>${u('call')}</span></a>` : ''}
          ${waLink() ? `<a href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener">${waIcon}<span>WhatsApp</span></a>` : ''}
          <a href="#quote">${icon('file')}<span>${u('quote')}</span></a>
        </div>
      </div>
    </div>`;
  }

  /* ---------- hero: one full-screen photo or video ---------- */
  // one background: the uploaded video if there is one, otherwise the photo (which also shows while the video loads)
  function heroSlides() {
    return [{ img: S.heroImage || 'img/glass-room.jpg', video: S.heroVideo || '' }];
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
          <h1>${esc(t(S.text.heroTitle))}<span class="silver">${esc(t(S.text.heroAccent))}</span></h1>
        </div>
` : ''}
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
        <div class="rail rv-kids" id="rail">${list
          .map(
            (s, i) => `<a class="card" style="--i:${Math.min(i, 6)}" href="#${esc(s.slug)}"><img src="${esc(src(s.image))}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}"><span class="card-n">${esc(t(s.name))}${icon('arrow')}</span></a>`
          )
          .join('')}</div>
        <button type="button" class="rail-btn next" data-rail="1" aria-label="Next">${icon('arrow')}</button>
        <div class="rail-prog" aria-hidden="true"><i></i></div>
      </div>
    </section>`;
  }

  /* ---------- aluminium profile systems (models) ---------- */
  const prods = () => (S.products || []).filter((x) => x && x.visible !== false && x.model);
  const byProd = (id) => prods().find((x) => x.id === id);
  const pcat = (id) => { const c = (S.productCats || []).find((x) => x.id === id); return c ? t(c.name) : ''; };
  let pf = 'all';
  function prodCards() {
    const L = prods().filter((x) => pf === 'all' || x.cat === pf);
    return L.map((x, i) => `<article class="prod" style="--i:${i}">
      <a class="prod-img" href="#${esc(x.id)}" tabindex="-1" aria-hidden="true"><img src="${esc(src(x.image))}" alt="" loading="lazy"><span>${esc(pcat(x.cat))}</span></a>
      <div class="prod-b"><p class="prod-m">${esc(x.model)}</p><h3><a href="#${esc(x.id)}">${esc(t(x.name))}</a></h3><p>${esc(t(x.short))}</p>
      <div class="prod-acts"><a class="link-sm" href="#${esc(x.id)}">${u('details')}${icon('arrow')}</a><button type="button" class="btn btn-sm btn-accent" data-addq="${esc(x.id)}">${icon('file')}${u('add_quote')}</button></div></div>
    </article>`).join('');
  }
  function products() {
    const L = prods();
    if (!L.length) return '';
    const used = new Set(L.map((x) => x.cat));
    const cats = (S.productCats || []).filter((c) => used.has(c.id));
    return `<section class="prods" id="products"><div class="wrap">
      <div class="proj-head rv"><div><p class="eyebrow">${u('prod_eyebrow')}</p><h2>${u('prod_title')}</h2><p class="prods-sub">${u('prod_sub')}</p></div></div>
      ${cats.length > 1 ? `<div class="chips" role="group" aria-label="${u('products')}">${[{ id: 'all', name: u('all_products') }, ...cats.map((c) => ({ id: c.id, name: t(c.name) }))].map((c) => `<button type="button" data-pf="${esc(c.id)}" aria-pressed="${pf === c.id}">${esc(c.name)}</button>`).join('')}</div>` : ''}
      <div class="prod-rail"><button type="button" class="rail-btn prev" data-prail="-1" aria-label="Previous">${icon('back')}</button><div class="prod-grid rv-kids" id="prod-grid">${prodCards()}</div><button type="button" class="rail-btn next" data-prail="1" aria-label="Next">${icon('arrow')}</button></div>
    </div></section>`;
  }
  function productPage(x) {
    const specs = (x.specs || []).filter((r) => t(r.label) && String(r.value || '').trim());
    const apps = (x.applications || []).map(t).filter(Boolean);
    return `<div class="sp-bar"><div class="wrap">
        <a class="sp-back" href="#products">${icon('back')}${u('products')}</a>
        <span class="sp-title">${esc(x.model)}</span>
        <button type="button" class="btn btn-accent" data-addq="${esc(x.id)}">${u('add_quote')}</button>
      </div></div>
      <section class="sp-hero"><div class="wrap sp-hero-grid">
        <div>
          <p class="eyebrow">${esc(pcat(x.cat))}</p>
          <h1>${esc(x.model)}</h1>
          <p class="lead">${esc(t(x.name))}</p>
          <p class="sp-maker">${u('prod_maker')}</p>
          ${t(x.desc) ? `<p class="prod-desc">${esc(t(x.desc))}</p>` : ''}
          <div class="sp-cta">
            <button type="button" class="btn btn-navy" data-addq="${esc(x.id)}">${icon('file')}${u('add_quote')}</button>
            ${waLink() ? `<a class="btn btn-wa" href="${esc(askWa('m', x.id, x.model + ' · ' + t(x.name)))}" target="_blank" rel="noopener">${waIcon}${u('ask_price')}</a>` : ''}
          </div>
          ${apps.length ? `<ul class="sp-apps" aria-label="${u('applications')}">${apps.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
        </div>
        ${x.image ? `<figure class="sp-hero-img"><img src="${esc(src(x.image))}" alt="${esc(x.model)}"></figure>` : ''}
      </div></section>
      <section class="sp-sec"><div class="wrap sp-two">
        <div><p class="eyebrow">${u('tech_data')}</p><h2>${u('specs')}</h2></div>
        <div>${specs.length ? `<table class="spec-table"><tbody>${specs.map((r) => `<tr><th scope="row">${esc(t(r.label))}</th><td>${esc(r.value)}</td></tr>`).join('')}</tbody></table>` : `<p class="prod-desc">${u('tech_on_request')}</p>`}
          ${t(x.colours) ? `<h3 class="prod-h3">${u('colours')}</h3><p class="prod-desc">${esc(t(x.colours))}</p>` : ''}
          ${specs.length || t(x.colours) ? `<p class="spec-note">${icon('info')}<span>${u('tech_source')}${x.source ? ` <a href="${esc(x.source)}" target="_blank" rel="noopener">MUSKITA</a>` : ''}</span></p>` : ''}
        </div>
      </div></section>
      <section class="sp-band"><div class="wrap"><div><h2>${u('cta_title')}</h2><p>${u('cta_body')}</p></div>
        <div class="btns"><button type="button" class="btn btn-accent" data-addq="${esc(x.id)}">${u('add_quote')}</button>${S.company.phone ? `<a class="btn btn-ghost" href="${telLink()}">${icon('phone')}${esc(S.company.phone)}</a>` : ''}</div></div></section>
      ${footerMini()}`;
  }

  /* ---------- about: image (with video button), text, key points ---------- */
  function about() {
    const img = S.aboutImage || 'img/alu-profiles.jpg';
    const v = (S.values || []).filter((x) => t(x.title));
    const stats = (S.stats || []).filter((x) => String(x.value || '').trim());
    return `<section class="about" id="about">
      <div class="about-grid">
        <figure class="about-media rv">${S.aboutVideo ? `<video src="${esc(src(S.aboutVideo))}" poster="${esc(src(img))}" muted loop autoplay playsinline preload="metadata" aria-hidden="true"></video>` : `<img src="${esc(src(img))}" alt="" loading="lazy">`}${S.heroVideo && !S.aboutVideo ? `<button type="button" class="about-play" data-video aria-label="${u('watch')}">${icon('play')}</button>` : ''}</figure>
        <div class="about-text rv">
          <p class="eyebrow">${u('about_eyebrow')} ${esc(S.company.name)}</p>
          <h2>${esc(t(S.text.introTitle))}</h2>
          <p>${esc(t(S.text.introBody))}</p>
        </div>
        ${v.length ? `<ul class="about-feats rv-kids">${v.slice(0, 4).map((x, i) => `<li style="--i:${i}">${icon(x.icon)}<span>${esc(t(x.title))}</span></li>`).join('')}</ul>` : ''}
      </div>
      <div class="wrap">${stats.length ? `<ul class="about-stats rv-kids">${stats.map((x, i) => `<li style="--i:${i}"><b data-count="${esc(x.value)}">${esc(x.value)}</b><span>${esc(t(x.label))}</span></li>`).join('')}</ul>` : ''}${founder()}</div>
    </section>`;
  }

  /* ---------- latest work + gallery ---------- */
  const NEW_DAYS = 45;
  const gf = { home: 'all', page: 'all' };
  const works = () => (S.works || []).filter((w) => w && (w.images || []).length);
  const catName = (id) => { const c = (S.galleryCats || []).find((x) => x.id === id); return c ? t(c.name) : ''; };
  const isNew = (w) => !!w.ts && Date.now() - w.ts < NEW_DAYS * 864e5;
  const workDate = (w) => {
    const m = /^(\d{4})-(\d{2})/.exec(w.date || '');
    return m ? new Date(+m[1], +m[2] - 1, 1).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', { month: 'short', year: 'numeric' }) : '';
  };
  function workCard(w, i) {
    const meta = [catName(w.cat), workDate(w)].filter(Boolean).join(' · ');
    return `<button type="button" class="work" style="--i:${Math.min(i, 8)}" data-work="${esc(w.id)}" aria-label="${esc(t(w.title))}">
      <img src="${esc(src(w.images[0]))}" alt="" loading="lazy">
      ${isNew(w) ? `<span class="work-new">${u('new_label')}</span>` : ''}
      ${w.images.length > 1 ? `<span class="work-n">${icon('images')}${w.images.length}</span>` : ''}
      <span class="work-b">${meta ? `<small>${esc(meta)}</small>` : ''}<b>${esc(t(w.title))}</b>${t(w.place) ? `<em>${esc(t(w.place))}</em>` : ''}</span>
    </button>`;
  }
  function chips(where) {
    const used = new Set(works().map((w) => w.cat));
    const cats = (S.galleryCats || []).filter((c) => used.has(c.id) && t(c.name));
    if (cats.length < 2) return '';
    return `<div class="chips" role="group" aria-label="${u('gallery')}">${[{ id: 'all', name: u('all') }, ...cats.map((c) => ({ id: c.id, name: t(c.name) }))].map((c) => `<button type="button" data-gf="${where}" data-c="${esc(c.id)}" aria-pressed="${gf[where] === c.id}">${esc(c.name)}</button>`).join('')}</div>`;
  }
  function workList(where) {
    const list = works().filter((w) => gf[where] === 'all' || w.cat === gf[where]);
    const shown = where === 'home' ? list.slice(0, 6) : list;
    return shown.length ? shown.map(workCard).join('') : `<p class="work-empty">${u('no_work')}</p>`;
  }
  function projects() {
    if (!works().length) return '';
    return `<section class="projects" id="projects">
      <div class="wrap proj-head rv"><div><p class="eyebrow">${u('gal_eyebrow')}</p><h2>${u('gal_title')}</h2></div><a class="link-sm" href="#gallery">${u('gal_view')}${icon('arrow')}</a></div>
      <div class="wrap">${chips('home')}</div>
      <div class="work-grid home rv-kids" id="work-home">${workList('home')}</div>
    </section>`;
  }
  function galleryPage() {
    return `<div class="sp-bar"><div class="wrap">
        <a class="sp-back" href="#projects">${icon('back')}${u('back_home')}</a>
        <span class="sp-title">${u('gallery')}</span>
        <a class="btn btn-accent" href="#quote">${u('quote')}</a>
      </div></div>
      <section class="gal-head"><div class="wrap"><p class="eyebrow">${u('gallery')}</p><h1>${u('gal_page_title')}</h1><p>${u('gal_page_sub')}</p>${chips('page')}</div></section>
      <section class="gal-body"><div class="wrap"><div class="work-grid" id="work-page">${workList('page')}</div></div></section>
      ${footerMini()}`;
  }

  function band() {
    return `<section class="band"><div class="wrap band-grid">
      <div class="band-cta rv"><span class="band-ic">${icon('handshake')}</span><div><h3>${u('band_title')}</h3><p>${u('band_body')}</p></div><a class="btn btn-accent" href="#quote">${u('contact_us')}${icon('arrow')}</a></div>
    </div></section>`;
  }

  /* ---------- reviews (Play Store style: Google sign-in, one review per account, shown at once) ---------- */
  const reviewsList = () => (S.reviews || []).filter((r) => r && String(r.text || '').trim() && String(r.name || '').trim());
  const STAR = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z';
  const stars = (n) => `<span class="stars" role="img" aria-label="${n} / 5">${[1, 2, 3, 4, 5].map((i) => `<svg viewBox="0 0 24 24" class="${i <= n ? 'on' : ''}" aria-hidden="true"><path d="${STAR}"/></svg>`).join('')}</span>`;
  const rate5 = (r) => Math.min(5, Math.max(1, Math.round(+r.rating) || 5));
  const rvDay = (ts) => (ts ? new Date(ts).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  const GCID = () => String((S.reviewSettings || {}).googleClientId || '').trim();
  const googleOn = () => !!(GCID() || S.devLogin);
  let RV = { user: null, mine: null };
  let rvVotes = {};
  try { rvVotes = JSON.parse(localStorage.getItem('rv-votes') || '{}') || {}; } catch (e) {}
  const uRevs = () => (S.ureviews || []).filter((r) => r && r.text);
  const allRevs = () => [...uRevs(), ...reviewsList().map((r) => ({ ...r, legacy: true }))];
  const byRelevance = (a, b) => (!!b.verified - !!a.verified) || ((b.helpful || 0) - (a.helpful || 0)) || (((b.photos || []).length > 0) - ((a.photos || []).length > 0)) || ((b.uts || b.ts || 0) - (a.uts || a.ts || 0));
  const hue = (s) => [...String(s || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const avatar = (r) => (r.pic ? `<span class="rva"><img src="${esc(r.pic)}" alt="" referrerpolicy="no-referrer" loading="lazy"></span>` : `<span class="rva" style="--h:${hue(r.name)}">${esc(String(r.name || '?').trim().charAt(0).toUpperCase())}</span>`);

  function revCard(r, i) {
    const own = RV.mine && r.id === RV.mine.id;
    const edited = r.uts && r.ts && r.uts - r.ts > 60000;
    const v = rvVotes[r.id] || 0;
    const meta = [own ? u('rv_your') : '', rvDay(r.uts || r.ts), edited ? u('rv_edited') : '', r.legacy ? r.place : ''].filter(Boolean).join(' · ');
    return `<article class="rvc" style="--i:${i || 0}" data-rid="${esc(r.id)}">
      <header class="rvc-h">${avatar(r)}<div class="rvc-n"><b>${esc(r.name)}</b>${r.verified ? `<small class="rv-ver">${icon('check')}${u('rv_verified')}</small>` : ''}</div>
        ${!r.legacy && !own ? `<div class="rvc-menu"><button type="button" class="rvc-more" data-rvmenu aria-label="${u('rv_more')}" aria-expanded="false">${icon('dots')}</button><div class="rvc-pop" hidden><button type="button" data-rvreport="${esc(r.id)}">${icon('info')}${u('rv_report')}</button></div></div>` : ''}</header>
      <div class="rvc-meta">${stars(rate5(r))}<span>${esc(meta)}</span></div>
      ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
      <p class="rvc-t">${esc(r.text)}</p>
      ${(r.photos || []).length ? `<div class="rev-ph">${r.photos.map((ph, k) => `<button type="button" data-rvp="${esc(r.id)}" data-k="${k}" aria-label="${u('zoom')}"><img src="${esc(src(ph))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      ${r.project ? `<small class="rev-proj">${esc(r.project)}</small>` : ''}
      ${r.helpful ? `<p class="rvc-hn">${r.helpful === 1 ? u('rv_helpful_1') : u('rv_helpful_n', { n: r.helpful })}</p>` : ''}
      ${!r.legacy && !own ? `<div class="rvc-vote"><span>${u('rv_was')}</span><button type="button" data-rvvote="${esc(r.id)}" data-v="1" aria-pressed="${v === 1}">${u('yes')}</button><button type="button" data-rvvote="${esc(r.id)}" data-v="-1" aria-pressed="${v === -1}">${u('no')}</button></div>` : ''}
      ${r.reply && r.reply.text ? `<div class="rvc-reply"><div><b>${esc(u('rv_reply_from', { c: S.company.name }))}</b><span>${esc(rvDay(r.reply.ts))}</span></div><p>${esc(r.reply.text)}</p></div>` : ''}
    </article>`;
  }
  function revSummary(L) {
    const n = L.length, avg = n ? L.reduce((a, r) => a + rate5(r), 0) / n : 0;
    return `<div class="rv-sum"><div class="rv-big"><b>${avg.toFixed(1)}</b>${stars(Math.round(avg))}<span>${n === 1 ? u('rev_one') : u('rev_count', { n })}</span></div>
      <ul class="rv-bars" aria-hidden="true">${[5, 4, 3, 2, 1].map((s) => { const c = L.filter((r) => rate5(r) === s).length; return `<li><span>${s}</span><i><b style="width:${n ? Math.round((c / n) * 100) : 0}%"></b></i></li>`; }).join('')}</ul></div>`;
  }
  function rateBox() {
    if (RV.mine) return `<div class="rv-rate mine"><p class="rv-rate-h">${u('rv_your')}</p>${stars(rate5(RV.mine))}<p class="rv-mine-t">${esc(RV.mine.text)}</p>${RV.mine.hidden ? `<p class="rv-rate-s">${u('rv_hidden')}</p>` : ''}<button type="button" class="link-sm" data-review>${icon('pen')}${u('rv_edit')}</button></div>`;
    return `<div class="rv-rate"><p class="rv-rate-h">${u('rv_rate')}</p><p class="rv-rate-s">${u('rv_rate_sub')}</p>
      <div class="rv-pick" role="group" aria-label="${u('rev_rating')}">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-rate="${i}" aria-label="${i} / 5"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg></button>`).join('')}</div>
      <button type="button" class="link-sm" data-review>${u('rev_write')}</button></div>`;
  }
  function reviews() {
    const L = allRevs().sort(byRelevance);
    return `<section class="reviews" id="reviews"><div class="wrap">
      <div class="rev-head rv"><div><p class="eyebrow">${u('reviews')}</p><h2>${u('rv_h')}</h2>${L.length ? '' : `<p class="rev-sub">${u(googleOn() ? 'rv_empty_g' : 'rev_empty')}</p>`}</div>${L.length ? `<a class="rv-arrow" href="#all-reviews" aria-label="${u('rv_see_all')}">${icon('arrow')}</a>` : ''}</div>
      <div class="rv-top rv${L.length ? '' : ' solo'}">${L.length ? revSummary(L) : ''}${rateBox()}</div>
      ${L.length ? `<div class="rev-grid rv-kids">${L.slice(0, 3).map(revCard).join('')}</div>${L.length > 3 ? `<a class="btn btn-ghost rv-seeall" href="#all-reviews">${u('rv_see_all')} (${L.length})${icon('arrow')}</a>` : ''}` : ''}
    </div></section>`;
  }
  let rvSort = 'rel', rvStar = 0;
  function revPageList() {
    let L = allRevs();
    if (rvStar) L = L.filter((r) => rate5(r) === rvStar);
    L.sort(rvSort === 'new' ? (a, b) => (b.uts || b.ts || 0) - (a.uts || a.ts || 0) : byRelevance);
    return L.length ? L.map(revCard).join('') : `<p class="rev-sub">${u('rv_none_filter')}</p>`;
  }
  function revPage() {
    const L = allRevs();
    return `<div class="sp-bar"><div class="wrap">
        <a class="sp-back" href="#reviews">${icon('back')}${u('back_home')}</a>
        <span class="sp-title">${u('rv_h')}</span>
        <button type="button" class="btn btn-accent" data-review>${u(RV.mine ? 'rv_edit' : 'rev_write')}</button>
      </div></div>
      <section class="gal-head rvp-head"><div class="wrap"><p class="eyebrow">${u('reviews')}</p><h1>${u('rv_h')}</h1>${googleOn() ? `<p>${u('rv_page_sub')}</p>` : ''}
        ${L.length ? revSummary(L) : ''}
        <div class="chips rvp-chips" role="group" aria-label="${u('rv_h')}">${[['rel', u('rv_sort_rel')], ['new', u('rv_sort_new')]].map(([k, l]) => `<button type="button" data-rvsort="${k}" aria-pressed="${rvSort === k}">${l}</button>`).join('')}${[5, 4, 3, 2, 1].map((s) => `<button type="button" data-rvstar="${s}" aria-pressed="${rvStar === s}">${s} ★</button>`).join('')}</div></div></section>
      <section class="gal-body rvp-body"><div class="wrap"><div class="rvp-list" id="rvp-list">${revPageList()}</div></div></section>
      ${footerMini()}`;
  }
  // redraw the review section (and the all-reviews page when it is open) after a change
  function refreshReviews() {
    const old = $('#reviews');
    if (old) { const w = document.createElement('div'); w.innerHTML = reviews(); const n = w.firstElementChild; old.replaceWith(n); reveal(n, true); }
    if (revOpen) { const sp = $('#sp'), y = sp.scrollTop; sp.innerHTML = revPage(); sp.scrollTop = y; }
  }
  function redrawCard(id) {
    const r = allRevs().find((x) => x.id === id);
    if (!r) return;
    $$(`[data-rid="${id}"]`).forEach((el) => { const w = document.createElement('div'); w.innerHTML = revCard(r, +getComputedStyle(el).getPropertyValue('--i') || 0); el.replaceWith(w.firstElementChild); });
  }
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('on'), 3400);
  }
  async function rvApi(path, method, body) {
    const r = await fetch(path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, ok: r.ok && j.ok !== false, j };
  }
  function upsertMine(r) {
    const L = S.ureviews || (S.ureviews = []);
    const k = L.findIndex((x) => x.id === r.id);
    if (r.hidden) { if (k >= 0) L.splice(k, 1); }
    else if (k >= 0) L[k] = r; else L.unshift(r);
    RV.mine = r;
  }
  async function rvLoadMe() {
    if (!googleOn() || PREVIEW) return;
    try {
      const { ok, j } = await rvApi('/api/review/me', 'GET');
      if (!ok) return;
      RV.user = j.user;
      if (j.mine) upsertMine(j.mine);
      if (j.user || j.mine) refreshReviews();
    } catch (e) {}
  }
  // Google Identity Services: loaded only when someone wants to write a review
  let gsiP = null, gsiInit = false, rvPreset = 0;
  function loadGsi() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    if (!GCID()) return Promise.reject(new Error('no client id'));
    return gsiP || (gsiP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => res();
      s.onerror = () => { gsiP = null; rej(new Error('gsi')); };
      document.head.appendChild(s);
    }));
  }
  function renderGsiButton() {
    const el = $('#gsi-btn');
    if (!el || !window.google || !google.accounts) return;
    if (!gsiInit) { google.accounts.id.initialize({ client_id: GCID(), callback: (resp) => rvLogin({ credential: resp.credential }), ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true }); gsiInit = true; }
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', locale: lang === 'el' ? 'el' : 'en', width: Math.max(220, Math.min(340, el.clientWidth || 300)) });
  }
  async function rvLogin(body) {
    const st = $('#rv-status');
    try {
      const { ok, j } = await rvApi('/api/review/login', 'POST', body);
      if (!ok) throw new Error('login');
      RV.user = j.user;
      if (j.mine) upsertMine(j.mine);
      refreshReviews();
      if ($('#rvm') && !$('#rvm').hidden) openReview(rvPreset);
    } catch (e) { if (st) { st.textContent = u('rv_err_login'); st.className = 'q-status err'; } }
  }

  function rvModal() {
    let m = $('#rvm');
    if (!m) { m = document.createElement('div'); m.id = 'rvm'; m.className = 'rvm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); document.body.appendChild(m); }
    m.setAttribute('aria-label', u('rev_form_title'));
    m.hidden = false;
    lock(true, 'rvm');
    return m;
  }
  const starPick = (n) => `<div class="star-pick" role="radiogroup" aria-label="${u('rev_rating')}">${[1, 2, 3, 4, 5].map((i) => `<button type="button" role="radio" class="${i <= n ? 'on' : ''}" aria-checked="${i === n}" data-star="${i}" aria-label="${i} / 5"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg></button>`).join('')}</div>`;
  const photoBox = () => `<div class="f"><span class="lbl">${u('rev_photos')}</span><div class="qb-files" id="rv-files"></div><label class="btn btn-sm btn-ghost qb-up">${icon('images')}<span id="rv-up-t">${u('qb_add_file')}</span><input type="file" id="rv-file" accept="image/jpeg,image/png,image/webp,image/heic" multiple></label><small class="qb-hint">${u('rev_photos_hint')}</small></div>`;
  function openReview(preset) {
    rvPreset = +preset || 0;
    if (!googleOn()) { openReviewLegacy(rvPreset); return; }
    const m = rvModal();
    if (!RV.user) {
      m.innerHTML = `<div class="rvm-card rvm-sign">
        <button type="button" class="rvm-x" data-rv-close aria-label="${u('close')}">&times;</button>
        <h3>${u('rv_signin_t')}</h3><p class="rvm-p">${u('rv_signin_b')}</p>
        <div id="gsi-btn" class="gsi-btn"></div>
        ${S.devLogin ? `<button type="button" class="btn btn-ghost" data-rvdev>Test sign-in (local only)</button>` : ''}
        <p class="q-status" id="rv-status" role="status" aria-live="polite"></p>
        <p class="qb-hint">${u('rv_privacy')}</p></div>`;
      if (GCID()) loadGsi().then(renderGsiButton).catch(() => { const st = $('#rv-status'); if (st) { st.textContent = u('rv_err_login'); st.className = 'q-status err'; } });
      setTimeout(() => { const x = m.querySelector('.rvm-x'); if (x) x.focus({ preventScroll: true }); }, 50);
      return;
    }
    const mine = RV.mine, rating = rvPreset || (mine ? rate5(mine) : 0);
    rvPhotos = mine ? (mine.photos || []).map((p, k) => ({ path: p, name: u('rv_photo_n', { n: k + 1 }) })) : [];
    m.dataset.rating = String(rating);
    m.innerHTML = `<form class="rvm-card" id="rv-form" novalidate>
      <button type="button" class="rvm-x" data-rv-close aria-label="${u('close')}">&times;</button>
      <h3>${u(mine ? 'rv_edit' : 'rev_form_title')}</h3>
      <div class="rvm-user">${avatar(RV.user)}<div><small>${u('rv_posting_as')}</small><b>${esc(RV.user.name)}</b></div><button type="button" class="link-sm" data-rvsignout>${u('rv_signout')}</button></div>
      <div class="f"><span class="lbl">${u('rev_rating')}</span>${starPick(rating)}</div>
      <div class="f"><label for="rv-text">${u('rev_text')} *</label><textarea id="rv-text" maxlength="1500" rows="5" placeholder="${esc(u('rv_desc_ph'))}">${esc(mine ? mine.text : '')}</textarea></div>
      ${photoBox()}
      <div class="q-actions"><button type="submit" class="btn btn-accent" id="rv-send">${u(mine ? 'rv_update' : 'rv_post')}${icon('arrow')}</button>${mine ? `<button type="button" class="btn btn-ghost rv-del" data-rvdel>${icon('trash')}${u('rv_delete')}</button>` : ''}</div>
      <p class="q-status" id="rv-status" role="status" aria-live="polite"></p>
      <p class="qb-hint">${u('rv_privacy')}</p>
    </form>`;
    rvDraw();
    setTimeout(() => { const t = $('#rv-text'); if (t) t.focus({ preventScroll: true }); }, 50);
  }
  function openReviewLegacy(preset) {
    const m = rvModal();
    m.innerHTML = `<form class="rvm-card" id="rv-form" novalidate>
      <button type="button" class="rvm-x" data-rv-close aria-label="${u('close')}">&times;</button>
      <h3>${u('rev_form_title')}</h3>
      <div class="f"><span class="lbl">${u('rev_rating')}</span>${starPick(preset)}</div>
      <div class="q-row"><div class="f"><label for="rv-name">${u('name')} *</label><input id="rv-name" autocomplete="name" maxlength="60" required></div><div class="f"><label for="rv-place">${u('rev_place')}</label><input id="rv-place" maxlength="60"></div></div>
      <div class="f"><label for="rv-title">${u('rev_title_f')}</label><input id="rv-title" maxlength="100"></div>
      <div class="f"><label for="rv-text">${u('rev_text')} *</label><textarea id="rv-text" maxlength="1200" required></textarea></div>
      <div class="f"><label for="rv-project">${u('rev_project')}</label><input id="rv-project" maxlength="100"></div>
      ${photoBox()}
      <div class="hp" aria-hidden="true"><input id="rv-web" tabindex="-1" autocomplete="off"></div>
      <div class="q-actions"><button type="submit" class="btn btn-accent" id="rv-send">${u('rev_send')}${icon('arrow')}</button></div>
      <p class="q-status" id="rv-status" role="status" aria-live="polite"></p>
    </form>`;
    m.dataset.rating = String(preset || 0);
    rvPhotos = [];
    setTimeout(() => $('#rv-name') && $('#rv-name').focus({ preventScroll: true }), 50);
  }
  let rvPhotos = [];
  function rvDraw() { const b = $('#rv-files'); if (b) b.innerHTML = rvPhotos.map((f, k) => `<span class="qb-file">${f.path ? `<img class="qb-file-im" src="${esc(src(f.path))}" alt="">` : icon('images')}<b>${esc(f.name)}</b><button type="button" data-rvf-del="${k}" aria-label="${u('qb_remove')}">&times;</button></span>`).join(''); }
  async function rvUpload(files) {
    const tx = $('#rv-up-t');
    for (const file of files.slice(0, 3 - rvPhotos.length)) {
      if (tx) tx.textContent = u('qb_uploading');
      try {
        const bmp = await createImageBitmap(file);
        const k = Math.min(1, 1800 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
        let id = 'preview';
        if (!PREVIEW) {
          const r = await fetch('/api/upload?for=review', { method: 'POST', headers: { 'content-type': 'image/jpeg', 'x-filename': encodeURIComponent(file.name) }, body: blob });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || !j.ok) throw new Error('up');
          id = j.id;
        }
        rvPhotos.push({ id, name: file.name });
      } catch (e) { const st = $('#rv-status'); if (st) { st.textContent = u('qb_err_file'); st.className = 'q-status err'; } }
    }
    if (tx) tx.textContent = u('qb_add_file');
    rvDraw();
  }
  function closeReview() { const m = $('#rvm'); if (m) { m.hidden = true; m.innerHTML = ''; } lock(false, 'rvm'); }
  async function submitReview() {
    if (!googleOn()) { submitLegacy(); return; }
    const m = $('#rvm'), st = $('#rv-status'), btn = $('#rv-send');
    const d = { rating: +m.dataset.rating, text: $('#rv-text').value.trim(), photos: rvPhotos.map((f) => f.path || f.id), lang };
    st.className = 'q-status';
    if (!d.rating || d.text.length < 10) { st.textContent = u('rv_need'); st.classList.add('err'); return; }
    btn.disabled = true;
    const was = !!RV.mine;
    try {
      const { status, ok, j } = await rvApi('/api/review/mine', 'POST', d);
      if (status === 401) { RV.user = null; openReview(d.rating); return; }
      if (!ok) throw new Error('send');
      upsertMine(j.review);
      closeReview();
      refreshReviews();
      toast(u(was ? 'rv_updated' : 'rv_live'));
    } catch (e) { st.textContent = u('send_err'); st.classList.add('err'); btn.disabled = false; }
  }
  async function submitLegacy() {
    const m = $('#rvm'), st = $('#rv-status'), btn = $('#rv-send');
    const d = { rating: +m.dataset.rating, name: $('#rv-name').value.trim(), place: $('#rv-place').value.trim(), title: $('#rv-title').value.trim(), project: $('#rv-project').value.trim(), text: $('#rv-text').value.trim(), photos: rvPhotos.map((f) => f.id), website: $('#rv-web').value, lang };
    st.className = 'q-status';
    if (!d.rating || !d.name || d.text.length < 10) { st.textContent = u('rev_need'); st.classList.add('err'); return; }
    btn.disabled = true;
    try {
      if (!PREVIEW) {
        const r = await fetch('/api/review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error('send');
      }
      $('#rv-form').innerHTML = `<button type="button" class="rvm-x" data-rv-close aria-label="${u('close')}">&times;</button><div class="rvm-ok">${stars(d.rating)}<h3>${u('rev_thanks')}</h3><button type="button" class="btn btn-ghost" data-rv-close>${u('close')}</button></div>`;
    } catch (e) {
      st.textContent = u('send_err');
      st.classList.add('err');
      btn.disabled = false;
    }
  }
  async function rvAction(el) {
    if (el.matches('[data-rvdev]')) { rvLogin({ dev: true, sub: 'dev-' + (localStorage.getItem('rv-dev') || 'a'), name: 'Test Customer', email: 'test@example.com' }); return; }
    if (el.matches('[data-rvsignout]')) {
      await rvApi('/api/review/logout', 'POST', {}).catch(() => {});
      RV.user = null; RV.mine = null;
      if (googleOn() && window.google && google.accounts) google.accounts.id.disableAutoSelect();
      closeReview(); refreshReviews(); toast(u('rv_signed_out'));
      return;
    }
    if (el.matches('[data-rvdel]')) {
      if (!el.dataset.armed) { el.dataset.armed = '1'; el.lastChild.textContent = u('rv_sure'); return; }
      const { ok } = await rvApi('/api/review/mine', 'DELETE').catch(() => ({ ok: false }));
      if (!ok) { const st = $('#rv-status'); if (st) { st.textContent = u('send_err'); st.className = 'q-status err'; } return; }
      S.ureviews = (S.ureviews || []).filter((x) => !RV.mine || x.id !== RV.mine.id);
      RV.mine = null;
      closeReview(); refreshReviews(); toast(u('rv_deleted'));
      return;
    }
    if (el.matches('[data-rvvote]')) {
      const id = el.dataset.rvvote, v = +el.dataset.v, nv = rvVotes[id] === v ? 0 : v;
      const r = uRevs().find((x) => x.id === id);
      if (!r) return;
      const before = rvVotes[id] || 0;
      rvVotes[id] = nv;
      r.helpful = Math.max(0, (r.helpful || 0) + (nv === 1 ? 1 : 0) - (before === 1 ? 1 : 0));
      try { localStorage.setItem('rv-votes', JSON.stringify(rvVotes)); } catch (e) {}
      redrawCard(id);
      if (!PREVIEW) { const { ok, j } = await rvApi('/api/review/vote', 'POST', { id, v: nv }).catch(() => ({})); if (ok && typeof j.helpful === 'number') { r.helpful = j.helpful; redrawCard(id); } }
      return;
    }
    if (el.matches('[data-rvreport]')) {
      $$('.rvc-pop').forEach((p) => { p.hidden = true; });
      if (!PREVIEW) await rvApi('/api/review/report', 'POST', { id: el.dataset.rvreport }).catch(() => {});
      toast(u('rv_reported'));
    }
  }

  function founder() {
    const f = S.founder || {};
    if (!String(f.name || '').trim()) return '';
    return `<div class="founder rv${f.photo ? '' : ' no-photo'}">
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

  /* ---------- multi-product quotation builder ---------- */
  const QB_KEY = 'qb2';
  const SYS_CAT = { 'motorized-sliding': 'sliding-doors', 'vertical-sliding': 'glass', 'aluminium-windows': 'windows', 'aluminium-doors': 'doors', 'folding-systems': 'doors', 'sliding-glass': 'sliding-doors', 'curtain-wall': 'glass', 'glass-facade': 'glass', 'custom-solutions': 'custom' };
  const newSid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
  let QB = { step: 'items', items: [], edit: -1, draft: null, cust: {}, sid: newSid(), ref: '', err: '' };
  try { const q = JSON.parse(localStorage.getItem(QB_KEY) || 'null'); if (q && Array.isArray(q.items)) QB = { ...QB, ...q, err: '', busy: false }; } catch (e) {}
  if (QB.cust && QB.cust.phone && QB.cust.pnum == null) QB.cust.pnum = QB.cust.phone;
  const qbSave = () => { try { const { err, busy, more, ...keep } = QB; localStorage.setItem(QB_KEY, JSON.stringify(keep)); } catch (e) {} };
  const blankItem = (o) => ({ grp: '', mp: 0, cat: '', model: '', width: '', height: '', qty: 1, colour: '', glass: '', glassThk: '', opening: '', specs: '', notes: '', files: [], ...(o || {}) });
  const optList = (vals, cur, blank) => (blank ? `<option value="">${esc(blank)}</option>` : '') + vals.map((v) => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');

  const QG = [
    { id: 'doors', cats: ['doors'], img: 'img/commercial-doors.jpg', k: 'qg_doors' },
    { id: 'windows', cats: ['windows'], img: 'img/house-windows.jpg', k: 'qg_windows' },
    { id: 'sliding', cats: ['sliding-doors', 'sliding-windows', 'thermal'], img: 'img/sliding-door.jpg', k: 'qg_sliding' },
    { id: 'glass', cats: ['glass'], img: 'img/glass-stairs.jpg', k: 'qg_glass' },
    { id: 'custom', cats: ['custom'], img: 'img/alu-profiles.jpg', k: 'qg_custom' },
  ];
  const CC = [['+357', 'CY'], ['+30', 'GR'], ['+44', 'UK'], ['+49', 'DE'], ['+40', 'RO'], ['+359', 'BG'], ['+7', 'RU'], ['+380', 'UA'], ['+972', 'IL'], ['+961', 'LB'], ['+880', 'BD'], ['+91', 'IN'], ['+63', 'PH'], ['+1', 'US/CA']];
  const grpOf = (cat) => QG.find((g) => g.cats.includes(cat)) || null;
  const grpById = (id) => QG.find((g) => g.id === id) || null;
  const grpModels = (g) => (g ? prods().filter((x) => g.cats.includes(x.cat)) : []);
  const prodByModel = (m) => (m ? prods().find((x) => x.model === m) : null);
  const itemImg = (it) => { const p = prodByModel(it.model); return src((p && p.image) || (grpOf(it.cat) || QG[4]).img); };
  const itemTitle = (it) => { const p = prodByModel(it.model); return it.model ? `${it.model} – ${p ? t(p.name) : it.catName || ''}` : it.catName || pcat(it.cat); };
  const itemMeta = (it) => [`${it.width} × ${it.height} mm`, it.colour, `${u('qb_qty_s')} ${it.qty}`].filter(Boolean).join(' · ');
  const qbSummary = (list) => { const n = list.length, pcs = list.reduce((s, it) => s + (+it.qty || 0), 0); return `${n === 1 ? u('qb_item_1') : u('qb_items_n', { n })} · ${u('qb_pcs', { n: pcs })}`; };

  function qbCard(it, k, mode) {
    const extra = [it.glass, it.glassThk, it.opening].filter(Boolean).join(' · ');
    const full = mode === 'review';
    return `<article class="qb-item"><img class="qb-item-im" src="${esc(itemImg(it))}" alt="" loading="lazy">
      <div class="qb-item-b"><div class="qb-item-t"><b>${esc(it.model || it.catName || pcat(it.cat))}</b>${mode === 'list' ? `<span class="qb-badge">${icon('check')}${u('qb_added')}</span>` : `<span class="qb-num">${k + 1}</span>`}</div>
        ${it.model ? `<span class="qb-item-n">${esc((prodByModel(it.model) && t(prodByModel(it.model).name)) || it.catName || '')}</span>` : ''}<span class="qb-item-m">${esc(itemMeta(it))}</span>${extra ? `<small>${esc(extra)}</small>` : ''}${full && it.specs ? `<small>${esc(it.specs)}</small>` : ''}${full && it.notes ? `<small>${esc(it.notes)}</small>` : ''}${it.files && it.files.length ? `<small>${icon('images')} ${full ? esc(it.files.map((f) => f.name).join(', ')) : it.files.length}</small>` : ''}</div>
      ${mode === 'list' ? `<div class="qb-item-a"><button type="button" data-qb="edit" data-k="${k}">${icon('pen')}${u('qb_edit')}</button><button type="button" data-qb="dup" data-k="${k}">${icon('copy')}${u('qb_dup')}</button><button type="button" class="del" data-qb="del" data-k="${k}">${icon('trash')}${u('qb_remove')}</button></div>` : ''}
    </article>`;
  }
  function qbItemForm() {
    const d = QB.draft || (QB.draft = blankItem());
    const g = grpById(d.grp), ms = grpModels(g), n = QB.edit >= 0 ? QB.edit + 1 : QB.items.length + 1;
    const ready = g && (!ms.length || d.mp);
    let h = `<div class="qb-sec" id="qb-edit"><div class="qb-sec-h"><h3>${QB.edit >= 0 ? u('qb_edit_product', { n }) : g ? u('qb_product', { n }) : u('qb_choose_prod')}</h3>${QB.items.length ? `<button type="button" class="qb-link" data-qb="cancel-item">${u('qb_cancel')}</button>` : ''}</div>`;
    if (!g) {
      h += `<div class="qb-cats">${QG.slice(0, 4).map((x) => `<button type="button" class="qb-cat" data-qb="grp" data-g="${x.id}"><span class="qb-cat-im"><img src="${esc(src(x.img))}" alt="" loading="lazy"></span><b>${u(x.k)}</b></button>`).join('')}</div>
        <button type="button" class="qb-cat-more" data-qb="grp" data-g="custom"><span>${icon('sparkle')}</span><div><b>${u('qg_custom')}</b><small>${u('qb_other_cat')}</small></div>${icon('right')}</button>`;
    } else {
      h += `<div class="qb-picked"><img src="${esc(src(g.img))}" alt=""><div><small>${u('qb_cat')}</small><b>${u(g.k)}</b></div><button type="button" class="qb-link" data-qb="grp" data-g="">${u('qb_change')}</button></div>`;
      if (ms.length) {
        h += `<div class="qb-sub-h">${u('qb_choose_model')}</div><div class="qb-models">${ms.map((x) => `<button type="button" class="qb-model${d.mp && d.model === x.model ? ' on' : ''}" aria-pressed="${!!(d.mp && d.model === x.model)}" data-qb="model" data-m="${esc(x.model)}"><span class="qb-model-im"><img src="${esc(src(x.image))}" alt="" loading="lazy"></span><span class="qb-model-t"><b>${esc(x.model)}</b><span>${esc(t(x.name))}</span><small>${esc(pcat(x.cat))}</small></span><span class="qb-radio"></span></button>`).join('')}
          <button type="button" class="qb-model${d.mp && !d.model ? ' on' : ''}" aria-pressed="${!!(d.mp && !d.model)}" data-qb="model" data-m=""><span class="qb-model-im qb-ns">?</span><span class="qb-model-t"><b>${u('qb_not_sure')}</b><span>${u('qb_not_sure_sub')}</span></span><span class="qb-radio"></span></button></div>`;
        if (g.id === 'sliding' && d.mp && !d.model) h += `<div class="qb-chips qb-stype">${['sliding-doors', 'sliding-windows'].map((c) => `<button type="button" class="qb-chip${d.cat === c ? ' on' : ''}" aria-pressed="${d.cat === c}" data-qb="stype" data-c="${c}">${esc(pcat(c))}</button>`).join('')}</div>`;
      }
    }
    if (ready) {
      const sel = (f, id, lbl, vals) => `<div class="f"><label for="${id}">${u(lbl)}</label><select id="${id}" data-qi="${f}">${optList(vals, d[f], u('qb_choose'))}</select></div>`;
      const more = QB.more || d.specs || d.notes || (d.files || []).length;
      h += `<div class="qb-box" id="qb-spec">
          ${g.id === 'custom' ? `<div class="f"><label for="qi-name">${u('qb_pname')} *</label><input id="qi-name" data-qi="model" maxlength="80" autocomplete="off" placeholder="${esc(u('qb_pname_ph'))}" value="${esc(d.model)}"></div>` : ''}
          <div class="qb-g3"><div class="f"><label for="qi-w">${u('qb_width_s')} *</label><input id="qi-w" data-qi="width" type="number" inputmode="numeric" min="1" max="30000" step="1" placeholder="mm" value="${esc(d.width)}"></div>
          <div class="f"><label for="qi-h">${u('qb_height_s')} *</label><input id="qi-h" data-qi="height" type="number" inputmode="numeric" min="1" max="30000" step="1" placeholder="mm" value="${esc(d.height)}"></div>
          <div class="f"><label for="qi-q">${u('qb_qty_s')} *</label><input id="qi-q" data-qi="qty" type="number" inputmode="numeric" min="1" max="999" step="1" value="${esc(d.qty)}"></div></div>
          <div class="qb-g2">${sel('colour', 'qi-col', 'qb_colour', u('colour_opts'))}${sel('opening', 'qi-open', 'qb_opening', u('opening_opts'))}${sel('glass', 'qi-gl', 'qb_glass', u('glass_opts'))}
          <div class="f"><label for="qi-glt">${u('qb_glass_thk')}</label><input id="qi-glt" data-qi="glassThk" maxlength="40" placeholder="${esc(u('qb_glass_thk_ph'))}" value="${esc(d.glassThk)}"></div></div>
          <details class="qb-more" id="qb-more"${more ? ' open' : ''}><summary>${icon('plus')}<span>${u('qb_more')}</span><small>${u('optional')}</small></summary><div class="qb-more-b">
            <div class="f"><label for="qi-sp">${u('qb_specs')}</label><textarea id="qi-sp" data-qi="specs" maxlength="500" rows="2" placeholder="${esc(u('qb_specs_ph'))}">${esc(d.specs)}</textarea></div>
            <div class="f"><label for="qi-no">${u('qb_notes')}</label><textarea id="qi-no" data-qi="notes" maxlength="1000" rows="2" placeholder="${esc(u('qb_notes_ph'))}">${esc(d.notes)}</textarea></div>
            <div class="f"><span class="lbl">${u('qb_files')}</span>
              <div class="qb-files">${(d.files || []).map((f, k) => `<span class="qb-file">${icon(f.type === 'application/pdf' ? 'file' : 'images')}<b>${esc(f.name)}</b><button type="button" data-qf-del="${k}" aria-label="${u('qb_remove')}">&times;</button></span>`).join('')}
                ${(d.files || []).length < 3 ? `<label class="qb-up">${icon('download')}<span id="qb-up-t">${u('qb_add_file')}</span><input type="file" id="qb-file" accept="image/jpeg,image/png,image/webp,application/pdf,image/heic"></label>` : ''}</div>
              <small class="qb-hint">${u('qb_files_hint')}</small></div></div></details></div>`;
    }
    h += `<p class="q-status err" id="qb-ierr" role="alert"></p>`;
    if (ready) h += `<button type="button" class="btn btn-accent qb-go" data-qb="save-item">${icon(QB.edit >= 0 ? 'check' : 'plus')}${u(QB.edit >= 0 ? 'qb_save' : 'qb_add')}</button>`;
    return h + '</div>';
  }
  function qbSteps() {
    const order = ['items', 'details', 'review'], go = ['to-items', 'to-details'];
    const at = order.indexOf(QB.step);
    return `<ol class="qb-steps">${['qb_step1', 'qb_step2', 'qb_step3'].map((k, i) => `<li class="${i < at ? 'done' : i === at ? 'on' : ''}"${i === at ? ' aria-current="step"' : ''}>${i < at ? `<button type="button" data-qb="${go[i]}">` : '<span>'}<i>${i < at ? icon('check') : i + 1}</i>${u(k)}${i < at ? '</button>' : '</span>'}</li>`).join('')}</ol>`;
  }
  function qbBody() {
    const c = QB.cust || {};
    if (QB.step === 'done') {
      const wa = waLink(u('qb_wa_msg', { c: S.company.name, r: QB.ref }) + `\n${u('name')}: ${c.name || ''}\n${u('phone')}: ${c.phone || ''}\n` + QB.doneItems.map((it, k) => `${k + 1}. ${itemTitle(it)} · ${itemMeta(it)}`).join('\n'));
      return `<div class="qb-done"><span class="qb-tick">${icon('check')}</span><h3>${u('qb_done_title')}</h3><p>${esc(u('qb_done_body', { r: QB.ref }))}</p><p class="qb-ref">${esc(QB.ref)}</p>
        <div class="qb-actions">${wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">${waIcon}${u('qb_done_wa')}</a>` : ''}<button type="button" class="btn btn-ghost" data-qb="new">${u('qb_new')}</button></div>${wa ? `<small class="qb-hint">${u('wa_note')}</small>` : ''}</div>`;
    }
    if (QB.step === 'details') {
      const fld = (k, lbl, type, ac, req, extra) => `<div class="f"><label for="qc-${k}">${u(lbl)}${req ? ' *' : ''}</label><input id="qc-${k}" data-qc="${k}" type="${type}" autocomplete="${ac}" maxlength="120" value="${esc(c[k] || '')}" ${extra || ''}></div>`;
      const cc = c.cc || '+357';
      return `${qbSteps()}<div class="qb-sec"><div class="qb-sec-h"><h3>${u('qb_sec_contact')}</h3></div>
          <div class="qb-g2">${fld('name', 'qb_fullname', 'text', 'name', 1)}${fld('email', 'qb_email', 'email', 'email', 1, 'inputmode="email"')}</div>
          <div class="qb-g2"><div class="f"><label for="qc-pnum">${u('qb_phone')} *</label><div class="qb-phone"><select id="qc-cc" data-qc="cc" aria-label="${esc(u('qb_cc'))}">${CC.map(([v, n]) => `<option value="${v}" ${v === cc ? 'selected' : ''}>${v} ${n}</option>`).join('')}</select><input id="qc-pnum" data-qc="pnum" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" placeholder="99 000000" value="${esc(c.pnum || '')}"></div></div>
          ${fld('location', 'qb_location', 'text', 'address-level2', 0)}</div>
        </div>
        <label class="qb-check"><input type="checkbox" id="qc-privacy" data-qc="privacy" ${c.privacy ? 'checked' : ''}><span>${esc(u('qb_privacy', { c: S.company.name }))}<small>${u('qb_privacy_note')}</small></span></label>
        <p class="q-status err" id="qb-cerr" role="alert"></p>
        <div class="qb-nav"><button type="button" class="btn btn-ghost" data-qb="to-items">${icon('back')}${u('qb_back')}</button><button type="button" class="btn btn-accent" data-qb="to-review">${u('qb_review')}${icon('arrow')}</button></div>`;
    }
    if (QB.step === 'review') {
      const r = (k, v) => (v ? `<div><dt>${u(k)}</dt><dd>${esc(v)}</dd></div>` : '');
      return `${qbSteps()}<div class="qb-sec"><div class="qb-sec-h"><h3>${u('qb_list_t')}</h3><button type="button" class="qb-link" data-qb="to-items">${u('qb_edit')}</button></div>
          <p class="qb-count">${esc(qbSummary(QB.items))}</p>
          <div class="qb-items">${QB.items.map((it, k) => qbCard(it, k, 'review')).join('')}</div></div>
        <div class="qb-sec"><div class="qb-sec-h"><h3>${u('qb_customer')}</h3><button type="button" class="qb-link" data-qb="to-details">${u('qb_edit')}</button></div>
          <dl class="qb-dl">${r('qb_fullname', c.name)}${r('qb_email', c.email)}${r('qb_phone', c.phone)}${r('qb_location', c.location)}</dl></div>
        <div class="hp" aria-hidden="true"><input id="qb-web" tabindex="-1" autocomplete="off"></div>
        <p class="q-status" id="qb-serr" role="status" aria-live="polite">${esc(QB.err || '')}</p>
        <div class="qb-nav"><button type="button" class="btn btn-ghost" data-qb="to-details">${icon('back')}${u('qb_back')}</button><button type="button" class="btn btn-accent" id="qb-send" data-qb="submit" ${QB.busy ? 'disabled' : ''}>${u(QB.busy ? 'qb_sending' : 'qb_submit')}${icon('arrow')}</button></div>`;
    }
    const editing = QB.draft || !QB.items.length;
    const list = QB.items.length ? `<div class="qb-sec"><div class="qb-sec-h"><h3>${u('qb_list_t')}</h3><span class="qb-count">${esc(qbSummary(QB.items))}</span></div>
        <div class="qb-items">${QB.items.map((it, k) => qbCard(it, k, editing ? 'view' : 'list')).join('')}</div>
        ${editing ? '' : `<button type="button" class="qb-addmore" data-qb="add-more">${icon('plus')}${u('qb_add_more')}</button>`}</div>` : '';
    if (editing) return `${qbSteps()}${qbItemForm()}${QB.edit >= 0 ? '' : list}`;
    return `${qbSteps()}${list}<button type="button" class="btn btn-accent qb-go" data-qb="to-details">${u('qb_cont_details')}${icon('arrow')}</button><p class="q-status err" id="qb-lerr" role="alert"></p>`;
  }
  function qbRender(focus) {
    const b = $('#qb');
    if (!b) return;
    b.innerHTML = qbBody();
    qbSave();
    if (focus) { const el = $(focus); if (el) el.focus({ preventScroll: true }); }
  }
  function qbReadItem() {
    const d = QB.draft || (QB.draft = blankItem());
    $$('[data-qi]').forEach((el) => { d[el.dataset.qi] = el.value; });
    return d;
  }
  function qbReadCust() {
    const c = QB.cust || (QB.cust = {});
    $$('[data-qc]').forEach((el) => { c[el.dataset.qc] = el.type === 'checkbox' ? el.checked : el.value.trim(); });
    const pn = (c.pnum || '').trim();
    c.phone = /^(\+|00)/.test(pn) ? pn : pn ? `${c.cc || '+357'} ${pn.replace(/^0+/, '')}` : '';
    return c;
  }
  function qbScrollTop() { const q = $('#quote'); if (q && q.getBoundingClientRect().top < 0) q.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  function qbStart(preset) {
    QB.step = 'items';
    QB.edit = -1;
    const g = grpOf(preset && preset.cat);
    QB.draft = blankItem({ ...preset, grp: g ? g.id : 'custom', mp: 1 });
    if (!g || g.id === 'custom') QB.draft.model = QB.draft.model || QB.draft.specs || '';
    qbRender();
    if (location.hash === '#quote') route(); else location.hash = 'quote';
    setTimeout(() => { const w = $('#qi-w'); if (w) w.focus({ preventScroll: true }); }, 900);
  }
  async function qbUpload(file) {
    const tx = $('#qb-up-t');
    if (tx) tx.textContent = u('qb_uploading');
    try {
      let blob = file, type = file.type;
      if (/^image\//.test(type) && type !== 'image/png') {
        const bmp = await createImageBitmap(file).catch(() => null);
        if (bmp) {
          const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
          c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
          c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
          blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.84)); type = 'image/jpeg';
        }
      }
      if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(type) || blob.size > 10 * 1024 * 1024) throw new Error('type');
      if (PREVIEW) return { id: 'preview', name: file.name, type, size: blob.size };
      const r = await fetch('/api/upload?for=quote', { method: 'POST', headers: { 'content-type': type, 'x-filename': encodeURIComponent(file.name) }, body: blob });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'upload');
      return { id: j.id, name: j.name, type: j.type, size: j.size };
    } catch (e) {
      const er = $('#qb-ierr');
      if (er) er.textContent = u('qb_err_file');
      if (tx) tx.textContent = u('qb_add_file');
      return null;
    }
  }
  const qbGo = (sel) => { const e = $(sel); if (e && (e.getBoundingClientRect().top < 70 || e.getBoundingClientRect().top > innerHeight * 0.7)) e.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); };
  async function qbAction(a, el) {
    if (a === 'grp') {
      const d = qbReadItem(), g = grpById(el.dataset.g);
      d.grp = g ? g.id : ''; d.model = ''; d.mp = g && !grpModels(g).length ? 1 : 0; d.cat = g ? g.cats[0] : '';
      qbRender(); qbGo('#qb-edit');
    } else if (a === 'model') {
      const d = qbReadItem(), g = grpById(d.grp), p = prodByModel(el.dataset.m);
      const first = !d.mp;
      d.model = p ? p.model : ''; d.mp = 1; d.cat = p ? p.cat : g ? g.cats[0] : 'custom';
      qbRender(); if (first) qbGo('#qb-spec');
    } else if (a === 'stype') { const d = qbReadItem(); d.cat = el.dataset.c; qbRender(); }
    else if (a === 'qty-' || a === 'qty+') { const d = qbReadItem(); d.qty = Math.min(999, Math.max(1, (Math.round(+d.qty) || 1) + (a === 'qty+' ? 1 : -1))); const q = $('#qi-q'); if (q) q.value = d.qty; qbSave(); }
    else if (a === 'save-item') {
      const d = qbReadItem(), g = grpById(d.grp);
      d.width = Math.round(+d.width); d.height = Math.round(+d.height); d.qty = Math.round(+d.qty);
      const er = $('#qb-ierr');
      if (!g) { if (er) er.textContent = u('qb_need_prod'); return; }
      if (grpModels(g).length && !d.mp) { if (er) er.textContent = u('qb_need_model'); return; }
      if (g.id === 'custom') { d.model = String(d.model || '').trim(); if (!d.model) { if (er) er.textContent = u('qb_need_pname'); const f = $('#qi-name'); if (f) f.focus(); return; } }
      if (!d.cat || !(d.width > 0) || !(d.height > 0) || !(d.qty >= 1)) { if (er) er.textContent = u('qb_need'); const f = !(d.width > 0) ? '#qi-w' : !(d.height > 0) ? '#qi-h' : '#qi-q'; if ($(f)) $(f).focus(); return; }
      d.catName = pcat(d.cat);
      if (QB.edit >= 0) QB.items[QB.edit] = d; else QB.items.push(d);
      QB.edit = -1; QB.draft = null;
      qbRender(); qbGo('#qb');
    } else if (a === 'cancel-item') { QB.edit = -1; QB.draft = null; qbRender(); qbGo('#qb'); }
    else if (a === 'add-more') { QB.edit = -1; QB.draft = blankItem(); qbRender(); qbGo('#qb-edit'); }
    else if (a === 'edit') { QB.edit = +el.dataset.k; const d = JSON.parse(JSON.stringify(QB.items[QB.edit])); const g = grpOf(d.cat); QB.draft = { ...d, grp: d.grp || (g ? g.id : 'custom'), mp: 1 }; qbRender(); qbGo('#qb-edit'); }
    else if (a === 'dup') { const k = +el.dataset.k; QB.items.splice(k + 1, 0, JSON.parse(JSON.stringify(QB.items[k]))); qbRender(); }
    else if (a === 'del') { QB.items.splice(+el.dataset.k, 1); if (!QB.items.length) { QB.draft = blankItem(); QB.edit = -1; } qbRender(); }
    else if (a === 'to-items') { if (QB.step === 'details') qbReadCust(); QB.step = 'items'; qbRender(); qbScrollTop(); }
    else if (a === 'to-details') {
      if (QB.step === 'items' && !QB.items.length) { const er = $('#qb-lerr'); if (er) er.textContent = u('qb_need_items'); return; }
      QB.edit = -1; QB.draft = null;
      QB.step = 'details'; qbRender('#qc-name'); qbScrollTop();
    } else if (a === 'to-review') {
      const c = qbReadCust(), er = $('#qb-cerr');
      const bad = !c.name ? ['qb_err_name', '#qc-name'] : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email || '') ? ['qb_err_email', '#qc-email'] : !/^\s*(\+|00)/.test(c.phone || '') || (c.phone || '').replace(/\D/g, '').length < 8 ? ['qb_err_phone', '#qc-pnum'] : !c.privacy ? ['qb_err_privacy', '#qc-privacy'] : null;
      if (bad) { er.textContent = u(bad[0]); $(bad[1]).focus(); return; }
      QB.step = 'review'; QB.err = ''; qbRender(); qbScrollTop();
    } else if (a === 'submit') {
      if (QB.busy) return;
      QB.busy = true; QB.err = ''; qbRender();
      try {
        let ref = 'AMT-PREVIEW';
        if (!PREVIEW) {
          const body = { sid: QB.sid, lang, website: ($('#qb-web') || {}).value || '', customer: { name: QB.cust.name, email: QB.cust.email, phone: QB.cust.phone, location: QB.cust.location, privacy: QB.cust.privacy }, items: QB.items.map((it) => ({ ...it, files: (it.files || []).map((f) => ({ id: f.id })) })) };
          const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok || !j.ok) throw new Error(j.error || 'send');
          ref = j.ref;
        }
        QB.doneItems = QB.items; QB.ref = ref; QB.step = 'done'; QB.items = []; QB.draft = null; QB.edit = -1; QB.sid = newSid();
      } catch (e) { QB.err = u('qb_err_send'); }
      QB.busy = false; qbRender(); qbScrollTop();
    } else if (a === 'new') { QB = { step: 'items', items: [], edit: -1, draft: blankItem(), cust: QB.cust, sid: newSid(), ref: '', err: '' }; qbRender(); }
  }

  function quote() {
    const c = S.company;
    const lines = [];
    if (c.phone) lines.push(`<a class="q-line" href="${telLink()}">${icon('phone')}<div><small>${u('phone')}</small><span>${esc(c.phone)}</span></div></a>`);
    if (waLink()) lines.push(`<a class="q-line" href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none">${WA_SVG.match(/<path[^>]*>/)[0]}</svg><div><small>WhatsApp</small><span>${esc(c.phone || '+' + digits(c.whatsapp))}</span></div></a>`);
    if (c.email) lines.push(`<a class="q-line" href="mailto:${esc(c.email)}">${icon('mail')}<div><small>${u('email')}</small><span>${esc(c.email)}</span></div></a>`);
    if (t(c.address)) lines.push(`<div class="q-line">${icon('pin')}<div><small>${u('address')}</small><span>${esc(t(c.address))}</span></div></div>`);
    if (t(c.hours)) lines.push(`<div class="q-line">${icon('clock')}<div><small>${u('hours')}</small><span>${esc(t(c.hours))}</span></div></div>`);
    return `<section class="quote" id="quote"><div class="wrap qb-wrap">
      <div class="qb-shell rv"><div class="qb-top"><span class="qb-brand">${esc(c.name)}</span><span class="qb-pill">${u('qb_eyebrow')}</span></div>
        <h2>${u('qb_h')}</h2><p class="qb-lead">${u('qb_lead')}</p>
        <div class="qb" id="qb">${qbBody()}</div></div>
      <aside class="qb-contact rv"><p class="eyebrow">${u('quote_eyebrow')}</p><h3>${u('qb_talk')}</h3><div class="q-lines">${lines.join('')}</div></aside>
    </div></section>`;
  }

  function footer() {
    const c = S.company, list = sys();
    const soc = socialLinks('socials');
    return `<footer class="foot"><div class="wrap foot-top${soc ? ' has-soc' : ''}">
      <div class="foot-brand"><img src="/img/logo-light.png" alt="${esc(c.name)}" width="111" height="52"><p>${esc(t(S.text.tagline))}</p></div>
      <div><h4>${u('quick_links')}</h4><ul><li><a href="#top">${u('home')}</a></li><li><a href="#about">${u('about')}</a></li><li><a href="#systems">${u('systems')}</a></li>${prods().length ? `<li><a href="#products">${u('products')}</a></li>` : ''}<li><a href="#projects">${u('gallery')}</a></li><li><a href="#reviews">${u('reviews')}</a></li><li><a href="#quote">${u('contact')}</a></li></ul></div>
      <div><h4>${u('systems')}</h4><ul>${list.slice(0, 6).map((s) => `<li><a href="#${esc(s.slug)}">${esc(t(s.name))}</a></li>`).join('')}</ul></div>
      <div><h4>${u('contact_info')}</h4><ul class="foot-contact">
        ${t(c.address) ? `<li>${icon('pin')}<span>${esc(t(c.address))}</span></li>` : ''}
        ${c.phone ? `<li>${icon('phone')}<a href="${telLink()}">${esc(c.phone)}</a></li>` : ''}
        ${c.email ? `<li>${icon('mail')}<a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>` : ''}
        ${t(c.hours) ? `<li>${icon('clock')}<span>${esc(t(c.hours))}</span></li>` : ''}
      </ul></div>
      ${soc ? `<div><h4>${u('follow')}</h4>${soc}</div>` : ''}
    </div><div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(c.name)}. ${u('rights')}</span><span>${esc(t(S.text.tagline))}</span></div></footer>
    ${helpButton()}`;
  }

  // floating "Need help?" button: opens a small menu with quote, WhatsApp, email and call
  function helpButton() {
    const c = S.company;
    const items = [
      `<a class="help-item" href="#quote"><span>${u('help_quote')}</span><i class="hi hi-quote">${icon('file')}</i></a>`,
      waLink() ? `<a class="help-item" href="${esc(waLink(u('wa_hello', { c: c.name })))}" target="_blank" rel="noopener"><span>WhatsApp</span><i class="hi wa">${waIcon}</i></a>` : '',
      c.email ? `<a class="help-item" href="mailto:${esc(c.email)}"><span>${u('help_email')}</span><i class="hi hi-mail">${icon('mail')}</i></a>` : '',
      c.phone ? `<a class="help-item" href="${telLink()}"><span>${u('help_call')}</span><i class="hi hi-call">${icon('phone')}</i></a>` : '',
    ].filter(Boolean);
    return `<div class="help" id="help">
      <div class="help-menu" id="help-menu">${items.map((x, i) => x.replace('class="help-item"', `class="help-item" style="--i:${items.length - 1 - i}" tabindex="-1"`)).join('')}</div>
      <button type="button" class="help-btn" aria-expanded="false" aria-controls="help-menu" aria-label="${esc(u('help'))}"><span class="help-t" aria-hidden="true">${u('help')}</span><span class="help-ic a">${icon('headset')}</span><span class="help-ic b" aria-hidden="true">${icon('close')}</span></button>
    </div>`;
  }
  function setHelp(open) {
    const h = $('#help');
    if (!h) return;
    h.classList.toggle('open', open);
    h.classList.remove('say');
    h.querySelector('.help-btn').setAttribute('aria-expanded', String(open));
    h.querySelector('.help-btn').setAttribute('aria-label', open ? u('close_help') : u('help'));
    $$('.help-item', h).forEach((a) => a.setAttribute('tabindex', open ? '0' : '-1'));
  }

  /* ---------- system detail page ---------- */
  function systemPage(s) {
    const list = sys();
    const i = list.indexOf(s);
    const imgs = [s.image, ...(s.gallery || [])].filter(Boolean);
    const specs = (s.specs || []).filter((r) => t(r.label) && String(r.value || '').trim());
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
            ${waLink() ? `<a class="btn btn-ghost" href="${esc(askWa('s', s.slug, t(s.name)))}" target="_blank" rel="noopener">${waIcon}${u('ask_price')}</a>` : ''}
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
          ${(s.features || []).length ? `<div class="feat-grid rv-kids">${s.features.map((f, k) => `<div class="feat" style="--i:${k}"><span class="tile">${icon(f.icon)}</span><span>${esc(t(f.title))}</span></div>`).join('')}</div>` : ''}
        </div>
      </div></section>
      ${specs.length ? `<section class="sp-sec" id="sp-specs"><div class="wrap sp-two">
        <div><p class="eyebrow">${u('specs')}</p><h2>${u('specs')}</h2></div>
        <div><table class="spec-table"><tbody>${specs.map((r) => (String(r.value || '').trim() ? `<tr><th scope="row">${esc(t(r.label))}</th><td>${esc(r.value)}</td></tr>` : `<tr><th scope="row">${esc(t(r.label))}</th><td class="req">${u('on_request')}</td></tr>`)).join('')}</tbody></table>
          <p class="spec-note">${icon('info')}<span>${u('specs_note')}</span></p></div>
      </div></section>` : ''}
      ${hasCfg ? `<section class="sp-sec" id="sp-config"><div class="wrap"><p class="eyebrow">${u('config')}</p><h2>${u('config')}</h2><div class="cfg rv" id="cfg"></div></div></section>` : ''}
      ${imgs.length > 1 ? `<section class="sp-sec" id="sp-gallery"><div class="wrap"><p class="eyebrow">${u('gallery')}</p><h2>${u('gallery')}</h2>
        <div class="gal rv-kids n${Math.min(imgs.length, 4)}">${imgs.map((im, k) => `<button type="button" style="--i:${k}" data-zoom="${k}" aria-label="${u('zoom')}"><img src="${esc(src(im))}" alt="${esc(t(s.name))}" loading="lazy"></button>`).join('')}</div></div></section>` : ''}
      ${related.length ? `<section class="sp-sec" id="sp-related"><div class="wrap"><p class="eyebrow">${u('related')}</p><h2>${u('related')}</h2>
        <div class="rel rv-kids">${related.map((r, k) => `<a style="--i:${k}" href="#${esc(r.slug)}"><figure><img src="${esc(src(r.image))}" alt="" loading="lazy"></figure><small>${pad(list.indexOf(r) + 1)}</small><h3>${esc(t(r.name))}</h3></a>`).join('')}</div></div></section>` : ''}
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
    $('#app').innerHTML = header() + '<main>' + hero() + cats() + products() + about() + projects() + reviews() + engineering() + band() + quote() + '</main>' + footer();
    tstStart();
    hsShow(hsI);
    railArrows();
    prodArrows();
    fitNav();
    syncPanels();
    reveal($('#app'), renders++ > 0);
  }

  // scroll reveal + count-up. Content is visible unless the script turns the effect on.
  let io = null, renders = 0;
  if (!reduce && !PREVIEW && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rv-on');
    io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      countUp(e.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  }
  if (PREVIEW) document.documentElement.classList.add('pv');
  function reveal(scope, instant) {
    if (!io || !scope) return;
    $$('.rv, .rv-kids', scope).forEach((el) => { if (instant) el.classList.add('in', 'now'); else io.observe(el); });
  }
  function countUp(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const raw = el.dataset.count, m = raw.match(/^(\D*)(\d[\d.,]*)(.*)$/);
      if (!m || el.dataset.done) return;
      el.dataset.done = '1';
      const target = parseFloat(m[2].replace(/,/g, '')), t0 = performance.now();
      if (!isFinite(target)) return;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? m[1] + Math.round(target * e).toLocaleString('en') + m[3] : raw;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  // configurator: opens itself once when it first scrolls into view
  function cfgDemo(s) {
    const box = $('#cfg'), st = CFG[s.slug];
    if (!box || !st || st.demo || reduce || PREVIEW || st.kind === 'grid' || !('IntersectionObserver' in window)) return;
    const ob = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      ob.disconnect();
      st.demo = true;
      const to = st.p, t0 = performance.now();
      st.p = 0;
      drawCfg(s);
      const step = (now) => {
        if (current !== s || st.touched) return;
        const k = Math.min(1, (now - t0 - 350) / 1700);
        if (k > 0) {
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          st.p = to * e;
          const r = $('#cfg-p');
          if (r) r.value = Math.round(st.p * 100);
          drawCfg(s);
        }
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    ob.observe(box);
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

  // desktop menu: when the links do not fit (e.g. longer Greek labels), use the mobile menu button instead
  function fitNav() {
    const h = $('#hdr'), nav = $('.nav'), cta = $('.nav-cta');
    if (!h || !nav || !cta) return;
    h.classList.remove('nav-tight');
    if (getComputedStyle(cta).display === 'none') return;
    const edge = nav.getBoundingClientRect().right - parseFloat(getComputedStyle(nav).paddingRight || 0);
    if (cta.getBoundingClientRect().right > edge + 1) h.classList.add('nav-tight');
  }
  addEventListener('resize', fitNav, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  // product row arrows
  function prodArrows() {
    const g = $('#prod-grid');
    if (!g) return;
    const upd = () => { const [a, b] = $$('[data-prail]'); const max = g.scrollWidth - g.clientWidth - 2; if (a) a.disabled = g.scrollLeft <= 2; if (b) b.disabled = g.scrollLeft >= max; };
    if (!g.dataset.w) { g.dataset.w = '1'; g.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd, { passive: true }); }
    upd();
  }
  // system cards rail
  let railUpd = null;
  addEventListener('resize', () => railUpd && railUpd(), { passive: true });
  function railArrows() {
    const r = $('#rail');
    if (!r) return;
    const upd = () => {
      const max = r.scrollWidth - r.clientWidth - 2;
      const [a, b] = $$('[data-rail]');
      if (a) a.disabled = r.scrollLeft <= 2;
      if (b) b.disabled = r.scrollLeft >= max;
      const bar = $('.rail-prog i');
      if (bar && r.scrollWidth) {
        const w = Math.min(100, (r.clientWidth / r.scrollWidth) * 100);
        bar.style.width = w + '%';
        bar.style.left = (max > 0 ? (r.scrollLeft / (r.scrollWidth - r.clientWidth)) * (100 - w) : 0) + '%';
      }
    };
    railUpd = upd;
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
    if (g) g.hidden = panel !== 'mega';
    const pg = $('#pmega');
    if (pg) pg.hidden = panel !== 'pmega';
    $$('.mega-btn').forEach((b) => b.setAttribute('aria-expanded', String(panel === b.dataset.p)));
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
    const past = scrollY > innerHeight * 0.6;
    document.documentElement.classList.toggle('past-hero', past);
    const sl = $('.slides');
    if (sl && !reduce && innerWidth > 760) sl.style.transform = scrollY < innerHeight ? `translate3d(0,${Math.round(scrollY * 0.14)}px,0)` : '';
    let seen = false;
    try { seen = !!sessionStorage.getItem('help-said'); } catch (e) {}
    if (past && !fabSaid && !seen && !reduce && !PREVIEW) {
      fabSaid = true;
      try { sessionStorage.setItem('help-said', '1'); } catch (e) {}
      try { if (sessionStorage.getItem('fab')) return; sessionStorage.setItem('fab', '1'); } catch (e) {}
      setTimeout(() => { const f = $('#help'); if (f && !f.classList.contains('open')) { f.classList.add('say'); setTimeout(() => { const g = $('#help'); if (g) g.classList.remove('say'); }, 4000); } }, 1200);
    }
  }
  let fabSaid = false;
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
      ...prods().map((x) => ({ href: '#' + x.id, img: x.image, ic: 'layers', title: x.model + ' · ' + t(x.name), sub: t(x.short), title_n: norm(x.model + ' ' + x.model.replace(/\s/g, '') + ' ' + [x.name.en, x.name.el].join(' ')), hay: norm([x.model, x.model.replace(/\s/g, ''), 'muskita', pcat(x.cat), x.name.en, x.name.el, x.short.en, x.short.el, x.desc.en, x.desc.el].join(' ')) })),
      page('#reviews', 'star', u('reviews'), u('rev_title'), 'reviews review rating testimonials clients κριτικες αξιολογησεις πελατες'),
      page('#gallery', 'images', u('gal_page_title'), u('gal_page_sub'), 'gallery projects photos work latest portfolio εργα φωτογραφιες γκαλερι'),
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
    prodCur = null;
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
    reveal(sp, instant && renders > 1);
    cfgDemo(s);
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
    setTimeout(() => { if (!layerBusy()) { sp.hidden = true; sp.innerHTML = ''; } }, reduce ? 0 : 720);
  }
  let galOpen = false, prodCur = null, revOpen = false;
  const layerBusy = () => current || galOpen || prodCur || revOpen;
  function openRevPage(instant) {
    current = null; galOpen = false; prodCur = null;
    revOpen = true;
    const sp = $('#sp');
    sp.innerHTML = revPage();
    sp.setAttribute('role', 'dialog');
    sp.setAttribute('aria-modal', 'true');
    sp.setAttribute('aria-label', u('rv_h'));
    sp.hidden = false;
    sp.scrollTop = 0;
    if (instant || reduce) sp.classList.add('open');
    else requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.add('open')));
    lock(true, 'sp');
    document.title = `${u('rv_h')} · ${S.company.name}`;
    sp.setAttribute('tabindex', '-1');
    setTimeout(() => sp.focus({ preventScroll: true }), 50);
  }
  function closeRevPage() {
    if (!revOpen) return;
    revOpen = false;
    const sp = $('#sp');
    sp.classList.remove('open');
    lock(false, 'sp');
    document.title = `${S.company.name} · ${t(S.text.tagline)}`;
    setTimeout(() => { if (!layerBusy()) { sp.hidden = true; sp.innerHTML = ''; } }, reduce ? 0 : 720);
  }
  function openProduct(id, instant) {
    const x = byProd(id);
    if (!x) return;
    current = null;
    galOpen = false;
    prodCur = x;
    const sp = $('#sp');
    sp.innerHTML = productPage(x);
    sp.setAttribute('role', 'dialog');
    sp.setAttribute('aria-modal', 'true');
    sp.setAttribute('aria-label', x.model);
    sp.hidden = false;
    sp.scrollTop = 0;
    if (instant || reduce) sp.classList.add('open');
    else requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.add('open')));
    lock(true, 'sp');
    reveal(sp, instant && renders > 1);
    document.title = `${x.model} · ${t(x.name)} · ${S.company.name}`;
    sp.setAttribute('tabindex', '-1');
    setTimeout(() => sp.focus({ preventScroll: true }), 50);
  }
  function closeProduct() {
    if (!prodCur) return;
    prodCur = null;
    const sp = $('#sp');
    sp.classList.remove('open');
    lock(false, 'sp');
    document.title = `${S.company.name} · ${t(S.text.tagline)}`;
    setTimeout(() => { if (!layerBusy()) { sp.hidden = true; sp.innerHTML = ''; } }, reduce ? 0 : 720);
  }
  function openGallery(instant) {
    current = null;
    galOpen = true;
    const sp = $('#sp');
    sp.innerHTML = galleryPage();
    sp.setAttribute('role', 'dialog');
    sp.setAttribute('aria-modal', 'true');
    sp.setAttribute('aria-label', u('gallery'));
    sp.hidden = false;
    sp.scrollTop = 0;
    if (instant || reduce) sp.classList.add('open');
    else requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.add('open')));
    lock(true, 'sp');
    document.title = `${u('gal_page_title')} · ${S.company.name}`;
    sp.setAttribute('tabindex', '-1');
    setTimeout(() => sp.focus({ preventScroll: true }), 50);
  }
  function closeGallery() {
    if (!galOpen) return;
    galOpen = false;
    const sp = $('#sp');
    sp.classList.remove('open');
    lock(false, 'sp');
    document.title = `${S.company.name} · ${t(S.text.tagline)}`;
    setTimeout(() => { if (!layerBusy()) { sp.hidden = true; sp.innerHTML = ''; } }, reduce ? 0 : 720);
  }
  function route(first) {
    const h = decodeURIComponent(location.hash.slice(1));
    if (panel) setPanel(null);
    setHelp(false);
    if (h === 'all-reviews' && allRevs().length) { openRevPage(first); return; }
    if (h === 'gallery' && works().length) { prodCur = null; revOpen = false; openGallery(first); return; }
    if (h && byProd(h)) { revOpen = false; openProduct(h, first); return; }
    if (h && bySlug(h)) { galOpen = false; prodCur = null; revOpen = false; openSystem(h, first); return; }
    if (revOpen) closeRevPage();
    if (prodCur) closeProduct();
    if (galOpen) closeGallery();
    if (current) closeSystem();
    if (h && !first) { const el = document.getElementById(h); if (el) setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 20); }
  }

  // lightbox
  let lbList = [], lbI = 0, lbCaps = [], lbWork = null;
  function openLB(list, i, caps, work) {
    lbList = list; lbI = i; lbCaps = caps || []; lbWork = work || null;
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
    let ask = lb.querySelector('.lb-ask');
    if (!ask) { ask = document.createElement('a'); ask.className = 'btn btn-wa lb-ask'; ask.target = '_blank'; ask.rel = 'noopener'; lb.appendChild(ask); }
    ask.hidden = !lbWork || !waLink();
    if (lbWork) ask.href = askWa('w', lbWork.id, t(lbWork.title));
    ask.innerHTML = waIcon + u('ask_price');
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
    else if (galOpen) { const top = $('#sp').scrollTop; openGallery(true); $('#sp').scrollTop = top; }
    else if (prodCur) { const top = $('#sp').scrollTop; openProduct(prodCur.id, true); $('#sp').scrollTop = top; }
  }

  /* ---------- events (delegated, bound once) ---------- */
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('[data-lang]');
    if (lb) { setLang(lb.dataset.lang); return; }
    if (e.target.closest('.help-btn')) { setHelp(!$('#help').classList.contains('open')); return; }
    if (!e.target.closest('.rvc-menu')) $$('.rvc-pop:not([hidden])').forEach((p) => { p.hidden = true; });
    const rate = e.target.closest('[data-rate]');
    if (rate) { openReview(+rate.dataset.rate); return; }
    if (e.target.closest('[data-review]')) { openReview(); return; }
    const rvmb = e.target.closest('[data-rvmenu]');
    if (rvmb) { const pop = rvmb.nextElementSibling, open = pop.hidden; $$('.rvc-pop').forEach((p) => { p.hidden = true; }); pop.hidden = !open; rvmb.setAttribute('aria-expanded', String(open)); return; }
    const rva = e.target.closest('[data-rvdev],[data-rvsignout],[data-rvdel],[data-rvvote],[data-rvreport]');
    if (rva) { rvAction(rva); return; }
    const rvs = e.target.closest('[data-rvsort],[data-rvstar]');
    if (rvs) {
      if (rvs.dataset.rvsort) rvSort = rvs.dataset.rvsort; else rvStar = rvStar === +rvs.dataset.rvstar ? 0 : +rvs.dataset.rvstar;
      $$('[data-rvsort]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rvsort === rvSort)));
      $$('[data-rvstar]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.rvstar === rvStar)));
      const l = $('#rvp-list'); if (l) l.innerHTML = revPageList();
      return;
    }
    if (e.target.closest('[data-rv-close]') || e.target.id === 'rvm') { closeReview(); return; }
    const sp = e.target.closest('[data-star]');
    const rvd = e.target.closest('[data-rvf-del]');
    if (rvd) { rvPhotos.splice(+rvd.dataset.rvfDel, 1); rvDraw(); return; }
    const rvp = e.target.closest('[data-rvp]');
    if (rvp) { const r = allRevs().find((x) => x.id === rvp.dataset.rvp); if (r) openLB(r.photos, +rvp.dataset.k || 0, r.photos.map(() => r.name)); return; }
    if (sp) { const n = +sp.dataset.star; $('#rvm').dataset.rating = String(n); $$('[data-star]').forEach((b) => { const on = +b.dataset.star <= n; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(+b.dataset.star === n)); }); return; }
    if ($('#help') && $('#help').classList.contains('open')) setHelp(false);
    const ls = e.target.closest('.lsel-btn');
    $$('.lsel-menu').forEach((m) => { if (!ls || !ls.parentElement.contains(m)) { m.hidden = true; m.previousElementSibling.setAttribute('aria-expanded', 'false'); } });
    if (ls) { const m = ls.nextElementSibling; m.hidden = !m.hidden; ls.setAttribute('aria-expanded', String(!m.hidden)); return; }
    const sb = e.target.closest('[data-slide]');
    if (sb) { hsShow(hsI + +sb.dataset.slide); return; }
    if (e.target.closest('#burger')) { setPanel(panel === 'menu' ? null : 'menu'); return; }
    const mb = e.target.closest('.mega-btn');
    if (mb) { setPanel(panel === mb.dataset.p && !canHover() ? null : mb.dataset.p); return; }
    if (e.target.closest('.srch-btn')) { setPanel(panel === 'search' ? null : 'search'); if (panel === 'search') { const i = $('#sq-top'); i.focus(); runSearch(i.closest('[data-search]')); } return; }
    const acc = e.target.closest('.acc');
    if (acc) { const open = acc.getAttribute('aria-expanded') !== 'true'; acc.setAttribute('aria-expanded', String(open)); $('#' + acc.getAttribute('aria-controls')).classList.toggle('open', open); return; }
    const chip = e.target.closest('[data-chip]');
    if (chip) { const box = chip.closest('[data-search]'), i = box.querySelector('.sq'); i.value = chip.dataset.chip; runSearch(box); i.focus(); return; }
    if (panel && e.target.closest('#mnav a, #mega a, #pmega a, #srch a')) { setPanel(null); return; }
    if (panel && panel !== 'menu' && !e.target.closest('#hdr')) setPanel(null);

    const pr = e.target.closest('[data-prail]');
    if (pr) { const g = $('#prod-grid'), c = g && g.querySelector('.prod'); if (g) g.scrollBy({ left: +pr.dataset.prail * ((c ? c.offsetWidth : 280) + 14), behavior: reduce ? 'auto' : 'smooth' }); return; }
    const rb = e.target.closest('[data-rail]');
    if (rb) { const r = $('#rail'); const card = r.querySelector('.card'); r.scrollBy({ left: +rb.dataset.rail * ((card ? card.offsetWidth : 300) + 16), behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (e.target.closest('[data-video]')) { openVideo(); return; }
    const wk = e.target.closest('[data-work]');
    if (wk) { const w = works().find((x) => x.id === wk.dataset.work); if (w) openLB(w.images, 0, w.images.map(() => t(w.title)), w); return; }
    const gchip = e.target.closest('[data-gf]');
    if (gchip) {
      const where = gchip.dataset.gf;
      gf[where] = gchip.dataset.c;
      $$(`[data-gf="${where}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === gf[where])));
      const grid = $(where === 'home' ? '#work-home' : '#work-page');
      if (grid) { grid.innerHTML = workList(where); grid.classList.remove('in', 'now'); void grid.offsetWidth; grid.classList.add('in'); if (where === 'home') grid.scrollLeft = 0; }
      return;
    }
    const td = e.target.closest('[data-tst]');
    if (td) { tstShow(+td.dataset.tst); tstStart(); tstShow(+td.dataset.tst); return; }

    const pt = e.target.closest('#parts li');
    if (pt) { focusPart(pt.classList.contains('on') && !canHover() ? null : pt.dataset.p); return; }

    const consult = e.target.closest('[data-consult]');
    if (consult) { const sy = bySlug(consult.dataset.consult); qbStart({ cat: SYS_CAT[consult.dataset.consult] || 'custom', specs: sy ? t(sy.name) : '' }); return; }
    const addq = e.target.closest('[data-addq]');
    if (addq) { const x = byProd(addq.dataset.addq); if (x) qbStart({ cat: x.cat, model: x.model }); return; }
    const qa = e.target.closest('[data-qb]');
    if (qa) { qbAction(qa.dataset.qb, qa); return; }
    const qfd = e.target.closest('[data-qf-del]');
    if (qfd) { const d = qbReadItem(); d.files.splice(+qfd.dataset.qfDel, 1); qbRender(); return; }
    const pfb = e.target.closest('[data-pf]');
    if (pfb) { pf = pfb.dataset.pf; $$('[data-pf]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pf === pf))); const g = $('#prod-grid'); if (g) { g.innerHTML = prodCards(); g.scrollLeft = 0; g.classList.remove('in', 'now'); void g.offsetWidth; g.classList.add('in'); prodArrows(); } return; }
    const go = e.target.closest('.sp-tabs [data-go]');
    if (go) { const el = document.getElementById(go.dataset.go); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
    const z = e.target.closest('[data-zoom]');
    if (z && current) { openLB([current.image, ...(current.gallery || [])].filter(Boolean), +z.dataset.zoom); return; }

    const set = e.target.closest('[data-set]');
    if (set && current) {
      const st = CFG[current.slug];
      st.touched = true;
      const k = set.dataset.set, v = set.dataset.v;
      st[k] = k === 'type' ? v : +v;
      if (k === 'type') st.p = 0.55;
      renderCfg(current);
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('sq')) { runSearch(e.target.closest('[data-search]')); return; }
    if (e.target.id === 'cfg-p' && current) { const st = CFG[current.slug]; st.touched = true; st.p = e.target.value / 100; drawCfg(current); }
  });
  document.addEventListener('focusin', (e) => { if (e.target.classList.contains('sq')) runSearch(e.target.closest('[data-search]')); });
  document.addEventListener('change', async (e) => {
    if (e.target.dataset && e.target.dataset.qi) { qbReadItem(); qbSave(); return; }
    if (e.target.dataset && e.target.dataset.qc) { qbReadCust(); qbSave(); return; }
    if (e.target.id === 'qb-file' && e.target.files[0]) { const d = qbReadItem(); const f = await qbUpload(e.target.files[0]); if (f) { d.files = [...(d.files || []), f].slice(0, 3); qbRender(); } return; }
    if (e.target.id === 'rv-file' && e.target.files.length) { rvUpload([...e.target.files]); return; }
  });
  document.addEventListener('toggle', (e) => { if (e.target.id === 'qb-more') QB.more = e.target.open; }, true);
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'rv-form') { e.preventDefault(); submitReview(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#rvm') && !$('#rvm').hidden) { closeReview(); return; }
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
      else if ($('#help') && $('#help').classList.contains('open')) setHelp(false);
      else if (galOpen) location.hash = 'projects';
      else if (prodCur) location.hash = 'products';
      else if (current) location.hash = 'systems';
    }
  });
  // desktop: open the systems mega menu on hover
  let megaT;
  document.addEventListener('mouseover', (e) => {
    if (!canHover()) return;
    const mb = e.target.closest('.mega-btn'), isMega = (p) => p === 'mega' || p === 'pmega';
    if (mb) { clearTimeout(megaT); if (panel !== mb.dataset.p && panel !== 'search') setPanel(mb.dataset.p); }
    else if (e.target.closest('#mega, #pmega')) clearTimeout(megaT);
    else if (isMega(panel) && !e.target.closest('#hdr')) { clearTimeout(megaT); megaT = setTimeout(() => { if (isMega(panel)) setPanel(null); }, 250); }
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
  // admin preview: jump straight to the part of the page being edited
  function previewTo(t) {
    if (byProd(t) || bySlug(t) || t === 'gallery' || t === 'all-reviews') { if (location.hash === '#' + t) route(true); else location.hash = t; return; }
    if (layerBusy() || location.hash) { history.replaceState(null, '', location.pathname + location.search); route(true); }
    const go = () => {
      if (t === 'top') { scrollTo(0, 0); return; }
      let el = null;
      for (const s of t.split('|')) { try { el = document.querySelector(/^[#.]/.test(s) ? s : '#' + s); } catch (e) {} if (el) break; }
      if (!el) return;
      let y = 0;
      for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
      const head = ($('#hdr') || { offsetHeight: 0 }).offsetHeight;
      scrollTo(0, Math.max(0, y - head - 16));
    };
    go();
    setTimeout(go, 120);
  }
  if (PREVIEW) {
    addEventListener('message', (e) => {
      if (e.origin === location.origin && e.data && e.data.type === 'preview-go') { previewTo(String(e.data.target || 'top')); return; }
      if (e.origin !== location.origin || !e.data || e.data.type !== 'preview') return;
      S = e.data.site;
      applyTheme(S.theme || {});
      const slug = current && current.slug, y = scrollY;
      render();
      scrollTo(0, y);
      if (slug && bySlug(slug)) openSystem(slug, true);
      else if (slug) closeSystem();
      else if (galOpen) openGallery(true);
      else if (prodCur && byProd(prodCur.id)) openProduct(prodCur.id, true);
    });
    if (parent !== window) parent.postMessage({ type: 'preview-ready' }, location.origin);
  }

  setupLB();
  render();
  route(true);
  rvLoadMe();

})();
