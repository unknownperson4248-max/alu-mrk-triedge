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

async function handleQuote(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (b && b.website) return json({ ok: true }); // honeypot field filled: silently ignore bots
  const c = (v, n) => String(v ?? '').trim().slice(0, n);
  const q = {
    name: c(b.name, 100),
    phone: c(b.phone, 40),
    email: c(b.email, 120),
    area: c(b.area, 80),
    system: c(b.system, 120),
    message: c(b.message, 2000),
    lang: c(b.lang, 4),
    ts: Date.now(),
  };
  if (!q.name || !q.phone) return json({ ok: false, error: 'required' }, 400);
  const key = `q:${String(9e15 - q.ts).padStart(16, '0')}:${crypto.randomUUID().slice(0, 8)}`;
  await env.KV.put(key, JSON.stringify(q), { metadata: { name: q.name, ts: q.ts }, expirationTtl: 60 * 60 * 24 * 400 });
  return json({ ok: true });
}

/* ---------- messages (price questions with replies) and reviews ----------
   KV keys: chat:<id> one conversation; chat-index a short list of all conversations for the admin panel,
   which also carries simple daily limits; rev-pending reviews waiting for approval. */
const CHAT_ID = /^[a-f0-9]{16}$/;
const KEEP = { expirationTtl: 60 * 60 * 24 * 400 };
const clip = (v, n) => String(v ?? '').replace(/\r/g, '').trim().slice(0, n);
const today = () => new Date().toISOString().slice(0, 10);
const rid = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');

async function chatIndex(env) {
  const ix = (await env.KV.get('chat-index', 'json')) || {};
  if (ix.day !== today()) { ix.day = today(); ix.threads = 0; ix.msgs = 0; }
  ix.items = Array.isArray(ix.items) ? ix.items : [];
  return ix;
}
function indexPut(ix, th, keepPlace) {
  const last = th.msgs[th.msgs.length - 1] || {};
  const row = { id: th.id, name: th.name, phone: th.phone, last: String(last.text || '').slice(0, 90), from: last.from || 'user', updated: th.updated, ua: th.ua || 0, n: th.msgs.length };
  const i = ix.items.findIndex((x) => x.id === th.id);
  if (keepPlace && i >= 0) ix.items[i] = row;
  else ix.items = [row, ...ix.items.filter((x) => x.id !== th.id)].slice(0, 300);
}
// The item a message is about is looked up on the server, so the title and photo always come from the site itself.
async function resolveRef(env, ref) {
  if (!ref || typeof ref !== 'object') return null;
  const site = await getSite(env);
  const id = clip(ref.id, 60), img = clip(ref.img, 160);
  if (ref.type === 'work') {
    const w = (site.works || []).find((x) => x.id === id);
    if (!w) return null;
    return { type: 'work', id, title: (w.title && (w.title.en || w.title.el)) || '', img: (w.images || []).includes(img) ? img : (w.images || [])[0] || '' };
  }
  if (ref.type === 'system') {
    const sy = (site.systems || []).find((x) => x.slug === id);
    if (!sy) return null;
    return { type: 'system', id, title: (sy.name && (sy.name.en || sy.name.el)) || '', img: sy.image || '' };
  }
  return null;
}
const publicThread = (th) => ({ id: th.id, name: th.name, msgs: th.msgs, uu: th.uu || 0 });

async function handleChatPost(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (b && b.website) return json({ ok: true });
  const text = clip(b.text, 1000);
  if (!text) return json({ ok: false, error: 'empty' }, 400);
  const ix = await chatIndex(env);
  if (ix.msgs >= 400) return json({ ok: false, error: 'busy' }, 429);
  let th = null;
  if (CHAT_ID.test(b.thread || '')) {
    th = await env.KV.get('chat:' + b.thread, 'json');
    if (!th || !safeEq(th.token, String(b.token || ''))) th = null;
  }
  const now = Date.now();
  if (!th) {
    const name = clip(b.name, 80), phone = clip(b.phone, 30);
    if (!name || phone.replace(/\D/g, '').length < 6) return json({ ok: false, error: 'contact' }, 400);
    if (ix.threads >= 150) return json({ ok: false, error: 'busy' }, 429);
    th = { id: rid(8), token: rid(16), name, phone, lang: clip(b.lang, 4), created: now, msgs: [], ua: 0, uu: 0 };
    ix.threads++;
  }
  if (th.msgs.length >= 300) return json({ ok: false, error: 'full' }, 400);
  const ref = await resolveRef(env, b.ref);
  th.msgs.push({ id: rid(4), from: 'user', text, ts: now, ...(ref ? { ref } : {}) });
  th.updated = now;
  th.ua = (th.ua || 0) + 1;
  th.uu = 0;
  ix.msgs++;
  indexPut(ix, th);
  await Promise.all([env.KV.put('chat:' + th.id, JSON.stringify(th), KEEP), env.KV.put('chat-index', JSON.stringify(ix))]);
  return json({ ok: true, thread: { ...publicThread(th), token: th.token } });
}

async function handleChatGet(env, url) {
  const id = url.searchParams.get('thread') || '', token = url.searchParams.get('token') || '';
  if (!CHAT_ID.test(id)) return json({ ok: false }, 400);
  const th = await env.KV.get('chat:' + id, 'json');
  if (!th || !safeEq(th.token, token)) return json({ ok: false, error: 'not_found' }, 404);
  const out = publicThread(th);
  if (url.searchParams.get('seen') === '1' && th.uu) {
    th.uu = 0;
    await env.KV.put('chat:' + id, JSON.stringify(th), KEEP);
  }
  return json({ ok: true, thread: out });
}

async function handleReviewPost(req, env, url) {
  if (!sameOrigin(req, url)) return json({ ok: false }, 403);
  let b;
  try {
    b = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }
  if (b && b.website) return json({ ok: true });
  const r = { id: rid(6), name: clip(b.name, 60), place: clip(b.place, 60), rating: Math.round(+b.rating), text: clip(b.text, 800), lang: clip(b.lang, 4), ts: Date.now() };
  if (!r.name || r.text.length < 10 || !(r.rating >= 1 && r.rating <= 5)) return json({ ok: false, error: 'required' }, 400);
  const list = (await env.KV.get('rev-pending', 'json')) || [];
  if (list.length >= 200) return json({ ok: false, error: 'busy' }, 429);
  list.unshift(r);
  await env.KV.put('rev-pending', JSON.stringify(list));
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

  if (path === '/api/admin/chats' && method === 'GET') {
    const [ix, pend] = await Promise.all([chatIndex(env), env.KV.get('rev-pending', 'json')]);
    return json({ items: ix.items, pendingReviews: (pend || []).length });
  }
  const cm = /^\/api\/admin\/chats\/([a-f0-9]{16})$/.exec(path);
  if (cm) {
    const key = 'chat:' + cm[1];
    const th = await env.KV.get(key, 'json');
    if (method === 'DELETE') {
      const ix = await chatIndex(env);
      ix.items = ix.items.filter((x) => x.id !== cm[1]);
      await Promise.all([env.KV.delete(key), env.KV.put('chat-index', JSON.stringify(ix))]);
      return json({ ok: true });
    }
    if (!th) return json({ ok: false, error: 'This conversation no longer exists' }, 404);
    if (method === 'GET') {
      if (th.ua) {
        th.ua = 0;
        const ix = await chatIndex(env);
        indexPut(ix, th, true);
        await Promise.all([env.KV.put(key, JSON.stringify(th), KEEP), env.KV.put('chat-index', JSON.stringify(ix))]);
      }
      const { token, ...safe } = th;
      return json({ ok: true, thread: safe });
    }
    if (method === 'POST') {
      let b = {};
      try {
        b = await req.json();
      } catch {}
      const text = clip(b.text, 1000);
      if (!text) return json({ ok: false, error: 'Write a reply first' }, 400);
      const now = Date.now();
      th.msgs.push({ id: rid(4), from: 'admin', text, ts: now });
      th.updated = now;
      th.ua = 0;
      th.uu = (th.uu || 0) + 1;
      const ix = await chatIndex(env);
      indexPut(ix, th);
      await Promise.all([env.KV.put(key, JSON.stringify(th), KEEP), env.KV.put('chat-index', JSON.stringify(ix))]);
      const { token, ...safe } = th;
      return json({ ok: true, thread: safe });
    }
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
      if (path === '/api/chat' && req.method === 'POST') return await handleChatPost(req, env, url);
      if (path === '/api/chat' && req.method === 'GET') return await handleChatGet(env, url);
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
