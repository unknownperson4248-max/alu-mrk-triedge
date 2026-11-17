// Aluminium Systems catalogue: the MUSKITA profile systems Alu MRK TriEdge fabricates and installs.
// Model names are MUSKITA's. Descriptions are our own short wording. Technical values are copied exactly from
// the MUSKITA product pages (source links below); where a page lists several versions, values are given in the
// order of `order`, separated by " / ". This catalogue is managed in code, not in the admin panel.
const T = (en, el) => ({ en, el });
const M = 'https://muskita.com.cy/product/';

export const ALU_SYSTEMS = [
  {
    id: 'thea', art: 'thea',
    name: T('THÉA Minimal Aluminium Frames', 'THÉA Minimal Aluminium Frames'),
    intro: T('Frames that almost disappear: the slimmest sliding glass walls for homes where the view is the design.', 'Κουφώματα που σχεδόν εξαφανίζονται: τα πιο λεπτά συρόμενα υαλοστάσια για σπίτια όπου η θέα είναι ο σχεδιασμός.'),
    products: [
      {
        id: 'thea-minimal', model: 'THÉA', source: 'https://theaminimalsystems.com/',
        name: T('Minimal sliding windows & doors', 'Minimal συρόμενα παράθυρα & πόρτες'),
        desc: T('A truly minimal sliding system with very thin sightlines, so the glass, not the frame, fills the opening. It is strong and modular enough to carry very large panes, up to about one tonne each.', 'Πραγματικά minimal συρόμενο σύστημα με πολύ λεπτές γραμμές, ώστε το άνοιγμα να γεμίζει γυαλί και όχι κούφωμα. Είναι αρκετά ανθεκτικό και αρθρωτό για πολύ μεγάλους υαλοπίνακες, έως περίπου έναν τόνο ο καθένας.'),
        specs: [['maxPane', 'Up to 1,000 kg']],
      },
    ],
  },
  {
    id: 'sliding', art: 'sliding',
    name: T('Sliding Systems', 'Συρόμενα συστήματα'),
    intro: T('Sliding and lift & slide systems, from budget-friendly to large thermal glass walls.', 'Συρόμενα και ανυψούμενα-συρόμενα συστήματα, από οικονομικές λύσεις έως μεγάλα θερμομονωτικά υαλοστάσια.'),
    products: [
      {
        id: 'mu3200', model: 'MU3200 Light Duty', source: M + 'mu3200-light-duty',
        name: T('Light, affordable sliding system', 'Ελαφρύ, οικονομικό συρόμενο'),
        desc: T('A slim, lightweight sliding system without thermal break, made for small and medium windows and doors. Quick to fit, which keeps renovations and new builds on budget.', 'Λεπτό, ελαφρύ συρόμενο σύστημα χωρίς θερμοδιακοπή, για μικρά και μεσαία παράθυρα και πόρτες. Τοποθετείται γρήγορα και κρατά το κόστος χαμηλά σε ανακαινίσεις και νέες κατασκευές.'),
        specs: [['rw', '85 mm'], ['rh', '35 mm'], ['sw', '32 mm'], ['sh', '68 mm'], ['iw', '69 & 95 mm'], ['msw', '160 kg'], ['glass', 'Up to 22 mm'], ['air', 'Class 3'], ['water', 'Class 4B'], ['wind', 'Class B2']],
      },
      {
        id: 'mu3000', model: 'MU3000', source: M + 'mu3000',
        name: T('Sliding & lift & slide, insulated or not', 'Συρόμενο & ανυψούμενο, με ή χωρίς θερμομόνωση'),
        desc: T('A proven family of sliding and lift & slide systems in straight or curved lines, with or without thermal insulation. A dependable, good-value choice for most homes.', 'Δοκιμασμένη οικογένεια συρόμενων και ανυψούμενων-συρόμενων συστημάτων, σε ευθείες ή καμπύλες γραμμές, με ή χωρίς θερμομόνωση. Αξιόπιστη και συμφέρουσα επιλογή για τα περισσότερα σπίτια.'),
        versions: ['MU3000 Thermal', 'MU3000 Thermal Lift & Slide', 'MU3000 Plus Thermal', 'MU3000', 'MU3000 Plus'],
        order: 'MU3000 Thermal / Thermal L&S / Plus Thermal / MU3000 / Plus',
        specs: [['uw', '≥ 1.7 / ≥ 1.7 / ≥ 1.7 / N/A / N/A'], ['sound', 'Up to 38 dB'], ['air', 'Class 3 / 4 / 3 / 3 / 3'], ['water', 'Class 4B / 6B / 4B / 4B / 4B'], ['wind', 'Class C2 / B2 / C2 / C2 / C2'], ['rw', '100 mm'], ['msw', '200 kg'], ['glass', 'Up to 29 / 29 / 24 / 24 / 24 mm']],
      },
      {
        id: 'mu114', model: 'MU114', source: M + 'mu114',
        name: T('Thermal sliding for homes & hotels', 'Θερμομονωτικό συρόμενο για σπίτια & ξενοδοχεία'),
        desc: T('A high-performance thermal sliding and lift & slide system for modern homes and hotels. Excellent insulation and water tightness, and it combines fixed and sliding panels in large openings.', 'Θερμομονωτικό συρόμενο και ανυψούμενο-συρόμενο σύστημα υψηλών επιδόσεων για σύγχρονα σπίτια και ξενοδοχεία. Άριστη μόνωση και στεγανότητα, συνδυάζει σταθερά και συρόμενα φύλλα σε μεγάλα ανοίγματα.'),
        versions: ['MU114 Lift & Slide', 'MU114 Slide', 'MU114 Hotel Solution'],
        order: 'Lift & Slide / Slide / Hotel Solution',
        specs: [['rw', '112 / 112 / 116.2 mm'], ['rh', '50.5 mm'], ['sw', '46 mm'], ['msw', '300 / 200 / 300 kg'], ['glass', '26 - 32 mm'], ['uw', '≥ 1.1 / ≥ 1.1 / ≥ 0.96'], ['sound', 'Up to 41 dB'], ['air', 'Class 4'], ['water', 'Class E750'], ['wind', 'Class C3']],
      },
      {
        id: 'mu144', model: 'MU144', source: M + 'mu144',
        name: T('Top-tier lift & slide for very large openings', 'Κορυφαίο ανυψούμενο-συρόμενο για πολύ μεγάλα ανοίγματα'),
        desc: T('Our heaviest-duty sliding system, for very wide openings and heavy glass, with top energy and sound ratings. It can also be motorised for remote-control opening.', 'Το πιο στιβαρό συρόμενο σύστημα, για πολύ φαρδιά ανοίγματα και βαριά τζάμια, με κορυφαίες επιδόσεις ενέργειας και ήχου. Μπορεί επίσης να γίνει μηχανοκίνητο με τηλεχειριστήριο.'),
        versions: ['MU144.79 Slide', 'MU144.79 Lift & Slide', 'MU144.91 Lift & Slide'],
        order: 'MU144.79 Slide / MU144.79 L&S / MU144.91 L&S',
        specs: [['rw', '144 mm'], ['rh', '41 & 50.5 mm'], ['sw', '60 mm'], ['msw', '200 / 300 / 400 kg'], ['glass', 'Up to 43 mm'], ['uw', '≥ 1.0'], ['sound', '46 dB'], ['air', 'Class 3 / 4 / 4'], ['water', 'Class 4A / 8A / 8A'], ['wind', 'Class C3 / C5 / C5']],
      },
      {
        id: 'mu100', model: 'MU100 Thermal & Special', source: M + 'mu100-thermal-special',
        name: T('Slim sliding, thermal or standard', 'Λεπτό συρόμενο, θερμομονωτικό ή απλό'),
        desc: T('Two well-established slim sliding systems: MU100 Thermal with insulation and MU100 Special without. Simple to install and cost-effective.', 'Δύο καθιερωμένα λεπτά συρόμενα συστήματα: το MU100 Thermal με θερμομόνωση και το MU100 Special χωρίς. Απλή τοποθέτηση, χαμηλό κόστος.'),
        versions: ['MU100 Thermal', 'MU100 Special'],
        order: 'MU100 Thermal / MU100 Special',
        specs: [['rw', '96.5 & 101 / 96.5 mm'], ['rh', '39 & 46 / 25 & 35 mm'], ['msw', '200 kg'], ['glass', 'Up to 24 mm'], ['uw', '≥ 1.7 / N/A'], ['air', 'Class 3'], ['water', 'Class 5A / 4B'], ['wind', 'Class C1 / A3']],
      },
      {
        id: 'mu27', model: 'MU27 Slim', source: M + 'mu27-slim',
        name: T('Slim thermal sliding at a fair price', 'Λεπτό θερμομονωτικό συρόμενο σε λογική τιμή'),
        desc: T('A newer thermal sliding system with a clean, slender look, strong profiles and multi-point locking. Standard or concealed sashes.', 'Νεότερο θερμομονωτικό συρόμενο σύστημα με καθαρή, λεπτή εμφάνιση, ανθεκτικά προφίλ και κλείδωμα πολλαπλών σημείων. Κανονικά ή κρυφά φύλλα.'),
        specs: [['rw', '137.7 mm'], ['rh', '37 mm'], ['sw', '47.7 mm'], ['sh', '42.5 mm'], ['msw', '200 kg'], ['glass', '26 - 32 mm'], ['uw', '≥ 1.1'], ['sound', 'Up to 41 dB'], ['air', 'Class 4'], ['water', 'Class 8A'], ['wind', 'Class C3']],
      },
    ],
  },
  {
    id: 'hinged', art: 'hinged',
    name: T('Hinged Systems & Hinged Doors', 'Ανοιγόμενα συστήματα & πόρτες'),
    intro: T('Opening windows, entrance doors, pivot doors and folding glass walls.', 'Ανοιγόμενα παράθυρα, πόρτες εισόδου, περιστρεφόμενες πόρτες και πτυσσόμενα υαλοστάσια.'),
    products: [
      {
        id: 'mu2000', model: 'MU2000', source: M + 'mu2000',
        name: T('Affordable hinged windows & doors', 'Οικονομικά ανοιγόμενα παράθυρα & πόρτες'),
        desc: T('A non-insulated hinged system with straight, softly rounded lines. Easy to fit and very good value where thermal insulation is not needed.', 'Ανοιγόμενο σύστημα χωρίς θερμομόνωση, με ευθείες, ελαφρώς στρογγυλεμένες γραμμές. Εύκολη τοποθέτηση και πολύ καλή τιμή όπου δεν χρειάζεται θερμομόνωση.'),
        specs: [['fw', '47, 54 & 100 mm'], ['sw', '54 mm'], ['tvis', '67 mm'], ['msw', '130 kg'], ['glass', 'Up to 35 mm'], ['sound', '37 dB'], ['air', 'Class 4'], ['water', 'Class 8A'], ['wind', 'Class C5/ B5']],
      },
      {
        id: 'mu2075', model: 'MU2075', source: M + 'mu2075',
        name: T('Premium thermal hinged system', 'Κορυφαίο θερμομονωτικό ανοιγόμενο'),
        desc: T('MUSKITA\'s flagship hinged system for windows and doors, with excellent energy, sound and security ratings, RC3 burglar resistance and micro-ventilation. Straight or curved.', 'Το κορυφαίο ανοιγόμενο σύστημα της MUSKITA για παράθυρα και πόρτες, με άριστες επιδόσεις ενέργειας, ήχου και ασφάλειας, αντιδιαρρηκτική κατηγορία RC3 και μικροαερισμό. Ευθύγραμμο ή καμπύλο.'),
        versions: ['MU2075', 'MU2075 Curve', 'MU2075 Elite', 'MU2075 Elite Plus'],
        order: 'MU2075 / Curve / Elite / Elite Plus',
        specs: [['fw', '68 / 75 / 78 / 78 mm'], ['sw', '75 / 75 / 85 / 85 mm'], ['tvis', '74 mm'], ['msw', '170 kg'], ['glass', 'Up to 56 / 56 / 66 / 66 mm'], ['uw', '≥ 1.2 / ≥ 1.2 / ≥ 1.0 / ≥ 0.97'], ['sound', 'Up to 50 / 50 / 51 / 51 dB'], ['air', 'Class 4'], ['water', 'Class E1050'], ['wind', 'Class C5']],
      },
      {
        id: 'mu2075-pivot', model: 'MU2075 Pivot Door & Aller Retour', source: M + 'mu2075-pivot-door-aller-retour',
        name: T('Large pivot & swing entrance doors', 'Μεγάλες περιστρεφόμενες πόρτες εισόδου'),
        desc: T('Statement entrance doors that turn on an axis, with a sleek face that can be clad in glass, panels or HPL. Thermally insulated, with options for fingerprint, keypad or card locks.', 'Εντυπωσιακές πόρτες εισόδου που περιστρέφονται σε άξονα, με λεία όψη που ντύνεται με γυαλί, πάνελ ή HPL. Θερμομονωτικές, με επιλογές κλειδαριάς δακτυλικού αποτυπώματος, πληκτρολογίου ή κάρτας.'),
        specs: [['fw', '75 mm'], ['sw', '75 mm'], ['pivot', 'Variable / Minimum 250 mm'], ['mcw', '1.25 m'], ['mdw', '300 kg'], ['glass', 'Up to 43 mm'], ['uw', '≥ 1.2'], ['sound', 'Up to 51 dB']],
      },
      {
        id: 'mu2020', model: 'MU2020 Concealed Sash', source: M + 'mu2020-concealed-sash',
        name: T('Slim hinged windows, hidden sash', 'Λεπτά ανοιγόμενα με κρυφό φύλλο'),
        desc: T('A thermal hinged system whose sash hides inside the frame, so you see less aluminium and more light. Strong energy and sound performance.', 'Θερμομονωτικό ανοιγόμενο σύστημα με φύλλο κρυμμένο μέσα στην κάσα, για λιγότερο ορατό αλουμίνιο και περισσότερο φως. Υψηλή ενεργειακή και ηχητική απόδοση.'),
        specs: [['fw', '76 mm'], ['fh', '56 mm'], ['sw', '74 mm'], ['sh', '49 mm'], ['tvis', '56 mm'], ['msw', '170 kg'], ['glass', 'Up to 32 mm'], ['uw', '≥ 0.97'], ['sound', 'Up to 50 dB'], ['air', 'Class 4'], ['water', 'Class E1050'], ['wind', 'Class C5']],
      },
      {
        id: 'mu2500', model: 'MU2500', source: M + 'mu2500',
        name: T('Value hinged system, straight or curved', 'Οικονομικό ανοιγόμενο, ευθύ ή καμπύλο'),
        desc: T('A non-insulated hinged system with modern straight or curved lines and good weather ratings. A sensible choice for renovations.', 'Ανοιγόμενο σύστημα χωρίς θερμομόνωση, με σύγχρονες ευθείες ή καμπύλες γραμμές και καλές επιδόσεις στα καιρικά. Λογική επιλογή για ανακαινίσεις.'),
        specs: [['fw', '60 & 100 mm'], ['sw', '60 mm'], ['tvis', '67 mm'], ['msw', '130 kg'], ['glass', 'Up to 35 mm'], ['air', 'Class 4'], ['water', 'Class E1050'], ['wind', 'Class C5']],
      },
      {
        id: 'mu2600', model: 'MU2600', source: M + 'mu2600',
        name: T('Folding glass walls', 'Πτυσσόμενα υαλοστάσια'),
        desc: T('A top-hung folding system that opens a whole wall and joins inside with outside. With or without insulation, straight or curved.', 'Πτυσσόμενο σύστημα κρεμαστής ανάρτησης που ανοίγει ολόκληρο τοίχο και ενώνει μέσα με έξω. Με ή χωρίς θερμομόνωση, ευθύ ή καμπύλο.'),
        versions: ['MU2600 Thermal', 'MU2600 Slim Thermal', 'MU2600'],
        order: 'MU2600 Thermal / Slim Thermal / MU2600',
        specs: [['rw', '60 mm'], ['rh', '40, 65 & 90 / 40, 65 & 90 / 31 & 78 mm'], ['sw', '60 mm'], ['sh', '64 / 43.5 / 64 mm'], ['msw', '100 kg'], ['glass', 'Up to 44 mm'], ['uw', '≥ 1.4 / ≥ 1.4 / N/A'], ['sound', 'Up to 37 dB'], ['air', 'Class 2'], ['water', 'Class 8A'], ['wind', 'Class C3']],
      },
      {
        id: 'mu2600-hd', model: 'MU2600 Heavy Duty', source: M + 'mu2600-heavy-duty',
        name: T('Heavy-duty folding for big openings', 'Στιβαρό πτυσσόμενο για μεγάλα ανοίγματα'),
        desc: T('Narrow but very strong folding profiles for openings that are tall and wide, with heavier glass and better insulation.', 'Στενά αλλά πολύ ανθεκτικά πτυσσόμενα προφίλ για ψηλά και φαρδιά ανοίγματα, με βαρύτερα τζάμια και καλύτερη μόνωση.'),
        specs: [['rw', '75, 82, 89 & 120 mm'], ['rh', '13, 39.5, 50, 55.3 & 62 mm'], ['sw', '75 mm'], ['sh', '48 mm'], ['msw', '200 kg'], ['glass', '26 - 62 mm'], ['uw', '≥ 1.2'], ['sound', 'Up to 49 dB'], ['air', 'Class 4'], ['water', 'Class 9A'], ['wind', 'Class C2']],
      },
      {
        id: 'mu2600-slim', model: 'MU2600 Slim Doors', source: M + 'mu2600-slim-doors',
        name: T('Slim pivot, swing & hinged doors', 'Λεπτές περιστρεφόμενες & ανοιγόμενες πόρτες'),
        desc: T('Slim, elegant doors for interiors and medium-size entrances, as pivot, aller-retour (double swing) or hinged doors.', 'Λεπτές, κομψές πόρτες για εσωτερικούς χώρους και μεσαίες εισόδους, ως περιστρεφόμενες, aller-retour (διπλής φοράς) ή ανοιγόμενες.'),
        specs: [['rw', '60 mm'], ['sw', '60 mm'], ['msw', '260 kg'], ['glass', 'Up to 32 mm'], ['uw', '≥ 1.4'], ['sound', 'Up to 37 dB']],
      },
      {
        id: 'mu2700', model: 'MU2700 Designer Doors®', source: M + 'mu2700-designer-doorsr',
        name: T('Insulated high-security entrance doors', 'Θερμομονωτικές πόρτες εισόδου υψηλής ασφάλειας'),
        desc: T('Solid, insulated entrance doors built to your design. Patented interlocking profiles make the door exceptionally strong.', 'Συμπαγείς, θερμομονωτικές πόρτες εισόδου κατασκευασμένες στο δικό σας σχέδιο. Τα πατενταρισμένα αλληλοσυνδεόμενα προφίλ κάνουν την πόρτα εξαιρετικά ανθεκτική.'),
        specs: [['fw', '68 mm'], ['fh', '57.5 mm'], ['sw', '75 mm'], ['sh', '150 mm'], ['pw', '38 mm'], ['ph', '30, 90, 120 & 150 mm'], ['uw', '≥ 1.4'], ['air', 'Class 2'], ['water', 'Class 3A'], ['wind', 'Class A3']],
      },
      {
        id: 'structural-doors', model: 'Structural Doors', source: M + 'structural-doors',
        name: T('All-glass insulated doors', 'Θερμομονωτικές ολόγυάλινες πόρτες'),
        desc: T('Thermal glass doors from the MU2075 family that blend into a glass façade or an all-glass interior partition.', 'Θερμομονωτικές γυάλινες πόρτες της οικογένειας MU2075 που δένουν με γυάλινη πρόσοψη ή ολόγυάλινο εσωτερικό χώρισμα.'),
        specs: [['uw', '≥ 1.2']],
      },
    ],
  },
  {
    id: 'curtain', art: 'curtain',
    name: T('Curtain Walls', 'Υαλοπετάσματα'),
    intro: T('Glass façades for shops, offices and high-rise buildings.', 'Γυάλινες προσόψεις για καταστήματα, γραφεία και πολυώροφα κτίρια.'),
    products: [
      {
        id: 'mu800', model: 'MU800', source: M + 'mu800',
        name: T('Thermal curtain wall', 'Θερμομονωτικό υαλοπέτασμα'),
        desc: T('MUSKITA\'s best-known thermal curtain wall, used on projects worldwide. Flexible enough for homes, shops and tall commercial buildings, and quick to install.', 'Το πιο γνωστό θερμομονωτικό υαλοπέτασμα της MUSKITA, σε έργα σε όλο τον κόσμο. Ευέλικτο για σπίτια, καταστήματα και ψηλά εμπορικά κτίρια, με γρήγορη τοποθέτηση.'),
        specs: [['mtw', '35 or 55 mm'], ['mtd', 'From 39.6 – 250.4 mm; customised sizes also available'], ['msw', '120 kg'], ['glass', 'Up to 46 mm'], ['uw', '≥ 1.1'], ['sound', '47 dB'], ['air', '600 Pa'], ['water', '600 Pa'], ['wind', '2400 Pa service load; 3600 Pa safety load'], ['impact', 'Pass']],
      },
      {
        id: 'mu800-sg', model: 'MU800 Structural Glazing', source: M + 'mu800-structural-glazing',
        name: T('All-glass façade for high-rise', 'Ολόγυάλινη πρόσοψη για πολυώροφα'),
        desc: T('The structural-glazing version of MU800: from outside you see only glass. Built for demanding high-rise façades, with very low heat loss.', 'Η έκδοση δομικής υάλωσης του MU800: από έξω φαίνεται μόνο γυαλί. Για απαιτητικές προσόψεις πολυώροφων, με πολύ χαμηλές θερμικές απώλειες.'),
        specs: [['mtw', '55 mm'], ['mtd', '116.5 - 220.5 mm'], ['msw', '120 kg'], ['glass', 'Up to 54 mm'], ['uw', '≥ 0.79'], ['sound', '47 dB'], ['air', '600 Pa'], ['water', '600 Pa'], ['wind', '2400 Pa service load; 3600 Pa safety load'], ['impact', 'Pass']],
      },
      {
        id: 'mu4200-semi', model: 'MU4200 Semi Structural', source: M + 'mu4200-semi-structural',
        name: T('Curtain wall with thin visible frames', 'Υαλοπέτασμα με λεπτά ορατά πλαίσια'),
        desc: T('A thermal curtain wall where a thin aluminium line frames each pane, with concealed hinges and top-hung opening windows anywhere on the façade.', 'Θερμομονωτικό υαλοπέτασμα όπου μια λεπτή γραμμή αλουμινίου πλαισιώνει κάθε τζάμι, με κρυφούς μεντεσέδες και προβαλλόμενα παράθυρα σε οποιοδήποτε σημείο της πρόσοψης.'),
        specs: [['mullw', '55 & 70 mm'], ['mulld', 'From 54.5 - 150 mm'], ['msw', '120 kg'], ['glass', 'Up to 33 mm'], ['uw', '≥ 1.5'], ['sound', '44 dB'], ['air', '600 Pa'], ['water', '600 Pa'], ['wind', '2400 Pa service load; 3600 Pa safety load']],
      },
      {
        id: 'mu4200-struct', model: 'MU4200 Structural & Step Structural', source: M + 'mu4200-structural-step-structural',
        name: T('Frameless-look glass façade', 'Πρόσοψη μόνο από γυαλί'),
        desc: T('Glass is bonded to the frame with structural silicone, so the outside shows glass only. With or without thermal insulation.', 'Το γυαλί κολλιέται στο πλαίσιο με δομική σιλικόνη, έτσι εξωτερικά φαίνεται μόνο γυαλί. Με ή χωρίς θερμομόνωση.'),
        specs: [['mullw', '55 & 70 mm'], ['mulld', 'From 54.5 - 150 mm'], ['msw', '120 kg'], ['glass', 'Up to 33 mm'], ['uw', '≥ 1.5'], ['sound', '41 dB'], ['air', '600 Pa'], ['water', '600 Pa'], ['wind', '2400 Pa service load; 3600 Pa safety load']],
      },
    ],
  },
  {
    id: 'fences', art: 'fence',
    name: T('Fences', 'Περιφράξεις'),
    intro: T('Aluminium fences and gates that never need painting: horizontal, vertical, louvred or laser-cut.', 'Αλουμινένιες περιφράξεις και καγκελόπορτες που δεν θέλουν βάψιμο: οριζόντιες, κάθετες, με περσίδες ή κομμένες με λέιζερ.'),
    products: [
      {
        id: 'alufence', model: 'AluFence®', source: M + 'alufencer',
        name: T('Clip-together fence, fast to fit', 'Φράχτης που κουμπώνει, γρήγορη τοποθέτηση'),
        desc: T('A stylish fence with 120 mm planks and clip-in posts that come ready with brackets or ground screws, so it fixes to a wall or straight into the lawn without foundations. Good for pools, gardens and privacy.', 'Κομψός φράχτης με σανίδες 120 mm και ορθοστάτες που κουμπώνουν, έτοιμους με βάσεις ή βίδες εδάφους, ώστε να στερεώνεται σε τοίχο ή κατευθείαν στο γρασίδι χωρίς θεμέλια. Ιδανικός για πισίνες, κήπους και ιδιωτικότητα.'),
        specs: [['plank', '120 mm']],
      },
      {
        id: 'mu1080', model: 'MU1080', source: M + 'mu1080',
        name: T('Horizontal slat fence', 'Φράχτης με οριζόντιες περσίδες'),
        desc: T('Horizontal aluminium slats set between strong posts for a continuous, modern line. The posts can stand far apart, so it suits long runs. Any colour.', 'Οριζόντιες αλουμινένιες περσίδες ανάμεσα σε γερούς ορθοστάτες για συνεχή, μοντέρνα γραμμή. Οι ορθοστάτες μπαίνουν σε μεγάλη απόσταση, άρα ταιριάζει σε μεγάλα μήκη. Σε οποιοδήποτε χρώμα.'),
        specs: [],
      },
      {
        id: 'mu1100', model: 'MU1100', source: M + 'mu1100',
        name: T('Vertical box-section fence', 'Φράχτης με κάθετα κουτιά'),
        desc: T('Vertical hollow aluminium sections, 50 x 100 mm, screwed onto a dedicated aluminium base. Robust, quick to install, any colour.', 'Κάθετα κοίλα αλουμινένια προφίλ 50 x 100 mm, βιδωμένα σε ειδική αλουμινένια βάση. Ανθεκτικός, γρήγορος στην τοποθέτηση, σε οποιοδήποτε χρώμα.'),
        specs: [['section', '50 x 100 mm']],
      },
      {
        id: 'mu936', model: 'MU936', source: M + 'mu936',
        name: T('Straight-line plank fence', 'Φράχτης με ευθείες σανίδες'),
        desc: T('Horizontal 120 mm planks fixed to central posts, in a straight, clean design that suits traditional and modern homes.', 'Οριζόντιες σανίδες 120 mm σε κεντρικούς ορθοστάτες, με ευθύ, καθαρό σχέδιο που ταιριάζει σε παραδοσιακά και μοντέρνα σπίτια.'),
        specs: [['plank', '120 mm']],
      },
      {
        id: 'mu941', model: 'MU941', source: M + 'mu941',
        name: T('Curved plank fence', 'Φράχτης με καμπύλες σανίδες'),
        desc: T('The same simple post-and-plank build with softer, curved 150 mm planks.', 'Η ίδια απλή κατασκευή με ορθοστάτες και σανίδες, με πιο μαλακές καμπύλες σανίδες 150 mm.'),
        specs: [['plank', '150 mm']],
      },
      {
        id: 'fence-louvre', model: 'Fences with Standard & Louvre Profiles', source: M + 'fences-standard-louvre-profiles',
        name: T('Louvred & standard-profile fences', 'Περιφράξεις με περσίδες & απλά προφίλ'),
        desc: T('Fences built from standard and louvre profiles, letting air through while keeping privacy.', 'Περιφράξεις από απλά προφίλ και περσίδες, που αφήνουν τον αέρα να περνά και κρατούν την ιδιωτικότητα.'),
        specs: [],
      },
      {
        id: 'fence-perforated', model: 'Fences with Perforated Panels', source: M + 'fences-perforated-panels',
        name: T('Laser-cut pattern panels', 'Πάνελ με σχέδια κομμένα με λέιζερ'),
        desc: T('Aluminium panels precision-cut into your own pattern, for a fence or gate that is one of a kind.', 'Αλουμινένια πάνελ κομμένα με ακρίβεια στο δικό σας σχέδιο, για φράχτη ή καγκελόπορτα μοναδική.'),
        specs: [],
      },
    ],
  },
  {
    id: 'shading', art: 'shading',
    name: T('Shading Solutions', 'Λύσεις σκίασης'),
    intro: T('Shutters, louvres and sliding screens that control sun, air and privacy.', 'Παντζούρια, περσίδες και συρόμενα πετάσματα που ελέγχουν ήλιο, αέρα και ιδιωτικότητα.'),
    products: [
      {
        id: 'mu35', model: 'MU35', source: M + 'mu35',
        name: T('Affordable openable shutters', 'Οικονομικά ανοιγόμενα παντζούρια'),
        desc: T('Openable shutters for shade, light control, airflow and extra security. They can be added to any of our door and window systems.', 'Ανοιγόμενα παντζούρια για σκιά, έλεγχο φωτός, αερισμό και επιπλέον ασφάλεια. Προστίθενται σε οποιοδήποτε σύστημα πόρτας ή παραθύρου.'),
        specs: [],
      },
      {
        id: 'mu435', model: 'MU435', source: M + 'mu435',
        name: T('Openable shutters, MUSKITA & KIKAU', 'Ανοιγόμενα παντζούρια MUSKITA & KIKAU'),
        desc: T('Shutters developed with KIKAU of Italy: many design options, clean looks and easy assembly.', 'Παντζούρια σε συνεργασία με την ιταλική KIKAU: πολλές επιλογές σχεδίου, καθαρή εμφάνιση και εύκολη συναρμολόγηση.'),
        specs: [],
      },
      {
        id: 'mu450', model: 'MU450 & MU450 Secure', source: M + 'mu450-mu450-secure',
        name: T('High-security openable shutters', 'Ανοιγόμενα παντζούρια υψηλής ασφάλειας'),
        desc: T('Openable shutters made with KIKAU of Italy, with a Secure version for homes that need stronger protection.', 'Ανοιγόμενα παντζούρια σε συνεργασία με την ιταλική KIKAU, με έκδοση Secure για σπίτια που θέλουν μεγαλύτερη προστασία.'),
        versions: ['MU450', 'MU450 Secure'],
        specs: [],
      },
      {
        id: 'mu605', model: 'MU605 Rolling Shutters', source: M + 'mu605-rolling-shutters',
        name: T('Aluminium rolling shutters', 'Αλουμινένια ρολά'),
        desc: T('All-aluminium rolling shutters for windows, doors and shopfronts, with full blackout. Light, durable and rust-free, in powder-coated or anodised finishes.', 'Ρολά εξ ολοκλήρου από αλουμίνιο για παράθυρα, πόρτες και βιτρίνες, με πλήρη συσκότιση. Ελαφριά, ανθεκτικά και ανοξείδωτα, σε ηλεκτροστατική βαφή ή ανοδίωση.'),
        specs: [['profw', '35 mm']],
      },
      {
        id: 'mu900', model: 'MU900', source: M + 'mu900',
        name: T('Fixed shading louvres', 'Σταθερές περσίδες σκίασης'),
        desc: T('A wide range of fixed blades for vertical or horizontal shading on façades, terraces and pergolas.', 'Μεγάλη γκάμα σταθερών περσίδων για κάθετη ή οριζόντια σκίαση σε προσόψεις, βεράντες και πέργκολες.'),
        specs: [['bw', '100, 115, 120, 150, 200, 208, 250 mm']],
      },
      {
        id: 'mu900-eclipse', model: 'MU900 Eclipse', source: M + 'mu900-eclipse',
        name: T('Sliding shading panels', 'Συρόμενα πετάσματα σκίασης'),
        desc: T('Slim sliding frames that hold perforated aluminium, HPL, glass, composite or louvre panels, for shade, privacy and less glare. The narrow track fits next to existing windows.', 'Λεπτά συρόμενα πλαίσια με διάτρητο αλουμίνιο, HPL, γυαλί, σύνθετα πάνελ ή περσίδες, για σκιά, ιδιωτικότητα και λιγότερη αντηλιά. Ο στενός οδηγός χωρά δίπλα σε υπάρχοντα παράθυρα.'),
        specs: [['rw', '48.3, 85 & 128 mm'], ['rh', '25 & 35 mm'], ['sw', '32 mm'], ['sh', '68 mm'], ['msw', '160 kg'], ['cwo', 'Up to 22 mm']],
      },
      {
        id: 'mu900-bifold', model: 'MU900 Eclipse Bi-Fold', source: M + 'mu900-eclipse-bi-fold',
        name: T('Folding shading panels, manual or motorised', 'Πτυσσόμενα πετάσματα σκίασης, χειροκίνητα ή μηχανοκίνητα'),
        desc: T('The folding version of Eclipse: panels fold away to open the view, by hand or with a motor.', 'Η πτυσσόμενη έκδοση του Eclipse: τα πάνελ διπλώνουν για να ανοίξει η θέα, με το χέρι ή με μοτέρ.'),
        specs: [['rw', '60 mm'], ['rh', '28 mm'], ['sw', '60 mm'], ['sh', '32 mm'], ['msw', '100 kg']],
      },
      {
        id: 'mu950', model: 'MU950', source: M + 'mu950',
        name: T('Movable louvres', 'Κινητές περσίδες'),
        desc: T('Adjustable louvres for simple, flexible outdoor shade, horizontal or vertical. Optional waterproof motors with remote control for areas up to 16 m².', 'Ρυθμιζόμενες περσίδες για απλή, ευέλικτη εξωτερική σκίαση, οριζόντια ή κάθετα. Προαιρετικά αδιάβροχα μοτέρ με τηλεχειριστήριο για επιφάνειες έως 16 m².'),
        specs: [['bw', '240 mm'], ['bl', 'Up to 3 m'], ['rw', '64 mm'], ['rh', '46 mm'], ['pitch', '225 mm'], ['slope', 'from 0-90°']],
      },
      {
        id: 'mu950-sunsmart', model: 'MU950 SunSmart', source: M + 'mu950-sunsmart',
        name: T('Smart motorised louvres', 'Έξυπνες μηχανοκίνητες περσίδες'),
        desc: T('Vertical louvres with hidden waterproof motors that turn from 0 to 90° for exact light and air control, and can also be set by hand. Tell us your orientation and we suggest the best angle.', 'Κάθετες περσίδες με κρυφά αδιάβροχα μοτέρ που γυρίζουν από 0 έως 90° για ακριβή έλεγχο φωτός και αέρα, και ρυθμίζονται και με το χέρι. Πείτε μας τον προσανατολισμό και σας προτείνουμε την καλύτερη γωνία.'),
        specs: [['bw', 'Multiple options from 120 mm to 400 mm'], ['bl', 'Depending on louvre up to 4 m'], ['rw', '150 mm'], ['rh', '85 mm'], ['slope', 'from 0-90° for black out, 45-135° for shading']],
      },
    ],
  },
  {
    id: 'pergolas', art: 'pergola',
    name: T('Pergolas', 'Πέργκολες'),
    intro: T('Aluminium pergolas for shade and outdoor living, with rotating or fixed louvres.', 'Αλουμινένιες πέργκολες για σκιά και ζωή έξω, με περιστρεφόμενες ή σταθερές περσίδες.'),
    products: [
      {
        id: 'mu9000-oasis', model: 'MU9000 Oasis Pergola', source: M + 'mu9000-oasis-pergola',
        name: T('Bioclimatic pergola, motorised louvres', 'Βιοκλιματική πέργκολα με μηχανοκίνητες περσίδες'),
        desc: T('A bioclimatic pergola with watertight louvres that rotate by motor, built-in ambient lighting and smart-home control. All aluminium, with hidden fixings.', 'Βιοκλιματική πέργκολα με στεγανές περσίδες που περιστρέφονται με μοτέρ, ενσωματωμένο φωτισμό ατμόσφαιρας και έλεγχο έξυπνου σπιτιού. Εξ ολοκλήρου αλουμίνιο, με κρυφές στερεώσεις.'),
        specs: [['pwmax', '4.50 m'], ['plen', '4.50 m'], ['plens', '6.00 m'], ['ph3', '3.00 m'], ['drain', '186 x 109 mm'], ['drainv', '6.07 L/m'], ['louvre', '224 x 50 mm'], ['angle', '0 - 135 degrees']],
      },
      {
        id: 'mu9000-zen', model: 'MU9000 Zen Pergola', source: M + 'mu9000-zen-pergola',
        name: T('Fixed-louvre pergola', 'Πέργκολα με σταθερές περσίδες'),
        desc: T('A pergola with fixed louvres in different styles, free-standing or attached to the house.', 'Πέργκολα με σταθερές περσίδες σε διάφορα στυλ, αυτοστήρικτη ή δίπλα στο σπίτι.'),
        specs: [['pwmax', '3.00 m'], ['plen', '3.00 m'], ['plens', '6.00 m'], ['ph3', '3.00 m']],
      },
    ],
  },
  {
    id: 'balustrades', art: 'balustrade',
    name: T('Balustrades & Glass Railings', 'Κάγκελα & γυάλινα κιγκλιδώματα'),
    intro: T('Glass railings for balconies, stairs and terraces, with or without a handrail.', 'Γυάλινα κάγκελα για μπαλκόνια, σκάλες και βεράντες, με ή χωρίς κουπαστή.'),
    products: [
      {
        id: 'mu500', model: 'MU500 Glass Railings', source: M + 'mu500-glass-railings',
        name: T('Glass railings, floor, side or embedded', 'Γυάλινα κάγκελα, δαπέδου, πλευρικά ή χωνευτά'),
        desc: T('Strong glass railings mounted on the floor, on the side, or embedded for a clean, uninterrupted view. Many handrails, or none at all.', 'Ανθεκτικά γυάλινα κάγκελα, πάνω στο δάπεδο, στο πλάι ή χωνευτά για καθαρή θέα. Πολλές επιλογές κουπαστής, ή και χωρίς.'),
        specs: [['glass', '10, 12, 16.76, 17.52, 20.76, 21.52 & 25.52 mm']],
      },
      {
        id: 'horizon', model: 'Horizon Balustrades', source: M + 'horizon-balustrades',
        name: T('Wedge-fixed glass balustrade', 'Γυάλινο κάγκελο με σφήνα'),
        desc: T('A newer glass railing that clamps the glass with an adjustable mechanical wedge, so it goes in faster and a broken pane is easy to replace.', 'Νεότερο γυάλινο κάγκελο που σφίγγει το τζάμι με ρυθμιζόμενη μηχανική σφήνα, ώστε μπαίνει πιο γρήγορα και ένα σπασμένο τζάμι αλλάζει εύκολα.'),
        specs: [['glass', '20.76, 21.52 & 25.52 mm'], ['load', 'Tested as per BS 6180:2011; results contingent on glass type and thickness']],
      },
    ],
  },
  {
    id: 'partitions', art: 'partition',
    name: T('Partitions', 'Χωρίσματα'),
    intro: T('Glass partitions for offices and interiors.', 'Γυάλινα χωρίσματα για γραφεία και εσωτερικούς χώρους.'),
    products: [
      {
        id: 'mu3900', model: 'MU3900 Office', source: M + 'mu3900-office-0',
        name: T('Office & interior partitions', 'Χωρίσματα γραφείων & εσωτερικών'),
        desc: T('Minimal partitions with thin aluminium caps, in glass, wood or plasterboard, with optional blinds between the glass. Good sound insulation and quick to install, even in working offices.', 'Minimal χωρίσματα με λεπτά καπάκια αλουμινίου, με γυαλί, ξύλο ή γυψοσανίδα και προαιρετικά περσίδες ανάμεσα στα τζάμια. Καλή ηχομόνωση και γρήγορη τοποθέτηση, ακόμη και σε γραφεία σε λειτουργία.'),
        specs: [['thick', '82 mm'], ['glazing', 'Double'], ['sound', '45 dB']],
      },
    ],
  },
  {
    id: 'insect', art: 'insect',
    name: T('Insect Screen Solutions', 'Σήτες'),
    intro: T('Slim insect screens, even for very large windows and patio doors.', 'Λεπτές σήτες, ακόμη και για πολύ μεγάλα παράθυρα και μπαλκονόπορτες.'),
    products: [
      {
        id: 'mu6100', model: 'MU6100 Insecta', source: M + 'mu6100-insecta',
        name: T('Minimal insect screens up to 3 m high', 'Minimal σήτες έως 3 m ύψος'),
        desc: T('Slim screens for openings up to 3 m high. Mesh options keep out even tiny gnats and sandflies, resist pets, or add shade, and they also fit standard window systems.', 'Λεπτές σήτες για ανοίγματα έως 3 m ύψος. Επιλογές πλέγματος που κρατούν έξω ακόμη και μικροσκοπικά κουνούπια, αντέχουν κατοικίδια ή δίνουν σκιά, και ταιριάζουν και σε κοινά συστήματα παραθύρων.'),
        specs: [['trw', '40 mm'], ['trh', '18 mm'], ['srw', '52.8 mm'], ['srh', '16 mm'], ['sw', '40 mm'], ['tvs', '50.4 mm'], ['svs', '35 mm']],
      },
    ],
  },
{
    id: 'cladding', art: 'fence',
    name: T('Cladding', 'Επενδύσεις'),
    intro: T('Aluminium cladding for walls, ceilings and façades.', 'Επενδύσεις αλουμινίου για τοίχους, οροφές και προσόψεις.'),
    products: [
      { id: 'mu3880', model: 'MU3880 Stripe Cladding', source: M + 'mu3880-stripe-cladding', name: T('Linear stripe cladding', 'Γραμμική επένδυση'), desc: T('Overlapping profiles that cover plaster, concrete, brick or insulation with clean straight lines, inside or outside. Decorative and protects against damp and wear.', 'Αλληλοκαλυπτόμενα προφίλ που καλύπτουν σοβά, μπετόν, τούβλο ή μόνωση με καθαρές ευθείες γραμμές, μέσα ή έξω. Διακοσμητική και προστατεύει από υγρασία και φθορά.'), specs: [] },
      { id: 'mu4100', model: 'MU4100 Rainscreen R4 Cladding', source: M + 'mu4100-rainscreen-r4-cladding', name: T('Ventilated rainscreen substructure', 'Υποδομή αεριζόμενης πρόσοψης'), desc: T('An aluminium substructure for a ventilated double-skin façade: an air gap behind the panels keeps the building drier and better insulated.', 'Υποδομή αλουμινίου για αεριζόμενη πρόσοψη διπλού κελύφους: το διάκενο αέρα πίσω από τα πάνελ κρατά το κτίριο πιο στεγνό και καλύτερα μονωμένο.'), specs: [] },
      { id: 'mu673', model: 'MU673 Cladding', source: M + 'mu673-cladding', name: T('Flexible wall & ceiling cladding', 'Ευέλικτη επένδυση τοίχου & οροφής'), desc: T('Quick-fit overlapping profiles for walls, entrance doors or bathroom ceilings, painted or anodised in any colour, with no maintenance.', 'Αλληλοκαλυπτόμενα προφίλ γρήγορης τοποθέτησης για τοίχους, εξώπορτες ή οροφές μπάνιου, βαμμένα ή ανοδιωμένα σε οποιοδήποτε χρώμα, χωρίς συντήρηση.'), specs: [] },
    ],
  },
  {
    id: 'drainage', art: 'insect',
    name: T('Drainage', 'Αποχέτευση ομβρίων'),
    intro: T('Slot drains for patios, pools, parks and pavements.', 'Γραμμικά κανάλια για αυλές, πισίνες, πάρκα και πεζοδρόμια.'),
    products: [
      { id: 'slotdrain', model: 'SlotDrain', source: M + 'mu-drainage-solutions', name: T('Discreet aluminium slot drain', 'Διακριτικό κανάλι απορροής'), desc: T('An extruded aluminium channel with a thin linear slot that carries away surface water fast, from home terraces to public spaces.', 'Κανάλι από αλουμίνιο με λεπτή γραμμική σχισμή που απομακρύνει γρήγορα τα νερά, από βεράντες σπιτιών μέχρι δημόσιους χώρους.'), specs: [['height', '95 & 110 mm'], ['access', '200 mm']] },
    ],
  },
  {
    id: 'solar', art: 'shading',
    name: T('Solar Panel Mounting', 'Βάσεις φωτοβολταϊκών'),
    intro: T('Aluminium frames for solar panels on flat, tiled and metal roofs.', 'Αλουμινένιες βάσεις για φωτοβολταϊκά σε ταράτσες, κεραμοσκεπές και μεταλλικές στέγες.'),
    products: [
      { id: 'mu7300', model: 'MU7300-1 & MU7300-2', source: M + 'mu7300-1-mu7300-2', name: T('Flat-roof frames, single or double', 'Βάσεις ταράτσας, μονές ή διπλές'), desc: T('Frames for flat concrete roofs that hold panels portrait or landscape at the angle you need.', 'Βάσεις για τσιμεντένιες ταράτσες που κρατούν τα πάνελ κάθετα ή οριζόντια στη γωνία που θέλετε.'), versions: ['MU7300-1', 'MU7300-2'], specs: [['app', 'Roofs'], ['orient', 'Portrait and Landscape'], ['weight', '15 kg'], ['angle2', '15 - 30°'], ['found', 'On concrete'], ['gap', '10 - 15 cm']] },
      { id: 'mu7320', model: 'MU7320', source: M + 'mu7320', name: T('Mounting for tiled roofs', 'Βάσεις για κεραμοσκεπές'), desc: T('Rails fixed to the existing roof frame, without harming the roof insulation. Suits every type of roof tile.', 'Ράγες στερεωμένες στον υπάρχοντα σκελετό, χωρίς να πειράζεται η μόνωση. Για κάθε τύπο κεραμιδιού.'), specs: [['app', 'Roof tiles'], ['orient', 'Portrait and Landscape'], ['angle2', 'Adjusted as per roof'], ['found', 'Wood or Metal']] },
      { id: 'mu7330', model: 'MU7330', source: M + 'mu7330', name: T('Mounting for metal roofs', 'Βάσεις για μεταλλικές στέγες'), desc: T('The same rail system for zinc and industrial roofs, fixed with stainless steel brackets.', 'Το ίδιο σύστημα ραγών για τσίγκινες και βιομηχανικές στέγες, με ανοξείδωτα στηρίγματα.'), specs: [['app', 'Zinc roofs'], ['orient', 'Portrait and Landscape'], ['angle2', 'Adjusted as per roof'], ['found', 'Zinc']] },
    ],
  },
  {
    id: 'pallets', art: 'fence',
    name: T('Aluminium Pallets', 'Παλέτες αλουμινίου'),
    intro: T('Welded aluminium pallets that never rot or rust, TÜV certified.', 'Συγκολλημένες παλέτες αλουμινίου που δεν σαπίζουν ούτε σκουριάζουν, με πιστοποίηση TÜV.'),
    products: [
      { id: 'mp102', model: 'MP102', source: M + 'mp102', name: T('1200 x 800 mm, 1000 kg', '1200 x 800 mm, 1000 kg'), desc: T('Robot-welded alloy 6005 pallet, watertight with rounded edges, for storage and hygienic warehouses.', 'Παλέτα από κράμα 6005 με ρομποτική συγκόλληση, στεγανή με στρογγυλεμένες άκρες, για αποθήκευση και καθαρούς χώρους.'), specs: [['dims', '1200x800x150 mm'], ['loadb', '1000 kg'], ['weight', '13 kg'], ['plank', '80 mm']] },
      { id: 'mp109', model: 'MP109', source: M + 'mp109', name: T('1200 x 800 mm, 1500 kg', '1200 x 800 mm, 1500 kg'), desc: T('A stronger 1200 x 800 pallet with wider planks.', 'Ανθεκτικότερη παλέτα 1200 x 800 με φαρδύτερες σανίδες.'), specs: [['dims', '1200x800x150 mm'], ['loadb', '1500 kg'], ['weight', '15 kg'], ['plank', '120 mm']] },
      { id: 'mp222', model: 'MP222', source: M + 'mp222', name: T('1200 x 800 mm, 1000 kg', '1200 x 800 mm, 1000 kg'), desc: T('A 1200 x 800 pallet with 120 mm planks.', 'Παλέτα 1200 x 800 με σανίδες 120 mm.'), specs: [['dims', '1200x800x150 mm'], ['loadb', '1000 kg'], ['weight', '15 kg'], ['plank', '120 mm']] },
      { id: 'mp224', model: 'MP224', source: M + 'mp224', name: T('1200 x 800 mm, 1500 kg', '1200 x 800 mm, 1500 kg'), desc: T('A heavy-load 1200 x 800 pallet.', 'Παλέτα 1200 x 800 για βαριά φορτία.'), specs: [['dims', '1200x800x150 mm'], ['loadb', '1500 kg'], ['weight', '15 kg'], ['plank', '120 mm']] },
      { id: 'mp503', model: 'MP503', source: M + 'mp503', name: T('1200 x 1000 mm, 1500 kg', '1200 x 1000 mm, 1500 kg'), desc: T('A larger 1200 x 1000 pallet for heavy loads.', 'Μεγαλύτερη παλέτα 1200 x 1000 για βαριά φορτία.'), specs: [['dims', '1200 x 1000 x 150 mm'], ['loadb', '1500 kg'], ['weight', '15 kg'], ['plank', '120 mm']] },
      { id: 'mp601', model: 'MP601', source: M + 'mp601', name: T('1200 x 1000 mm, 1200 kg', '1200 x 1000 mm, 1200 kg'), desc: T('A 1200 x 1000 pallet for medium loads.', 'Παλέτα 1200 x 1000 για μεσαία φορτία.'), specs: [['dims', '1200 x 1000 x 150 mm'], ['loadb', '1200 kg'], ['weight', '15 kg'], ['plank', '120 mm']] },
    ],
  },
  {
    id: 'ladders', art: 'partition',
    name: T('Ladders', 'Σκάλες'),
    intro: T('Light aluminium ladders: single, extending and A-frame.', 'Ελαφριές σκάλες αλουμινίου: μονές, επεκτεινόμενες και τρίποδες.'),
    products: [
      { id: 'ladder-double', model: 'Double Extending Ladders (900)', source: M + 'double-extending-ladders', name: T('Extending ladders, 2 to 5 m+', 'Επεκτεινόμενες σκάλες, 2 έως 5 m+'), desc: T('Two-section ladders that slide out to reach higher, in many heights.', 'Σκάλες δύο τμημάτων που ανοίγουν για να φτάσετε ψηλότερα, σε πολλά ύψη.'), specs: [['range', 'Type 900: 2.00 m (8+8 steps) … Type 906: 5.00 m (20+20 steps)']] },
      { id: 'ladder-single', model: 'Single Ladders (700)', source: M + 'single-ladders', name: T('Single ladders, 2 to 5 m+', 'Μονές σκάλες, 2 έως 5 m+'), desc: T('Simple one-piece aluminium ladders in many lengths.', 'Απλές μονοκόμματες σκάλες αλουμινίου σε πολλά μήκη.'), specs: [['range', 'Type 701: 2.00 m (8 steps) … Type 707: 5.00 m (20 steps)']] },
      { id: 'ladder-tripod', model: 'Tripod Ladders (500)', source: M + 'tripod-ladders', name: T('A-frame step ladders', 'Τρίποδες σκάλες'), desc: T('Free-standing A-frame ladders for home and work.', 'Αυτοστήρικτες τρίποδες σκάλες για σπίτι και δουλειά.'), specs: [['range', 'Type 501: 0.75 m (3 steps) … Type 508: 2.50 m']] },
    ],
  },
  {
    id: 'finishes', art: 'shading',
    name: T('Colours & Finishes', 'Χρώματα & φινιρίσματα'),
    intro: T('The colour and surface of your aluminium: anodised, powder coated or wood effect.', 'Το χρώμα και η επιφάνεια του αλουμινίου σας: ανοδίωση, ηλεκτροστατική βαφή ή απομίμηση ξύλου.'),
    products: [
      { id: 'anodize', model: 'Anodize', source: M + 'anodize', name: T('Anodised metallic finishes', 'Ανοδιωμένα μεταλλικά φινιρίσματα'), desc: T('Refined metallic and tinted tones that last for decades. MUSKITA has anodised aluminium since 1965.', 'Εκλεπτυσμένοι μεταλλικοί και χρωματιστοί τόνοι που κρατούν δεκαετίες. Η MUSKITA ανοδιώνει αλουμίνιο από το 1965.'), specs: [] },
      { id: 'powder', model: 'Powder Coating', source: M + 'powder-coating', name: T('Powder-coated colours', 'Χρώματα ηλεκτροστατικής βαφής'), desc: T('Superdurable powder coatings: special MU colours plus standard RAL, in smooth or sanded matt textures.', 'Ανθεκτικές ηλεκτροστατικές βαφές: ειδικά χρώματα MU και τυπικά RAL, σε λεία ή αμμώδη ματ υφή.'), specs: [] },
      { id: 'wood', model: 'Sublimation & Wood Finishes', source: M + 'sublimation-wood-finishes', name: T('Wood-effect finishes', 'Φινιρίσματα απομίμησης ξύλου'), desc: T('The warm look of wood on aluminium, made with the Decoral sublimation process.', 'Η ζεστή όψη του ξύλου σε αλουμίνιο, με τη μέθοδο εξάχνωσης Decoral.'), specs: [] },
    ],
  },
  {
    id: 'profiles', art: 'curtain',
    name: T('Profiles & More', 'Προφίλ & άλλα'),
    intro: T('Standard and custom aluminium profiles, acoustic louvres and sign profiles.', 'Τυποποιημένα και ειδικά προφίλ αλουμινίου, ακουστικές περσίδες και προφίλ πινακίδων.'),
    products: [
      { id: 'custom-profiles', model: 'Customized Profiles', source: M + 'customized-profiles', name: T('Profiles made to your design', 'Προφίλ στο δικό σας σχέδιο'), desc: T('Aluminium profiles extruded to your own specification or die, for special projects.', 'Προφίλ αλουμινίου στις δικές σας προδιαγραφές ή μήτρα, για ειδικά έργα.'), specs: [] },
      { id: 'gp-profiles', model: 'General Purpose Profiles', source: M + 'general-purpose-profiles', name: T('Profiles for everyday uses', 'Προφίλ για καθημερινές χρήσεις'), desc: T('Hundreds of profiles for shading, panels, shutters, flooring edges, frames, false ceilings, grilles, handles and decoration.', 'Εκατοντάδες προφίλ για σκίαση, πάνελ, παντζούρια, δάπεδα, πλαίσια, ψευδοροφές, κάγκελα, χερούλια και διακόσμηση.'), specs: [] },
      { id: 'std-profiles', model: 'Standard Profiles', source: M + 'standard-profiles', name: T('Tubes, angles and bars', 'Σωλήνες, γωνίες και λάμες'), desc: T('Standard sections in many sizes: square and rectangular, tubes, 90° angles, flat bars, U and T bars.', 'Τυποποιημένες διατομές σε πολλά μεγέθη: τετράγωνες και ορθογώνιες, σωλήνες, γωνίες 90°, λάμες, U και T.'), specs: [] },
      { id: 'acoustic', model: 'MUSKITA Acoustic Louvres', source: M + 'muskita-acoustic-louvres', name: T('Noise-reducing ventilation louvres', 'Ηχοαπορροφητικές περσίδες αερισμού'), desc: T('Louvres that let air through but cut noise from air conditioners, generators and cooling units, while blending into the façade.', 'Περσίδες που αφήνουν τον αέρα να περνά αλλά μειώνουν τον θόρυβο από κλιματιστικά, γεννήτριες και ψυκτικά, δένοντας με την πρόσοψη.'), specs: [['mwid', '2.00 m'], ['mhei', '3.00 m'], ['cw', '160, 250, 320 & 500 mm'], ['sound', 'Up to 43.6 dB']] },
      { id: 'signs', model: 'Road Signs', source: M + 'road-signs', name: T('Interlocking sign profiles', 'Αλληλοσυνδεόμενα προφίλ πινακίδων'), desc: T('A light, maintenance-free interlocking profile system for signs of any size.', 'Ελαφρύ σύστημα αλληλοσυνδεόμενων προφίλ χωρίς συντήρηση, για πινακίδες κάθε μεγέθους.'), specs: [] },
    ],
  },
];

// Spec labels (English, Greek).
export const SPEC_LABELS = {
  rw: ['Rail width', 'Πλάτος οδηγού'], rh: ['Rail height', 'Ύψος οδηγού'],
  sw: ['Sash width', 'Πλάτος φύλλου'], sh: ['Sash height', 'Ύψος φύλλου'],
  fw: ['Frame width', 'Πλάτος κάσας'], fh: ['Frame height', 'Ύψος κάσας'],
  iw: ['Interlock section width', 'Πλάτος μεσαίου προφίλ'], tvis: ['Minimum visible aluminium width of T-profile', 'Ελάχιστο ορατό πλάτος ταφ'],
  msw: ['Maximum sash weight', 'Μέγιστο βάρος φύλλου'], mdw: ['Maximum door weight', 'Μέγιστο βάρος πόρτας'],
  glass: ['Glass options', 'Πάχος υαλοπίνακα'], uw: ['Thermal transmittance Uw [W/(m²K)]', 'Θερμοπερατότητα Uw [W/(m²K)]'],
  sound: ['Sound reduction', 'Ηχομείωση'], air: ['Air permeability', 'Αεροπερατότητα'], water: ['Water tightness', 'Υδατοστεγανότητα'],
  wind: ['Resistance to wind load', 'Αντοχή σε ανεμοπίεση'], impact: ['Impact resistance', 'Αντοχή σε κρούση'],
  pivot: ['Pivot position from sash edge', 'Θέση άξονα από το άκρο του φύλλου'], mcw: ['Minimum construction width', 'Ελάχιστο πλάτος κατασκευής'],
  pw: ['Panel width', 'Πλάτος πάνελ'], ph: ['Panel height', 'Ύψος πάνελ'],
  mtw: ['Mullion / transom width', 'Πλάτος κολόνας / τραβέρσας'], mtd: ['Mullion / transom depth', 'Βάθος κολόνας / τραβέρσας'],
  mullw: ['Mullion width', 'Πλάτος κολόνας'], mulld: ['Mullion depth', 'Βάθος κολόνας'],
  plank: ['Plank width', 'Πλάτος σανίδας'], section: ['Section size', 'Διατομή'], profw: ['Profile width', 'Πλάτος προφίλ'],
  bw: ['Blade width', 'Πλάτος περσίδας'], bl: ['Blade length', 'Μήκος περσίδας'], pitch: ['Adjustable pitch', 'Ρυθμιζόμενο βήμα'], slope: ['Slope', 'Κλίση'],
  cwo: ['Construction width options', 'Επιλογές πλάτους κατασκευής'],
  pwmax: ['Maximum pergola width', 'Μέγιστο πλάτος πέργκολας'], plen: ['Maximum length without support', 'Μέγιστο μήκος χωρίς στήριξη'],
  plens: ['Maximum length with additional support', 'Μέγιστο μήκος με επιπλέον στήριξη'], ph3: ['Maximum suggested height', 'Προτεινόμενο μέγιστο ύψος'],
  drain: ['Water drainage channel', 'Κανάλι απορροής νερού'], drainv: ['Drainage channel volume', 'Χωρητικότητα καναλιού'],
  louvre: ['Louvre dimensions', 'Διαστάσεις περσίδας'], angle: ['Louvre angle range', 'Εύρος γωνίας περσίδας'],
  load: ['Load testing', 'Δοκιμή φορτίου'], thick: ['Structure thickness', 'Πάχος κατασκευής'], glazing: ['Glazing', 'Υάλωση'],
  maxPane: ['Glass pane weight', 'Βάρος υαλοπίνακα'],
  height: ['Height', 'Ύψος'], access: ['Access panel length', 'Μήκος καπακιού επίσκεψης'], app: ['Application', 'Εφαρμογή'], orient: ['Orientation', 'Προσανατολισμός'], weight: ['Weight (±5%)', 'Βάρος (±5%)'], angle2: ['Angle', 'Γωνία'], found: ['Foundation', 'Βάση στήριξης'], gap: ['Lowest distance from ground', 'Ελάχιστη απόσταση από το έδαφος'],
  dims: ['Dimensions', 'Διαστάσεις'], loadb: ['Load bearing', 'Φορτίο'], range: ['Sizes', 'Μεγέθη'], mwid: ['Maximum width', 'Μέγιστο πλάτος'], mhei: ['Maximum height', 'Μέγιστο ύψος'], cw: ['Construction widths', 'Πλάτη κατασκευής'],
  trw: ['Top rail width', 'Πλάτος άνω οδηγού'], trh: ['Top rail height', 'Ύψος άνω οδηγού'], srw: ['Side rail width', 'Πλάτος πλαϊνού οδηγού'],
  srh: ['Side rail height', 'Ύψος πλαϊνού οδηγού'], tvs: ['Top visible section', 'Ορατό άνω τμήμα'], svs: ['Side visible section', 'Ορατό πλαϊνό τμήμα'],
};
