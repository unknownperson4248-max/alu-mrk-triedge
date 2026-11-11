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
    const w = Math.round(+it.width), h = Math.round(+it.height), q = Math.round(+it.qty);
    if (!Q_CATS.includes(it.cat) || !(w > 0 && w <= 30000) || !(h > 0 && h <= 30000) || !(q >= 1 && q <= 999)) { errs.push('item'); break; }
    const files = [];
    for (const f of Array.isArray(it.files) ? it.files.slice(0, 3) : []) {
      const id = String(f && f.id || '');
      if (!FILE_ID.test(id)) continue;
      const meta = (await env.KV.getWithMetadata('qf:' + id, { type: 'stream' })).metadata;
      if (meta) files.push({ id, name: meta.name, type: meta.type, size: meta.size });
    }
    items.push({
      cat: it.cat, catName: clip(it.catName, 60), model: clip(it.model, 80), width: w, height: h, qty: q,
      colour: clip(it.colour, 60), glass: clip(it.glass, 60), glassThk: clip(it.glassThk, 40), opening: clip(it.opening, 60),
      specs: clip(it.specs, 500), notes: clip(it.notes, 1000), files,
    });
  }
  if (errs.length) return json({ ok: false, error: 'invalid', fields: [...new Set(errs)] }, 400);
  if (!(await bump(env, 'quote', 200))) return json({ ok: false, error: 'busy' }, 429);

  const ts = Date.now(), ref = quoteRef();
  const rec = { ref, ts, lang: clip(b.lang, 4), customer, items };
  const site = await getSite(env);
  const lines = items.map((it, k) => `${k + 1}. ${it.model || it.catName} (${it.catName}) ${it.width} x ${it.height} mm, qty ${it.qty}`
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
       <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px">${row('Category', it.catName)}${row('Size', `${it.width} x ${it.height} mm`)}${row('Quantity', String(it.qty))}${row('Colour', it.colour)}${row('Glass', [it.glass, it.glassThk].filter(Boolean).join(', '))}${row('Opening', it.opening)}${row('Specifications', it.specs)}${row('Notes', it.notes)}${row('Attachments', it.files.map((f) => f.name).join(', ') + (it.files.length ? ' (open in the admin panel)' : ''))}</table></div>`).join('')}`, url.origin);
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

      if (req.method !== 'GET' && req.method !== 'HEAD') return text('Method not allowed', 'text/plain', 'no-store', 405);

      if (path === '/' || path === '/index.html') {
        const site = await getSite(env);
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
        const hit = IMAGES[path.slice(5)];
        if (hit) return new Response(hit[0], { headers: { 'content-type': hit[1], 'cache-control': 'public, max-age=604800', ...BASE_HEADERS } });
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
