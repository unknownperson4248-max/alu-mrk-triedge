// Default website content. The admin panel saves a full copy of this object to KV;
// these values are only used until the first save (and to fill any missing fields).
const T = (en, el) => ({ en, el });
const F = (icon, en, el) => ({ icon, title: T(en, el) });
const SP = (en, el) => ({ label: T(en, el), value: '' });

export const PRESETS = {
  'black-silver-gold': { navy: '#17191d', accent: '#d4b36e', bg: '#0a0b0d', surface: '#141619', ink: '#eceef1' },
  'night-gold': { navy: '#121b2a', accent: '#e9b23c', bg: '#0b1019', surface: '#141d2b', ink: '#eef1f5' },
  'navy-gold': { navy: '#0e1b2e', accent: '#c98a3c', bg: '#ffffff', surface: '#eef1f4', ink: '#0c1522' },
  'graphite-bronze': { navy: '#2b3033', accent: '#b08a62', bg: '#ffffff', surface: '#f2f2f0', ink: '#16191b' },
  'midnight-orange': { navy: '#0b1220', accent: '#f08a24', bg: '#ffffff', surface: '#f1f3f6', ink: '#0b1220' },
  'black-silver': { navy: '#121315', accent: '#a3acb4', bg: '#ffffff', surface: '#f0f1f2', ink: '#111214' },
  'green-brass': { navy: '#10241f', accent: '#b8954f', bg: '#ffffff', surface: '#eef2f0', ink: '#0f1c18' },
};

export const DEFAULT_SITE = {
  version: 1,
  theme: { ...PRESETS['black-silver-gold'] },
  company: {
    name: 'Alu MRK TriEdge Ltd',
    phone: '+357 99 078280',
    whatsapp: '35799078280',
    email: 'alutriedge@gmail.com',
    address: T('', ''),
    hours: T('', ''),
    socials: { facebook: '', instagram: '', linkedin: '' },
  },
  text: {
    tagline: T('Engineering Excellence. Redefining Aluminium.', 'Μηχανική αριστεία. Επαναπροσδιορίζουμε το αλουμίνιο.'),
    heroTitle: T('Engineering Excellence.', 'Μηχανική αριστεία.'),
    heroAccent: T('Redefining Aluminium.', 'Επαναπροσδιορίζουμε το αλουμίνιο.'),
    heroSub: T('Aluminium windows, doors and glass systems for modern architecture, made to measure in Cyprus.', 'Παράθυρα, πόρτες και συστήματα γυαλιού αλουμινίου για σύγχρονη αρχιτεκτονική, κατά παραγγελία στην Κύπρο.'),
    introTitle: T('Precision in every frame. Care in every detail.', 'Ακρίβεια σε κάθε πλαίσιο. Φροντίδα σε κάθε λεπτομέρεια.'),
    introBody: T(
      'From the first measurement to the final seal, one team designs, fabricates and installs your aluminium windows, doors and glass systems. Everything is made to measure, for homes, offices and commercial spaces across Cyprus.',
      'Από την πρώτη μέτρηση μέχρι την τελική σφράγιση, μία ομάδα σχεδιάζει, κατασκευάζει και τοποθετεί τα κουφώματα αλουμινίου, τις πόρτες και τα συστήματα γυαλιού σας. Όλα κατασκευάζονται στα μέτρα σας, για κατοικίες, γραφεία και επαγγελματικούς χώρους σε όλη την Κύπρο.'
    ),
    systemsTitle: T('Nine systems. One standard of precision.', 'Εννέα συστήματα. Ένα πρότυπο ακρίβειας.'),
    systemsSub: T('Choose a system to see how it works, what it is made of and how it can open.', 'Επιλέξτε ένα σύστημα για να δείτε πώς λειτουργεί, από τι αποτελείται και πώς ανοίγει.'),
  },
  hero: [
    { img: 'img/glass-room.jpg', caption: T('Glass room', 'Γυάλινος χώρος') },
    { img: 'img/house-windows.jpg', caption: T('Curtain wall', 'Υαλοπέτασμα') },
    { img: 'img/folding-interior.jpg', caption: T('Folding doors', 'Πτυσσόμενες πόρτες') },
  ],
  heroImage: 'img/glass-room.jpg',
  heroVideo: '',
  heroText: true,
  aboutImage: 'img/alu-profiles.jpg',
  heroBadge: T('', ''),
  galleryCats: [
    { id: 'sliding', name: T('Sliding systems', 'Συρόμενα') },
    { id: 'folding', name: T('Folding systems', 'Πτυσσόμενα') },
    { id: 'windows', name: T('Windows', 'Παράθυρα') },
    { id: 'doors', name: T('Doors', 'Πόρτες') },
    { id: 'glass-rooms', name: T('Glass rooms', 'Γυάλινοι χώροι') },
    { id: 'railings', name: T('Railings & partitions', 'Κάγκελα & χωρίσματα') },
    { id: 'commercial', name: T('Commercial', 'Επαγγελματικά') },
  ],
  // Latest work: newest first. `ts` is set when a work is added in the admin panel and drives the NEW label.
  works: [
    { id: 'w01', title: T('Glass room', 'Γυάλινος χώρος'), cat: 'glass-rooms', place: T('', ''), date: '', images: ['img/glass-room.jpg'], ts: 0 },
    { id: 'w02', title: T('Corner glazing', 'Γωνιακά υαλοστάσια'), cat: 'windows', place: T('', ''), date: '', images: ['img/house-windows.jpg'], ts: 0 },
    { id: 'w03', title: T('Entrance door & window', 'Πόρτα εισόδου & παράθυρο'), cat: 'doors', place: T('', ''), date: '', images: ['img/door-window.jpg'], ts: 0 },
    { id: 'w04', title: T('Sliding doors', 'Συρόμενες πόρτες'), cat: 'sliding', place: T('', ''), date: '', images: ['img/sliding-door.jpg', 'img/lift-slide.jpg'], ts: 0 },
    { id: 'w05', title: T('Folding doors', 'Πτυσσόμενες πόρτες'), cat: 'folding', place: T('', ''), date: '', images: ['img/folding-interior.jpg', 'img/folding-product.jpg'], ts: 0 },
    { id: 'w06', title: T('Office partitions', 'Χωρίσματα γραφείου'), cat: 'railings', place: T('', ''), date: '', images: ['img/office-partition.jpg', 'img/partition-door.jpg'], ts: 0 },
    { id: 'w07', title: T('Glass stair railing', 'Γυάλινο κάγκελο σκάλας'), cat: 'railings', place: T('', ''), date: '', images: ['img/glass-stairs.jpg'], ts: 0 },
    { id: 'w08', title: T('Sliding window', 'Συρόμενο παράθυρο'), cat: 'windows', place: T('', ''), date: '', images: ['img/sliding-window.jpg'], ts: 0 },
    { id: 'w09', title: T('Commercial entrance', 'Επαγγελματική είσοδος'), cat: 'commercial', place: T('', ''), date: '', images: ['img/commercial-doors.jpg'], ts: 0 },
  ],
  founder: { name: '', photo: '', role: T('', ''), bio: T('', ''), quote: T('', '') },
  stats: [],
  values: [
    { icon: 'diamond', title: T('Measured on site', 'Μέτρηση στον χώρο'), body: T('Every opening is surveyed and measured by our team before production.', 'Κάθε άνοιγμα μετριέται από την ομάδα μας πριν την παραγωγή.') },
    { icon: 'layers', title: T('Engineered systems', 'Σύγχρονα συστήματα'), body: T('Thermal-break profiles, quality hardware and insulated glass.', 'Προφίλ θερμοδιακοπής, ποιοτικοί μηχανισμοί και μονωτικά τζάμια.') },
    { icon: 'palette', title: T('Made to measure', 'Κατά παραγγελία'), body: T('Any size, any RAL colour or wood-effect finish.', 'Κάθε διάσταση, κάθε χρώμα RAL ή απομίμηση ξύλου.') },
    { icon: 'users', title: T('One team, start to finish', 'Μία ομάδα, από την αρχή ως το τέλος'), body: T('Survey, fabrication and installation by the same people.', 'Αυτοψία, κατασκευή και τοποθέτηση από τους ίδιους ανθρώπους.') },
  ],
  testimonials: [],
  // Aluminium profile systems (models). MUSKITA is the profile manufacturer/supplier; specs are copied from its product pages. Leave a value empty when it is not confirmed.
  productCats: [
    { id: 'doors', name: T('Aluminium Doors', 'Πόρτες αλουμινίου') },
    { id: 'sliding-doors', name: T('Sliding Doors', 'Συρόμενες πόρτες') },
    { id: 'windows', name: T('Aluminium Windows', 'Παράθυρα αλουμινίου') },
    { id: 'sliding-windows', name: T('Sliding Windows', 'Συρόμενα παράθυρα') },
    { id: 'thermal', name: T('Thermal Systems', 'Θερμομονωτικά συστήματα') },
    { id: 'glass', name: T('Glass Solutions', 'Λύσεις γυαλιού') },
    { id: 'custom', name: T('Custom Solutions', 'Ειδικές κατασκευές') },
  ],
  products: [
    {
      id: 'mu2000', model: 'MU 2000', visible: true, cat: 'doors', image: 'img/door-window.jpg',
      name: T('Door System', 'Σύστημα πόρτας'),
      short: T('Cost-effective non-insulated hinged system with a linear design.', 'Οικονομικό μη θερμομονωτικό ανοιγόμενο σύστημα με γραμμικό σχεδιασμό.'),
      desc: T('MU 2000 is a cost-effective, non-insulated aluminium system with a clean linear design, used for doors and windows where thermal insulation is not required.', 'Το MU 2000 είναι ένα οικονομικό, μη θερμομονωτικό σύστημα αλουμινίου με καθαρό γραμμικό σχεδιασμό, για πόρτες και παράθυρα όπου δεν απαιτείται θερμομόνωση.'),
      colours: T('', ''), specs: [], applications: [T('Homes', 'Κατοικίες'), T('Apartments', 'Διαμερίσματα'), T('Shops & offices', 'Καταστήματα & γραφεία')],
      source: 'https://muskita.tabsandspaces.agency/product/mu2000',
    },
    {
      id: 'mu3200', model: 'MU 3200', visible: true, cat: 'sliding-windows', image: 'img/sliding-window.jpg',
      name: T('Sliding Window System', 'Συρόμενο σύστημα παραθύρων'),
      short: T('Slim, cost-effective sliding system for small to medium openings.', 'Λεπτό, οικονομικό συρόμενο σύστημα για μικρά έως μεσαία ανοίγματα.'),
      desc: T('MU 3200 (Light Duty) is a cost-effective sliding aluminium system with a slim design, suitable for windows and doors of small to medium dimensions. It is non-insulated.', 'Το MU 3200 (Light Duty) είναι ένα οικονομικό συρόμενο σύστημα αλουμινίου με λεπτό σχεδιασμό, κατάλληλο για παράθυρα και πόρτες μικρών έως μεσαίων διαστάσεων. Δεν είναι θερμομονωτικό.'),
      colours: T('', ''), specs: [], applications: [T('Windows', 'Παράθυρα'), T('Balcony doors', 'Μπαλκονόπορτες'), T('Apartments', 'Διαμερίσματα')],
      source: 'https://muskita.tabsandspaces.agency/product/mu3200-light-duty',
    },
    {
      id: 'mu3000', model: 'MU 3000', visible: true, cat: 'thermal', image: 'img/lift-slide.jpg',
      name: T('Thermal Sliding System', 'Θερμομονωτικό συρόμενο σύστημα'),
      short: T('Long-standing sliding and lift-and-slide range, with or without thermal insulation.', 'Δοκιμασμένη σειρά συρόμενων και ανυψούμενων-συρόμενων συστημάτων, με ή χωρίς θερμομόνωση.'),
      desc: T('The MU 3000 series are reliable, cost-effective sliding and lift-and-slide aluminium systems, available with or without thermal insulation, in straight or curved profiles. Versions: MU3000 Thermal, MU3000 Thermal Lift & Slide, MU3000 Plus Thermal, MU3000 and MU3000 Plus. Single to quadruple sashes, flush thresholds and corner openings without posts are possible.', 'Η σειρά MU 3000 περιλαμβάνει αξιόπιστα, οικονομικά συρόμενα και ανυψούμενα-συρόμενα συστήματα αλουμινίου, με ή χωρίς θερμομόνωση, σε ευθύγραμμα ή καμπύλα προφίλ. Εκδόσεις: MU3000 Thermal, MU3000 Thermal Lift & Slide, MU3000 Plus Thermal, MU3000 και MU3000 Plus. Δυνατότητα από ένα έως τέσσερα φύλλα, χωνευτό κατωκάσι και γωνιακά ανοίγματα χωρίς κολόνα.'),
      colours: T('Powder-coated colours, anodised finishes and wood effects (ask us for the colour chart).', 'Ηλεκτροστατική βαφή, ανοδιώσεις και απομίμηση ξύλου (ζητήστε τον χρωματολόγιο).'),
      specs: [
        { label: T('Rail width', 'Πλάτος οδηγού'), value: '100 mm' },
        { label: T('Max. sash weight', 'Μέγ. βάρος φύλλου'), value: '200 kg' },
        { label: T('Glass', 'Υαλοπίνακας'), value: 'up to 24–29 mm (by version)' },
        { label: T('Thermal transmittance Uw (thermal versions)', 'Θερμοπερατότητα Uw (θερμομονωτικές εκδόσεις)'), value: '≥ 1.7 W/(m²K)' },
        { label: T('Thermal break', 'Θερμοδιακοπή'), value: '24 mm polyamides (thermal versions)' },
        { label: T('Sound reduction', 'Ηχομείωση'), value: 'up to 38 dB' },
        { label: T('Air permeability', 'Αεροπερατότητα'), value: 'Class 3–4 (by version)' },
        { label: T('Water tightness', 'Υδατοστεγανότητα'), value: 'Class 4B–6B (by version)' },
        { label: T('Wind load resistance', 'Αντοχή σε ανεμοπίεση'), value: 'Class B2–C2 (by version)' },
      ],
      applications: [T('Renovation', 'Ανακαίνιση'), T('New buildings', 'Νέες κατασκευές'), T('Large openings', 'Μεγάλα ανοίγματα')],
      source: 'https://muskita.tabsandspaces.agency/product/mu3000',
    },
    {
      id: 'mu2075', model: 'MU 2075', visible: true, cat: 'windows', image: 'img/house-windows.jpg',
      name: T('Aluminium System', 'Σύστημα αλουμινίου'),
      short: T('Thermal hinged system for windows and doors: energy efficiency, sound insulation and security.', 'Θερμομονωτικό ανοιγόμενο σύστημα για παράθυρα και πόρτες: ενεργειακή απόδοση, ηχομόνωση και ασφάλεια.'),
      desc: T('MU 2075 is a thermal hinged system for windows and doors, combining energy efficiency, sound insulation and security, in linear or curved designs. Versions: MU2075, MU2075 Curve, MU2075 Elite and MU2075 Elite Plus. Configurations include one to three sash windows, doors, tilt & turn, tilt & slide, pivot doors, double doors and shopfronts.', 'Το MU 2075 είναι θερμομονωτικό ανοιγόμενο σύστημα για παράθυρα και πόρτες, που συνδυάζει ενεργειακή απόδοση, ηχομόνωση και ασφάλεια, σε γραμμικό ή καμπύλο σχεδιασμό. Εκδόσεις: MU2075, MU2075 Curve, MU2075 Elite και MU2075 Elite Plus. Διαμορφώσεις: παράθυρα ενός έως τριών φύλλων, πόρτες, ανοιγοανακλινόμενα, tilt & slide, περιστρεφόμενες πόρτες, δίφυλλες πόρτες και βιτρίνες.'),
      colours: T('Over 80 finishes: anodised, powder-coated, wood effects and sublimation.', 'Πάνω από 80 φινιρίσματα: ανοδιώσεις, ηλεκτροστατική βαφή, απομίμηση ξύλου και sublimation.'),
      specs: [
        { label: T('Frame width', 'Πλάτος κάσας'), value: '68–78 mm (by version)' },
        { label: T('Sash width', 'Πλάτος φύλλου'), value: '75–85 mm (by version)' },
        { label: T('Max. sash weight', 'Μέγ. βάρος φύλλου'), value: '170 kg' },
        { label: T('Glass', 'Υαλοπίνακας'), value: 'up to 56–66 mm (by version)' },
        { label: T('Thermal transmittance Uw', 'Θερμοπερατότητα Uw'), value: 'from ≥ 0.97 W/(m²K) (Elite Plus) to ≥ 1.2' },
        { label: T('Sound reduction', 'Ηχομείωση'), value: 'up to 51 dB' },
        { label: T('Air permeability', 'Αεροπερατότητα'), value: 'Class 4' },
        { label: T('Water tightness', 'Υδατοστεγανότητα'), value: 'Class E1050' },
        { label: T('Wind load resistance', 'Αντοχή σε ανεμοπίεση'), value: 'Class C5' },
        { label: T('Burglar resistance', 'Αντιδιαρρηκτική προστασία'), value: 'up to RC3' },
      ],
      applications: [T('Homes', 'Κατοικίες'), T('Buildings with high energy requirements', 'Κτίρια με υψηλές ενεργειακές απαιτήσεις'), T('Shopfronts', 'Βιτρίνες')],
      source: 'https://muskita.tabsandspaces.agency/product/mu2075',
    },
    {
      id: 'mu114', model: 'MU 114', visible: true, cat: 'thermal', image: 'img/sliding-door.jpg',
      name: T('Thermal Sliding System', 'Θερμομονωτικό συρόμενο σύστημα'),
      short: T('', ''), desc: T('', ''), colours: T('', ''), specs: [], applications: [],
      source: '',
    },
  ],
  // Defaults for the quotation document made in the admin panel. Empty until the company confirms them.
  quoteSettings: { currency: '€', vat: '', validity: '', payment: '', delivery: '', terms: '' },
  // Published customer reviews: { id, name, place, rating 1-5, text, ts }. New ones arrive through the website and are approved in the admin panel.
  reviews: [],
  systems: [
    {
      slug: 'motorized-sliding', icon: 'motor', visible: true, kind: 'slide', motor: true, configs: [2, 3, 4, 6],
      name: T('Motorized Sliding Systems', 'Μηχανοκίνητα συρόμενα συστήματα'),
      short: T('Large glass panels that open at the touch of a button.', 'Μεγάλα γυάλινα φύλλα που ανοίγουν με το πάτημα ενός κουμπιού.'),
      overview: T(
        'Motorized sliding systems move heavy, full-height glass panels quietly and smoothly, controlled by a wall switch, a remote or a smart-home system. They suit wide openings where manual operation would be difficult.',
        'Τα μηχανοκίνητα συρόμενα συστήματα κινούν βαριά γυάλινα φύλλα πλήρους ύψους αθόρυβα και ομαλά, με διακόπτη, τηλεχειριστήριο ή σύστημα έξυπνου σπιτιού. Ιδανικά για μεγάλα ανοίγματα όπου ο χειρισμός με το χέρι θα ήταν δύσκολος.'
      ),
      image: 'img/lift-slide.jpg', gallery: ['img/sliding-door.jpg'],
      features: [
        F('motor', 'Quiet electric drive', 'Αθόρυβη ηλεκτρική κίνηση'),
        F('remote', 'Switch, remote or smart-home control', 'Διακόπτης, τηλεχειριστήριο ή έξυπνο σπίτι'),
        F('maximize', 'Wide, uninterrupted openings', 'Μεγάλα ανοίγματα χωρίς εμπόδια'),
        F('thermo', 'Thermal-break profiles', 'Προφίλ με θερμοδιακοπή'),
      ],
      specs: [SP('Max. panel width', 'Μέγ. πλάτος φύλλου'), SP('Max. panel height', 'Μέγ. ύψος φύλλου'), SP('Max. panel weight', 'Μέγ. βάρος φύλλου'), SP('Glass thickness', 'Πάχος γυαλιού'), SP('Frame depth', 'Βάθος πλαισίου'), SP('Motor & control', 'Μοτέρ και χειρισμός'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Villas', 'Βίλες'), T('Penthouses', 'Ρετιρέ'), T('Hotels & restaurants', 'Ξενοδοχεία & εστιατόρια')],
      brochure: '',
    },
    {
      slug: 'vertical-sliding', icon: 'arrowsV', visible: true, kind: 'vertical', motor: true, configs: [2, 3, 4],
      name: T('Vertical Sliding Systems', 'Κάθετα συρόμενα συστήματα'),
      short: T('Glass panels that rise and lower to open a space.', 'Γυάλινα φύλλα που ανεβαίνουν και κατεβαίνουν για να ανοίξει ο χώρος.'),
      overview: T(
        'Vertical sliding (guillotine) systems lift glass panels upwards, turning a terrace, restaurant or bar into an open space in seconds while keeping the view clear when closed.',
        'Τα κάθετα συρόμενα συστήματα (γκιλοτίνα) ανεβάζουν τα γυάλινα φύλλα προς τα πάνω, μετατρέποντας μια βεράντα, ένα εστιατόριο ή ένα μπαρ σε ανοιχτό χώρο μέσα σε δευτερόλεπτα, με καθαρή θέα όταν είναι κλειστά.'
      ),
      image: 'img/glass-room.jpg', gallery: [],
      features: [
        F('arrowsV', 'Panels move vertically, no floor track', 'Κάθετη κίνηση, χωρίς οδηγό δαπέδου'),
        F('motor', 'Motorized operation', 'Μηχανοκίνητη λειτουργία'),
        F('wind', 'Protection from wind and rain', 'Προστασία από αέρα και βροχή'),
        F('sun', 'Use your terrace all year round', 'Χρήση της βεράντας όλο τον χρόνο'),
      ],
      specs: [SP('Max. panel width', 'Μέγ. πλάτος φύλλου'), SP('Max. panel height', 'Μέγ. ύψος φύλλου'), SP('Glass thickness', 'Πάχος γυαλιού'), SP('Number of panels', 'Αριθμός φύλλων'), SP('Drive', 'Κίνηση'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Terraces', 'Βεράντες'), T('Restaurants & cafés', 'Εστιατόρια & καφέ'), T('Balconies', 'Μπαλκόνια')],
      brochure: '',
    },
    {
      slug: 'aluminium-windows', icon: 'window', visible: true, kind: 'window', motor: false, configs: [1, 2, 3],
      name: T('Aluminium Windows', 'Παράθυρα αλουμινίου'),
      short: T('Sliding, casement and tilt-and-turn windows.', 'Συρόμενα, ανοιγόμενα και ανακλινόμενα παράθυρα.'),
      overview: T(
        'Thermally broken aluminium windows that keep heat out in summer and comfort in during winter. Available as sliding, casement or tilt-and-turn, in slim modern profiles and any colour.',
        'Παράθυρα αλουμινίου με θερμοδιακοπή που κρατούν τη ζέστη έξω το καλοκαίρι και τη θαλπωρή μέσα τον χειμώνα. Συρόμενα, ανοιγόμενα ή ανακλινόμενα, με λεπτά σύγχρονα προφίλ σε κάθε χρώμα.'
      ),
      image: 'img/sliding-window.jpg', gallery: ['img/door-window.jpg'],
      features: [
        F('thermo', 'Thermal-break profiles', 'Προφίλ με θερμοδιακοπή'),
        F('layers', 'Double or triple glazing', 'Διπλά ή τριπλά τζάμια'),
        F('droplet', 'Weather-tight seals', 'Στεγανά λάστιχα'),
        F('palette', 'Any RAL colour or wood effect', 'Κάθε χρώμα RAL ή απομίμηση ξύλου'),
      ],
      specs: [SP('Opening types', 'Τύποι ανοίγματος'), SP('Max. sash size', 'Μέγ. διάσταση φύλλου'), SP('Glazing', 'Υαλοπίνακες'), SP('Frame depth', 'Βάθος πλαισίου'), SP('Thermal break', 'Θερμοδιακοπή'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Homes', 'Κατοικίες'), T('Apartments', 'Διαμερίσματα'), T('Offices', 'Γραφεία')],
      brochure: '',
    },
    {
      slug: 'aluminium-doors', icon: 'door', visible: true, kind: 'swing', motor: false, configs: [1, 2],
      name: T('Aluminium Doors', 'Πόρτες αλουμινίου'),
      short: T('Entrance, patio and commercial doors.', 'Πόρτες εισόδου, βεράντας και επαγγελματικές.'),
      overview: T(
        'Secure, insulated aluminium doors for main entrances, patios, shops and offices, with multi-point locking, modern panel designs and glazed options.',
        'Ασφαλείς, μονωμένες πόρτες αλουμινίου για κεντρικές εισόδους, βεράντες, καταστήματα και γραφεία, με κλειδαριά πολλαπλών σημείων, σύγχρονα πάνελ και επιλογές με τζάμι.'
      ),
      image: 'img/door-window.jpg', gallery: ['img/commercial-doors.jpg', 'img/partition-door.jpg'],
      features: [
        F('lock', 'Multi-point locking', 'Κλειδαριά πολλαπλών σημείων'),
        F('thermo', 'Insulated panels and profiles', 'Μονωμένα πάνελ και προφίλ'),
        F('key', 'Single and double leaf', 'Μονόφυλλες και δίφυλλες'),
        F('palette', 'Custom designs and colours', 'Σχέδια και χρώματα κατά παραγγελία'),
      ],
      specs: [SP('Leaf types', 'Τύποι φύλλων'), SP('Max. leaf size', 'Μέγ. διάσταση φύλλου'), SP('Locking', 'Κλείδωμα'), SP('Panel / glass options', 'Επιλογές πάνελ / γυαλιού'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Main entrances', 'Κεντρικές είσοδοι'), T('Shops', 'Καταστήματα'), T('Offices', 'Γραφεία')],
      brochure: '',
    },
    {
      slug: 'folding-systems', icon: 'fold', visible: true, kind: 'fold', motor: false, configs: [3, 4, 5, 6],
      name: T('Folding Systems', 'Πτυσσόμενα συστήματα'),
      short: T('Panels that fold away to open a whole wall.', 'Φύλλα που διπλώνουν και ανοίγουν ολόκληρο τον τοίχο.'),
      overview: T(
        'Folding (bi-fold) doors stack neatly to one side, connecting indoor and outdoor living with an almost fully clear opening. Ideal for kitchens, living rooms, cafés and terraces.',
        'Οι πτυσσόμενες πόρτες διπλώνουν προς τη μία πλευρά, ενώνοντας τον εσωτερικό με τον εξωτερικό χώρο με σχεδόν πλήρως ελεύθερο άνοιγμα. Ιδανικές για κουζίνες, σαλόνια, καφέ και βεράντες.'
      ),
      image: 'img/folding-interior.jpg', gallery: ['img/folding-product.jpg'],
      features: [
        F('fold', 'Opens almost the full width', 'Ανοίγει σχεδόν όλο το πλάτος'),
        F('arrowsH', 'Inward or outward opening', 'Άνοιγμα προς τα μέσα ή έξω'),
        F('lock', 'Secure multi-point locking', 'Ασφαλής κλειδαριά πολλαπλών σημείων'),
        F('ruler', 'Low threshold options', 'Επιλογές χαμηλού κατωκάσι'),
      ],
      specs: [SP('Max. number of panels', 'Μέγ. αριθμός φύλλων'), SP('Max. panel width', 'Μέγ. πλάτος φύλλου'), SP('Max. panel height', 'Μέγ. ύψος φύλλου'), SP('Glass thickness', 'Πάχος γυαλιού'), SP('Opening direction', 'Φορά ανοίγματος'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Living rooms', 'Σαλόνια'), T('Cafés & bars', 'Καφέ & μπαρ'), T('Terraces', 'Βεράντες')],
      brochure: '',
    },
    {
      slug: 'sliding-glass', icon: 'arrowsH', visible: true, kind: 'slide', motor: false, configs: [2, 3, 4, 6],
      name: T('Sliding Glass Systems', 'Συρόμενα συστήματα γυαλιού'),
      short: T('Slim sliding doors and windows for wide views.', 'Λεπτές συρόμενες πόρτες και παράθυρα για μεγάλη θέα.'),
      overview: T(
        'Sliding and lift-and-slide systems with slim frames and large glass, running smoothly on concealed rollers. They save space and keep the view open.',
        'Συρόμενα και ανυψούμενα-συρόμενα συστήματα με λεπτά πλαίσια και μεγάλα τζάμια, που κινούνται ομαλά σε κρυφά ράουλα. Εξοικονομούν χώρο και αφήνουν τη θέα ανοιχτή.'
      ),
      image: 'img/sliding-door.jpg', gallery: ['img/lift-slide.jpg'],
      features: [
        F('maximize', 'Large glass, slim frames', 'Μεγάλα τζάμια, λεπτά πλαίσια'),
        F('arrowsH', 'Smooth lift-and-slide operation', 'Ομαλή ανυψούμενη-συρόμενη λειτουργία'),
        F('thermo', 'Thermal-break profiles', 'Προφίλ με θερμοδιακοπή'),
        F('ruler', 'Flush threshold options', 'Επιλογές με χωνευτό κατωκάσι'),
      ],
      specs: [SP('Max. panel width', 'Μέγ. πλάτος φύλλου'), SP('Max. panel height', 'Μέγ. ύψος φύλλου'), SP('Max. panel weight', 'Μέγ. βάρος φύλλου'), SP('Glass thickness', 'Πάχος γυαλιού'), SP('Frame depth', 'Βάθος πλαισίου'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Living rooms', 'Σαλόνια'), T('Balconies', 'Μπαλκόνια'), T('Villas', 'Βίλες')],
      brochure: '',
    },
    {
      slug: 'curtain-wall', icon: 'grid', visible: true, kind: 'grid', motor: false, configs: [3, 4, 5, 6],
      name: T('Curtain Wall Systems', 'Συστήματα υαλοπετασμάτων'),
      short: T('Floor-to-ceiling glass walls for modern buildings.', 'Γυάλινοι τοίχοι από το δάπεδο ως την οροφή.'),
      overview: T(
        'Curtain walls create continuous glass surfaces across one or more floors, held by a slim aluminium grid of mullions and transoms. They bring daylight deep into the building and give it a strong architectural look.',
        'Τα υαλοπετάσματα δημιουργούν συνεχείς γυάλινες επιφάνειες σε έναν ή περισσότερους ορόφους, με λεπτό κάνναβο αλουμινίου. Φέρνουν φυσικό φως βαθιά στο κτίριο και του δίνουν έντονο αρχιτεκτονικό χαρακτήρα.'
      ),
      image: 'img/house-windows.jpg', gallery: [],
      features: [
        F('building', 'Multi-storey glazing', 'Υαλοστάσια πολλών ορόφων'),
        F('grid', 'Slim mullion and transom grid', 'Λεπτός κάνναβος προφίλ'),
        F('sun', 'Daylight and solar-control glass', 'Φυσικό φως και γυαλί ηλιοπροστασίας'),
        F('layers', 'Fixed and opening vents', 'Σταθερά και ανοιγόμενα τμήματα'),
      ],
      specs: [SP('Mullion depth', 'Βάθος κατακόρυφου προφίλ'), SP('Glazing type', 'Τύπος υαλοπινάκων'), SP('Max. glass size', 'Μέγ. διάσταση γυαλιού'), SP('Opening vents', 'Ανοιγόμενα τμήματα'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Offices', 'Γραφεία'), T('Showrooms', 'Εκθέσεις'), T('Residential buildings', 'Πολυκατοικίες')],
      brochure: '',
    },
    {
      slug: 'glass-facade', icon: 'building', visible: true, kind: 'grid', motor: false, configs: [3, 4, 5, 6],
      name: T('Glass Facade Systems', 'Συστήματα γυάλινων προσόψεων'),
      short: T('Shopfronts and facades with a clean glass finish.', 'Βιτρίνες και προσόψεις με καθαρό γυάλινο φινίρισμα.'),
      overview: T(
        'Glass facade systems for shopfronts, entrances and commercial buildings, combining large glass areas with integrated doors for a clean, modern frontage.',
        'Συστήματα γυάλινων προσόψεων για βιτρίνες, εισόδους και επαγγελματικά κτίρια, που συνδυάζουν μεγάλες γυάλινες επιφάνειες με ενσωματωμένες πόρτες για καθαρή, σύγχρονη πρόσοψη.'
      ),
      image: 'img/commercial-doors.jpg', gallery: ['img/partition-door.jpg'],
      features: [
        F('building', 'Shopfronts and entrances', 'Βιτρίνες και είσοδοι'),
        F('maximize', 'Large glass areas', 'Μεγάλες γυάλινες επιφάνειες'),
        F('key', 'Integrated doors', 'Ενσωματωμένες πόρτες'),
        F('shield', 'Safety glass', 'Γυαλί ασφαλείας'),
      ],
      specs: [SP('System depth', 'Βάθος συστήματος'), SP('Glazing type', 'Τύπος υαλοπινάκων'), SP('Max. glass size', 'Μέγ. διάσταση γυαλιού'), SP('Door options', 'Επιλογές πόρτας'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Shops', 'Καταστήματα'), T('Clinics', 'Κλινικές'), T('Office lobbies', 'Είσοδοι γραφείων')],
      brochure: '',
    },
    {
      slug: 'custom-solutions', icon: 'sparkle', visible: true, kind: 'none', motor: false, configs: [],
      name: T('Custom Aluminium Solutions', 'Ειδικές κατασκευές αλουμινίου'),
      short: T('Railings, partitions and one-off designs.', 'Κάγκελα, χωρίσματα και ειδικές κατασκευές.'),
      overview: T(
        'Glass railings, office partitions, pergolas, cladding and other one-off aluminium and glass work, designed around your space and built to measure.',
        'Γυάλινα κάγκελα, χωρίσματα γραφείων, πέργκολες, επενδύσεις και άλλες ειδικές κατασκευές αλουμινίου και γυαλιού, σχεδιασμένες για τον χώρο σας και κατασκευασμένες στα μέτρα του.'
      ),
      image: 'img/glass-stairs.jpg', gallery: ['img/office-partition.jpg', 'img/partition-door.jpg'],
      features: [
        F('sparkle', 'Designed for your project', 'Σχεδιασμένο για το έργο σας'),
        F('layers', 'Glass railings and partitions', 'Γυάλινα κάγκελα και χωρίσματα'),
        F('ruler', 'Measured and made to fit', 'Μέτρηση και κατασκευή στα μέτρα'),
        F('palette', 'Any colour and finish', 'Κάθε χρώμα και φινίρισμα'),
      ],
      specs: [SP('Scope', 'Εύρος εργασιών'), SP('Materials', 'Υλικά'), SP('Finishes', 'Φινιρίσματα')],
      applications: [T('Stairs & balconies', 'Σκάλες & μπαλκόνια'), T('Offices', 'Γραφεία'), T('Outdoor spaces', 'Εξωτερικοί χώροι')],
      brochure: '',
    },
  ],
};
