import INDEX_HTML from './client/index.html';
import SITE_CSS from './client/site.css';
import SITE_JS from './client/site.client.js';
import ADMIN_HTML from './client/admin.html';
import ADMIN_CSS from './client/admin.css';
import ADMIN_JS from './client/admin.client.js';
import { IMAGES } from './images.js';
import { DEFAULT_SITE, PRESETS } from './data.js';

const enc = new TextEncoder();
const PBKDF2_ITER = 10000;
const SESSION_DAYS = 7;
const MAX_SITE_BYTES = 512 * 1024;
const MAX_UPLOAD_BYTES = 24 * 1024 * 1024; // Workers KV values are limited to 25 MiB
const UPLOAD_TYPES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf', 'video/mp4': '.mp4', 'video/webm': '.webm' };

// Short version string for cache-busting the client files.
const VERSION = (() => {
  let h = 2166136261;
  const s = SITE_JS + SITE_CSS + ADMIN_JS + ADMIN_CSS;
  for (let i = 0; i < s.length; i += 7) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
})();

const BASE_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...BASE_HEADERS, ...headers },
  });

const text = (body, type, cache, status = 200, extra = {}) =>
  new Response(body, { status, headers: { 'content-type': type, 'cache-control': cache, ...BASE_HEADERS, ...extra } });

const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- site data ---------- */

function mergeSite(stored) {
  if (!stored || typeof stored !== 'object') return structuredClone(DEFAULT_SITE);
  const d = DEFAULT_SITE;
  return {
    ...structuredClone(d),
    ...stored,
    theme: { ...d.theme, ...(stored.theme || {}) },
    company: { ...d.company, ...(stored.company || {}), socials: { ...d.company.socials, ...((stored.company || {}).socials || {}) } },
    text: { ...d.text, ...(stored.text || {}) },
    founder: { ...d.founder, ...(stored.founder || {}) },
    quoteSettings: { ...d.quoteSettings, ...(stored.quoteSettings || {}) },
    reviewSettings: { ...d.reviewSettings, ...(stored.reviewSettings || {}) },
  };
}

async function getSite(env) {
  const stored = await env.KV.get('site', 'json');
  return mergeSite(stored);
}

const HEX = /^#[0-9a-f]{6}$/i;
function themeCss(theme) {
  const d = PRESETS['navy-gold'];
  const v = (k) => (HEX.test(theme?.[k] || '') ? theme[k] : d[k]);
  return `:root{--navy:${v('navy')};--accent:${v('accent')};--bg:${v('bg')};--surface:${v('surface')};--ink:${v('ink')}}`;
}

function tone(theme) {
  const hex = HEX.test((theme && theme.bg) || '') ? theme.bg : '#ffffff';
  const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45 ? 'dark' : 'light';
}

function renderIndex(site, url) {
  const t = (o) => (o && (o.en || '')) || '';
  const title = `${site.company.name} · ${t(site.text.tagline)}`;
  const desc = t(site.text.introBody) || t(site.text.introTitle);
  const ogImg = new URL('/' + String(site.heroImage || (site.hero && site.hero[0] && site.hero[0].img) || 'img/house-windows.jpg').replace(/^\//, ''), url).href;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: site.company.name,
    description: desc,
    url: url.origin + '/',
    image: ogImg,
    telephone: site.company.phone || undefined,
    email: site.company.email || undefined,
    address: t(site.company.address) ? { '@type': 'PostalAddress', streetAddress: t(site.company.address), addressCountry: 'CY' } : { '@type': 'PostalAddress', addressCountry: 'CY' },
  };
  const data = JSON.stringify(site).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const map = {
    '{{TITLE}}': escHtml(title),
    '{{DESC}}': escHtml(desc),
    '{{OG_IMAGE}}': escHtml(ogImg),
    '{{URL}}': escHtml(url.origin + '/'),
    '{{THEME}}': themeCss(site.theme),
    '{{LD}}': JSON.stringify(ld).replace(/</g, '\\u003c'),
    '{{DATA}}': data,
    '{{V}}': VERSION,
    '{{TONE}}': tone(site.theme),
    '{{NAVY}}': HEX.test(site.theme.navy || '') ? site.theme.navy : '#0e1b2e',
  };
  return INDEX_HTML.replace(/\{\{[A-Z_]+\}\}/g, (m) => (m in map ? map[m] : m));
}

function validSite(s) {
  if (!s || typeof s !== 'object') return 'Not an object';
  if (!s.theme || !s.company || !s.text) return 'Missing theme, company or text';
  if (!Array.isArray(s.systems) || !Array.isArray(s.hero)) return 'Missing systems or hero';
  for (const sys of s.systems) {
    if (!sys || typeof sys.slug !== 'string' || !/^[a-z0-9-]{2,60}$/.test(sys.slug)) return 'Each system needs a slug (a-z, 0-9, -)';
  }
  const slugs = new Set(s.systems.map((x) => x.slug));
  if (slugs.size !== s.systems.length) return 'Two systems have the same slug';
  return null;
}

/* ---------- auth ---------- */

const b64u = (buf) => {
  let s = '';
  const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function safeEq(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64u(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: iter }, key, 256));
}

async function authRecord(env) {
  return env.KV.get('auth', 'json');
}

async function checkPassword(env, pw) {
  if (typeof pw !== 'string' || !pw) return null;
  const rec = await authRecord(env);
  if (rec) return safeEq(await pbkdf2(pw, rec.salt, rec.iter), rec.hash) ? rec : null;
  return env.ADMIN_PASSWORD && safeEq(pw, env.ADMIN_PASSWORD) ? { ver: 0 } : null;
}

async function sessionCookie(env, ver, secure) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  const sig = await hmac(env.SESSION_SECRET, `admin.${exp}.${ver}`);
  return `atok=${exp}.${sig}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}

async function isAuthed(req, env) {
  const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)atok=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const rec = await authRecord(env);
  const ver = rec ? rec.ver : 0;
  return safeEq(sig, await hmac(env.SESSION_SECRET, `admin.${exp}.${ver}`));
}

const sameOrigin = (req, url) => {
  const o = req.headers.get('origin');
  return !o || o === url.origin;
};

/* ---------- handlers ---------- */

const Q_CATS = ['doors', 'sliding-doors', 'windows', 'sliding-windows', 'thermal', 'glass', 'custom'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const quoteRef = () => {
  const d = new Date(), a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(4));
  return 'AMT-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + [...r].map((x) => a[x % a.length]).join('');
};

async function handleQuote(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (b && b.website) return json({ ok: true, ref: 'AMT-000000-0000' }); // honeypot: pretend success to bots
  const sid = clip(b.sid, 40);
  if (/^[a-z0-9-]{8,40}$/i.test(sid)) {
    const prev = await env.KV.get('qsub:' + sid);
    if (prev) return json({ ok: true, ref: prev, duplicate: true });
  }
  const c = b.customer || {};
  const customer = {
    name: clip(c.name, 100), email: clip(c.email, 120).toLowerCase(), phone: clip(c.phone, 40),
    company: clip(c.company, 120), location: clip(c.location, 120), type: clip(c.type, 60), message: clip(c.message, 2000),
  };
  const errs = [];
  if (!customer.name) errs.push('name');
  if (!EMAIL_RE.test(customer.email)) errs.push('email');
  if (customer.phone.replace(/\D/g, '').length < 8 || !/^\s*(\+|00)/.test(customer.phone)) errs.push('phone');
  if (!c.privacy) errs.push('privacy');
  const raw = Array.isArray(b.items) ? b.items.slice(0, 30) : [];
  if (!raw.length) errs.push('items');
  const items = [];
  for (const it of raw) {
    const measure = !!it.measure, w = measure ? 0 : Math.round(+it.width), h = measure ? 0 : Math.round(+it.height), q = Math.round(+it.qty);
    if (!Q_CATS.includes(it.cat) || (!measure && (!(w > 0 && w <= 30000) || !(h > 0 && h <= 30000))) || !(q >= 1 && q <= 999)) { errs.push('item'); break; }
    const files = [];
    for (const f of Array.isArray(it.files) ? it.files.slice(0, 3) : []) {
      const id = String(f && f.id || '');
      if (!FILE_ID.test(id)) continue;
      const meta = (await env.KV.getWithMetadata('qf:' + id, { type: 'stream' })).metadata;
      if (meta) files.push({ id, name: meta.name, type: meta.type, size: meta.size });
    }
    items.push({
      cat: it.cat, catName: clip(it.catName, 60), model: clip(it.model, 80), measure, width: w, height: h, qty: q,
      colour: clip(it.colour, 60), glass: clip(it.glass, 60), glassThk: clip(it.glassThk, 40), opening: clip(it.opening, 60),
      specs: clip(it.specs, 500), notes: clip(it.notes, 1000), files,
    });
  }
  if (errs.length) return json({ ok: false, error: 'invalid', fields: [...new Set(errs)] }, 400);
  if (!(await bump(env, 'quote', 200))) return json({ ok: false, error: 'busy' }, 429);

  const ts = Date.now(), ref = quoteRef();
  const rec = { ref, ts, lang: clip(b.lang, 4), customer, items };
  // remembers the email so a later Google review from it shows "Verified customer"
  await env.KV.put('qe:' + (await sha256hex(customer.email.toLowerCase())), '1', KEEP);
  const site = await getSite(env);
  const lines = items.map((it, k) => `${k + 1}. ${it.model || it.catName} (${it.catName}) ${it.measure ? 'size: measure on site' : `${it.width} x ${it.height} mm`}, qty ${it.qty}`
    + [it.colour && `colour ${it.colour}`, it.glass && `glass ${it.glass}${it.glassThk ? ' ' + it.glassThk : ''}`, it.opening && `opening ${it.opening}`].filter(Boolean).map((x) => ', ' + x).join('')
    + (it.specs ? `\n   Specs: ${it.specs}` : '') + (it.notes ? `\n   Notes: ${it.notes}` : '') + (it.files.length ? `\n   Attachments: ${it.files.map((f) => f.name).join(', ')}` : '')).join('\n');
  const when = new Date(ts).toLocaleString('en-GB', { timeZone: 'Asia/Nicosia', dateStyle: 'medium', timeStyle: 'short' });
  const html = mailShell(`Quotation request ${ref}`,
    `<p style="margin:0 0 12px">New quotation request from the website, ${escMail(when)} (Cyprus time).</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;margin-bottom:14px">${row('Reference', ref)}${row('Name', customer.name)}${row('Email', customer.email)}${row('Phone', customer.phone)}${row('Company', customer.company)}${row('Location', customer.location)}${row('Project type', customer.type)}</table>
     ${customer.message ? `<p style="margin:0 0 14px;padding:10px;background:#f7f7f8;border-radius:6px;white-space:pre-line">${escMail(customer.message)}</p>` : ''}
     <h3 style="font-size:16px;margin:16px 0 8px">Products (${items.length})</h3>
     ${items.map((it, k) => `<div style="border:1px solid #e3e5e8;border-radius:8px;padding:10px 12px;margin-bottom:8px">
       <div style="font-weight:bold">${k + 1}. ${escMail(it.model || it.catName)}</div>
       <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${row('Category', it.catName)}${row('Size', it.measure ? 'Not known: measure on site' : `${it.width} x ${it.height} mm`)}${row('Quantity', String(it.qty))}${row('Colour', it.colour)}${row('Glass', [it.glass, it.glassThk].filter(Boolean).join(', '))}${row('Opening', it.opening)}${row('Specifications', it.specs)}${row('Notes', it.notes)}${row('Attachments', it.files.map((f) => f.name).join(', ') + (it.files.length ? ' (open in the admin panel)' : ''))}</table></div>`).join('')}`, url.origin);
  const plain = `Quotation request ${ref}\n${when}\n\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\n${customer.company ? 'Company: ' + customer.company + '\n' : ''}${customer.location ? 'Location: ' + customer.location + '\n' : ''}${customer.type ? 'Project type: ' + customer.type + '\n' : ''}${customer.message ? '\nMessage:\n' + customer.message + '\n' : ''}\nProducts:\n${lines}\n\nAdmin panel: ${url.origin}/admin`;
  rec.email = await sendMail(env, site, { subject: `Quotation request ${ref} · ${customer.name} · ${items.length} item${items.length > 1 ? 's' : ''}`, html, text: plain, replyTo: customer.email });
  const key = `q:${String(9e15 - ts).padStart(16, '0')}:${rid(4)}`;
  await env.KV.put(key, JSON.stringify(rec), { metadata: { name: customer.name, ts }, ...KEEP });
  if (sid) await env.KV.put('qsub:' + sid, ref, { expirationTtl: 60 * 60 * 24 * 3 });
  return json({ ok: true, ref });
}

/* ---------- shared helpers for quotes, uploads and reviews ---------- */
const clip = (v, n) => String(v ?? '').replace(/\r/g, '').trim().slice(0, n);
const today = () => new Date().toISOString().slice(0, 10);
const rid = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
const KEEP = { expirationTtl: 60 * 60 * 24 * 400 };
const FILE_ID = /^[a-f0-9]{20}$/;
const UP_TYPES = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1, 'application/pdf': 1 };
const UP_MAX = 10 * 1024 * 1024;

// Simple daily counters so the public forms cannot be used to fill the store.
async function bump(env, name, limit) {
  const key = `cnt:${name}:${today()}`;
  const n = +((await env.KV.get(key)) || 0);
  if (n >= limit) return false;
  await env.KV.put(key, String(n + 1), { expirationTtl: 60 * 60 * 48 });
  return true;
}

// Private uploads (quote drawings, review photos). Never served publicly; the admin reads them through /api/admin/file/.
async function handleUpload(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  const type = (req.headers.get('content-type') || '').split(';')[0].trim();
  if (!UP_TYPES[type]) return json({ ok: false, error: 'type' }, 415);
  const purpose = url.searchParams.get('for') === 'review' ? 'review' : 'quote';
  if (purpose === 'review' && type === 'application/pdf') return json({ ok: false, error: 'type' }, 415);
  const len = +(req.headers.get('content-length') || 0);
  if (len > UP_MAX) return json({ ok: false, error: 'size' }, 413);
  const buf = await req.arrayBuffer();
  if (!buf.byteLength) return json({ ok: false, error: 'empty' }, 400);
  if (buf.byteLength > UP_MAX) return json({ ok: false, error: 'size' }, 413);
  if (!(await bump(env, 'upload', 300))) return json({ ok: false, error: 'busy' }, 429);
  const id = rid(10);
  const name = clip(decodeURIComponent(req.headers.get('x-filename') || 'file'), 100).replace(/[^\w.\- ()]/g, '_');
  await env.KV.put('qf:' + id, buf, { metadata: { type, name, size: buf.byteLength, purpose, ts: Date.now() }, ...KEEP });
  return json({ ok: true, id, name, size: buf.byteLength, type });
}

/* ---------- email (Resend). Works once RESEND_API_KEY is set as a Worker secret; otherwise skipped. ---------- */
const escMail = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function sendMail(env, site, { subject, html, text: plain, replyTo }) {
  if (!env.RESEND_API_KEY) return 'not-configured';
  const to = env.MAIL_TO || (site.company && site.company.email);
  if (!to) return 'no-recipient';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'Alu MRK TriEdge Website <onboarding@resend.dev>', to: [to], subject, html, text: plain, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return r.ok ? 'sent' : 'failed-' + r.status;
  } catch (e) {
    return 'failed';
  }
}
function mailShell(title, inner, url) {
  return `<!doctype html><html><body style="margin:0;background:#f2f3f5;font-family:Arial,Helvetica,sans-serif;color:#14171a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5;padding:16px 8px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:10px;overflow:hidden">
<tr><td style="background:#17191d;color:#ffffff;padding:18px 20px;font-size:18px;font-weight:bold">${escMail(title)}</td></tr>
<tr><td style="padding:18px 20px;font-size:15px;line-height:1.5">${inner}</td></tr>
<tr><td style="padding:14px 20px;background:#f7f7f8;font-size:12px;color:#5f6873">Open the admin panel: <a href="${escMail(url)}/admin">${escMail(url)}/admin</a></td></tr>
</table></td></tr></table></body></html>`;
}
const row = (k, v) => (v ? `<tr><td style="padding:4px 10px 4px 0;color:#5f6873;vertical-align:top;white-space:nowrap">${escMail(k)}</td><td style="padding:4px 0">${escMail(v)}</td></tr>` : '');

async function handleReviewPost(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (b && b.website) return json({ ok: true });
  const r = { id: rid(6), name: clip(b.name, 60), place: clip(b.place, 60), title: clip(b.title, 100), project: clip(b.project, 100), rating: Math.round(+b.rating), text: clip(b.text, 1200), lang: clip(b.lang, 4), ts: Date.now(), photos: [] };
  if (!r.name || r.text.length < 10 || !(r.rating >= 1 && r.rating <= 5)) return json({ ok: false, error: 'required' }, 400);
  for (const id of Array.isArray(b.photos) ? b.photos.slice(0, 3) : []) {
    if (!FILE_ID.test(String(id))) continue;
    const meta = (await env.KV.getWithMetadata('qf:' + id, { type: 'stream' })).metadata;
    if (meta && meta.type && meta.type.startsWith('image/')) r.photos.push(String(id));
  }
  if (!(await bump(env, 'review', 60))) return json({ ok: false, error: 'busy' }, 429);
  const list = (await env.KV.get('rev-pending', 'json')) || [];
  if (list.length >= 200) return json({ ok: false, error: 'busy' }, 429);
  list.unshift(r);
  await env.KV.put('rev-pending', JSON.stringify(list));
  const site = await getSite(env);
  await sendMail(env, site, {
    subject: `New review waiting for approval · ${'★'.repeat(r.rating)} · ${r.name}`,
    html: mailShell('New review waiting for approval', `<p style="margin:0 0 10px;font-size:20px;color:#c99a3c">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</p><table role="presentation" cellpadding="0" cellspacing="0">${row('Name', r.name)}${row('Area', r.place)}${row('Title', r.title)}${row('Project', r.project)}${row('Photos', r.photos.length ? String(r.photos.length) : '')}</table><p style="white-space:pre-line">${escMail(r.text)}</p><p>It is not shown on the website until you approve it in the admin panel (Reviews).</p>`, url.origin),
    text: `New review from ${r.name} (${r.rating}/5)\n${r.title ? r.title + '\n' : ''}${r.text}\n\nApprove or delete it in the admin panel: ${url.origin}/admin`,
  });
  return json({ ok: true });
}

/* ---------- customer reviews with Google sign-in (one review per Google account, published at once) ---------- */
const URV = 'urv';
const RV_DAYS = 180;
const dec = new TextDecoder();
const b64uDec = (s) => {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};
async function sha256hex(v) {
  const h = await crypto.subtle.digest('SHA-256', enc.encode(String(v)));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
let GKEYS = null, GKEYS_AT = 0;
async function googleKeys(force) {
  if (!force && GKEYS && Date.now() - GKEYS_AT < 3600e3) return GKEYS;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!r.ok) throw new Error('google_keys');
  GKEYS = (await r.json()).keys || [];
  GKEYS_AT = Date.now();
  return GKEYS;
}
// Checks a Google "Sign in with Google" ID token: signature, issuer, audience (our client ID) and expiry.
async function verifyGoogle(token, clientId) {
  const [h, p, s] = String(token || '').split('.');
  if (!h || !p || !s || !clientId) return null;
  let head, claims;
  try { head = JSON.parse(dec.decode(b64uDec(h))); claims = JSON.parse(dec.decode(b64uDec(p))); } catch { return null; }
  if (head.alg !== 'RS256') return null;
  let jwk = (await googleKeys()).find((k) => k.kid === head.kid);
  if (!jwk) jwk = (await googleKeys(true)).find((k) => k.kid === head.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uDec(s), enc.encode(h + '.' + p)))) return null;
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) return null;
  if (claims.aud !== clientId || !(claims.exp * 1000 > Date.now()) || !claims.sub) return null;
  return claims;
}
const devLoginOk = (env, url) => env.DEV_FAKE_GOOGLE === '1' && (url.hostname === '127.0.0.1' || url.hostname === 'localhost');
async function rvCookie(env, user, secure) {
  const payload = b64u(enc.encode(JSON.stringify({ ...user, x: Date.now() + RV_DAYS * 864e5 })));
  const sig = await hmac(env.SESSION_SECRET, 'rv.' + payload);
  return `rtok=${payload}.${sig}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${RV_DAYS * 86400}`;
}
async function rvUser(req, env) {
  const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)rtok=([^;]+)/);
  if (!m || !env.SESSION_SECRET) return null;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig || !safeEq(sig, await hmac(env.SESSION_SECRET, 'rv.' + payload))) return null;
  try {
    const u = JSON.parse(dec.decode(b64uDec(payload)));
    return u && u.u && u.x > Date.now() ? u : null;
  } catch { return null; }
}
const urvAll = async (env) => (await env.KV.get(URV, 'json')) || [];
const urvSave = (env, list) => env.KV.put(URV, JSON.stringify(list));
const urvPublic = (r) => ({ id: r.id, name: r.name, pic: r.pic || '', rating: r.rating, text: r.text, photos: r.photos || [], ts: r.ts, uts: r.uts || r.ts, verified: !!r.verified, helpful: r.helpful || 0, reply: r.reply || null });
async function publicUserReviews(env) {
  return (await urvAll(env)).filter((r) => !r.hidden).map(urvPublic);
}
async function voterKey(req, env, user) {
  if (user) return 'u' + user.u.slice(0, 16);
  return 'i' + (await hmac(env.SESSION_SECRET || 'x', 'ip.' + (req.headers.get('cf-connecting-ip') || ''))).slice(0, 16);
}
// Copies a private upload (qf:) to public media and returns its path, or '' when it is not an image.
async function publishUpload(env, id, label) {
  const { value, metadata } = await env.KV.getWithMetadata('qf:' + id, { type: 'arrayBuffer' });
  const ext = metadata && { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[metadata.type];
  if (!value || !ext) return '';
  const mid = rid(8) + ext;
  await env.KV.put('media:' + mid, value, { metadata: { type: metadata.type, name: label + (metadata.name || mid), size: value.byteLength, ts: Date.now() } });
  await env.KV.delete('qf:' + id);
  return 'media/' + mid;
}
async function dropMedia(env, paths) {
  for (const p of paths || []) if (/^media\/[a-z0-9]{16}\.(jpg|png|webp)$/.test(p)) await env.KV.delete('media:' + p.slice(6));
}

async function handleUserReviews(req, env, url, path) {
  const method = req.method;
  if (method !== 'GET' && !sameOrigin(req, url)) return json({ ok: false }, 403);
  const site = await getSite(env);
  const clientId = String((site.reviewSettings || {}).googleClientId || '').trim();
  const secure = url.protocol === 'https:';
  const user = await rvUser(req, env);
  const mineOf = async (u) => (u ? (await urvAll(env)).find((r) => r.uid === u.u) : null);

  if (path === '/api/review/me' && method === 'GET') {
    const mine = await mineOf(user);
    return json({ ok: true, user: user ? { name: user.n, pic: user.p } : null, mine: mine && !mine.hidden ? urvPublic(mine) : mine ? { ...urvPublic(mine), hidden: true } : null });
  }
  if (path === '/api/review/login' && method === 'POST') {
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
    if (!(await bump(env, 'urv-login', 2000))) return json({ ok: false, error: 'busy' }, 429);
    let c = null;
    if (b && b.dev && devLoginOk(env, url)) c = { sub: String(b.sub || 'dev-user'), name: clip(b.name || 'Dev User', 60), email: clip(b.email || 'dev@example.com', 120), email_verified: true, picture: '' };
    else c = await verifyGoogle(b && b.credential, clientId).catch(() => null);
    if (!c) return json({ ok: false, error: 'login_failed' }, 401);
    const pic = /^https:\/\/lh3\.googleusercontent\.com\//.test(c.picture || '') ? String(c.picture).slice(0, 300) : '';
    const u = { u: (await sha256hex('google:' + c.sub)).slice(0, 32), n: clip(c.name || c.given_name || (c.email || '').split('@')[0], 60) || 'Google user', p: pic, e: c.email_verified ? clip(c.email, 120).toLowerCase() : '' };
    const mine = await mineOf(u);
    return json({ ok: true, user: { name: u.n, pic: u.p }, mine: mine ? urvPublic(mine) : null }, 200, { 'set-cookie': await rvCookie(env, u, secure) });
  }
  if (path === '/api/review/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': `rtok=; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=0` });
  }
  if (path === '/api/review/mine' && (method === 'POST' || method === 'DELETE')) {
    if (!user) return json({ ok: false, error: 'login' }, 401);
    const list = await urvAll(env);
    const k = list.findIndex((r) => r.uid === user.u);
    if (method === 'DELETE') {
      if (k < 0) return json({ ok: true });
      await dropMedia(env, list[k].photos);
      list.splice(k, 1);
      await urvSave(env, list);
      return json({ ok: true });
    }
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
    const rating = Math.round(+b.rating), textv = clip(b.text, 1500);
    if (!(rating >= 1 && rating <= 5) || textv.length < 10) return json({ ok: false, error: 'required' }, 400);
    if (!(await bump(env, 'urv', 300))) return json({ ok: false, error: 'busy' }, 429);
    const old = k >= 0 ? list[k] : null;
    if (!old && list.length >= 3000) return json({ ok: false, error: 'busy' }, 429);
    const keep = [], fresh = [];
    for (const v of Array.isArray(b.photos) ? b.photos.slice(0, 3) : []) {
      const s = String(v);
      if (old && (old.photos || []).includes(s)) keep.push(s);
      else if (FILE_ID.test(s)) fresh.push(s);
    }
    const photos = [...keep];
    for (const id of fresh) { if (photos.length >= 3) break; const p = await publishUpload(env, id, 'review-'); if (p) photos.push(p); }
    if (old) await dropMedia(env, (old.photos || []).filter((p) => !photos.includes(p)));
    const verified = !!(user.e && (await env.KV.get('qe:' + (await sha256hex(user.e)))));
    const now = Date.now();
    const r = old
      ? { ...old, name: user.n, pic: user.p, email: user.e, rating, text: textv, photos, uts: now, verified, lang: clip(b.lang, 4) }
      : { id: rid(6), uid: user.u, name: user.n, pic: user.p, email: user.e, rating, text: textv, photos, ts: now, uts: now, verified, helpful: 0, votes: {}, reports: 0, reporters: [], hidden: false, reply: null, lang: clip(b.lang, 4) };
    if (old) list[k] = r; else list.unshift(r);
    await urvSave(env, list);
    if (!old) {
      await sendMail(env, site, {
        subject: `New review on the website · ${'★'.repeat(rating)} · ${r.name}`,
        html: mailShell('New review on the website', `<p style="margin:0 0 10px;font-size:20px;color:#c99a3c">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p><table role="presentation" cellpadding="0" cellspacing="0">${row('Name', r.name)}${row('Email', r.email)}${row('Verified customer', verified ? 'Yes' : '')}${row('Photos', photos.length ? String(photos.length) : '')}</table><p style="white-space:pre-line">${escMail(textv)}</p><p>It is already shown on the website. You can reply to it or hide it in the admin panel (Reviews).</p>`, url.origin),
        text: `New review from ${r.name} (${rating}/5)\n${textv}\n\nReply or hide it in the admin panel: ${url.origin}/admin`,
      });
    }
    return json({ ok: true, review: urvPublic(r) });
  }
  if ((path === '/api/review/vote' || path === '/api/review/report') && method === 'POST') {
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }
    const list = await urvAll(env);
    const r = list.find((x) => x.id === String(b && b.id) && !x.hidden);
    if (!r) return json({ ok: false, error: 'not_found' }, 404);
    const vk = await voterKey(req, env, user);
    if (path === '/api/review/vote') {
      if (user && r.uid === user.u) return json({ ok: false, error: 'own' }, 400);
      if (!(await bump(env, 'urv-vote', 5000))) return json({ ok: false, error: 'busy' }, 429);
      const v = [1, -1].includes(+b.v) ? +b.v : 0;
      r.votes = r.votes || {};
      if (v) r.votes[vk] = v; else delete r.votes[vk];
      const keys = Object.keys(r.votes);
      if (keys.length > 3000) delete r.votes[keys[0]];
      r.helpful = Object.values(r.votes).filter((x) => x === 1).length;
      await urvSave(env, list);
      return json({ ok: true, helpful: r.helpful });
    }
    if (!(await bump(env, 'urv-report', 500))) return json({ ok: false, error: 'busy' }, 429);
    r.reporters = r.reporters || [];
    if (!r.reporters.includes(vk)) { r.reporters.push(vk); r.reports = r.reporters.length; await urvSave(env, list); }
    return json({ ok: true });
  }
  return json({ ok: false, error: 'not_found' }, 404);
}

// English -> Greek with Cloudflare Workers AI. A language model that knows the trade terms does the work;
// a plain translation model is the fallback. Results are kept in KV so the same text is translated once.
const TR_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
const TR_PROMPT = 'You translate website text for Alu MRK TriEdge Ltd, an aluminium windows, doors and glass company in Cyprus, from English to Greek (as used in Cyprus). Use the correct trade terms, for example: sliding = συρόμενο, lift and slide = ανυψούμενο-συρόμενο, folding = πτυσσόμενο, hinged = ανοιγόμενο, railing = κάγκελο, partition = χώρισμα, curtain wall = υαλοπέτασμα, facade = πρόσοψη, thermal break = θερμοδιακοπή, double glazing = διπλά τζάμια, profile = προφίλ, shopfront = βιτρίνα. Keep brand names, company names, model codes (such as MU 2000), numbers, units, emails and URLs unchanged. Translate every word. Keep line breaks. Short labels stay short; use the imperative for buttons (for example: Get a free site survey = Ζητήστε δωρεάν αυτοψία). Reply with only a JSON array of strings: the translations, in the same order and with the same length as the input array.';
async function trKey(s) { return 'tr:el:' + (await sha256hex(TR_MODEL + '|' + s)).slice(0, 40); }
async function m2mGreek(env, s) {
  const out = [];
  for (const line of s.split('\n')) {
    if (!line.trim()) { out.push(line); continue; }
    const r = await env.AI.run('@cf/meta/m2m100-1.2b', { text: line, source_lang: 'en', target_lang: 'el' });
    out.push(String((r && r.translated_text) || '').trim());
  }
  return out.join('\n').trim();
}
async function toGreekBatch(env, texts) {
  const out = texts.map(() => '');
  const miss = [];
  for (let k = 0; k < texts.length; k++) {
    if (!texts[k].trim()) continue;
    const hit = await env.KV.get(await trKey(texts[k]));
    if (hit) out[k] = hit; else miss.push(k);
  }
  if (!miss.length) return out;
  let got = null;
  try {
    const r = await env.AI.run(TR_MODEL, { messages: [{ role: 'system', content: TR_PROMPT }, { role: 'user', content: JSON.stringify(miss.map((k) => texts[k])) }], max_tokens: 4000, temperature: 0.1 });
    let v = r && (r.response != null ? r.response : r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content);
    if (typeof v === 'string') { const a = v.indexOf('['), b = v.lastIndexOf(']'); v = a >= 0 && b > a ? JSON.parse(v.slice(a, b + 1)) : null; }
    if (Array.isArray(v) && v.length === miss.length && v.every((x) => typeof x === 'string')) got = v;
  } catch (e) { got = null; }
  for (let n = 0; n < miss.length; n++) {
    const k = miss[n];
    let v = got ? got[n].trim() : '';
    if (!v) { try { v = await m2mGreek(env, texts[k]); } catch (e) { v = ''; } }
    out[k] = v;
    if (v) await env.KV.put(await trKey(texts[k]), v);
  }
  return out;
}

async function listMedia(env) {
  const out = [];
  let cursor;
  do {
    const r = await env.KV.list({ prefix: 'media:', cursor });
    for (const k of r.keys) out.push({ path: 'media/' + k.name.slice(6), ...(k.metadata || {}) });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out.sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

async function handleAdminApi(req, env, url, path) {
  const method = req.method;

  if (path === '/api/admin/login' && method === 'POST') {
    if (!sameOrigin(req, url)) return json({ ok: false }, 403);
    let b = {};
    try {
      b = await req.json();
    } catch {}
    const rec = await checkPassword(env, b.password);
    if (!rec) {
      await new Promise((r) => setTimeout(r, 800));
      return json({ ok: false, error: 'Wrong password' }, 401);
    }
    return json({ ok: true }, 200, { 'set-cookie': await sessionCookie(env, rec.ver || 0, url.protocol === 'https:') });
  }

  if (path === '/api/admin/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': 'atok=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' });
  }

  if (!(await isAuthed(req, env))) return json({ ok: false, error: 'auth' }, 401);
  if (method !== 'GET' && (req.headers.get('x-requested-with') !== 'admin' || !sameOrigin(req, url))) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  if (path === '/api/admin/site' && method === 'GET') {
    const [site, media] = await Promise.all([getSite(env), listMedia(env)]);
    const builtin = Object.keys(IMAGES).filter((n) => n.endsWith('.jpg')).map((n) => ({ path: 'img/' + n, name: n, builtin: true }));
    return json({ site, media, builtin, presets: PRESETS, defaults: DEFAULT_SITE });
  }

  if (path === '/api/admin/site' && method === 'PUT') {
    const raw = await req.text();
    if (raw.length > MAX_SITE_BYTES) return json({ ok: false, error: 'Content is too large' }, 413);
    let s;
    try {
      s = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400);
    }
    const err = validSite(s);
    if (err) return json({ ok: false, error: err }, 400);
    s.updatedAt = Date.now();
    await env.KV.put('site', JSON.stringify(s));
    return json({ ok: true, updatedAt: s.updatedAt });
  }

  if (path === '/api/admin/media' && method === 'POST') {
    const type = (req.headers.get('content-type') || '').split(';')[0].trim();
    const ext = UPLOAD_TYPES[type];
    if (!ext) return json({ ok: false, error: 'Only JPG, PNG, WebP, PDF, MP4 or WebM files' }, 415);
    const buf = await req.arrayBuffer();
    if (!buf.byteLength) return json({ ok: false, error: 'Empty file' }, 400);
    if (buf.byteLength > MAX_UPLOAD_BYTES) return json({ ok: false, error: 'File is larger than 24 MB' }, 413);
    const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16) + ext;
    const name = decodeURIComponent(req.headers.get('x-filename') || '').slice(0, 120);
    const meta = { type, name, size: buf.byteLength, ts: Date.now() };
    await env.KV.put('media:' + id, buf, { metadata: meta });
    return json({ ok: true, path: 'media/' + id, ...meta });
  }

  if (path.startsWith('/api/admin/media/') && method === 'DELETE') {
    const id = path.slice('/api/admin/media/'.length);
    if (!/^[a-z0-9]{16}\.(jpg|png|webp|pdf|mp4|webm)$/.test(id)) return json({ ok: false }, 400);
    await env.KV.delete('media:' + id);
    return json({ ok: true });
  }

  if (path === '/api/admin/quotes' && method === 'GET') {
    const r = await env.KV.list({ prefix: 'q:', limit: 200 });
    const items = await Promise.all(r.keys.map(async (k) => ({ key: k.name, ...((await env.KV.get(k.name, 'json')) || {}) })));
    return json({ items });
  }

  const qdm = /^\/api\/admin\/quotes\/(.+)\/doc$/.exec(path);
  if (qdm && method === 'POST') {
    const key = decodeURIComponent(qdm[1]);
    if (!/^q:\d{16}:[a-f0-9-]{8}$/.test(key)) return json({ ok: false, error: 'Bad request' }, 400);
    const { value: rec, metadata } = await env.KV.getWithMetadata(key, 'json');
    if (!rec) return json({ ok: false, error: 'This request no longer exists' }, 404);
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
    const d = (b && b.doc) || {};
    const num = (v) => (v === '' || v == null || !Number.isFinite(+v) ? '' : String(+v));
    const doc = {
      no: clip(d.no, 40), date: clip(d.date, 20), validity: clip(d.validity, 80), vat: num(d.vat), currency: clip(d.currency, 4),
      rows: (Array.isArray(d.rows) ? d.rows : []).slice(0, 60).map((r) => ({ desc: clip(r && r.desc, 600), size: clip(r && r.size, 40), qty: num(r && r.qty), price: num(r && r.price) })),
      payment: clip(d.payment, 3000), delivery: clip(d.delivery, 3000), terms: clip(d.terms, 3000), sign: clip(d.sign, 200),
      subtotal: +num(d.subtotal) || 0, total: +num(d.total) || 0, savedAt: Date.now(),
    };
    rec.doc = doc;
    await env.KV.put(key, JSON.stringify(rec), { metadata: metadata || {}, ...KEEP });
    return json({ ok: true, doc });
  }
  if (path.startsWith('/api/admin/quotes/') && method === 'DELETE') {
    const key = decodeURIComponent(path.slice('/api/admin/quotes/'.length));
    if (!/^q:\d{16}:[a-f0-9-]{8}$/.test(key)) return json({ ok: false }, 400);
    await env.KV.delete(key);
    return json({ ok: true });
  }

  if (path === '/api/admin/password' && method === 'POST') {
    let b = {};
    try {
      b = await req.json();
    } catch {}
    const rec = await checkPassword(env, b.current);
    if (!rec) return json({ ok: false, error: 'Current password is wrong' }, 400);
    if (typeof b.next !== 'string' || b.next.length < 8) return json({ ok: false, error: 'New password needs at least 8 characters' }, 400);
    const salt = crypto.randomUUID();
    const ver = (rec.ver || 0) + 1;
    await env.KV.put('auth', JSON.stringify({ salt, iter: PBKDF2_ITER, hash: await pbkdf2(b.next, salt, PBKDF2_ITER), ver }));
    return json({ ok: true }, 200, { 'set-cookie': await sessionCookie(env, ver, url.protocol === 'https:') });
  }

  const fm = /^\/api\/admin\/file\/([a-f0-9]{20})$/.exec(path);
  if (fm && method === 'GET') {
    const { value, metadata } = await env.KV.getWithMetadata('qf:' + fm[1], { type: 'arrayBuffer' });
    if (!value) return json({ ok: false, error: 'File not found' }, 404);
    const nm = String((metadata && metadata.name) || 'file').replace(/[^\w.\- ]/g, '_');
    return new Response(value, { headers: { 'content-type': (metadata && metadata.type) || 'application/octet-stream', 'content-disposition': `inline; filename="${nm}"`, 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
  }
  const am = /^\/api\/admin\/reviews\/([a-f0-9]{12})\/publish$/.exec(path);
  if (am && method === 'POST') {
    const list = (await env.KV.get('rev-pending', 'json')) || [];
    const r = list.find((x) => x.id === am[1]);
    if (!r) return json({ ok: false, error: 'This review is no longer waiting' }, 404);
    const photos = [];
    for (const id of r.photos || []) {
      const { value, metadata } = await env.KV.getWithMetadata('qf:' + id, { type: 'arrayBuffer' });
      if (!value || !metadata) continue;
      const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[metadata.type];
      if (!ext) continue;
      const mid = rid(8) + ext;
      await env.KV.put('media:' + mid, value, { metadata: { type: metadata.type, name: 'review-' + (metadata.name || mid), size: value.byteLength, ts: Date.now() } });
      photos.push('media/' + mid);
    }
    return json({ ok: true, review: { id: r.id, name: r.name, place: r.place || '', title: r.title || '', project: r.project || '', rating: r.rating, text: r.text, ts: r.ts, photos } });
  }
  if (path === '/api/admin/translate' && method === 'POST') {
    if (!env.AI) return json({ ok: false, error: 'Translation is not available' }, 503);
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
    const texts = (Array.isArray(b.texts) ? b.texts : []).slice(0, 20).map((x) => String(x || '').slice(0, 2000));
    try { return json({ ok: true, out: await toGreekBatch(env, texts) }); }
    catch (e) { return json({ ok: false, error: 'Translation failed' }, 502); }
  }
  if (path === '/api/admin/ureviews' && method === 'GET') {
    return json({ items: (await urvAll(env)).map((r) => ({ ...urvPublic(r), email: r.email || '', hidden: !!r.hidden, reports: r.reports || 0 })) });
  }
  const um = /^\/api\/admin\/ureviews\/([a-f0-9]{12})$/.exec(path);
  if (um && (method === 'POST' || method === 'DELETE')) {
    const list = await urvAll(env);
    const k = list.findIndex((x) => x.id === um[1]);
    if (k < 0) return json({ ok: false, error: 'Review not found' }, 404);
    if (method === 'DELETE') {
      await dropMedia(env, list[k].photos);
      list.splice(k, 1);
      await urvSave(env, list);
      return json({ ok: true });
    }
    let b;
    try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
    const r = list[k];
    if ('reply' in b) { const tx = clip(b.reply, 1500); r.reply = tx ? { text: tx, ts: Date.now() } : null; }
    if ('hidden' in b) r.hidden = !!b.hidden;
    if (b.clearReports) { r.reports = 0; r.reporters = []; }
    await urvSave(env, list);
    return json({ ok: true, review: { ...urvPublic(r), email: r.email || '', hidden: !!r.hidden, reports: r.reports || 0 } });
  }
  if (path === '/api/admin/reviews' && method === 'GET') {
    return json({ items: (await env.KV.get('rev-pending', 'json')) || [] });
  }
  const rm = /^\/api\/admin\/reviews\/([a-f0-9]{12})$/.exec(path);
  if (rm && method === 'DELETE') {
    const list = ((await env.KV.get('rev-pending', 'json')) || []).filter((x) => x.id !== rm[1]);
    await env.KV.put('rev-pending', JSON.stringify(list));
    return json({ ok: true });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    try {
      if (path.startsWith('/api/admin/')) return await handleAdminApi(req, env, url, path);
      if (path === '/api/quote' && req.method === 'POST') return await handleQuote(req, env, url);
      if (path === '/api/upload' && req.method === 'POST') return await handleUpload(req, env, url);
      if (path === '/api/review' && req.method === 'POST') return await handleReviewPost(req, env, url);
      if (path.startsWith('/api/review/')) return await handleUserReviews(req, env, url, path);

      if (req.method !== 'GET' && req.method !== 'HEAD') return text('Method not allowed', 'text/plain', 'no-store', 405);

      if (path === '/' || path === '/index.html') {
        const site = await getSite(env);
        site.ureviews = await publicUserReviews(env);
        if (devLoginOk(env, url)) site.devLogin = true;
        return text(renderIndex(site, url), 'text/html; charset=utf-8', 'no-cache', 200, { 'x-frame-options': 'SAMEORIGIN' });
      }
      if (path === '/site.css') return text(SITE_CSS, 'text/css; charset=utf-8', 'public, max-age=31536000, immutable');
      if (path === '/site.js') return text(SITE_JS, 'text/javascript; charset=utf-8', 'public, max-age=31536000, immutable');

      if (path === '/admin' || path === '/admin/') {
        return text(ADMIN_HTML.replace(/\{\{V\}\}/g, VERSION), 'text/html; charset=utf-8', 'no-store', 200, { 'x-frame-options': 'DENY', 'x-robots-tag': 'noindex' });
      }
      if (path === '/admin.css') return text(ADMIN_CSS, 'text/css; charset=utf-8', 'public, max-age=31536000, immutable');
      if (path === '/admin.js') return text(ADMIN_JS, 'text/javascript; charset=utf-8', 'public, max-age=31536000, immutable');

      if (path.startsWith('/img/')) {
        const name = path.slice(5);
        // JPG photos have a smaller WebP twin; browsers that accept WebP get it (link previews keep the JPG)
        const webp = /\.jpe?g$/i.test(name) && /image\/webp/.test(req.headers.get('accept') || '') && IMAGES[name.replace(/\.jpe?g$/i, '.webp')];
        const hit = webp || IMAGES[name];
        if (hit) return new Response(hit[0], { headers: { 'content-type': hit[1], 'cache-control': 'public, max-age=604800', vary: 'Accept', ...BASE_HEADERS } });
      }

      if (path.startsWith('/media/')) {
        const id = path.slice(7);
        if (/^[a-z0-9]{16}\.(jpg|png|webp|pdf|mp4|webm)$/.test(id)) {
          const { value, metadata } = await env.KV.getWithMetadata('media:' + id, { type: 'arrayBuffer', cacheTtl: 86400 });
          if (value) {
            const h = { 'content-type': (metadata && metadata.type) || 'application/octet-stream', 'cache-control': 'public, max-age=31536000, immutable', 'accept-ranges': 'bytes', ...BASE_HEADERS };
            if (id.endsWith('.pdf')) h['content-disposition'] = `inline; filename="${String((metadata && metadata.name) || 'brochure.pdf').replace(/[^\w.\- ]/g, '')}"`;
            // Byte ranges: Safari will not play a video without them.
            const total = value.byteLength;
            const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
            if (m && (m[1] !== '' || m[2] !== '')) {
              let start = m[1] === '' ? Math.max(0, total - +m[2]) : +m[1];
              let end = m[1] === '' || m[2] === '' ? total - 1 : Math.min(+m[2], total - 1);
              if (start >= total || start > end) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${total}`, ...BASE_HEADERS } });
              return new Response(value.slice(start, end + 1), { status: 206, headers: { ...h, 'content-range': `bytes ${start}-${end}/${total}`, 'content-length': String(end - start + 1) } });
            }
            return new Response(value, { headers: h });
          }
        }
      }

      const pm = /^\/p\/(w|s|m)\/([a-z0-9-]{1,60})$/.exec(path);
      if (pm) {
        const site = await getSite(env);
        const t = (o) => (o && (o.en || o.el)) || '';
        let item = null;
        if (pm[1] === 'w') { const w = (site.works || []).find((x) => x.id === pm[2]); if (w) item = { title: t(w.title), desc: [t(w.place)].filter(Boolean).join(' · '), img: (w.images || [])[0], to: '/#gallery' }; }
        if (pm[1] === 's') { const x = (site.systems || []).find((y) => y.slug === pm[2] && y.visible !== false); if (x) item = { title: t(x.name), desc: t(x.short), img: x.image, to: '/#' + x.slug }; }
        if (pm[1] === 'm') { const x = (site.products || []).find((y) => y.id === pm[2] && y.visible !== false); if (x) item = { title: `${x.model} · ${t(x.name)}`, desc: t(x.short), img: x.image, to: '/#' + x.id }; }
        if (!item) return Response.redirect(url.origin + '/', 302);
        const img = item.img ? new URL('/' + String(item.img).replace(/^\//, ''), url).href : '';
        const title = `${item.title} · ${site.company.name}`;
        return text(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(title)}</title><meta name="description" content="${escHtml(item.desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${escHtml(site.company.name)}"><meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="${escHtml(item.desc || t(site.text.tagline))}">
${img ? `<meta property="og:image" content="${escHtml(img)}"><meta name="twitter:card" content="summary_large_image">` : ''}<meta property="og:url" content="${escHtml(url.href)}">
<meta http-equiv="refresh" content="0;url=${escHtml(item.to)}"><link rel="canonical" href="${escHtml(url.origin + '/')}"></head>
<body style="background:#0a0b0d;color:#fff;font-family:sans-serif;padding:24px"><a style="color:#d4b36e" href="${escHtml(item.to)}">${escHtml(title)}</a><script>location.replace(${JSON.stringify(item.to)})</script></body></html>`, 'text/html; charset=utf-8', 'public, max-age=300');
      }
      if (path === '/robots.txt') {
        return text(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ${url.origin}/sitemap.xml\n`, 'text/plain; charset=utf-8', 'public, max-age=3600');
      }
      if (path === '/sitemap.xml') {
        return text(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url></urlset>`,
          'application/xml; charset=utf-8',
          'public, max-age=3600'
        );
      }
      if (path === '/favicon.ico') return Response.redirect(url.origin + '/img/icon-dark.png', 301);

      return text('Not found', 'text/plain; charset=utf-8', 'no-store', 404);
    } catch (e) {
      console.error(e && e.stack ? e.stack : e);
      return json({ ok: false, error: 'server_error' }, 500);
    }
  },
};
