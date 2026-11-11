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
- **Latest work**: add finished jobs (photos, title, category, month, place). New work goes first on the
  website with a NEW label for 45 days; gallery categories drive the filter buttons.
- **Systems**: show/hide, order, names, descriptions, photos, gallery, features, technical
  specifications, configurator type, applications and a PDF brochure. Empty spec values show
  "On request" on the site.
- **Why us & reviews**: the four "Why choose us" items, optional numbers and client reviews
  (sections are hidden when empty).
- **Profile Systems**: aluminium profile models (MU 2000, MU 3200, MU 3000, MU 114, MU 2075; profiles by MUSKITA) with category,
  description, colours, specifications and photo. Hidden products do not show on the site.
- **Reviews**: Play Store style. With a Google OAuth Client ID (admin → Reviews), customers sign in with
  Google and post one review per account at once (they can edit or delete it); the company can reply, hide
  or delete. Without a Client ID, reviews wait for approval as before.
- **Quote requests**: multi-product requests from the quotation builder, each with a reference number
  (AMT-YYMMDD-XXXX) and private attachments. "Create quotation (PDF)" opens an editable, printable
  quotation; prices, VAT, validity and terms are typed in by hand (defaults are editable, empty by default).

"Ask the price" buttons open WhatsApp with the item's name and a link to its page (the link preview shows
the photo). Nothing is sent automatically.
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

Email notifications for new quote requests and reviews (optional, via [Resend](https://resend.com)):

```
npx wrangler secret put RESEND_API_KEY
```

Optional variables: `MAIL_TO` (default: company email from the admin panel) and `MAIL_FROM`
(default `onboarding@resend.dev`, which only delivers to the Resend account's own address until a
domain is verified). Without the key, requests are still saved and shown in the admin panel.
After adding or removing files in `src/img`, run `npm run images`.
