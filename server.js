// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server  —  server.js  PART 1 / 4
//  Setup · DB Init · Crypto · Upload · Auth · Users · Contacts · Profile
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

app.use(express.json({ limit: '4mb' }));
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

// ── DB Init ────────────────────────────────────────────────────────────────
async function initDb() {
  const q = async (sql) => { try { await pool.query(sql); } catch(e) { /* skip if already exists */ } };

  // Extend msg_type enum
  await q(`ALTER TABLE messages MODIFY COLUMN msg_type ENUM('text','image','file','audio','video','call','location','contact','voice_note','video_note') DEFAULT 'text'`);
  // Add reply_to column
  await q(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id VARCHAR(40) DEFAULT NULL`);
  // Add session_id to live_locations
  await q(`ALTER TABLE live_locations ADD COLUMN IF NOT EXISTS session_id VARCHAR(40) DEFAULT NULL`);
  await q(`ALTER TABLE live_locations ADD UNIQUE KEY IF NOT EXISTS uq_live_session (session_id)`);
  // Add two_step_hash to users
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_step_hash VARCHAR(255) DEFAULT NULL`);

  // FIXED: Message reactions table
  await q(`CREATE TABLE IF NOT EXISTS message_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(40) NOT NULL,
    user_id INT NOT NULL,
    emoji VARCHAR(20) NOT NULL DEFAULT '❤️',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_mr (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`);

  // FIXED: chat_settings with proper lock management
  await q(`CREATE TABLE IF NOT EXISTS chat_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_key VARCHAR(200) NOT NULL,
    disappearing_msgs VARCHAR(20) DEFAULT 'off',
    theme VARCHAR(30) DEFAULT 'default',
    is_locked TINYINT(1) DEFAULT 0,
    lock_pin_hash VARCHAR(255) DEFAULT NULL,
    is_muted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cs (user_id, chat_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`);

  // FIXED: message_status table — for delivered/seen per message per user
  await q(`CREATE TABLE IF NOT EXISTS message_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(40) NOT NULL,
    user_id INT NOT NULL,
    status ENUM('sent','delivered','seen') DEFAULT 'sent',
    delivered_at TIMESTAMP NULL,
    seen_at TIMESTAMP NULL,
    UNIQUE KEY uq_ms (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`);

  // FIXED: Add avatar_url to messages table for live avatar updates (optional)
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL`);

  // FIXED: Active call rooms persistence table (for reconnect)
  await q(`CREATE TABLE IF NOT EXISTS active_calls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(80) NOT NULL UNIQUE,
    call_type VARCHAR(10) DEFAULT 'audio',
    is_group TINYINT(1) DEFAULT 0,
    group_id VARCHAR(80) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL 4 HOUR)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS active_call_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(80) NOT NULL,
    user_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_acm (room_id, user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // Clean up expired calls on startup
  await q(`DELETE FROM active_calls WHERE expires_at < NOW()`);
  await q(`ALTER TABLE call_history ADD COLUMN IF NOT EXISTS deleted_for JSON DEFAULT NULL`);

  console.log('✅ DB schema verified');
}
initDb().catch(e => console.error('DB init error:', e.message));

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
  limits: { fileSize: 4 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/','video/','audio/','application/','text/'];
    cb(null, allowed.some(t => file.mimetype.startsWith(t)));
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

// ── Helper: resolve chat key to numeric user ID ────────────────────────────
async function resolvePrivateChatTarget(key) {
  const raw = key.slice(2);
  const asInt = parseInt(raw);
  if (!isNaN(asInt) && asInt.toString() === raw) return asInt;
  const [rows] = await pool.query('SELECT id FROM users WHERE username=?', [raw]);
  return rows[0]?.id || null;
}

// ── Helper: decrypt reply_to object ──────────────────────────────────────
function processReplyTo(rt) {
  if (!rt) return null;
  const obj = typeof rt === 'string' ? JSON.parse(rt) : rt;
  if (obj && obj.content && obj.content_iv) {
    obj.content = decrypt(obj.content, obj.content_iv);
  }
  return obj;
}
function processReactions(raw) {
  if (!raw) return [];
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

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
      `SELECT id,username,email,avatar_color,avatar_url,profile_pic,is_online,last_seen
       FROM users WHERE id!=? ORDER BY username ASC`, [req.user.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/users/:userId/common-groups', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT g.id,g.name,g.group_pic,
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
    `SELECT id,file_path,file_type,file_name,file_size,created_at
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
  rows.forEach(u => { u.avatarUrl = applyPrivacy(u, req.user.id, contactIds.includes(u.id)); });
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
  await pool.query('UPDATE users SET two_step_hash=?,two_step_pin=? WHERE id=?', [hash, hash, req.user.id]);
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
    const [rows] = await pool.query('SELECT profile_pic FROM users WHERE id=?', [req.user.id]);
    const oldPic = rows[0]?.profile_pic;
    if (oldPic) { const op = join(__dirname, 'public', oldPic); if (fs.existsSync(op)) try { fs.unlinkSync(op); } catch {} }
    // FIXED: Update both profile_pic and avatar_url columns
    await pool.query('UPDATE users SET profile_pic=?,avatar_url=? WHERE id=?', [fileUrl, fileUrl, req.user.id]);
    res.json({ url: fileUrl, name: file.originalname, size: finalSize, type: file.mimetype });
  } catch (e) { console.error('upload:', e); res.status(500).json({ error: 'Upload failed' }); }
});

app.post('/api/upload/media', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    let finalName = file.filename, finalSize = file.size;
    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('gif') && !req.query.raw) {
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

// ── Home ──────────────────────────────────────
app.get('/', (req, res) => 
  res.sendFile(join(__dirname, 'app', 'index.html'))
);
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server  —  server.js  PART 2 / 4
//  Messages · Chat Settings · Status · Block/Unblock · Call History
// ════════════════════════════════════════════════════════════════════════════

// Increase GROUP_CONCAT limit
pool.query("SET SESSION group_concat_max_len = 1000000").catch(()=>{});

// ══════════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════════

app.get('/api/messages/private/:targetId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const you = parseInt(req.params.targetId);
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.sender_id, m.receiver_id, m.content, m.content_iv,
             m.msg_type, m.file_path, m.file_name, m.file_size, m.file_type,
             m.is_edited, m.deleted_both, m.created_at, m.disappears_at, m.reply_to_id,
             u.username AS sender_name, u.avatar_color,
             COALESCE(ms.status, 'sent') AS msg_status,
             COALESCE((
               SELECT CONCAT('[', GROUP_CONCAT(
                 JSON_OBJECT('emoji', mr.emoji, 'userId', mr.user_id, 'username', ru.username)
               ORDER BY mr.id), ']')
               FROM message_reactions mr
               JOIN users ru ON ru.id = mr.user_id
               WHERE mr.message_id = m.id
             ), '[]') AS reactions,
             (SELECT JSON_OBJECT(
                'id', rm.id,
                'content', rm.content,
                'content_iv', rm.content_iv,
                'sender_name', rmu.username,
                'msg_type', rm.msg_type,
                'file_name', rm.file_name,
                'file_path', rm.file_path
              ) FROM messages rm
              JOIN users rmu ON rmu.id = rm.sender_id
              WHERE rm.id = m.reply_to_id
             ) AS reply_to
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      LEFT JOIN message_status ms ON ms.message_id = m.id AND ms.user_id = ?
      WHERE m.group_id IS NULL
        AND m.deleted_both = 0
        AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
        AND NOT JSON_CONTAINS(COALESCE(m.deleted_for, '[]'), JSON_ARRAY(?))
        AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
      ORDER BY m.created_at ASC
      LIMIT 200
    `, [me, me, you, you, me, JSON.stringify(me)]);

    // FIXED: When recipient fetches messages, mark all unread as delivered
    const unsentIds = rows
      .filter(r => r.sender_id !== me && (!r.msg_status || r.msg_status === 'sent'))
      .map(r => r.id);

    if (unsentIds.length > 0) {
      for (const msgId of unsentIds) {
        await pool.query(
          "INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status=IF(status='sent','delivered',status), delivered_at=IF(status='sent',NOW(),delivered_at)",
          [msgId, me]
        );
      }
      // Notify sender about delivery
      const [senderRows] = await pool.query(
        'SELECT DISTINCT sender_id FROM messages WHERE id IN (?)',
        [unsentIds]
      );
      senderRows.forEach(sr => {
        if (onlineUsers[sr.sender_id]) {
          io.to(onlineUsers[sr.sender_id]).emit('messages-delivered', { msgIds: unsentIds });
        }
      });
    }

    res.json(rows.map(r => ({
      ...r,
      content: r.content ? decrypt(r.content, r.content_iv) : null,
      reactions: processReactions(r.reactions),
      reply_to: processReplyTo(r.reply_to)
    })));
  } catch (err) {
    console.error('PRIVATE MSG ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/messages/group/:groupId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const gid = req.params.groupId;
  try {
    const [mem] = await pool.query(
      'SELECT id FROM group_members WHERE group_id=? AND user_id=?', [gid, me]
    );
    if (!mem.length) return res.status(403).json({ error: 'Not a member' });

    const [rows] = await pool.query(`
      SELECT m.id, m.sender_id, m.group_id, m.content, m.content_iv,
             m.msg_type, m.file_path, m.file_name, m.file_size, m.file_type,
             m.is_edited, m.created_at, m.disappears_at, m.reply_to_id,
             u.username AS sender_name, u.avatar_color,
             COALESCE((
               SELECT CONCAT('[', GROUP_CONCAT(
                 JSON_OBJECT('emoji', mr.emoji, 'userId', mr.user_id, 'username', ru.username)
               ORDER BY mr.id), ']')
               FROM message_reactions mr
               JOIN users ru ON ru.id = mr.user_id
               WHERE mr.message_id = m.id
             ), '[]') AS reactions,
             (SELECT JSON_OBJECT(
                'id', rm.id,
                'content', rm.content,
                'content_iv', rm.content_iv,
                'sender_name', rmu.username,
                'msg_type', rm.msg_type,
                'file_name', rm.file_name,
                'file_path', rm.file_path
              ) FROM messages rm
              JOIN users rmu ON rmu.id = rm.sender_id
              WHERE rm.id = m.reply_to_id
             ) AS reply_to
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.group_id = ?
        AND m.deleted_both = 0
        AND NOT JSON_CONTAINS(COALESCE(m.deleted_for, '[]'), JSON_ARRAY(?))
        AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
      ORDER BY m.created_at ASC
      LIMIT 200
    `, [gid, JSON.stringify(me)]);

    res.json(rows.map(r => ({
      ...r,
      content: r.content ? decrypt(r.content, r.content_iv) : null,
      reactions: processReactions(r.reactions),
      reply_to: processReplyTo(r.reply_to)
    })));
  } catch (err) {
    console.error('GROUP MSG ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

// ── Message Reactions API ──────────────────────────────────────────────────
app.post('/api/messages/:msgId/react', requireAuth, async (req, res) => {
  const { emoji } = req.body;
  try {
    if (emoji) {
      await pool.query(
        'INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?',
        [req.params.msgId, req.user.id, emoji, emoji]
      );
    } else {
      await pool.query(
        'DELETE FROM message_reactions WHERE message_id=? AND user_id=?',
        [req.params.msgId, req.user.id]
      );
    }
    const [reactions] = await pool.query(
      'SELECT mr.emoji, u.id AS userId, u.username FROM message_reactions mr JOIN users u ON u.id=mr.user_id WHERE mr.message_id=?',
      [req.params.msgId]
    );
    res.json({ ok: true, reactions });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── FIXED: Mark all messages as seen when user opens chat ─────────────────
app.post('/api/messages/mark-seen', requireAuth, async (req, res) => {
  const { fromUserId } = req.body;
  const me = req.user.id;
  try {
    // Get all unread messages from this sender
    const [msgs] = await pool.query(
      `SELECT m.id, m.sender_id FROM messages m
       WHERE m.sender_id = ? AND m.receiver_id = ? AND m.deleted_both = 0
       AND m.group_id IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM message_status ms
         WHERE ms.message_id = m.id AND ms.user_id = ? AND ms.status = 'seen'
       )`,
      [fromUserId, me, me]
    );

    if (msgs.length > 0) {
      const msgIds = msgs.map(m => m.id);
      for (const msgId of msgIds) {
        await pool.query(
          "INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()",
          [msgId, me]
        );
      }
      // Notify sender
      if (onlineUsers[fromUserId]) {
        io.to(onlineUsers[fromUserId]).emit('messages-seen', { msgIds, by: req.user.username });
      }
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Clear Chat ─────────────────────────────────────────────────────────────
app.delete('/api/chat/clear/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = decodeURIComponent(req.params.chatKey);
  try {
    if (key.startsWith('p:')) {
      const otherId = await resolvePrivateChatTarget(key);
      if (!otherId) return res.status(404).json({ error: 'User not found' });
      await pool.query(
        `UPDATE messages SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'), '$', ?)
         WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
           AND group_id IS NULL`,
        [me, me, otherId, otherId, me]
      );
    } else if (key.startsWith('g:')) {
      const groupId = key.slice(2);
      await pool.query(
        `UPDATE messages SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'), '$', ?)
         WHERE group_id=?`,
        [me, groupId]
      );
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Clear failed' }); }
});

// ── Export Chat ───────────────────────────────────────────────────────────
app.get('/api/chat/export/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = decodeURIComponent(req.params.chatKey);
  try {
    let rows = [];
    if (key.startsWith('p:')) {
      const otherId = await resolvePrivateChatTarget(key);
      if (!otherId) return res.status(404).json({ error: 'User not found' });
      const [r] = await pool.query(
        `SELECT m.*, u.username AS sender_name FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE ((m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?))
           AND m.deleted_both=0 AND m.group_id IS NULL
         ORDER BY m.created_at ASC`,
        [me, otherId, otherId, me]
      );
      rows = r;
    } else {
      const gid = key.slice(2);
      const [r] = await pool.query(
        `SELECT m.*, u.username AS sender_name FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.group_id=? AND m.deleted_both=0
         ORDER BY m.created_at ASC`,
        [gid]
      );
      rows = r;
    }
    const lines = rows.map(r => {
      const content = r.content
        ? decrypt(r.content, r.content_iv)
        : (r.file_name ? `[File: ${r.file_name}]` : '');
      const d = new Date(r.created_at);
      return `[${d.toLocaleString()}] ${r.sender_name}: ${content}`;
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="chat_export_${Date.now()}.txt"`);
    res.send(lines.join('\n'));
  } catch(e) { res.status(500).json({ error: 'Export failed: ' + e.message }); }
});

// ── Live Location ──────────────────────────────────────────────────────────
app.get('/api/live-location/:sessionId', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ll.*, u.username, u.avatar_color, u.profile_pic
       FROM live_locations ll JOIN users u ON u.id=ll.user_id
       WHERE ll.session_id=? AND ll.expires_at > NOW()`,
      [req.params.sessionId]
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/live-location/chat/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = decodeURIComponent(req.params.chatKey);
  try {
    let rows;
    if (key.startsWith('g:')) {
      const groupId = key.slice(2);
      [rows] = await pool.query(
        `SELECT ll.*, u.username, u.avatar_color FROM live_locations ll
         JOIN users u ON u.id=ll.user_id WHERE ll.group_id=? AND ll.expires_at > NOW()`,
        [groupId]
      );
    } else {
      const otherId = await resolvePrivateChatTarget(key);
      [rows] = await pool.query(
        `SELECT ll.*, u.username, u.avatar_color FROM live_locations ll
         JOIN users u ON u.id=ll.user_id
         WHERE ll.expires_at > NOW()
           AND ((ll.user_id=? AND ll.chat_user_id=?) OR (ll.user_id=? AND ll.chat_user_id=?))`,
        [me, otherId, otherId, me]
      );
    }
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════
//  CALL HISTORY
// ══════════════════════════════════════════════

app.get('/api/calls', requireAuth, async (req, res) => {
  const me = req.user.id;
  const { filter, from, to } = req.query; // filter: today|yesterday|week|month|year|custom
  
  let dateCondition = '';
  const now = new Date();
  
  if (filter === 'today') {
    dateCondition = `AND DATE(ch.started_at) = CURDATE()`;
  } else if (filter === 'yesterday') {
    dateCondition = `AND DATE(ch.started_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
  } else if (filter === 'week') {
    dateCondition = `AND ch.started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
  } else if (filter === 'month') {
    dateCondition = `AND MONTH(ch.started_at) = MONTH(NOW()) AND YEAR(ch.started_at) = YEAR(NOW())`;
  } else if (filter === 'year') {
    dateCondition = `AND YEAR(ch.started_at) = YEAR(NOW())`;
  } else if (filter === 'custom' && from && to) {
    dateCondition = `AND DATE(ch.started_at) BETWEEN '${from}' AND '${to}'`;
  }

  const [rows] = await pool.query(`
    SELECT ch.id, ch.caller_id, ch.callee_id, ch.group_id, ch.call_type,
           ch.is_group, ch.status, ch.started_at, ch.ended_at, ch.duration_s,
           caller.username AS caller_name, caller.avatar_color AS caller_color,
           COALESCE(caller.profile_pic, caller.avatar_url) AS caller_pic,
           callee.username AS callee_name, callee.avatar_color AS callee_color,
           COALESCE(callee.profile_pic, callee.avatar_url) AS callee_pic,
           cg.name AS group_name
    FROM call_history ch
    JOIN users caller ON caller.id = ch.caller_id
    LEFT JOIN users callee ON callee.id = ch.callee_id
    LEFT JOIN chat_groups cg ON cg.id = ch.group_id
    WHERE (ch.caller_id=? OR ch.callee_id=?)
      AND NOT JSON_CONTAINS(COALESCE(ch.deleted_for, '[]'), JSON_ARRAY(?))
      ${dateCondition}
    ORDER BY ch.started_at DESC LIMIT 200
  `, [me, me, me]);
  res.json(rows);
});

// ── DELETE individual call history entry (only for this user) ──────────────
app.delete('/api/calls/:callId', requireAuth, async (req, res) => {
  const me = req.user.id;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM call_history WHERE id=?', [req.params.callId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const call = rows[0];
    if (call.caller_id !== me && call.callee_id !== me)
      return res.status(403).json({ error: 'Forbidden' });
    const cur = call.deleted_for ? JSON.parse(call.deleted_for) : [];
    if (!cur.includes(me)) cur.push(me);
    await pool.query('UPDATE call_history SET deleted_for=? WHERE id=?',
      [JSON.stringify(cur), req.params.callId]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE all call history for this user ─────────────────────────────────
app.delete('/api/calls', requireAuth, async (req, res) => {
  const me = req.user.id;
  try {
    // Mark all calls as deleted for this user
    await pool.query(`
      UPDATE call_history 
      SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for, '[]'), '$', ?)
      WHERE (caller_id=? OR callee_id=?)
        AND NOT JSON_CONTAINS(COALESCE(deleted_for, '[]'), JSON_ARRAY(?))
    `, [me, me, me, me]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════
//  STATUS  (WhatsApp-like 24h)
// ══════════════════════════════════════════════

app.get('/api/status', requireAuth, async (req, res) => {
  const me = req.user.id;
  try {
    const [posts] = await pool.query(`
      SELECT sp.id, sp.user_id, sp.content_type, sp.content, sp.file_url, sp.caption,
             sp.bg_color, sp.text_color, sp.font_size, sp.expires_at, sp.created_at,
             u.username, u.avatar_color, u.profile_pic, u.avatar_url, u.priv_photo,
             (SELECT COUNT(*) FROM status_views sv WHERE sv.status_id=sp.id) AS view_count,
             (SELECT COUNT(*) FROM status_likes sl WHERE sl.status_id=sp.id) AS like_count,
             (SELECT 1 FROM status_views sv2 WHERE sv2.status_id=sp.id AND sv2.viewer_id=?) AS i_viewed,
             (SELECT emoji FROM status_likes sl2 WHERE sl2.status_id=sp.id AND sl2.user_id=?) AS my_reaction
      FROM status_posts sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.expires_at > NOW()
        AND (sp.user_id=? OR sp.user_id IN (SELECT contact_id FROM contacts WHERE user_id=?))
        AND sp.user_id NOT IN (SELECT blocked_id FROM blocked_users WHERE user_id=?)
        AND sp.user_id NOT IN (SELECT user_id FROM blocked_users WHERE blocked_id=?)
      ORDER BY sp.user_id=? DESC, sp.created_at DESC
    `, [me, me, me, me, me]);

    const userMap = {};
    posts.forEach(p => {
      if (!userMap[p.user_id]) {
        userMap[p.user_id] = {
          user_id: p.user_id,
          username: p.username,
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
    await pool.query(
      'DELETE FROM status_likes WHERE status_id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
  }
  res.json({ ok: true });
});

app.get('/api/status/:id/viewers', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.avatar_color, u.profile_pic, sv.viewed_at, sl.emoji AS reaction
     FROM status_views sv
     JOIN users u ON u.id = sv.viewer_id
     LEFT JOIN status_likes sl ON sl.status_id=sv.status_id AND sl.user_id=sv.viewer_id
     WHERE sv.status_id=?
       AND EXISTS(SELECT 1 FROM status_posts sp WHERE sp.id=? AND sp.user_id=?)
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
    `SELECT u.id, u.username, u.email, u.avatar_color, u.profile_pic
     FROM blocked_users bu JOIN users u ON u.id=bu.blocked_id WHERE bu.user_id=?`,
    [req.user.id]
  );
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
  const [r1] = await pool.query(
    'SELECT 1 FROM blocked_users WHERE user_id=? AND blocked_id=?',
    [req.user.id, req.params.userId]
  );
  const [r2] = await pool.query(
    'SELECT 1 FROM blocked_users WHERE user_id=? AND blocked_id=?',
    [req.params.userId, req.user.id]
  );
  res.json({ iBlockedThem: r1.length > 0, theyBlockedMe: r2.length > 0 });
});

// ══════════════════════════════════════════════
//  CHAT SETTINGS — FIXED: Proper lock management
// ══════════════════════════════════════════════

app.get('/api/chat-settings/:chatKey', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM chat_settings WHERE user_id=? AND chat_key=?',
    [req.user.id, req.params.chatKey]
  );
  res.json(rows[0] || { disappearing_msgs: 'off', theme: 'default', is_locked: 0, is_muted: 0 });
});

app.put('/api/chat-settings/:chatKey', requireAuth, async (req, res) => {
  const { disappearingMsgs, theme, isLocked, lockPin, isMuted } = req.body;
  let lockHash = null;
  // Only hash if we're locking AND a new pin was provided
  if (isLocked && lockPin) {
    lockHash = await bcrypt.hash(String(lockPin), 10);
  }
  await pool.query(
    `INSERT INTO chat_settings (user_id, chat_key, disappearing_msgs, theme, is_locked, lock_pin_hash, is_muted)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       disappearing_msgs = VALUES(disappearing_msgs),
       theme = VALUES(theme),
       is_locked = VALUES(is_locked),
       lock_pin_hash = IF(? IS NOT NULL, ?, IF(VALUES(is_locked)=0, NULL, lock_pin_hash)),
       is_muted = VALUES(is_muted)`,
    [
      req.user.id, req.params.chatKey,
      disappearingMsgs || 'off',
      theme || 'default',
      isLocked ? 1 : 0,
      lockHash,
      isMuted ? 1 : 0,
      lockHash, lockHash
    ]
  );
  res.json({ ok: true });
});

// FIXED: Verify PIN for locked chat
app.post('/api/chat-settings/:chatKey/verify-pin', requireAuth, async (req, res) => {
  const { pin } = req.body;
  const [rows] = await pool.query(
    'SELECT is_locked, lock_pin_hash FROM chat_settings WHERE user_id=? AND chat_key=?',
    [req.user.id, req.params.chatKey]
  );
  // Not locked or not found → valid
  if (!rows.length || !rows[0].is_locked) return res.json({ valid: true });
  if (!rows[0].lock_pin_hash) return res.json({ valid: true });
  const valid = await bcrypt.compare(String(pin), rows[0].lock_pin_hash);
  res.json({ valid });
});
// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server  —  server.js  PART 3 / 4
//  Socket.IO — Connection · Messages · Reactions · Groups · Live Location
//  FIXED: avatar broadcast, message delivery, mark-all-seen, call-hold
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════════════

const onlineUsers  = {};   // userId -> socketId
const socketToUser = {};   // socketId -> {id, username}
const callRooms    = {};   // roomId -> {members:Set, type, callId, histId, callerId}

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

  await pool.query('UPDATE users SET is_online=1, last_seen=NULL WHERE id=?', [myId]);
  socket.broadcast.emit('user-status', { userId: myId, username, isOnline: true });

  // Send current online list to newly connected socket
  const currentOnlineIds = Object.keys(onlineUsers).map(id => parseInt(id));
  socket.emit('online-users', currentOnlineIds);

  // FIXED: When user connects, deliver any pending 'sent' messages to them
  try {
    const [pendingMsgs] = await pool.query(
      `SELECT m.id, m.sender_id FROM messages m
       WHERE m.receiver_id = ? AND m.deleted_both = 0 AND m.group_id IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM message_status ms
         WHERE ms.message_id = m.id AND ms.user_id = ?
       )
       ORDER BY m.created_at ASC LIMIT 200`,
      [myId, myId]
    );

    if (pendingMsgs.length > 0) {
      const msgIds = pendingMsgs.map(m => m.id);
      // Update status to delivered in DB
      for (const msgId of msgIds) {
        await pool.query(
          "INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status=IF(status='sent','delivered',status), delivered_at=IF(status='sent',NOW(),delivered_at)",
          [msgId, myId]
        );
      }
      // Notify senders about delivery
      const senderGroups = {};
      pendingMsgs.forEach(m => {
        if (!senderGroups[m.sender_id]) senderGroups[m.sender_id] = [];
        senderGroups[m.sender_id].push(m.id);
      });
      Object.entries(senderGroups).forEach(([senderId, ids]) => {
        emitTo(parseInt(senderId), 'messages-delivered', { msgIds: ids });
      });
    }
  } catch(e) { console.error('pending delivery error:', e.message); }

  // ── Helper functions ─────────────────────────────────────────────────────
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
    const [members] = await pool.query(
      'SELECT user_id FROM group_members WHERE group_id=?', [groupId]
    );
    members.forEach(m => {
      if (excludeMe && m.user_id === myId) return;
      emitTo(m.user_id, event, data);
    });
  }
  async function ensureContact(a, b) {
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [a, b]);
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [b, a]);
  }
  async function getMessageReactions(msgId) {
    const [rows] = await pool.query(
      'SELECT mr.emoji, u.id AS userId, u.username FROM message_reactions mr JOIN users u ON u.id=mr.user_id WHERE mr.message_id=?',
      [msgId]
    );
    return rows;
  }

  // ── FIXED: Avatar updated broadcast ──────────────────────────────────────
  socket.on('avatar-updated', async ({ avatarUrl }) => {
    if (!avatarUrl) return;
    // Get all contacts of this user
    try {
      const [contacts] = await pool.query(
        'SELECT contact_id FROM contacts WHERE user_id=?', [myId]
      );
      contacts.forEach(c => {
        emitTo(c.contact_id, 'user-avatar-updated', { username, avatarUrl, userId: myId });
      });
    } catch(e) { console.error('avatar-updated error:', e.message); }
  });

  // ── Private Message ───────────────────────────────────────────────────────
  socket.on('private-message', async ({
    to, content, msgType, fileUrl, fileName, fileSize, fileType, msgId, replyToId
  }) => {
    const toId = await getUserId(to);
    if (!toId) return;

    const [blocked] = await pool.query(
      'SELECT 1 FROM blocked_users WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)',
      [myId, toId, toId, myId]
    );
    if (blocked.length) return socket.emit('message-blocked', { to });

    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };

    const [myCs]    = await pool.query(
      'SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?',
      [myId, `p:${to}`]
    );
    const [theirCs] = await pool.query(
      'SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?',
      [toId, `p:${username}`]
    );
    const dm = myCs[0]?.disappearing_msgs || theirCs[0]?.disappearing_msgs || 'off';
    let disappearsAt = null;
    if (dm !== 'off') {
      const hours = dm === '24h' ? 24 : dm === '7d' ? 168 : 720;
      disappearsAt = new Date(Date.now() + hours * 3600000);
    }

    await pool.query(
      'INSERT INTO messages (id,sender_id,receiver_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type,disappears_at,reply_to_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, myId, toId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null, disappearsAt, replyToId||null]
    );
    await ensureContact(myId, toId);

    const msg = {
      id, from: username, to,
      content: content||null,
      msgType: msgType||'text',
      fileUrl, fileName, fileSize, fileType,
      time: new Date().toISOString(),
      status: 'sent',
      disappearsAt,
      replyToId: replyToId||null
    };

    if (onlineUsers[toId]) {
      // Deliver immediately
      emitTo(toId, 'private-message', { ...msg, status: 'delivered' });
      await pool.query(
        "INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status='delivered', delivered_at=NOW()",
        [id, toId]
      );
      socket.emit('message-sent', { id, status: 'delivered' });
    } else {
      // Store as sent, will be delivered when user comes online
      socket.emit('message-sent', { id, status: 'sent' });
    }
  });

  // ── Group Message ──────────────────────────────────────────────────────────
  socket.on('group-message', async ({
    groupId, content, msgType, fileUrl, fileName, fileSize, fileType, msgId, replyToId
  }) => {
    const [mem] = await pool.query(
      'SELECT id FROM group_members WHERE group_id=? AND user_id=?', [groupId, myId]
    );
    if (!mem.length) return;

    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };

    await pool.query(
      'INSERT INTO messages (id,sender_id,group_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type,reply_to_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, myId, groupId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null, replyToId||null]
    );

    const msg = {
      id, from: username, groupId,
      content: content||null,
      msgType: msgType||'text',
      fileUrl, fileName, fileSize, fileType,
      time: new Date().toISOString(),
      replyToId: replyToId||null
    };
    await emitToGroupMembers(groupId, 'group-message', msg);
  });

  // ── Edit Message ───────────────────────────────────────────────────────────
  socket.on('edit-message', async ({ msgId, newContent, to, groupId }) => {
    const [msg] = await pool.query(
      'SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]
    );
    if (!msg.length || msg[0].msg_type !== 'text') return;
    const { enc, iv } = encrypt(newContent);
    await pool.query(
      'UPDATE messages SET content=?, content_iv=?, is_edited=1 WHERE id=?',
      [enc, iv, msgId]
    );
    const payload = { msgId, newContent, editedBy: username };
    socket.emit('message-edited', payload);
    if (groupId) {
      await emitToGroupMembers(groupId, 'message-edited', payload, true);
    } else if (to) {
      const toId = await getUserId(to);
      if (toId) emitTo(toId, 'message-edited', payload);
    }
  });

  // ── Delete Message ─────────────────────────────────────────────────────────
  socket.on('delete-message', async ({ msgId, deleteFor, to, groupId }) => {
    const [msg] = await pool.query(
      'SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]
    );
    if (!msg.length) return;
    if (deleteFor === 'everyone') {
      await pool.query('UPDATE messages SET deleted_both=1 WHERE id=?', [msgId]);
      if (msg[0].file_path) {
        const fp = join(__dirname, 'public', msg[0].file_path);
        if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch {}
      }
      const payload = { msgId, deleteFor: 'everyone' };
      socket.emit('message-deleted', payload);
      if (groupId) {
        await emitToGroupMembers(groupId, 'message-deleted', payload, true);
      } else if (to) {
        const toId = await getUserId(to);
        if (toId) emitTo(toId, 'message-deleted', payload);
      }
    } else {
      const cur = msg[0].deleted_for ? JSON.parse(msg[0].deleted_for) : [];
      if (!cur.includes(myId)) cur.push(myId);
      await pool.query(
        'UPDATE messages SET deleted_for=? WHERE id=?',
        [JSON.stringify(cur), msgId]
      );
      socket.emit('message-deleted', { msgId, deleteFor: 'me' });
    }
  });

  // ── React to Message ───────────────────────────────────────────────────────
  socket.on('react-message', async ({ msgId, emoji, to, groupId }) => {
    try {
      if (emoji) {
        await pool.query(
          'INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?',
          [msgId, myId, emoji, emoji]
        );
      } else {
        await pool.query(
          'DELETE FROM message_reactions WHERE message_id=? AND user_id=?',
          [msgId, myId]
        );
      }
      const reactions = await getMessageReactions(msgId);
      const payload = { msgId, reactions, by: username };
      socket.emit('message-reacted', payload);
      if (groupId) {
        await emitToGroupMembers(groupId, 'message-reacted', payload, true);
      } else if (to) {
        const toId = await getUserId(to);
        if (toId) emitTo(toId, 'message-reacted', payload);
      }
    } catch(e) { console.error('react-message:', e); }
  });

  // ── FIXED: message-seen — single message ──────────────────────────────────
  socket.on('message-seen', async ({ msgId, fromUser }) => {
    await pool.query(
      "INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()",
      [msgId, myId]
    );
    const fromId = await getUserId(fromUser);
    if (fromId) emitTo(fromId, 'message-seen', { msgId, by: username });
  });

  // ── FIXED: mark-all-seen — bulk mark when chat is opened ─────────────────
  socket.on('mark-all-seen', async ({ fromUser }) => {
    try {
      const fromId = await getUserId(fromUser);
      if (!fromId) return;

      const [msgs] = await pool.query(
        `SELECT m.id FROM messages m
         WHERE m.sender_id=? AND m.receiver_id=? AND m.deleted_both=0 AND m.group_id IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM message_status ms WHERE ms.message_id=m.id AND ms.user_id=? AND ms.status='seen'
         )`,
        [fromId, myId, myId]
      );

      if (msgs.length > 0) {
        const msgIds = msgs.map(m => m.id);
        for (const msgId of msgIds) {
          await pool.query(
            "INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()",
            [msgId, myId]
          );
        }
        // Notify sender
        emitTo(fromId, 'messages-seen', { msgIds, by: username });
      }
    } catch(e) { console.error('mark-all-seen:', e.message); }
  });

  // ── Typing ─────────────────────────────────────────────────────────────────
  socket.on('typing', async ({ to, isTyping, isGroup }) => {
    const payload = { from: username, to, isTyping, isGroup };
    if (isGroup) {
      await emitToGroupMembers(to, 'typing', payload, true);
    } else {
      const toId = await getUserId(to);
      if (toId) emitTo(toId, 'typing', payload);
    }
  });

  // ── Create Group ───────────────────────────────────────────────────────────
  socket.on('create-group', async ({ groupId, name, members }) => {
    try {
      await pool.query(
        'INSERT INTO chat_groups (id,name,created_by) VALUES (?,?,?)',
        [groupId, name, myId]
      );
      const ids = [];
      for (const uname of members) {
        const uid = await getUserId(uname);
        if (uid) ids.push(uid);
      }
      ids.push(myId);
      for (const uid of [...new Set(ids)]) {
        await pool.query(
          'INSERT IGNORE INTO group_members (group_id,user_id) VALUES (?,?)',
          [groupId, uid]
        );
      }
      const [memRows] = await pool.query(
        'SELECT u.username FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=?',
        [groupId]
      );
      const memberNames = memRows.map(r => r.username);
      ids.forEach(uid => emitTo(uid, 'group-created', {
        groupId, name, createdBy: username, members: memberNames
      }));
    } catch(e) { console.error('create-group:', e); }
  });

  // ── Live Location ──────────────────────────────────────────────────────────
  socket.on('live-location-update', async ({
    to, groupId, lat, lng, speed, heading, accuracy, sessionId
  }) => {
    const toIdResolved = to ? await getUserId(to) : null;
    try {
      await pool.query(
        `INSERT INTO live_locations (session_id,user_id,chat_user_id,group_id,latitude,longitude,speed,heading,accuracy,expires_at)
         VALUES (?,?,?,?,?,?,?,?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR))
         ON DUPLICATE KEY UPDATE
           latitude=?, longitude=?, speed=?, heading=?, accuracy=?,
           expires_at=DATE_ADD(NOW(), INTERVAL 1 HOUR)`,
        [
          sessionId, myId, toIdResolved||null, groupId||null,
          lat, lng, speed||0, heading||0, accuracy||0,
          lat, lng, speed||0, heading||0, accuracy||0
        ]
      );
    } catch(e) { console.error('live-loc insert:', e.message); }

    const payload = {
      from: username, userId: myId,
      lat, lng, speed: speed||0, heading: heading||0, accuracy: accuracy||0,
      sessionId
    };
    if (groupId) {
      await emitToGroupMembers(groupId, 'live-location-update', payload, true);
    } else if (to) {
      if (toIdResolved) emitTo(toIdResolved, 'live-location-update', payload);
    }
  });

  socket.on('stop-live-location', async ({ to, groupId, sessionId }) => {
    await pool.query(
      'DELETE FROM live_locations WHERE session_id=? AND user_id=?',
      [sessionId, myId]
    );
    const payload = { from: username, userId: myId, sessionId };
    if (groupId) {
      await emitToGroupMembers(groupId, 'stop-live-location', payload, true);
    } else if (to) {
      const toId = await getUserId(to);
      if (toId) emitTo(toId, 'stop-live-location', payload);
    }
  });

  // ── Status events ──────────────────────────────────────────────────────────
  socket.on('status-posted', () => {
    pool.query('SELECT contact_id FROM contacts WHERE user_id=?', [myId])
      .then(([rows]) => {
        rows.forEach(r => emitTo(r.contact_id, 'status-new', { from: username, userId: myId }));
      });
  });
  // ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server  —  server.js  PART 4 / 4
//  Socket.IO — Calls · WebRTC Signaling · Disconnect · Server Start
//  FIXED: hold/resume, page-refresh rejoin, call room persistence
// ════════════════════════════════════════════════════════════════════════════

  // ════════════════════════════════════════════
  //  CALL SIGNALING
  // ════════════════════════════════════════════

socket.on('call-invite', async ({ to, callType, isGroup, groupId, roomId }) => {
  // Block check for 1:1 calls
  if (!isGroup && to) {
    const toId = await getUserId(to);
    if (toId) {
      const [blocked] = await pool.query(
        'SELECT 1 FROM blocked_users WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)',
        [myId, toId, toId, myId]
      );
      if (blocked.length) {
        socket.emit('call-blocked', { to });
        return;
      }
    }
  }
  
  const callId = roomId || genId();
  if (!callRooms[callId]) {
    callRooms[callId] = { members: new Set(), type: callType, callId };
  }
  callRooms[callId].members.add(myId);
  

    // Save to DB for reconnect
    try {
      await pool.query(
        'INSERT INTO active_calls (room_id,call_type,is_group,group_id) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE call_type=VALUES(call_type)',
        [callId, callType, isGroup?1:0, groupId||null]
      );
      await pool.query(
        'INSERT IGNORE INTO active_call_members (room_id,user_id,username) VALUES (?,?,?)',
        [callId, myId, username]
      );
    } catch(e) {}

    if (isGroup && groupId) {
      await emitToGroupMembers(groupId, 'call-invite', {
        from: username, callType, isGroup: true, groupId, roomId: callId
      }, true);
    } else {
      const toId = await getUserId(to);
      if (!toId) return;
      const calleeInCall = [...Object.values(callRooms)].some(r => r.members.has(toId));
      emitTo(toId, 'call-invite', {
        from: username, callType, isGroup: false,
        roomId: callId, calleeBusy: calleeInCall
      });
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

    // Save member
    try {
      await pool.query(
        'INSERT IGNORE INTO active_call_members (room_id,user_id,username) VALUES (?,?,?)',
        [roomId, myId, username]
      );
    } catch(e) {}

    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      const existing = [...room.members];
      room.members.add(myId);
      if (room.histId) {
        await pool.query(
          'UPDATE call_history SET status="answered", started_at=NOW() WHERE id=?',
          [room.histId]
        );
      }
      emitTo(toId, 'call-accepted', { from: username, callType });
      for (const uid of existing) {
        if (uid !== myId) emitTo(uid, 'please-connect', { to: username });
      }
    } else {
      emitTo(toId, 'call-accepted', { from: username, callType });
      emitTo(toId, 'please-connect', { to: username });
    }
  });

  socket.on('call-rejected', async ({ to, roomId }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-rejected', { from: username });
    if (roomId && callRooms[roomId]?.histId) {
      await pool.query(
        'UPDATE call_history SET status="rejected", ended_at=NOW() WHERE id=?',
        [callRooms[roomId].histId]
      );
    }
  });

  socket.on('call-ended', async ({ to, isGroup, groupId, roomId, durationSeconds }) => {
    if (isGroup && groupId) {
      await emitToGroupMembers(groupId, 'call-ended', { from: username }, true);
    } else {
      const toId = await getUserId(to);
      if (toId) emitTo(toId, 'call-ended', { from: username });
    }
    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      room.members.delete(myId);
      if (room.histId && durationSeconds > 0) {
        await pool.query(
          'UPDATE call_history SET ended_at=NOW(), duration_s=?, status="completed" WHERE id=?',
          [durationSeconds, room.histId]
        );
      }
      if (room.members.size === 0) {
        delete callRooms[roomId];
        // Clean up DB
        try {
          await pool.query('DELETE FROM active_call_members WHERE room_id=?', [roomId]);
          await pool.query('DELETE FROM active_calls WHERE room_id=?', [roomId]);
        } catch(e) {}
      }
    }
    // Remove from all rooms
    for (const rid in callRooms) callRooms[rid].members.delete(myId);
    // Remove from DB
    try {
      await pool.query('DELETE FROM active_call_members WHERE room_id=? AND user_id=?', [roomId||'', myId]);
    } catch(e) {}
  });

  // FIXED: Hold call event
  socket.on('call-hold', async ({ to, onHold }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-hold', { from: username, onHold });
  });

  socket.on('add-to-call', async ({ to, callType, roomId }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-invite', {
      from: username, callType, isGroup: false, addToCall: true, roomId
    });
  });

  // FIXED: Rejoin call after page refresh
  socket.on('rejoin-call', async ({ roomId, callType }) => {
    if (!roomId) return;
    // Check if room exists
    if (callRooms[roomId]) {
      callRooms[roomId].members.add(myId);
    } else {
      // Check DB
      try {
        const [roomRows] = await pool.query(
          'SELECT * FROM active_calls WHERE room_id=?', [roomId]
        );
        if (roomRows.length > 0) {
          callRooms[roomId] = {
            members: new Set([myId]),
            type: callType,
            callId: roomId
          };
        } else {
          return; // Room no longer exists
        }
      } catch(e) { return; }
    }

    // Notify other members in room to reconnect
    try {
      const [members] = await pool.query(
        'SELECT user_id, username FROM active_call_members WHERE room_id=? AND user_id!=?',
        [roomId, myId]
      );
      members.forEach(m => {
        emitTo(m.user_id, 'call-peer-reconnect', {
          from: username, callType, roomId
        });
      });
    } catch(e) {}
  });

  // FIXED: call-peer-reconnect forward
  socket.on('call-peer-reconnect', async ({ to, callType, roomId }) => {
    const toId = await getUserId(to);
    if (toId) emitTo(toId, 'call-peer-reconnect', { from: username, callType, roomId });
  });

  // ── WebRTC Signaling ───────────────────────────────────────────────────────
  socket.on('offer', async ({ to, offer }) => {
    const t = await getUserId(to);
    if (t) emitTo(t, 'offer', { from: username, offer });
  });

  socket.on('answer', async ({ to, answer }) => {
    const t = await getUserId(to);
    if (t) emitTo(t, 'answer', { from: username, answer });
  });

  socket.on('icecandidate', async ({ to, candidate }) => {
    const t = await getUserId(to);
    if (t) emitTo(t, 'icecandidate', { from: username, candidate });
  });

  socket.on('toggle-media', async ({ to, kind, enabled }) => {
    const t = await getUserId(to);
    if (t) emitTo(t, 'peer-toggle-media', { from: username, kind, enabled });
  });

  socket.on('please-connect', async ({ to }) => {
    const t = await getUserId(to);
    if (t) emitTo(t, 'please-connect', { to: username });
  });
  socket.on('block-user', async ({ blockedUsername }) => {
    const blockedId = await getUserId(blockedUsername);
    if (blockedId) {
      // Notify blocked user — hide blocker's info
      emitTo(blockedId, 'you-were-blocked', { 
        by: username, 
        byId: myId,
        // Force remove avatar, online status from blocked user's view
        hideAvatar: true,
        hideOnline: true,
        hideStatus: true
      });
      // Notify blocker — update their UI
      socket.emit('block-action', { blockedUsername, blockedId, action: 'blocked' });
    }
  });

  socket.on('unblock-user', async ({ unblockedUsername }) => {
    const unblockedId = await getUserId(unblockedUsername);
    if (unblockedId) {
      emitTo(unblockedId, 'you-were-unblocked', { by: username, byId: myId });
      socket.emit('block-action', { unblockedUsername, unblockedId, action: 'unblocked' });
    }
  });
  // ── Disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    const lastSeen = new Date();
    try {
      await pool.query(
        'UPDATE users SET is_online=0, last_seen=? WHERE id=?',
        [lastSeen, myId]
      );
      await pool.query(
        'DELETE FROM live_locations WHERE user_id=?',
        [myId]
      );
    } catch(e) {}

    delete onlineUsers[myId];
    delete socketToUser[socket.id];

    // Remove from call rooms
    for (const rid in callRooms) {
      callRooms[rid].members.delete(myId);
      if (callRooms[rid].members.size === 0) {
        delete callRooms[rid];
      }
    }

    socket.broadcast.emit('user-status', {
      userId: myId,
      username,
      isOnline: false,
      lastSeen: lastSeen.toISOString()
    });

    // FIXED: When user disconnects, check if they had pending messages
    // These will be delivered on next connect via the pending delivery logic above
  });

}); // end io.on('connection')

// ══════════════════════════════════════════════
//  START SERVER
// ══════════════════════════════════════════════

server.listen(PORT, () => {
  console.log(`🚀 ChatApp v4.0 running on http://localhost:${PORT}`);
  console.log(`   Features: avatar live update, message delivery, chat lock fix, call hold/resume`);
});