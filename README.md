# Alu MRK TriEdge Ltd — website + admin panel

Bilingual (English / Greek) website for Alu MRK TriEdge Ltd, aluminium and glass systems in Cyprus,
with an admin panel for colours, text, photos, systems and quote requests.

- Website: `/`
- Admin panel: `/admin`

Runs on a single Cloudflare Worker. Content, uploaded files, quote requests and the admin password
hash are stored in Workers KV (binding `KV`).

## What the admin panel can change

- **Colours**: five theme colours or a preset. The preview updates as you edit; Save puts it live.
- **Company & text**: name, phone, WhatsApp, email, address, opening hours, social links, headlines.
- **Hero slides**: photos and captions for the slideshow at the top.
- **Systems**: show/hide, order, names, descriptions, photos, gallery, features, technical
  specifications, configurator type, applications and a PDF brochure. Empty spec values show
  "On request" on the site.
- **Why us & reviews**: the four "Why choose us" items, optional numbers and client reviews
  (sections are hidden when empty).
- **Quote requests**: everything sent from the website form.
- **Images & files**: upload photos (resized in the browser before upload) and PDFs.
- **Password**: change the admin password.

## Project layout

```
src/worker.js            routes, admin API, auth, KV access
src/data.js              default content (used until the first save in the admin panel)
src/images.js            generated list of built-in images (npm run images)
src/img/                 built-in photos and logos
src/client/index.html    page template (filled in by the Worker)
src/client/site.*        public website
src/client/admin.*       admin panel
```

## Develop

```
npm install
printf 'ADMIN_PASSWORD=choose-one\nSESSION_SECRET=any-long-random-string\n' > .dev.vars
npm run dev
```

## Deploy

```
npx wrangler deploy
```

Secrets (set once):

```
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
```

`ADMIN_PASSWORD` is only used until a new password is set in the admin panel.
After adding or removing files in `src/img`, run `npm run images`.
