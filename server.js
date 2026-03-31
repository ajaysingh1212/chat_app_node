// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server  —  server.js  v2.1  (BUG-FIXED)
//  FIXES:
//    1. Call: please-connect is sole offer trigger (no double-offer race)
//    2. Online status: broadcast current online list to new connections
//    3. Status: only explicit contacts (not auto-ensured) shown
//    4. Misc: graceful error handling improvements
// ════════════════════════════════════════════════════════════════════════════
import express          from 'express';
import { createServer } from 'http';
import { Server }       from 'socket.io';
import { fileURLToPath }from 'url';
import { dirname, join } from 'path';
import mysql            from 'mysql2/promise';
import bcrypt           from 'bcryptjs';
import jwt              from 'jsonwebtoken';
import multer           from 'multer';
import sharp            from 'sharp';
import crypto           from 'crypto';
import fs               from 'fs';
import path             from 'path';
import dotenv           from 'dotenv';

dotenv.config();

const __dirname  = dirname(fileURLToPath(import.meta.url));
const PORT       = process.env.PORT       || 9000;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_32chars+';

const ENC_KEY = (() => {
  const raw = process.env.ENC_KEY || crypto.randomBytes(32).toString('hex');
  return Buffer.from(raw.slice(0, 64), 'hex');
})();

// ── Express + Socket.io ───────────────────────────────────────────────────
const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  maxHttpBufferSize: 20e6,
  cors: { origin: '*' }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.static(join(__dirname, 'public')));

// ── MySQL Pool ─────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:             process.env.DB_HOST || 'localhost',
  user:             process.env.DB_USER || 'root',
  password:         process.env.DB_PASS || '',
  database:         process.env.DB_NAME || 'node_chat',
  waitForConnections: true,
  connectionLimit:  15,
  charset:          'utf8mb4'
});

// ── Crypto ─────────────────────────────────────────────────────────────────
function encrypt(text) {
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, iv);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  return { enc, iv: iv.toString('hex') };
}
function decrypt(enc, ivHex) {
  try {
    const iv  = Buffer.from(ivHex, 'hex');
    const dec = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
    let out   = dec.update(enc, 'hex', 'utf8');
    out      += dec.final('utf8');
    return out;
  } catch { return '[Message unavailable]'; }
}

// ── File Upload ────────────────────────────────────────────────────────────
const uploadDir = join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/', 'video/', 'audio/', 'application/pdf', 'application/zip',
                'application/msword', 'application/vnd.openxmlformats', 'text/'];
    cb(null, ok.some(t => file.mimetype.startsWith(t)));
  }
});

// ── JWT Middleware ─────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function genId() { return Date.now().toString(36) + crypto.randomBytes(5).toString('hex'); }
function avatarColor(name) {
  const c = ['#00A884','#1565C0','#6A1B9A','#AD1457','#00838F','#2E7D32','#E65100'];
  let h = 0; for (const ch of name) h = ch.charCodeAt(0) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}
function applyPrivacy(u, viewerId, isContact) {
  const url = u.profile_pic || u.avatar_url || null;
  if (!url) return null;
  if (u.priv_photo === 'everyone') return url;
  if (u.priv_photo === 'contacts' && isContact) return url;
  return null;
}

// ── Chat key helper ─────────────────────────────────────────────────────────
function buildChatKey(type, id) { return type === 'private' ? `p:${id}` : `g:${id}`; }

// ══════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const [ex] = await pool.query('SELECT id FROM users WHERE email=? OR username=?', [email, username]);
    if (ex.length) return res.status(409).json({ error: 'Email or username already taken' });
    const hash  = await bcrypt.hash(password, 12);
    const color = avatarColor(username);
    const [result] = await pool.query(
      'INSERT INTO users (username,email,password_hash,avatar_color) VALUES (?,?,?,?)',
      [username.trim(), email.trim().toLowerCase(), hash, color]
    );
    const token = jwt.sign({ id: result.insertId, username: username.trim(), email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: result.insertId, username: username.trim(), email, avatarColor: color } });
  } catch (e) { console.error('register:', e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const avatarUrl = user.profile_pic || user.avatar_url || null;
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatar_color, avatarUrl, phone: user.phone, about: user.about } });
  } catch (e) { console.error('login:', e); res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════
//  USERS
// ══════════════════════════════════════════════

app.get('/api/users/search', requireAuth, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const [rows] = await pool.query(
    `SELECT id,username,email,avatar_color,avatar_url,profile_pic,priv_photo,is_online,last_seen,about,phone
     FROM users WHERE email=? AND id!=?`,
    [email.trim().toLowerCase(), req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  const u = rows[0];
  const [isContactRows] = await pool.query('SELECT id FROM contacts WHERE user_id=? AND contact_id=?',[req.user.id, u.id]);
  u.avatarUrl = applyPrivacy(u, req.user.id, isContactRows.length > 0);
  res.json(u);
});

app.get('/api/users/:userId/profile', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id,username,email,phone,about,profile_pic,avatar_url,avatar_color,
              priv_photo,priv_about,priv_last_seen,is_online,last_seen
       FROM users WHERE id=?`, [req.params.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const u = rows[0];
    const [isContact] = await pool.query('SELECT id FROM contacts WHERE user_id=? AND contact_id=?',[req.user.id, u.id]);
    u.avatarUrl = applyPrivacy(u, req.user.id, isContact.length > 0);
    if (u.priv_about === 'nobody' || (u.priv_about === 'contacts' && !isContact.length)) u.about = null;
    if (u.priv_last_seen === 'nobody' || (u.priv_last_seen === 'contacts' && !isContact.length)) {
      u.last_seen = null; u.is_online = 0;
    }
    res.json(u);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, email, avatar_color, avatar_url, profile_pic,
              is_online, last_seen
       FROM users WHERE id != ?
       ORDER BY username ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /api/users:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId/common-groups', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT g.id, g.name, g.group_pic,
            (SELECT COUNT(*) FROM group_members gm3 WHERE gm3.group_id=g.id) AS member_count
     FROM chat_groups g
     JOIN group_members gm1 ON gm1.group_id=g.id AND gm1.user_id=?
     JOIN group_members gm2 ON gm2.group_id=g.id AND gm2.user_id=?`,
    [req.user.id, req.params.userId]
  );
  res.json(rows);
});

app.get('/api/chat-media/:targetId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const you = parseInt(req.params.targetId);
  const [rows] = await pool.query(
    `SELECT id, file_path, file_type, file_name, file_size, created_at
     FROM messages
     WHERE msg_type IN ('image','video','file')
       AND deleted_both=0
       AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
     ORDER BY created_at DESC LIMIT 50`,
    [me, you, you, me]
  );
  res.json(rows);
});

// ══════════════════════════════════════════════
//  CONTACTS
// ══════════════════════════════════════════════

app.get('/api/contacts', requireAuth, async (req, res) => {
  const [myC] = await pool.query('SELECT contact_id FROM contacts WHERE user_id=?', [req.user.id]);
  const contactIds = myC.map(c => c.contact_id);
  const [rows] = await pool.query(`
    SELECT u.id,u.username,u.email,u.phone,u.about,u.avatar_color,u.avatar_url,u.profile_pic,
           u.priv_photo,u.is_online,u.last_seen
    FROM contacts c JOIN users u ON u.id=c.contact_id
    WHERE c.user_id=? ORDER BY u.username`, [req.user.id]);
  rows.forEach(u => {
    u.avatarUrl = applyPrivacy(u, req.user.id, contactIds.includes(u.id));
  });
  res.json(rows);
});

app.post('/api/contacts', requireAuth, async (req, res) => {
  const { contactId } = req.body;
  if (!contactId) return res.status(400).json({ error: 'contactId required' });
  await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [req.user.id, contactId]);
  await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [contactId, req.user.id]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════

app.put('/api/profile', requireAuth, async (req, res) => {
  const { username, about, phone } = req.body;
  const fields = []; const vals = [];
  if (username) { fields.push('username=?'); vals.push(username.trim()); }
  if (about !== undefined) { fields.push('about=?'); vals.push(about); }
  if (phone !== undefined) { fields.push('phone=?'); vals.push(phone); }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.user.id);
  await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=?`, vals);
  res.json({ ok: true });
});

app.put('/api/privacy', requireAuth, async (req, res) => {
  const { privLastSeen, privPhoto, privAbout, privGroupAdd, liveLocEnabled } = req.body;
  await pool.query(
    'UPDATE users SET priv_last_seen=?,priv_photo=?,priv_about=?,priv_group_add=?,live_loc_enabled=? WHERE id=?',
    [privLastSeen||'everyone', privPhoto||'everyone', privAbout||'everyone',
     privGroupAdd||'everyone', liveLocEnabled?1:0, req.user.id]
  );
  res.json({ ok: true });
});

app.put('/api/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Fields required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Min 6 characters' });
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
  const valid  = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
  res.json({ ok: true });
});

app.put('/api/change-email', requireAuth, async (req, res) => {
  const { newEmail, currentPassword } = req.body;
  if (!newEmail || !currentPassword) return res.status(400).json({ error: 'Fields required' });
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
  const valid  = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
  const [ex] = await pool.query('SELECT id FROM users WHERE email=? AND id!=?', [newEmail.toLowerCase(), req.user.id]);
  if (ex.length) return res.status(409).json({ error: 'Email already taken' });
  await pool.query('UPDATE users SET email=? WHERE id=?', [newEmail.toLowerCase(), req.user.id]);
  res.json({ ok: true });
});

app.put('/api/two-step', requireAuth, async (req, res) => {
  const { pin } = req.body;
  if (!pin || !/^\d{6}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 6 digits' });
  const hash = await bcrypt.hash(pin, 10);
  await pool.query('UPDATE users SET two_step_hash=? WHERE id=?', [hash, req.user.id]);
  res.json({ ok: true });
});

app.delete('/api/account', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=?', [req.user.id]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  GROUPS
// ══════════════════════════════════════════════

app.get('/api/groups', requireAuth, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT g.id,g.name,g.group_pic,g.created_by,g.created_at,
           GROUP_CONCAT(u.username ORDER BY u.username SEPARATOR ',') AS members
    FROM chat_groups g
    JOIN group_members gm ON gm.group_id=g.id
    JOIN users u ON u.id=gm.user_id
    WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id=?)
    GROUP BY g.id`, [req.user.id]);
  res.json(rows);
});

// ══════════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════════

app.get('/api/messages/private/:targetId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const you = parseInt(req.params.targetId);
  const [rows] = await pool.query(`
    SELECT m.id,m.sender_id,m.receiver_id,m.content,m.content_iv,
           m.msg_type,m.file_path,m.file_name,m.file_size,m.file_type,
           m.is_edited,m.deleted_both,m.created_at,m.disappears_at,
           u.username AS sender_name,u.avatar_color,
           ms.status AS msg_status
    FROM messages m
    JOIN users u ON u.id=m.sender_id
    LEFT JOIN message_status ms ON ms.message_id=m.id AND ms.user_id=?
    WHERE m.group_id IS NULL AND m.deleted_both=0
      AND ((m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?))
      AND NOT JSON_CONTAINS(COALESCE(m.deleted_for,'[]'), JSON_ARRAY(?))
      AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
    ORDER BY m.created_at ASC LIMIT 200`,
    [me, me, you, you, me, JSON.stringify(me)]);
  res.json(rows.map(r => ({ ...r, content: r.content ? decrypt(r.content, r.content_iv) : null })));
});

app.get('/api/messages/group/:groupId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const gid = req.params.groupId;
  const [mem] = await pool.query('SELECT id FROM group_members WHERE group_id=? AND user_id=?', [gid, me]);
  if (!mem.length) return res.status(403).json({ error: 'Not a member' });
  const [rows] = await pool.query(`
    SELECT m.id,m.sender_id,m.group_id,m.content,m.content_iv,
           m.msg_type,m.file_path,m.file_name,m.file_size,m.file_type,
           m.is_edited,m.created_at,m.disappears_at,
           u.username AS sender_name,u.avatar_color
    FROM messages m JOIN users u ON u.id=m.sender_id
    WHERE m.group_id=? AND m.deleted_both=0
      AND NOT JSON_CONTAINS(COALESCE(m.deleted_for,'[]'), JSON_ARRAY(?))
      AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
    ORDER BY m.created_at ASC LIMIT 200`,
    [gid, JSON.stringify(me)]);
  res.json(rows.map(r => ({ ...r, content: r.content ? decrypt(r.content, r.content_iv) : null })));
});

// ── Clear Chat ────────────────────────────────
app.delete('/api/chat/clear/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = req.params.chatKey;
  try {
    if (key.startsWith('p:')) {
      const otherId = parseInt(key.slice(2));
      await pool.query(
        `UPDATE messages SET deleted_for=JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'),'$',?)
         WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
           AND group_id IS NULL`,
        [me, me, otherId, otherId, me]
      );
    } else if (key.startsWith('g:')) {
      const groupId = key.slice(2);
      await pool.query(
        `UPDATE messages SET deleted_for=JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'),'$',?)
         WHERE group_id=?`, [me, groupId]
      );
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Clear failed' }); }
});

// ── Export Chat ───────────────────────────────
app.get('/api/chat/export/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = req.params.chatKey;
  try {
    let rows = [];
    if (key.startsWith('p:')) {
      const otherId = parseInt(key.slice(2));
      const [r] = await pool.query(
        `SELECT m.*,u.username AS sender_name FROM messages m
         JOIN users u ON u.id=m.sender_id
         WHERE ((m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?))
           AND m.deleted_both=0 AND m.group_id IS NULL
         ORDER BY m.created_at ASC`, [me, otherId, otherId, me]);
      rows = r;
    } else {
      const gid = key.slice(2);
      const [r] = await pool.query(
        `SELECT m.*,u.username AS sender_name FROM messages m
         JOIN users u ON u.id=m.sender_id
         WHERE m.group_id=? AND m.deleted_both=0
         ORDER BY m.created_at ASC`, [gid]);
      rows = r;
    }
    const lines = rows.map(r => {
      const content = r.content ? decrypt(r.content, r.content_iv) : (r.file_name ? `[File: ${r.file_name}]` : '');
      const d = new Date(r.created_at);
      return `[${d.toLocaleString()}] ${r.sender_name}: ${content}`;
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="chat_export_${Date.now()}.txt"`);
    res.send(lines.join('\n'));
  } catch(e) { res.status(500).json({ error: 'Export failed' }); }
});

// ══════════════════════════════════════════════
//  CALL HISTORY
// ══════════════════════════════════════════════

app.get('/api/calls', requireAuth, async (req, res) => {
  const me = req.user.id;
  const [rows] = await pool.query(`
    SELECT ch.id,ch.caller_id,ch.callee_id,ch.group_id,ch.call_type,
           ch.is_group,ch.status,ch.started_at,ch.ended_at,ch.duration_s,
           caller.username AS caller_name,caller.avatar_color AS caller_color,
           callee.username AS callee_name,callee.avatar_color AS callee_color,
           cg.name AS group_name
    FROM call_history ch
    JOIN users caller ON caller.id=ch.caller_id
    LEFT JOIN users callee ON callee.id=ch.callee_id
    LEFT JOIN chat_groups cg ON cg.id=ch.group_id
    WHERE ch.caller_id=? OR ch.callee_id=?
    ORDER BY ch.started_at DESC LIMIT 100`, [me, me]);
  res.json(rows);
});

// ══════════════════════════════════════════════
//  FILE UPLOAD
// ══════════════════════════════════════════════

app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    let finalName = file.filename, finalSize = file.size;
    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('gif')) {
      const outName = `c-${file.filename.replace(/\.[^.]+$/, '.jpg')}`;
      const outPath = join(uploadDir, outName);
      try {
        await sharp(file.path)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toFile(outPath);
        const cs = fs.statSync(outPath).size;
        if (cs < file.size) { fs.unlinkSync(file.path); finalName = outName; finalSize = cs; }
        else fs.unlinkSync(outPath);
      } catch {}
    }
    const fileUrl = `/uploads/${finalName}`;
    const [rows]  = await pool.query('SELECT profile_pic FROM users WHERE id=?', [req.user.id]);
    const oldPic  = rows[0]?.profile_pic;
    if (oldPic) { const op = join(__dirname, 'public', oldPic); if (fs.existsSync(op)) try { fs.unlinkSync(op); } catch {} }
    await pool.query('UPDATE users SET profile_pic=? WHERE id=?', [fileUrl, req.user.id]);
    res.json({ url: fileUrl, name: file.originalname, size: finalSize, type: file.mimetype });
  } catch (e) { console.error('upload:', e); res.status(500).json({ error: 'Upload failed' }); }
});

app.post('/api/upload/media', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    let finalName = file.filename, finalSize = file.size;
    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('gif')) {
      const outName = `c-${file.filename.replace(/\.[^.]+$/, '.jpg')}`;
      const outPath = join(uploadDir, outName);
      try {
        await sharp(file.path)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82 }).toFile(outPath);
        const cs = fs.statSync(outPath).size;
        if (cs < file.size) { fs.unlinkSync(file.path); finalName = outName; finalSize = cs; }
        else fs.unlinkSync(outPath);
      } catch {}
    }
    res.json({ url: `/uploads/${finalName}`, name: file.originalname, size: finalSize, type: file.mimetype });
  } catch (e) { res.status(500).json({ error: 'Upload failed' }); }
});

// ══════════════════════════════════════════════
//  STATUS  (WhatsApp-like 24h)
// ══════════════════════════════════════════════

// FIX: Status only shows explicit contacts (contacts table entries)
app.get('/api/status', requireAuth, async (req, res) => {
  const me = req.user.id;
  try {
    const [posts] = await pool.query(`
      SELECT sp.id,sp.user_id,sp.content_type,sp.content,sp.file_url,sp.caption,
             sp.bg_color,sp.text_color,sp.font_size,sp.expires_at,sp.created_at,
             u.username,u.avatar_color,u.profile_pic,u.avatar_url,u.priv_photo,
             (SELECT COUNT(*) FROM status_views sv WHERE sv.status_id=sp.id) AS view_count,
             (SELECT COUNT(*) FROM status_likes sl WHERE sl.status_id=sp.id) AS like_count,
             (SELECT 1 FROM status_views sv2 WHERE sv2.status_id=sp.id AND sv2.viewer_id=?) AS i_viewed,
             (SELECT emoji FROM status_likes sl2 WHERE sl2.status_id=sp.id AND sl2.user_id=?) AS my_reaction
      FROM status_posts sp
      JOIN users u ON u.id=sp.user_id
      WHERE sp.expires_at > NOW()
        AND (
          sp.user_id = ?
          OR sp.user_id IN (
            SELECT contact_id FROM contacts WHERE user_id = ?
          )
        )
      ORDER BY sp.user_id=? DESC, sp.created_at DESC`,
      [me, me, me, me, me]);

    const userMap = {};
    posts.forEach(p => {
      if (!userMap[p.user_id]) {
        userMap[p.user_id] = {
          user_id: p.user_id, username: p.username,
          avatar_color: p.avatar_color,
          avatarUrl: (p.priv_photo !== 'nobody') ? (p.profile_pic || p.avatar_url) : null,
          is_mine: p.user_id === me,
          statuses: []
        };
      }
      userMap[p.user_id].statuses.push(p);
    });
    res.json(Object.values(userMap));
  } catch(e) { console.error('status:', e); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/status', requireAuth, async (req, res) => {
  const { contentType, content, fileUrl, caption, bgColor, textColor, fontSize } = req.body;
  const id = genId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO status_posts (id,user_id,content_type,content,file_url,caption,bg_color,text_color,font_size,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, req.user.id, contentType||'text', content||null, fileUrl||null, caption||null,
     bgColor||'#1a2433', textColor||'#ffffff', fontSize||28, expiresAt]
  );
  res.json({ id, ok: true });
});

app.delete('/api/status/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM status_posts WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

app.post('/api/status/:id/view', requireAuth, async (req, res) => {
  await pool.query(
    'INSERT IGNORE INTO status_views (status_id,viewer_id) VALUES (?,?)',
    [req.params.id, req.user.id]
  );
  res.json({ ok: true });
});

app.post('/api/status/:id/like', requireAuth, async (req, res) => {
  const { emoji } = req.body;
  if (emoji) {
    await pool.query(
      'INSERT INTO status_likes (status_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?',
      [req.params.id, req.user.id, emoji, emoji]
    );
  } else {
    await pool.query('DELETE FROM status_likes WHERE status_id=? AND user_id=?', [req.params.id, req.user.id]);
  }
  res.json({ ok: true });
});

app.get('/api/status/:id/viewers', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id,u.username,u.avatar_color,u.profile_pic,sv.viewed_at,
            sl.emoji AS reaction
     FROM status_views sv
     JOIN users u ON u.id=sv.viewer_id
     LEFT JOIN status_likes sl ON sl.status_id=sv.status_id AND sl.user_id=sv.viewer_id
     WHERE sv.status_id=? AND EXISTS(
       SELECT 1 FROM status_posts sp WHERE sp.id=? AND sp.user_id=?
     )
     ORDER BY sv.viewed_at DESC`,
    [req.params.id, req.params.id, req.user.id]
  );
  res.json(rows);
});

// ══════════════════════════════════════════════
//  BLOCK / UNBLOCK
// ══════════════════════════════════════════════

app.get('/api/blocked', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id,u.username,u.email,u.avatar_color,u.profile_pic
     FROM blocked_users bu JOIN users u ON u.id=bu.blocked_id
     WHERE bu.user_id=?`, [req.user.id]);
  res.json(rows);
});

app.post('/api/block/:userId', requireAuth, async (req, res) => {
  await pool.query(
    'INSERT IGNORE INTO blocked_users (user_id,blocked_id) VALUES (?,?)',
    [req.user.id, req.params.userId]
  );
  res.json({ ok: true });
});

app.delete('/api/block/:userId', requireAuth, async (req, res) => {
  await pool.query(
    'DELETE FROM blocked_users WHERE user_id=? AND blocked_id=?',
    [req.user.id, req.params.userId]
  );
  res.json({ ok: true });
});

app.get('/api/block/check/:userId', requireAuth, async (req, res) => {
  const [r1] = await pool.query('SELECT 1 FROM blocked_users WHERE user_id=? AND blocked_id=?', [req.user.id, req.params.userId]);
  const [r2] = await pool.query('SELECT 1 FROM blocked_users WHERE user_id=? AND blocked_id=?', [req.params.userId, req.user.id]);
  res.json({ iBlockedThem: r1.length > 0, theyBlockedMe: r2.length > 0 });
});

// ══════════════════════════════════════════════
//  CHAT SETTINGS
// ══════════════════════════════════════════════

app.get('/api/chat-settings/:chatKey', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM chat_settings WHERE user_id=? AND chat_key=?',
    [req.user.id, req.params.chatKey]
  );
  res.json(rows[0] || { disappearing_msgs:'off', theme:'default', is_locked:0, is_muted:0 });
});

app.put('/api/chat-settings/:chatKey', requireAuth, async (req, res) => {
  const { disappearingMsgs, theme, isLocked, lockPin, isMuted } = req.body;
  let lockHash = null;
  if (isLocked && lockPin) lockHash = await bcrypt.hash(lockPin, 10);
  await pool.query(
    `INSERT INTO chat_settings (user_id,chat_key,disappearing_msgs,theme,is_locked,lock_pin_hash,is_muted)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       disappearing_msgs=VALUES(disappearing_msgs),
       theme=VALUES(theme),
       is_locked=VALUES(is_locked),
       lock_pin_hash=COALESCE(VALUES(lock_pin_hash),lock_pin_hash),
       is_muted=VALUES(is_muted)`,
    [req.user.id, req.params.chatKey, disappearingMsgs||'off', theme||'default',
     isLocked?1:0, lockHash, isMuted?1:0]
  );
  res.json({ ok: true });
});

app.post('/api/chat-settings/:chatKey/verify-pin', requireAuth, async (req, res) => {
  const { pin } = req.body;
  const [rows] = await pool.query(
    'SELECT lock_pin_hash FROM chat_settings WHERE user_id=? AND chat_key=? AND is_locked=1',
    [req.user.id, req.params.chatKey]
  );
  if (!rows.length) return res.json({ valid: true });
  const valid = await bcrypt.compare(pin, rows[0].lock_pin_hash);
  res.json({ valid });
});

// ── Home ──────────────────────────────────────
app.get('/', (req, res) =>
  res.sendFile(join(__dirname, 'app', 'index.html'))
);

// ══════════════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════════════
const onlineUsers  = {};   // userId(int) → socketId
const socketToUser = {};   // socketId   → { id, username }
const callRooms    = {};
const liveLocSessions = {};

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('auth_required'));
  try { socket.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { next(new Error('invalid_token')); }
});

io.on('connection', async (socket) => {
  const { id: myId, username } = socket.user;
  onlineUsers[myId]       = socket.id;
  socketToUser[socket.id] = { id: myId, username };

  await pool.query('UPDATE users SET is_online=1,last_seen=NULL WHERE id=?', [myId]);
  socket.broadcast.emit('user-status', { userId: myId, username, isOnline: true });

  // ── FIX: Send list of currently online user IDs to newly connected socket ──
  // This fixes the stale online-status on first load
  const currentOnlineIds = Object.keys(onlineUsers).map(id => parseInt(id));
  socket.emit('online-users', currentOnlineIds);

  // ── Helpers ─────────────────────────────────────────────────────────────
  async function getUserId(uname) {
    if (!uname) return null;
    const [r] = await pool.query('SELECT id FROM users WHERE username=?', [uname]);
    return r[0]?.id || null;
  }
  function emitTo(userId, event, data) {
    const sid = onlineUsers[userId];
    if (sid) io.to(sid).emit(event, data);
  }
  async function emitToGroupMembers(groupId, event, data, excludeMe = false) {
    const [members] = await pool.query('SELECT user_id FROM group_members WHERE group_id=?', [groupId]);
    members.forEach(m => { if (excludeMe && m.user_id === myId) return; emitTo(m.user_id, event, data); });
  }
  // NOTE: ensureContact only used for explicit messaging, NOT for status
  async function ensureContact(a, b) {
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [a, b]);
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [b, a]);
  }

  // ── Private Message ──────────────────────────────────────────────────────
  socket.on('private-message', async ({ to, content, msgType, fileUrl, fileName, fileSize, fileType, msgId }) => {
    const toId = await getUserId(to);
    if (!toId) return;
    const [blocked] = await pool.query(
      'SELECT 1 FROM blocked_users WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)',
      [myId, toId, toId, myId]);
    if (blocked.length) return socket.emit('message-blocked', { to });

    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };

    const [myCs]    = await pool.query('SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?', [myId, `p:${toId}`]);
    const [theirCs] = await pool.query('SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?', [toId, `p:${myId}`]);
    const dm = myCs[0]?.disappearing_msgs || theirCs[0]?.disappearing_msgs || 'off';
    let disappearsAt = null;
    if (dm !== 'off') {
      const hours = dm === '24h' ? 24 : dm === '7d' ? 168 : 720;
      disappearsAt = new Date(Date.now() + hours * 3600000);
    }

    await pool.query(
      'INSERT INTO messages (id,sender_id,receiver_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type,disappears_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, myId, toId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null, disappearsAt]
    );
    await ensureContact(myId, toId);
    const msg = { id, from: username, to, content: content||null, msgType: msgType||'text', fileUrl, fileName, fileSize, fileType, time: new Date().toISOString(), status: 'sent', disappearsAt };
    if (onlineUsers[toId]) {
      emitTo(toId, 'private-message', { ...msg, status: 'delivered' });
      await pool.query("INSERT INTO message_status (message_id,user_id,status) VALUES (?,?,'delivered') ON DUPLICATE KEY UPDATE status='delivered'", [id, toId]);
    }
    socket.emit('message-sent', { id, status: onlineUsers[toId] ? 'delivered' : 'sent' });
  });

  // ── Group Message ────────────────────────────────────────────────────────
  socket.on('group-message', async ({ groupId, content, msgType, fileUrl, fileName, fileSize, fileType, msgId }) => {
    const [mem] = await pool.query('SELECT id FROM group_members WHERE group_id=? AND user_id=?', [groupId, myId]);
    if (!mem.length) return;
    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };
    await pool.query(
      'INSERT INTO messages (id,sender_id,group_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, myId, groupId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null]
    );
    const msg = { id, from: username, groupId, content: content||null, msgType: msgType||'text', fileUrl, fileName, fileSize, fileType, time: new Date().toISOString() };
    await emitToGroupMembers(groupId, 'group-message', msg);
  });

  // ── Edit ─────────────────────────────────────────────────────────────────
  socket.on('edit-message', async ({ msgId, newContent, to, groupId }) => {
    const [msg] = await pool.query('SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]);
    if (!msg.length || msg[0].msg_type !== 'text') return;
    const { enc, iv } = encrypt(newContent);
    await pool.query('UPDATE messages SET content=?,content_iv=?,is_edited=1 WHERE id=?', [enc, iv, msgId]);
    const payload = { msgId, newContent, editedBy: username };
    socket.emit('message-edited', payload);
    if (groupId) { await emitToGroupMembers(groupId, 'message-edited', payload, true); }
    else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'message-edited', payload); }
  });

  // ── Delete ────────────────────────────────────────────────────────────────
  socket.on('delete-message', async ({ msgId, deleteFor, to, groupId }) => {
    const [msg] = await pool.query('SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]);
    if (!msg.length) return;
    if (deleteFor === 'everyone') {
      await pool.query('UPDATE messages SET deleted_both=1 WHERE id=?', [msgId]);
      if (msg[0].file_path) { const fp = join(__dirname, 'public', msg[0].file_path); if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch {} }
      const payload = { msgId, deleteFor: 'everyone' };
      socket.emit('message-deleted', payload);
      if (groupId) { await emitToGroupMembers(groupId, 'message-deleted', payload, true); }
      else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'message-deleted', payload); }
    } else {
      const cur = msg[0].deleted_for ? JSON.parse(msg[0].deleted_for) : [];
      if (!cur.includes(myId)) cur.push(myId);
      await pool.query('UPDATE messages SET deleted_for=? WHERE id=?', [JSON.stringify(cur), msgId]);
      socket.emit('message-deleted', { msgId, deleteFor: 'me' });
    }
  });

  // ── Seen ──────────────────────────────────────────────────────────────────
  socket.on('message-seen', async ({ msgId, fromUser }) => {
    await pool.query("INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen',seen_at=NOW()", [msgId, myId]);
    const fromId = await getUserId(fromUser);
    if (fromId) emitTo(fromId, 'message-seen', { msgId, by: username });
  });

  // ── Typing ────────────────────────────────────────────────────────────────
  socket.on('typing', async ({ to, isTyping, isGroup }) => {
    const payload = { from: username, to, isTyping, isGroup };
    if (isGroup) { await emitToGroupMembers(to, 'typing', payload, true); }
    else { const toId = await getUserId(to); if (toId) emitTo(toId, 'typing', payload); }
  });

  // ── Create Group ──────────────────────────────────────────────────────────
  socket.on('create-group', async ({ groupId, name, members }) => {
    try {
      await pool.query('INSERT INTO chat_groups (id,name,created_by) VALUES (?,?,?)', [groupId, name, myId]);
      const ids = [];
      for (const uname of members) { const uid = await getUserId(uname); if (uid) ids.push(uid); }
      ids.push(myId);
      for (const uid of [...new Set(ids)]) {
        await pool.query('INSERT IGNORE INTO group_members (group_id,user_id) VALUES (?,?)', [groupId, uid]);
      }
      const [memRows] = await pool.query('SELECT u.username FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=?', [groupId]);
      const memberNames = memRows.map(r => r.username);
      ids.forEach(uid => emitTo(uid, 'group-created', { groupId, name, createdBy: username, members: memberNames }));
    } catch (e) { console.error('create-group:', e); }
  });

  // ── Live Location ──────────────────────────────────────────────────────────
  socket.on('live-location-update', async ({ to, groupId, lat, lng, speed, heading, accuracy, sessionId }) => {
    await pool.query(
      `INSERT INTO live_locations (session_id,user_id,chat_user_id,group_id,latitude,longitude,speed,heading,accuracy,expires_at)
       VALUES (?,?,?,?,?,?,?,?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR))
       ON DUPLICATE KEY UPDATE latitude=?,longitude=?,speed=?,heading=?,accuracy=?,expires_at=DATE_ADD(NOW(), INTERVAL 1 HOUR)`,
      [sessionId, myId, to?await getUserId(to):null, groupId||null, lat,lng,speed||0,heading||0,accuracy||0,
       lat,lng,speed||0,heading||0,accuracy||0]
    );
    const payload = { from: username, userId: myId, lat, lng, speed: speed||0, heading: heading||0, accuracy: accuracy||0, sessionId };
    if (groupId) { await emitToGroupMembers(groupId, 'live-location-update', payload, true); }
    else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'live-location-update', payload); }
  });

  socket.on('stop-live-location', async ({ to, groupId, sessionId }) => {
    await pool.query('DELETE FROM live_locations WHERE session_id=? AND user_id=?', [sessionId, myId]);
    const payload = { from: username, userId: myId, sessionId };
    if (groupId) { await emitToGroupMembers(groupId, 'stop-live-location', payload, true); }
    else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'stop-live-location', payload); }
  });

  // ── Status events ──────────────────────────────────────────────────────────
  socket.on('status-posted', () => {
    pool.query('SELECT contact_id FROM contacts WHERE user_id=?', [myId]).then(([rows]) => {
      rows.forEach(r => emitTo(r.contact_id, 'status-new', { from: username, userId: myId }));
    });
  });

  // ════════════════════════════════════════════
  //  CALL SIGNALING  (FIXED)
  //  Key fix: server emits BOTH 'call-accepted' AND 'please-connect' to caller.
  //  Client now ONLY sends offer from 'please-connect' handler (not call-accepted).
  //  This eliminates the double-offer race condition.
  // ════════════════════════════════════════════
  socket.on('call-invite', async ({ to, callType, isGroup, groupId, roomId }) => {
    const callId = roomId || genId();
    if (!callRooms[callId]) callRooms[callId] = { members: new Set(), type: callType, callId };
    callRooms[callId].members.add(myId);
    if (isGroup && groupId) {
      await emitToGroupMembers(groupId, 'call-invite', { from: username, callType, isGroup: true, groupId, roomId: callId }, true);
    } else {
      const toId = await getUserId(to);
      if (!toId) return;
      const calleeInCall = [...Object.values(callRooms)].some(r => r.members.has(toId));
      emitTo(toId, 'call-invite', { from: username, callType, isGroup: false, roomId: callId, calleeBusy: calleeInCall });
      const histId = genId();
      await pool.query(
        'INSERT INTO call_history (id,caller_id,callee_id,call_type,is_group,status) VALUES (?,?,?,?,0,"missed")',
        [histId, myId, toId, callType]
      );
      callRooms[callId].histId = histId;
      callRooms[callId].callerId = myId;
    }
  });

  socket.on('call-accepted', async ({ to, callType, roomId }) => {
    const toId = await getUserId(to);
    if (!toId) return;
    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      const existing = [...room.members];
      room.members.add(myId);
      if (room.histId) await pool.query('UPDATE call_history SET status="answered",started_at=NOW() WHERE id=?', [room.histId]);
      // Send call-accepted to caller (for UI transition)
      emitTo(toId, 'call-accepted', { from: username, callType });
      // Send please-connect to all existing members so they initiate offer
      // (client sends offer ONLY from please-connect, not from call-accepted)
      for (const uid of existing) {
        if (uid !== myId) emitTo(uid, 'please-connect', { to: username });
      }
    } else {
      // Fallback: no room found, still notify caller
      emitTo(toId, 'call-accepted', { from: username, callType });
      emitTo(toId, 'please-connect', { to: username });
    }
  });

  socket.on('call-rejected', async ({ to, roomId }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-rejected', { from: username });
    if (roomId && callRooms[roomId]?.histId)
      await pool.query('UPDATE call_history SET status="rejected",ended_at=NOW() WHERE id=?', [callRooms[roomId].histId]);
  });

  socket.on('call-ended', async ({ to, isGroup, groupId, roomId, durationSeconds }) => {
    if (isGroup && groupId) await emitToGroupMembers(groupId, 'call-ended', { from: username }, true);
    else { const toId = await getUserId(to); if (toId) emitTo(toId, 'call-ended', { from: username }); }
    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      room.members.delete(myId);
      if (room.histId && durationSeconds > 0)
        await pool.query('UPDATE call_history SET ended_at=NOW(),duration_s=?,status="completed" WHERE id=?', [durationSeconds, room.histId]);
      if (room.members.size === 0) delete callRooms[roomId];
    }
    for (const rid in callRooms) callRooms[rid].members.delete(myId);
  });

  socket.on('add-to-call', async ({ to, callType, roomId }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-invite', { from: username, callType, isGroup: false, addToCall: true, roomId });
  });

  socket.on('offer',        async ({ to, offer })       => { const t=await getUserId(to); if(t) emitTo(t,'offer',       {from:username,offer}); });
  socket.on('answer',       async ({ to, answer })      => { const t=await getUserId(to); if(t) emitTo(t,'answer',      {from:username,answer}); });
  socket.on('icecandidate', async ({ to, candidate })   => { const t=await getUserId(to); if(t) emitTo(t,'icecandidate',{from:username,candidate}); });
  socket.on('toggle-media', async ({ to, kind, enabled })=> { const t=await getUserId(to); if(t) emitTo(t,'peer-toggle-media',{from:username,kind,enabled}); });

  socket.on('disconnect', async () => {
    const lastSeen = new Date();
    await pool.query('UPDATE users SET is_online=0,last_seen=? WHERE id=?', [lastSeen, myId]);
    await pool.query('DELETE FROM live_locations WHERE user_id=?', [myId]);
    delete onlineUsers[myId];
    delete socketToUser[socket.id];
    for (const rid in callRooms) callRooms[rid].members.delete(myId);
    socket.broadcast.emit('user-status', { userId: myId, username, isOnline: false, lastSeen: lastSeen.toISOString() });
  });
});

server.listen(PORT, () => console.log(`🚀 ChatApp v2.1 running on http://localhost:${PORT}`));