// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Server — server.js (UPDATED: socket rooms, realtime ban, online fix, ads budget)
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
import adminRouter, { setPool, setIo as setAdminIo, ADMIN_JWT_SECRET } from './public/js/admin.js';
import userBanAdsRouter, {
  setBanPool,
  setBanIo,
  initBanAdsTables,
  handleBanSocket,
  runAdsBudgetCycle
} from './public/js/user-ban-ads.js';

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

// ── Inject pool + io into admin router ───────────────────────────────────
setPool(pool);
setAdminIo(io); // Give admin router access to Socket.IO for realtime ban/unban
setBanPool(pool);
setBanIo(io);

// ── Mount Admin Router ─────────────────────────────────────────────────────
app.use('/admin-api', adminRouter);
app.use('/api', userBanAdsRouter);

// ── Admin Panel HTML page ─────────────────────────────────────────────────
app.get('/admin', (req, res) =>
  res.sendFile(join(__dirname, 'app', 'admin.html'))
);
app.get('/ban', (req, res) =>
  res.sendFile(join(__dirname, 'app', 'ban.html'))
);

// ── DB Init ────────────────────────────────────────────────────────────────
async function initDb() {
  const q = async (sql) => { try { await pool.query(sql); } catch(e) { /* skip if already exists */ } };

  await q(`ALTER TABLE messages MODIFY COLUMN msg_type ENUM('text','image','file','audio','video','call','location','contact','voice_note','video_note') DEFAULT 'text'`);
  await q(`ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id VARCHAR(40) DEFAULT NULL`);
  await q(`ALTER TABLE live_locations ADD COLUMN IF NOT EXISTS session_id VARCHAR(40) DEFAULT NULL`);
  await q(`ALTER TABLE live_locations ADD UNIQUE KEY IF NOT EXISTS uq_live_session (session_id)`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_step_hash VARCHAR(255) DEFAULT NULL`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status ENUM('active','banned','suspended','pending') DEFAULT 'active'`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP NULL`);

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

  await q(`ALTER TABLE call_history ADD COLUMN IF NOT EXISTS deleted_for JSON DEFAULT NULL`);

  // Admin tables
  await q(`CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superadmin','admin','moderator') DEFAULT 'admin',
    avatar_url VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    permissions JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try {
    const [existing] = await pool.query('SELECT id FROM admin_users WHERE email=?', ['admin@chatapp.com']);
    if (!existing.length) {
      const hash = await bcrypt.hash('Admin@123456', 12);
      await pool.query(
        'INSERT INTO admin_users (username,email,password_hash,role,permissions) VALUES (?,?,?,?,?)',
        ['superadmin', 'admin@chatapp.com', hash, 'superadmin',
         JSON.stringify({manage_users:true,manage_ads:true,manage_roles:true,view_reports:true,manage_api_keys:true,manage_settings:true,delete_users:true,ban_users:true})]
      );
      console.log('✅ Default superadmin: admin@chatapp.com / Admin@123456');
    }
  } catch(e) {}

  await q(`CREATE TABLE IF NOT EXISTS user_bans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    banned_by INT NOT NULL,
    reason TEXT DEFAULT NULL,
    ban_type ENUM('temporary','permanent') DEFAULT 'permanent',
    banned_until TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lifted_at TIMESTAMP NULL,
    lifted_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_by) REFERENCES admin_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS unban_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    appeal_message TEXT DEFAULT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    review_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    ad_type ENUM('banner','interstitial','status','story','chat','notification','popup') DEFAULT 'banner',
    media_url VARCHAR(500) DEFAULT NULL,
    media_type ENUM('image','video','gif','html') DEFAULT 'image',
    cta_text VARCHAR(100) DEFAULT 'Learn More',
    cta_url VARCHAR(500) DEFAULT NULL,
    target_url VARCHAR(500) DEFAULT NULL,
    placement_status TINYINT(1) DEFAULT 1,
    placement_chat TINYINT(1) DEFAULT 0,
    placement_calls TINYINT(1) DEFAULT 0,
    placement_home TINYINT(1) DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT 0.00,
    daily_budget DECIMAL(10,2) DEFAULT 0.00,
    cost_per_click DECIMAL(10,4) DEFAULT 0.0000,
    cost_per_impression DECIMAL(10,4) DEFAULT 0.0000,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_gender ENUM('all','male','female') DEFAULT 'all',
    target_age_min INT DEFAULT 13,
    target_age_max INT DEFAULT 65,
    target_location VARCHAR(500) DEFAULT NULL,
    target_interests TEXT DEFAULT NULL,
    bg_color VARCHAR(20) DEFAULT '#1a2433',
    text_color VARCHAR(20) DEFAULT '#ffffff',
    border_color VARCHAR(20) DEFAULT '#00bfa5',
    advertiser_name VARCHAR(200) DEFAULT NULL,
    advertiser_logo VARCHAR(500) DEFAULT NULL,
    advertiser_email VARCHAR(255) DEFAULT NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    spend DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active','paused','ended','draft','pending_review') DEFAULT 'draft',
    priority INT DEFAULT 1,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS ad_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    user_id INT NULL,
    event_type ENUM('impression','click','dismiss') DEFAULT 'impression',
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    placement VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
    INDEX idx_ad_events_ad (ad_id),
    INDEX idx_ad_events_date (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(200) NOT NULL,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(128) NOT NULL,
    owner_name VARCHAR(200) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    permissions JSON DEFAULT NULL,
    max_users INT DEFAULT 100,
    current_users INT DEFAULT 0,
    rate_limit_per_min INT DEFAULT 60,
    rate_limit_per_day INT DEFAULT 10000,
    total_requests BIGINT DEFAULT 0,
    last_used_at TIMESTAMP NULL,
    status ENUM('active','suspended','expired','revoked') DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS admin_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) DEFAULT NULL,
    target_id VARCHAR(100) DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_admin_log_date (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  await q(`CREATE TABLE IF NOT EXISTS admin_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    permissions JSON NOT NULL,
    color VARCHAR(20) DEFAULT '#00bfa5',
    is_system TINYINT(1) DEFAULT 0,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try {
    const [r] = await pool.query('SELECT COUNT(*) as c FROM admin_roles');
    if (!r[0].c) {
      await pool.query(`INSERT INTO admin_roles (role_name,display_name,description,permissions,color,is_system) VALUES
        ('superadmin','Super Admin','Full system access','${JSON.stringify({manage_users:true,manage_ads:true,manage_roles:true,view_reports:true,manage_api_keys:true,manage_settings:true,delete_users:true,ban_users:true})}','#e53e3e',1),
        ('admin','Admin','General admin access','${JSON.stringify({manage_users:true,manage_ads:true,view_reports:true,ban_users:true})}','#f6ad55',1),
        ('moderator','Moderator','Content moderation','${JSON.stringify({manage_users:true,view_reports:true})}','#00bfa5',1)`
      );
    }
  } catch(e) {}

  await q(`CREATE TABLE IF NOT EXISTS app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    setting_type ENUM('string','number','boolean','json') DEFAULT 'string',
    description VARCHAR(500) DEFAULT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  try {
    const [s] = await pool.query('SELECT COUNT(*) as c FROM app_settings');
    if (!s[0].c) {
      await pool.query(`INSERT INTO app_settings (setting_key,setting_value,setting_type,description) VALUES
        ('app_name','ChatApp','string','Application name'),
        ('max_file_size_mb','50','number','Max file upload size in MB'),
        ('registration_enabled','true','boolean','Allow new user registrations'),
        ('ads_enabled','true','boolean','Enable ads system'),
        ('maintenance_mode','false','boolean','Enable maintenance mode'),
        ('default_message_retention_days','365','number','Days to keep messages'),
        ('max_group_members','256','number','Max members per group')`
      );
    }
  } catch(e) {}

  await q(`CREATE OR REPLACE VIEW admin_stats AS
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE account_status='active' OR account_status IS NULL) AS active_users,
      (SELECT COUNT(*) FROM users WHERE account_status='banned') AS banned_users,
      (SELECT COUNT(*) FROM users WHERE is_online=1) AS online_users,
      (SELECT COUNT(*) FROM users WHERE DATE(created_at)=CURDATE()) AS new_users_today,
      (SELECT COUNT(*) FROM messages WHERE DATE(created_at)=CURDATE()) AS messages_today,
      (SELECT COUNT(*) FROM messages) AS total_messages,
      (SELECT COUNT(*) FROM chat_groups) AS total_groups,
      (SELECT COUNT(*) FROM ads WHERE status='active') AS active_ads,
      (SELECT COUNT(*) FROM api_keys WHERE status='active') AS active_api_keys,
      (SELECT COUNT(*) FROM unban_requests WHERE status='pending') AS pending_unban_requests`);

  await q(`DELETE FROM active_calls WHERE expires_at < NOW()`);

  // ── CRITICAL: Reset all online status on server start ────────────────
  await pool.query('UPDATE users SET is_online=0, last_seen=NOW() WHERE is_online=1');
  console.log('✅ Online status reset on startup');

  console.log('✅ DB schema verified');
}
initDb().catch(e => console.error('DB init error:', e.message));
initBanAdsTables(pool).catch(e => console.error('Ban/Ads init error:', e.message));

// ── Ad Auto-Management (check every hour) ─────────────────────────────────
setInterval(async () => {
  try {
    // Auto-end expired ads
    const [expired] = await pool.query(
      `UPDATE ads SET status='ended' WHERE status='active' AND end_date < CURDATE()`
    );
    if (expired.affectedRows > 0) {
      console.log(`⏰ Auto-ended ${expired.affectedRows} expired ad(s)`);
      io.emit('ad-updated', { type: 'auto-ended' });
    }

    // Auto-end over-budget ads
    const [overBudget] = await pool.query(
      `UPDATE ads SET status='ended' WHERE status='active' AND budget > 0 AND spend >= budget`
    );
    if (overBudget.affectedRows > 0) {
      console.log(`💰 Auto-ended ${overBudget.affectedRows} over-budget ad(s)`);
      io.emit('ad-updated', { type: 'budget-exceeded' });
    }

    // Auto-expire API keys
    await pool.query(
      `UPDATE api_keys SET status='expired' WHERE status='active' AND expires_at IS NOT NULL AND expires_at < NOW()`
    );
    await runAdsBudgetCycle(pool, io);
  } catch (e) { console.error('ad auto-management error:', e.message); }
}, 60 * 60 * 1000); // Every hour

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
function csvList(value) {
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean);
}
function getIceServers(user) {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];
  const turnUrls = csvList(process.env.TURN_URLS || process.env.TURN_URL);
  if (!turnUrls.length) return iceServers;
  let username = process.env.TURN_USERNAME || process.env.TURN_USER || '';
  let credential = process.env.TURN_CREDENTIAL || process.env.TURN_PASSWORD || '';
  if (process.env.TURN_SECRET) {
    const ttl = Math.max(300, parseInt(process.env.TURN_TTL_SECONDS || '3600', 10));
    const expires = Math.floor(Date.now() / 1000) + ttl;
    username = `${expires}:${user?.username || user?.id || 'user'}`;
    credential = crypto.createHmac('sha1', process.env.TURN_SECRET).update(username).digest('base64');
  }
  if (username && credential) {
    iceServers.push({ urls: turnUrls.length === 1 ? turnUrls[0] : turnUrls, username, credential });
  }
  return iceServers;
}
async function resolvePrivateChatTarget(key) {
  const raw = key.slice(2);
  const asInt = parseInt(raw);
  if (!isNaN(asInt) && asInt.toString() === raw) return asInt;
  const [rows] = await pool.query('SELECT id FROM users WHERE username=?', [raw]);
  return rows[0]?.id || null;
}
function processReplyTo(rt) {
  if (!rt) return null;
  const obj = typeof rt === 'string' ? JSON.parse(rt) : rt;
  if (obj && obj.content && obj.content_iv) obj.content = decrypt(obj.content, obj.content_iv);
  return obj;
}
function processReactions(raw) {
  if (!raw) return [];
  try { const arr = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(arr) ? arr : []; }
  catch { return []; }
}

// ══════════════════════════════════════════════
//  AUTH — with BAN check + rich error response
// ══════════════════════════════════════════════

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const [setting] = await pool.query("SELECT setting_value FROM app_settings WHERE setting_key='registration_enabled'");
    if (setting.length && setting[0].setting_value === 'false')
      return res.status(403).json({ error: 'Registration is currently disabled' });
  } catch {}
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

    // ── BANNED CHECK ──────────────────────────────────────────────────────
    if (user.account_status === 'banned') {
      // Check if temp ban has expired
      if (user.banned_until && new Date(user.banned_until) < new Date()) {
        await pool.query('UPDATE users SET account_status="active", ban_reason=NULL, banned_until=NULL WHERE id=?', [user.id]);
      } else {
        // Check if unban request already submitted
        const [unbanReq] = await pool.query(
          'SELECT id, status FROM unban_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
          [user.id]
        );
        return res.status(403).json({
          error: 'account_banned',
          banned: true,
          userId: user.id,
          username: user.username,
          email: user.email,
          banReason: user.ban_reason || 'Your account has been suspended.',
          bannedUntil: user.banned_until || null,
          unbanRequestStatus: unbanReq.length ? unbanReq[0].status : null,
          unbanRequestId: unbanReq.length ? unbanReq[0].id : null
        });
      }
    }

    if (user.account_status === 'suspended') {
      const [unbanReq] = await pool.query(
        'SELECT id, status FROM unban_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
      return res.status(403).json({
        error: 'account_suspended',
        banned: true,
        userId: user.id,
        username: user.username,
        email: user.email,
        banReason: user.ban_reason || 'Your account is suspended.',
        bannedUntil: user.banned_until || null,
        unbanRequestStatus: unbanReq.length ? unbanReq[0].status : null,
        unbanRequestId: unbanReq.length ? unbanReq[0].id : null
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const avatarUrl = user.profile_pic || user.avatar_url || null;
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatar_color, avatarUrl, phone: user.phone, about: user.about } });
  } catch (e) { console.error('login:', e); res.status(500).json({ error: 'Server error' }); }
});

// ── Public: Submit Unban Request ──────────────────────────────────────────
app.post('/api/unban-request', async (req, res) => {
  const { userId, email, username, reason, appealMessage } = req.body;
  if (!userId || !reason) return res.status(400).json({ error: 'userId and reason required' });
  try {
    const [existing] = await pool.query('SELECT id, status FROM unban_requests WHERE user_id=? AND status="pending"', [userId]);
    if (existing.length) return res.status(409).json({
      error: 'You already have a pending request',
      requestId: existing[0].id,
      status: existing[0].status
    });
    const [user] = await pool.query('SELECT account_status FROM users WHERE id=?', [userId]);
    if (!user.length || (user[0].account_status !== 'banned' && user[0].account_status !== 'suspended'))
      return res.status(400).json({ error: 'Account is not banned' });
    const [result] = await pool.query(
      'INSERT INTO unban_requests (user_id,email,username,reason,appeal_message) VALUES (?,?,?,?,?)',
      [userId, email || '', username || '', reason, appealMessage || null]
    );
    io.to('admin:live').emit('admin-unban-request', { userId: parseInt(userId), username, email, requestId: result.insertId });
    res.json({ ok: true, requestId: result.insertId, message: 'Your request has been submitted. Admin will review it soon.' });
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// ── Public: Check unban request status ───────────────────────────────────
app.get('/api/unban-request/status/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, status, reason, review_note, created_at, reviewed_at FROM unban_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
      [req.params.userId]
    );
    if (!rows.length) return res.json({ hasRequest: false });
    res.json({ hasRequest: true, ...rows[0] });
  } catch { res.json({ hasRequest: false }); }
});

// ── Public: Get active ads for user app ──────────────────────────────────
app.get('/api/ads', async (req, res) => {
  const { placement = 'status' } = req.query;
  const validPlacements = ['status', 'chat', 'calls', 'home'];
  const placementCol = `placement_${placement}`;
  if (!validPlacements.includes(placement)) return res.json([]);
  try {
    const [ads] = await pool.query(`
      SELECT id, title, description, ad_type, media_url, media_type, cta_text, cta_url,
             bg_color, text_color, border_color, advertiser_name, advertiser_logo, priority
      FROM ads
      WHERE status='active' AND ${placementCol}=1
        AND start_date <= CURDATE() AND end_date >= CURDATE()
      ORDER BY priority DESC, RAND() LIMIT 3
    `);
    res.json(ads);
  } catch { res.json([]); }
});

// ── Track ad event + auto-deduct budget ──────────────────────────────────
app.post('/api/ads/:id/event', async (req, res) => {
  const { eventType = 'impression', placement } = req.body;
  const userId = req.body.userId || null;
  try {
    await pool.query('INSERT INTO ad_events (ad_id,user_id,event_type,placement,ip_address) VALUES (?,?,?,?,?)',
      [req.params.id, userId, eventType, placement, req.ip]);

    // Deduct spend from budget
    if (eventType === 'impression') {
      await pool.query(
        'UPDATE ads SET impressions=impressions+1, spend=spend+cost_per_impression WHERE id=?',
        [req.params.id]
      );
    }
    if (eventType === 'click') {
      await pool.query(
        'UPDATE ads SET clicks=clicks+1, spend=spend+cost_per_click WHERE id=?',
        [req.params.id]
      );
    }

    // Auto-end if budget exceeded
    const [updated] = await pool.query(
      `UPDATE ads SET status='ended' WHERE id=? AND status='active' AND budget > 0 AND spend >= budget`,
      [req.params.id]
    );
    if (updated.affectedRows > 0) {
      io.emit('ad-updated', { type: 'budget-exceeded', adId: parseInt(req.params.id) });
    }

    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
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
    const [blocked] = await pool.query(
      'SELECT 1 FROM blocked_users WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)',
      [req.user.id, u.id, u.id, req.user.id]
    );
    if (blocked.length) {
      u.avatarUrl = null; u.about = null; u.last_seen = null; u.is_online = 0;
      return res.json(u);
    }
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
     WHERE msg_type IN ('image','video','file') AND deleted_both=0
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
        await sharp(file.path).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(outPath);
        const cs = fs.statSync(outPath).size;
        if (cs < file.size) { fs.unlinkSync(file.path); finalName = outName; finalSize = cs; }
        else fs.unlinkSync(outPath);
      } catch {}
    }
    const fileUrl = `/uploads/${finalName}`;
    const [rows] = await pool.query('SELECT profile_pic FROM users WHERE id=?', [req.user.id]);
    const oldPic = rows[0]?.profile_pic;
    if (oldPic) { const op = join(__dirname, 'public', oldPic); if (fs.existsSync(op)) try { fs.unlinkSync(op); } catch {} }
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
        await sharp(file.path).resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(outPath);
        const cs = fs.statSync(outPath).size;
        if (cs < file.size) { fs.unlinkSync(file.path); finalName = outName; finalSize = cs; }
        else fs.unlinkSync(outPath);
      } catch {}
    }
    res.json({ url: `/uploads/${finalName}`, name: file.originalname, size: finalSize, type: file.mimetype });
  } catch (e) { res.status(500).json({ error: 'Upload failed' }); }
});

app.get('/api/ice-servers', requireAuth, (req, res) => {
  res.json({ iceServers: getIceServers(req.user) });
});

app.get('/', (req, res) => res.sendFile(join(__dirname, 'app', 'index.html')));

// ══════════════════════════════════════════════
//  MESSAGES
// ══════════════════════════════════════════════

pool.query("SET SESSION group_concat_max_len = 1000000").catch(()=>{});

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
               FROM message_reactions mr JOIN users ru ON ru.id = mr.user_id
               WHERE mr.message_id = m.id
             ), '[]') AS reactions,
             (SELECT JSON_OBJECT(
                'id', rm.id, 'content', rm.content, 'content_iv', rm.content_iv,
                'sender_name', rmu.username, 'msg_type', rm.msg_type,
                'file_name', rm.file_name, 'file_path', rm.file_path
              ) FROM messages rm JOIN users rmu ON rmu.id = rm.sender_id
              WHERE rm.id = m.reply_to_id) AS reply_to
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      LEFT JOIN message_status ms ON ms.message_id = m.id AND ms.user_id = ?
      WHERE m.group_id IS NULL AND m.deleted_both = 0
        AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
        AND NOT JSON_CONTAINS(COALESCE(m.deleted_for, '[]'), JSON_ARRAY(?))
        AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
      ORDER BY m.created_at ASC LIMIT 200
    `, [me, me, you, you, me, JSON.stringify(me)]);

    const unsentIds = rows.filter(r => r.sender_id !== me && (!r.msg_status || r.msg_status === 'sent')).map(r => r.id);
    if (unsentIds.length > 0) {
      for (const msgId of unsentIds) {
        await pool.query("INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status=IF(status='sent','delivered',status), delivered_at=IF(status='sent',NOW(),delivered_at)", [msgId, me]);
      }
      const [senderRows] = await pool.query('SELECT DISTINCT sender_id FROM messages WHERE id IN (?)', [unsentIds]);
      senderRows.forEach(sr => { emitToUser(sr.sender_id, 'messages-delivered', { msgIds: unsentIds }); });
    }
    res.json(rows.map(r => ({
      ...r,
      content: r.content ? decrypt(r.content, r.content_iv) : null,
      reactions: processReactions(r.reactions),
      reply_to: processReplyTo(r.reply_to)
    })));
  } catch (err) { console.error('PRIVATE MSG ERROR:', err); res.status(500).json({ error: 'Failed to fetch messages' }); }
});

app.get('/api/messages/group/:groupId', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const gid = req.params.groupId;
  try {
    const [mem] = await pool.query('SELECT id FROM group_members WHERE group_id=? AND user_id=?', [gid, me]);
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
               FROM message_reactions mr JOIN users ru ON ru.id = mr.user_id
               WHERE mr.message_id = m.id
             ), '[]') AS reactions,
             (SELECT JSON_OBJECT(
                'id', rm.id, 'content', rm.content, 'content_iv', rm.content_iv,
                'sender_name', rmu.username, 'msg_type', rm.msg_type,
                'file_name', rm.file_name, 'file_path', rm.file_path
              ) FROM messages rm JOIN users rmu ON rmu.id = rm.sender_id
              WHERE rm.id = m.reply_to_id) AS reply_to
      FROM messages m JOIN users u ON u.id = m.sender_id
      WHERE m.group_id = ? AND m.deleted_both = 0
        AND NOT JSON_CONTAINS(COALESCE(m.deleted_for, '[]'), JSON_ARRAY(?))
        AND (m.disappears_at IS NULL OR m.disappears_at > NOW())
      ORDER BY m.created_at ASC LIMIT 200
    `, [gid, JSON.stringify(me)]);
    res.json(rows.map(r => ({
      ...r, content: r.content ? decrypt(r.content, r.content_iv) : null,
      reactions: processReactions(r.reactions), reply_to: processReplyTo(r.reply_to)
    })));
  } catch (err) { console.error('GROUP MSG ERROR:', err); res.status(500).json({ error: 'Failed to fetch group messages' }); }
});

app.post('/api/messages/:msgId/react', requireAuth, async (req, res) => {
  const { emoji } = req.body;
  try {
    if (emoji) {
      await pool.query('INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?', [req.params.msgId, req.user.id, emoji, emoji]);
    } else {
      await pool.query('DELETE FROM message_reactions WHERE message_id=? AND user_id=?', [req.params.msgId, req.user.id]);
    }
    const [reactions] = await pool.query('SELECT mr.emoji, u.id AS userId, u.username FROM message_reactions mr JOIN users u ON u.id=mr.user_id WHERE mr.message_id=?', [req.params.msgId]);
    res.json({ ok: true, reactions });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/messages/mark-seen', requireAuth, async (req, res) => {
  const { fromUserId } = req.body;
  const me = req.user.id;
  try {
    const [msgs] = await pool.query(
      `SELECT m.id, m.sender_id FROM messages m
       WHERE m.sender_id=? AND m.receiver_id=? AND m.deleted_both=0 AND m.group_id IS NULL
       AND NOT EXISTS (SELECT 1 FROM message_status ms WHERE ms.message_id=m.id AND ms.user_id=? AND ms.status='seen')`,
      [fromUserId, me, me]
    );
    if (msgs.length > 0) {
      const msgIds = msgs.map(m => m.id);
      for (const msgId of msgIds) {
        await pool.query("INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()", [msgId, me]);
      }
      emitToUser(fromUserId, 'messages-seen', { msgIds, by: req.user.username });
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/chat/clear/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = decodeURIComponent(req.params.chatKey);
  try {
    if (key.startsWith('p:')) {
      const otherId = await resolvePrivateChatTarget(key);
      if (!otherId) return res.status(404).json({ error: 'User not found' });
      await pool.query(
        `UPDATE messages SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'), '$', CAST(? AS JSON))
         WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
           AND group_id IS NULL AND NOT JSON_CONTAINS(COALESCE(deleted_for,'[]'), CAST(? AS JSON))`,
        [me, me, otherId, otherId, me, me]
      );
    } else if (key.startsWith('g:')) {
      const groupId = key.slice(2);
      await pool.query(
        `UPDATE messages SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for,'[]'), '$', CAST(? AS JSON))
         WHERE group_id=? AND NOT JSON_CONTAINS(COALESCE(deleted_for,'[]'), CAST(? AS JSON))`,
        [me, groupId, me]
      );
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'Clear failed' }); }
});

app.get('/api/chat/export/:chatKey', requireAuth, async (req, res) => {
  const me  = req.user.id;
  const key = decodeURIComponent(req.params.chatKey);
  try {
    let rows = [];
    if (key.startsWith('p:')) {
      const otherId = await resolvePrivateChatTarget(key);
      if (!otherId) return res.status(404).json({ error: 'User not found' });
      const [r] = await pool.query(
        `SELECT m.*, u.username AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id
         WHERE ((m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?))
           AND m.deleted_both=0 AND m.group_id IS NULL
           AND NOT JSON_CONTAINS(COALESCE(m.deleted_for,'[]'), CAST(? AS JSON))
         ORDER BY m.created_at ASC`,
        [me, otherId, otherId, me, me]
      );
      rows = r;
    } else {
      const gid = key.slice(2);
      const [r] = await pool.query(
        `SELECT m.*, u.username AS sender_name FROM messages m JOIN users u ON u.id = m.sender_id
         WHERE m.group_id=? AND m.deleted_both=0
           AND NOT JSON_CONTAINS(COALESCE(m.deleted_for,'[]'), CAST(? AS JSON))
         ORDER BY m.created_at ASC`,
        [gid, me]
      );
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
  } catch(e) { res.status(500).json({ error: 'Export failed: ' + e.message }); }
});

app.get('/api/live-location/:sessionId', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ll.*, u.username, u.avatar_color, u.profile_pic FROM live_locations ll JOIN users u ON u.id=ll.user_id
       WHERE ll.session_id=? AND ll.expires_at > NOW()`, [req.params.sessionId]
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════
//  CALL HISTORY
// ══════════════════════════════════════════════

app.get('/api/calls', requireAuth, async (req, res) => {
  const me = req.user.id;
  const filter = String(req.query.filter || 'all');
  const fromDate = String(req.query.from || '').trim();
  const toDate = String(req.query.to || '').trim();
  const where = ['(ch.caller_id=? OR ch.callee_id=?)', 'NOT JSON_CONTAINS(COALESCE(ch.deleted_for, JSON_ARRAY()), JSON_ARRAY(?))'];
  const params = [me, me, me];
  if (filter === 'missed') where.push('ch.status="missed"');
  else if (filter === 'incoming') { where.push('ch.callee_id=?'); params.push(me); }
  else if (filter === 'outgoing') { where.push('ch.caller_id=?'); params.push(me); }
  else if (filter === 'video') where.push('ch.call_type="video"');
  else if (filter === 'audio') where.push('ch.call_type="audio"');
  if (/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) { where.push('DATE(ch.started_at) >= ?'); params.push(fromDate); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(toDate)) { where.push('DATE(ch.started_at) <= ?'); params.push(toDate); }
  const [rows] = await pool.query(`
    SELECT ch.id, ch.caller_id, ch.callee_id, ch.group_id, ch.call_type,
           ch.is_group, ch.status, ch.started_at, ch.ended_at, ch.duration_s,
           caller.username AS caller_name, caller.avatar_color AS caller_color,
           callee.username AS callee_name, callee.avatar_color AS callee_color,
           cg.name AS group_name
    FROM call_history ch
    JOIN users caller ON caller.id = ch.caller_id
    LEFT JOIN users callee ON callee.id = ch.callee_id
    LEFT JOIN chat_groups cg ON cg.id = ch.group_id
    WHERE ${where.join(' AND ')} ORDER BY ch.started_at DESC LIMIT 100
  `, params);
  res.json(rows);
});

app.delete('/api/calls/:id', requireAuth, async (req, res) => {
  const me = req.user.id;
  await pool.query(`UPDATE call_history SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for, JSON_ARRAY()), '$', ?) WHERE id=? AND (caller_id=? OR callee_id=?) AND NOT JSON_CONTAINS(COALESCE(deleted_for, JSON_ARRAY()), JSON_ARRAY(?))`, [me, req.params.id, me, me, me]);
  res.json({ ok: true });
});

app.delete('/api/calls', requireAuth, async (req, res) => {
  const me = req.user.id;
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(id => String(id).trim()).filter(Boolean).slice(0, 100) : [];
  if (!ids.length) return res.status(400).json({ error: 'No calls selected' });
  await pool.query(`UPDATE call_history SET deleted_for = JSON_ARRAY_APPEND(COALESCE(deleted_for, JSON_ARRAY()), '$', ?) WHERE id IN (?) AND (caller_id=? OR callee_id=?) AND NOT JSON_CONTAINS(COALESCE(deleted_for, JSON_ARRAY()), JSON_ARRAY(?))`, [me, ids, me, me, me]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  STATUS
// ══════════════════════════════════════════════

app.get('/api/status', requireAuth, async (req, res) => {
  const me = req.user.id;
  try {
    const [blockedList] = await pool.query('SELECT blocked_id FROM blocked_users WHERE user_id=?', [me]);
    const blockedIds = blockedList.map(b => b.blocked_id);
    const [posts] = await pool.query(`
      SELECT sp.id, sp.user_id, sp.content_type, sp.content, sp.file_url, sp.caption,
             sp.bg_color, sp.text_color, sp.font_size, sp.expires_at, sp.created_at,
             u.username, u.avatar_color, u.profile_pic, u.avatar_url, u.priv_photo,
             (SELECT COUNT(*) FROM status_views sv WHERE sv.status_id=sp.id) AS view_count,
             (SELECT COUNT(*) FROM status_likes sl WHERE sl.status_id=sp.id) AS like_count,
             (SELECT 1 FROM status_views sv2 WHERE sv2.status_id=sp.id AND sv2.viewer_id=?) AS i_viewed,
             (SELECT emoji FROM status_likes sl2 WHERE sl2.status_id=sp.id AND sl2.user_id=?) AS my_reaction
      FROM status_posts sp JOIN users u ON u.id = sp.user_id
      WHERE sp.expires_at > NOW()
        AND (sp.user_id=? OR sp.user_id IN (SELECT contact_id FROM contacts WHERE user_id=?))
        ${blockedIds.length ? `AND sp.user_id NOT IN (${blockedIds.join(',')})` : ''}
      ORDER BY sp.user_id=? DESC, sp.created_at DESC
    `, [me, me, me, me, me]);
    const userMap = {};
    posts.forEach(p => {
      if (!userMap[p.user_id]) {
        userMap[p.user_id] = { user_id: p.user_id, username: p.username, avatar_color: p.avatar_color, avatarUrl: (p.priv_photo !== 'nobody') ? (p.profile_pic || p.avatar_url) : null, is_mine: p.user_id === me, statuses: [] };
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
  await pool.query('INSERT INTO status_posts (id,user_id,content_type,content,file_url,caption,bg_color,text_color,font_size,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, req.user.id, contentType||'text', content||null, fileUrl||null, caption||null, bgColor||'#1a2433', textColor||'#ffffff', fontSize||28, expiresAt]);
  res.json({ id, ok: true });
});

app.delete('/api/status/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM status_posts WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.post('/api/status/:id/view', requireAuth, async (req, res) => {
  await pool.query('INSERT IGNORE INTO status_views (status_id,viewer_id) VALUES (?,?)', [req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.post('/api/status/:id/like', requireAuth, async (req, res) => {
  const { emoji } = req.body;
  if (emoji) await pool.query('INSERT INTO status_likes (status_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?', [req.params.id, req.user.id, emoji, emoji]);
  else await pool.query('DELETE FROM status_likes WHERE status_id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.get('/api/status/:id/viewers', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.avatar_color, u.profile_pic, sv.viewed_at, sl.emoji AS reaction
     FROM status_views sv JOIN users u ON u.id = sv.viewer_id
     LEFT JOIN status_likes sl ON sl.status_id=sv.status_id AND sl.user_id=sv.viewer_id
     WHERE sv.status_id=? AND EXISTS(SELECT 1 FROM status_posts sp WHERE sp.id=? AND sp.user_id=?)
     ORDER BY sv.viewed_at DESC`,
    [req.params.id, req.params.id, req.user.id]
  );
  res.json(rows);
});

// ══════════════════════════════════════════════
//  BLOCK / UNBLOCK
// ══════════════════════════════════════════════

app.get('/api/blocked', requireAuth, async (req, res) => {
  const [rows] = await pool.query(`SELECT u.id, u.username, u.email, u.avatar_color, u.profile_pic FROM blocked_users bu JOIN users u ON u.id=bu.blocked_id WHERE bu.user_id=?`, [req.user.id]);
  res.json(rows);
});

app.post('/api/block/:userId', requireAuth, async (req, res) => {
  await pool.query('INSERT IGNORE INTO blocked_users (user_id,blocked_id) VALUES (?,?)', [req.user.id, req.params.userId]);
  emitToUser(parseInt(req.params.userId), 'user-blocked-you', { by: req.user.username, byId: req.user.id });
  res.json({ ok: true });
});

app.delete('/api/block/:userId', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM blocked_users WHERE user_id=? AND blocked_id=?', [req.user.id, req.params.userId]);
  emitToUser(parseInt(req.params.userId), 'user-unblocked-you', { by: req.user.username, byId: req.user.id });
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
  const [rows] = await pool.query('SELECT * FROM chat_settings WHERE user_id=? AND chat_key=?', [req.user.id, req.params.chatKey]);
  res.json(rows[0] || { disappearing_msgs: 'off', theme: 'default', is_locked: 0, is_muted: 0 });
});

app.put('/api/chat-settings/:chatKey', requireAuth, async (req, res) => {
  const { disappearingMsgs, theme, isLocked, lockPin, isMuted } = req.body;
  let lockHash = null;
  if (isLocked && lockPin) lockHash = await bcrypt.hash(String(lockPin), 10);
  await pool.query(
    `INSERT INTO chat_settings (user_id, chat_key, disappearing_msgs, theme, is_locked, lock_pin_hash, is_muted)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE disappearing_msgs=VALUES(disappearing_msgs), theme=VALUES(theme),
       is_locked=VALUES(is_locked),
       lock_pin_hash=IF(? IS NOT NULL, ?, IF(VALUES(is_locked)=0, NULL, lock_pin_hash)),
       is_muted=VALUES(is_muted)`,
    [req.user.id, req.params.chatKey, disappearingMsgs||'off', theme||'default', isLocked?1:0, lockHash, isMuted?1:0, lockHash, lockHash]
  );
  res.json({ ok: true });
});

app.post('/api/chat-settings/:chatKey/verify-pin', requireAuth, async (req, res) => {
  const { pin } = req.body;
  const [rows] = await pool.query('SELECT is_locked, lock_pin_hash FROM chat_settings WHERE user_id=? AND chat_key=?', [req.user.id, req.params.chatKey]);
  if (!rows.length || !rows[0].is_locked) return res.json({ valid: true });
  if (!rows[0].lock_pin_hash) return res.json({ valid: true });
  const valid = await bcrypt.compare(String(pin), rows[0].lock_pin_hash);
  res.json({ valid });
});

// ══════════════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════════════

const onlineUsers  = {};
const socketToUser = {};
const callRooms    = {};

function addOnlineSocket(userId, socketId) {
  if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
  onlineUsers[userId].add(socketId);
}
function removeOnlineSocket(userId, socketId) {
  const sockets = onlineUsers[userId];
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) delete onlineUsers[userId];
}
function isUserOnline(userId) { return !!onlineUsers[userId]?.size; }
function emitToUser(userId, event, data) {
  // Use socket room for reliable delivery
  io.to(`user:${userId}`).emit(event, data);
}
function emitCallSignal(fromId, toId, event, data, roomId = null, senderSocketId = null) {
  const room = Object.values(callRooms).find(r => r.members?.has(fromId) && r.members?.has(toId)) || (roomId && callRooms[roomId]);
  if (room && senderSocketId) {
    if (!room.memberSockets) room.memberSockets = new Map();
    room.memberSockets.set(fromId, senderSocketId);
  }
  const sid = room?.memberSockets?.get(toId);
  if (sid && onlineUsers[toId]?.has(sid)) io.to(sid).emit(event, data);
  else emitToUser(toId, event, data);
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token && socket.handshake.auth?.banWatch && socket.handshake.auth?.userId) {
    socket.banWatch = { userId: parseInt(socket.handshake.auth.userId) };
    return next();
  }
  if (!token) return next(new Error('auth_required'));
  try { socket.user = jwt.verify(token, JWT_SECRET); return next(); }
  catch {}
  try { socket.admin = jwt.verify(token, ADMIN_JWT_SECRET); return next(); }
  catch { next(new Error('invalid_token')); }
});

io.on('connection', async (socket) => {
  if (socket.banWatch) {
    socket.join(`user:${socket.banWatch.userId}`);
    socket.on('check-ban-status', async () => {
      try {
        const [rows] = await pool.query('SELECT account_status, ban_reason, banned_until FROM users WHERE id=?', [socket.banWatch.userId]);
        const user = rows[0];
        if (!user) return;
        if (user.account_status === 'active') socket.emit('account-unbanned', { message: 'Your account has been restored. You can login now.' });
        else socket.emit('account-banned', { reason: user.ban_reason, bannedUntil: user.banned_until });
      } catch {}
    });
    return;
  }

  if (socket.admin) {
    socket.join('admin:live');
    socket.data.adminId = socket.admin.id;
    socket.data.username = socket.admin.username;
    try {
      const onlineIds = Object.keys(onlineUsers).map(id => parseInt(id));
      socket.emit('admin-online-users', { onlineIds, count: onlineIds.length });
    } catch {}
    return;
  }

  const { id: myId, username } = socket.user;

  // ── Join personal room for targeted events (ban, unban, etc.) ─────────
  socket.join(`user:${myId}`);
  // Store userId in socket data for admin panel online count
  socket.data.userId = myId;
  socket.data.username = username;

  // Check if user is banned
  try {
    const [userCheck] = await pool.query('SELECT account_status FROM users WHERE id=?', [myId]);
    if (userCheck.length && userCheck[0].account_status === 'banned') {
      if (socket.handshake.auth?.banPage) {
        handleBanSocket(socket, io, pool);
        socket.emit('account-banned', { message: 'Your account has been banned.' });
        return;
      }
      socket.emit('account-banned', { message: 'Your account has been banned.' });
      socket.disconnect(true);
      return;
    }
  } catch {}

  addOnlineSocket(myId, socket.id);
  socketToUser[socket.id] = { id: myId, username };

  await pool.query('UPDATE users SET is_online=1, last_seen=NULL WHERE id=?', [myId]);
  socket.broadcast.emit('user-status', { userId: myId, username, isOnline: true });
  io.to('admin:live').emit('admin-user-status', { userId: myId, username, isOnline: true, onlineCount: Object.keys(onlineUsers).length });

  const currentOnlineIds = Object.keys(onlineUsers).map(id => parseInt(id));
  socket.emit('online-users', currentOnlineIds);

  // Deliver pending messages on connect
  try {
    const [pendingMsgs] = await pool.query(
      `SELECT m.id, m.sender_id FROM messages m WHERE m.receiver_id=? AND m.deleted_both=0 AND m.group_id IS NULL
       AND NOT EXISTS (SELECT 1 FROM message_status ms WHERE ms.message_id=m.id AND ms.user_id=?)
       ORDER BY m.created_at ASC LIMIT 200`,
      [myId, myId]
    );
    if (pendingMsgs.length > 0) {
      const msgIds = pendingMsgs.map(m => m.id);
      for (const msgId of msgIds) {
        await pool.query("INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status=IF(status='sent','delivered',status), delivered_at=IF(status='sent',NOW(),delivered_at)", [msgId, myId]);
      }
      const senderGroups = {};
      pendingMsgs.forEach(m => { if (!senderGroups[m.sender_id]) senderGroups[m.sender_id]=[]; senderGroups[m.sender_id].push(m.id); });
      Object.entries(senderGroups).forEach(([senderId, ids]) => { emitToUser(parseInt(senderId), 'messages-delivered', { msgIds: ids }); });
    }
  } catch(e) {}

  async function getUserId(uname) {
    if (!uname) return null;
    const [r] = await pool.query('SELECT id FROM users WHERE username=?', [uname]);
    return r[0]?.id || null;
  }
  function emitTo(userId, event, data) { emitToUser(userId, event, data); }
  async function emitToGroupMembers(groupId, event, data, excludeMe = false) {
    const [members] = await pool.query('SELECT user_id FROM group_members WHERE group_id=?', [groupId]);
    members.forEach(m => { if (excludeMe && m.user_id === myId) return; emitTo(m.user_id, event, data); });
  }
  async function ensureContact(a, b) {
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [a, b]);
    await pool.query('INSERT IGNORE INTO contacts (user_id,contact_id) VALUES (?,?)', [b, a]);
  }
  async function getMessageReactions(msgId) {
    const [rows] = await pool.query('SELECT mr.emoji, u.id AS userId, u.username FROM message_reactions mr JOIN users u ON u.id=mr.user_id WHERE mr.message_id=?', [msgId]);
    return rows;
  }

  socket.on('avatar-updated', async ({ avatarUrl }) => {
    if (!avatarUrl) return;
    try {
      const [contacts] = await pool.query('SELECT contact_id FROM contacts WHERE user_id=?', [myId]);
      contacts.forEach(c => { emitTo(c.contact_id, 'user-avatar-updated', { username, avatarUrl, userId: myId }); });
    } catch(e) {}
  });

  socket.on('private-message', async ({ to, content, msgType, fileUrl, fileName, fileSize, fileType, msgId, replyToId }) => {
    const toId = await getUserId(to);
    if (!toId) return;
    const [blocked] = await pool.query('SELECT 1 FROM blocked_users WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)', [myId, toId, toId, myId]);
    if (blocked.length) return socket.emit('message-blocked', { to });
    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };
    const [myCs] = await pool.query('SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?', [myId, `p:${to}`]);
    const [theirCs] = await pool.query('SELECT disappearing_msgs FROM chat_settings WHERE user_id=? AND chat_key=?', [toId, `p:${username}`]);
    const dm = myCs[0]?.disappearing_msgs || theirCs[0]?.disappearing_msgs || 'off';
    let disappearsAt = null;
    if (dm !== 'off') { const hours = dm === '24h' ? 24 : dm === '7d' ? 168 : 720; disappearsAt = new Date(Date.now() + hours * 3600000); }
    await pool.query('INSERT INTO messages (id,sender_id,receiver_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type,disappears_at,reply_to_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, myId, toId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null, disappearsAt, replyToId||null]);
    await ensureContact(myId, toId);
    const msg = { id, from: username, to, content: content||null, msgType: msgType||'text', fileUrl, fileName, fileSize, fileType, time: new Date().toISOString(), status: 'sent', disappearsAt, replyToId: replyToId||null };
    if (isUserOnline(toId)) {
      emitTo(toId, 'private-message', { ...msg, status: 'delivered' });
      await pool.query("INSERT INTO message_status (message_id,user_id,status,delivered_at) VALUES (?,?,'delivered',NOW()) ON DUPLICATE KEY UPDATE status='delivered', delivered_at=NOW()", [id, toId]);
      socket.emit('message-sent', { id, status: 'delivered' });
    } else {
      socket.emit('message-sent', { id, status: 'sent' });
    }
  });

  socket.on('group-message', async ({ groupId, content, msgType, fileUrl, fileName, fileSize, fileType, msgId, replyToId }) => {
    const [mem] = await pool.query('SELECT id FROM group_members WHERE group_id=? AND user_id=?', [groupId, myId]);
    if (!mem.length) return;
    const id = msgId || genId();
    const { enc, iv } = content ? encrypt(content) : { enc: null, iv: null };
    await pool.query('INSERT INTO messages (id,sender_id,group_id,content,content_iv,msg_type,file_path,file_name,file_size,file_type,reply_to_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, myId, groupId, enc, iv, msgType||'text', fileUrl||null, fileName||null, fileSize||null, fileType||null, replyToId||null]);
    const msg = { id, from: username, groupId, content: content||null, msgType: msgType||'text', fileUrl, fileName, fileSize, fileType, time: new Date().toISOString(), replyToId: replyToId||null };
    await emitToGroupMembers(groupId, 'group-message', msg);
  });

  socket.on('edit-message', async ({ msgId, newContent, to, groupId }) => {
    const [msg] = await pool.query('SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]);
    if (!msg.length || msg[0].msg_type !== 'text') return;
    const { enc, iv } = encrypt(newContent);
    await pool.query('UPDATE messages SET content=?, content_iv=?, is_edited=1 WHERE id=?', [enc, iv, msgId]);
    const payload = { msgId, newContent, editedBy: username };
    socket.emit('message-edited', payload);
    if (groupId) await emitToGroupMembers(groupId, 'message-edited', payload, true);
    else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'message-edited', payload); }
  });

  socket.on('delete-message', async ({ msgId, deleteFor, to, groupId }) => {
    const [msg] = await pool.query('SELECT * FROM messages WHERE id=? AND sender_id=?', [msgId, myId]);
    if (!msg.length) return;
    if (deleteFor === 'everyone') {
      await pool.query('UPDATE messages SET deleted_both=1 WHERE id=?', [msgId]);
      if (msg[0].file_path) { const fp = join(__dirname, 'public', msg[0].file_path); if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch {} }
      const payload = { msgId, deleteFor: 'everyone' };
      socket.emit('message-deleted', payload);
      if (groupId) await emitToGroupMembers(groupId, 'message-deleted', payload, true);
      else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'message-deleted', payload); }
    } else {
      const cur = msg[0].deleted_for ? JSON.parse(msg[0].deleted_for) : [];
      if (!cur.includes(myId)) cur.push(myId);
      await pool.query('UPDATE messages SET deleted_for=? WHERE id=?', [JSON.stringify(cur), msgId]);
      socket.emit('message-deleted', { msgId, deleteFor: 'me' });
    }
  });

  socket.on('react-message', async ({ msgId, emoji, to, groupId }) => {
    try {
      if (emoji) await pool.query('INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?) ON DUPLICATE KEY UPDATE emoji=?', [msgId, myId, emoji, emoji]);
      else await pool.query('DELETE FROM message_reactions WHERE message_id=? AND user_id=?', [msgId, myId]);
      const reactions = await getMessageReactions(msgId);
      const payload = { msgId, reactions, by: username };
      socket.emit('message-reacted', payload);
      if (groupId) await emitToGroupMembers(groupId, 'message-reacted', payload, true);
      else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'message-reacted', payload); }
    } catch(e) {}
  });

  socket.on('message-seen', async ({ msgId, fromUser }) => {
    await pool.query("INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()", [msgId, myId]);
    const fromId = await getUserId(fromUser);
    if (fromId) emitTo(fromId, 'message-seen', { msgId, by: username });
  });

  socket.on('mark-all-seen', async ({ fromUser }) => {
    try {
      const fromId = await getUserId(fromUser);
      if (!fromId) return;
      const [msgs] = await pool.query(
        `SELECT m.id FROM messages m WHERE m.sender_id=? AND m.receiver_id=? AND m.deleted_both=0 AND m.group_id IS NULL
         AND NOT EXISTS (SELECT 1 FROM message_status ms WHERE ms.message_id=m.id AND ms.user_id=? AND ms.status='seen')`,
        [fromId, myId, myId]
      );
      if (msgs.length > 0) {
        const msgIds = msgs.map(m => m.id);
        for (const msgId of msgIds) await pool.query("INSERT INTO message_status (message_id,user_id,status,seen_at) VALUES (?,?,'seen',NOW()) ON DUPLICATE KEY UPDATE status='seen', seen_at=NOW()", [msgId, myId]);
        emitTo(fromId, 'messages-seen', { msgIds, by: username });
      }
    } catch(e) {}
  });

  socket.on('typing', async ({ to, isTyping, isGroup }) => {
    const payload = { from: username, to, isTyping, isGroup };
    if (isGroup) await emitToGroupMembers(to, 'typing', payload, true);
    else { const toId = await getUserId(to); if (toId) emitTo(toId, 'typing', payload); }
  });

  socket.on('create-group', async ({ groupId, name, members }) => {
    try {
      await pool.query('INSERT INTO chat_groups (id,name,created_by) VALUES (?,?,?)', [groupId, name, myId]);
      const ids = [];
      for (const uname of members) { const uid = await getUserId(uname); if (uid) ids.push(uid); }
      ids.push(myId);
      for (const uid of [...new Set(ids)]) await pool.query('INSERT IGNORE INTO group_members (group_id,user_id) VALUES (?,?)', [groupId, uid]);
      const [memRows] = await pool.query('SELECT u.username FROM group_members gm JOIN users u ON u.id=gm.user_id WHERE gm.group_id=?', [groupId]);
      const memberNames = memRows.map(r => r.username);
      ids.forEach(uid => emitTo(uid, 'group-created', { groupId, name, createdBy: username, members: memberNames }));
    } catch(e) {}
  });

  socket.on('live-location-update', async ({ to, groupId, lat, lng, speed, heading, accuracy, sessionId }) => {
    const toIdResolved = to ? await getUserId(to) : null;
    try {
      await pool.query(
        `INSERT INTO live_locations (session_id,user_id,chat_user_id,group_id,latitude,longitude,speed,heading,accuracy,expires_at)
         VALUES (?,?,?,?,?,?,?,?,?,DATE_ADD(NOW(), INTERVAL 1 HOUR))
         ON DUPLICATE KEY UPDATE latitude=?, longitude=?, speed=?, heading=?, accuracy=?, expires_at=DATE_ADD(NOW(), INTERVAL 1 HOUR)`,
        [sessionId, myId, toIdResolved||null, groupId||null, lat, lng, speed||0, heading||0, accuracy||0, lat, lng, speed||0, heading||0, accuracy||0]
      );
    } catch(e) {}
    const payload = { from: username, userId: myId, lat, lng, speed: speed||0, heading: heading||0, accuracy: accuracy||0, sessionId };
    if (groupId) await emitToGroupMembers(groupId, 'live-location-update', payload, true);
    else if (to && toIdResolved) emitTo(toIdResolved, 'live-location-update', payload);
  });

  socket.on('stop-live-location', async ({ to, groupId, sessionId }) => {
    await pool.query('DELETE FROM live_locations WHERE session_id=? AND user_id=?', [sessionId, myId]);
    const payload = { from: username, userId: myId, sessionId };
    if (groupId) await emitToGroupMembers(groupId, 'stop-live-location', payload, true);
    else if (to) { const toId = await getUserId(to); if (toId) emitTo(toId, 'stop-live-location', payload); }
  });

  socket.on('status-posted', () => {
    pool.query('SELECT contact_id FROM contacts WHERE user_id=?', [myId])
      .then(([rows]) => { rows.forEach(r => emitTo(r.contact_id, 'status-new', { from: username, userId: myId })); });
  });

  // ── Call Signaling (same as before) ──────────────────────────────────
  socket.on('call-invite', async ({ to, callType, isGroup, groupId, roomId }) => {
    const callId = roomId || genId();
    if (!callRooms[callId]) callRooms[callId] = { members: new Set(), memberSockets: new Map(), type: callType, callId };
    callRooms[callId].members.add(myId);
    callRooms[callId].memberSockets.set(myId, socket.id);
    try {
      await pool.query('INSERT INTO active_calls (room_id,call_type,is_group,group_id) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE call_type=VALUES(call_type)', [callId, callType, isGroup?1:0, groupId||null]);
      await pool.query('INSERT IGNORE INTO active_call_members (room_id,user_id,username) VALUES (?,?,?)', [callId, myId, username]);
    } catch(e) {}
    if (isGroup && groupId) {
      await emitToGroupMembers(groupId, 'call-invite', { from: username, callType, isGroup: true, groupId, roomId: callId }, true);
    } else {
      const toId = await getUserId(to);
      if (!toId) return;
      const calleeInCall = [...Object.values(callRooms)].some(r => r.members.has(toId));
      emitTo(toId, 'call-invite', { from: username, callType, isGroup: false, roomId: callId, calleeBusy: calleeInCall });
      const histId = genId();
      await pool.query('INSERT INTO call_history (id,caller_id,callee_id,call_type,is_group,status) VALUES (?,?,?,?,0,"missed")', [histId, myId, toId, callType]);
      callRooms[callId].histId = histId; callRooms[callId].callerId = myId;
    }
  });

  socket.on('call-accepted', async ({ to, callType, roomId }) => {
    const toId = await getUserId(to);
    if (!toId) return;
    try { await pool.query('INSERT IGNORE INTO active_call_members (room_id,user_id,username) VALUES (?,?,?)', [roomId, myId, username]); } catch {}
    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      const existing = [...room.members];
      room.members.add(myId);
      room.memberSockets?.set(myId, socket.id);
      const payload = { from: username, callType, roomId };
      const callerSid = room.memberSockets?.get(toId);
      if (callerSid && onlineUsers[toId]?.has(callerSid)) io.to(callerSid).emit('call-accepted', payload);
      else emitTo(toId, 'call-accepted', payload);
      for (const uid of existing) {
        if (uid !== myId) {
          const sid = room.memberSockets?.get(uid);
          if (sid && onlineUsers[uid]?.has(sid)) io.to(sid).emit('please-connect', { to: username, roomId });
          else emitTo(uid, 'please-connect', { to: username, roomId });
        }
      }
      if (room.histId) pool.query('UPDATE call_history SET status="ongoing", started_at=NOW() WHERE id=?', [room.histId]).catch(() => {});
    } else {
      emitTo(toId, 'call-accepted', { from: username, callType, roomId });
      emitTo(toId, 'please-connect', { to: username, roomId });
    }
  });

  socket.on('call-rejected', async ({ to, roomId }) => {
    const toId = await getUserId(to);
    if (toId) { const sid = roomId ? callRooms[roomId]?.memberSockets?.get(toId) : null; if (sid) io.to(sid).emit('call-rejected', { from: username }); else emitTo(toId, 'call-rejected', { from: username }); }
    if (roomId && callRooms[roomId]?.histId) await pool.query('UPDATE call_history SET status="rejected", ended_at=NOW() WHERE id=?', [callRooms[roomId].histId]);
  });

  socket.on('call-ended', async ({ to, isGroup, groupId, roomId, durationSeconds }) => {
    if (isGroup && groupId) await emitToGroupMembers(groupId, 'call-ended', { from: username }, true);
    else { const toId = await getUserId(to); if (toId) emitCallSignal(myId, toId, 'call-ended', { from: username, roomId }, roomId, socket.id); }
    if (roomId && callRooms[roomId]) {
      const room = callRooms[roomId];
      room.members.delete(myId); room.memberSockets?.delete(myId);
      if (room.histId && durationSeconds > 0) await pool.query('UPDATE call_history SET ended_at=NOW(), duration_s=?, status="completed" WHERE id=?', [durationSeconds, room.histId]);
      if (room.members.size === 0) { delete callRooms[roomId]; try { await pool.query('DELETE FROM active_call_members WHERE room_id=?', [roomId]); await pool.query('DELETE FROM active_calls WHERE room_id=?', [roomId]); } catch {} }
    }
    for (const rid in callRooms) { callRooms[rid].members.delete(myId); callRooms[rid].memberSockets?.delete(myId); }
    try { await pool.query('DELETE FROM active_call_members WHERE room_id=? AND user_id=?', [roomId||'', myId]); } catch {}
  });

  socket.on('call-hold', async ({ to, onHold, roomId }) => { const toId = await getUserId(to); if (toId) emitCallSignal(myId, toId, 'call-hold', { from: username, onHold, roomId }, roomId, socket.id); });
  socket.on('add-to-call', async ({ to, callType, roomId }) => { const toId = await getUserId(to); if (toId) emitTo(toId, 'call-invite', { from: username, callType, isGroup: false, addToCall: true, roomId }); });
  socket.on('rejoin-call', async ({ roomId, callType }) => {
    if (!roomId) return;
    if (callRooms[roomId]) { callRooms[roomId].members.add(myId); callRooms[roomId].memberSockets?.set(myId, socket.id); }
    else {
      try { const [roomRows] = await pool.query('SELECT * FROM active_calls WHERE room_id=?', [roomId]); if (roomRows.length > 0) callRooms[roomId] = { members: new Set([myId]), memberSockets: new Map([[myId, socket.id]]), type: callType, callId: roomId }; else return; } catch { return; }
    }
    try { await pool.query('INSERT IGNORE INTO active_call_members (room_id,user_id,username) VALUES (?,?,?)', [roomId, myId, username]); } catch {}
    try { const [members] = await pool.query('SELECT user_id, username FROM active_call_members WHERE room_id=? AND user_id!=?', [roomId, myId]); members.forEach(m => { emitTo(m.user_id, 'call-peer-reconnect', { from: username, callType, roomId }); }); } catch {}
  });
  socket.on('call-peer-reconnect', async ({ to, callType, roomId }) => { const toId = await getUserId(to); if (toId) emitCallSignal(myId, toId, 'call-peer-reconnect', { from: username, callType, roomId }, roomId, socket.id); });
  socket.on('offer', async ({ to, offer, roomId }) => { const t = await getUserId(to); if (t) emitCallSignal(myId, t, 'offer', { from: username, offer, roomId }, roomId, socket.id); });
  socket.on('answer', async ({ to, answer, roomId }) => { const t = await getUserId(to); if (t) emitCallSignal(myId, t, 'answer', { from: username, answer, roomId }, roomId, socket.id); });
  socket.on('icecandidate', async ({ to, candidate, roomId }) => { const t = await getUserId(to); if (t) emitCallSignal(myId, t, 'icecandidate', { from: username, candidate, roomId }, roomId, socket.id); });
  socket.on('toggle-media', async ({ to, kind, enabled, roomId }) => { const t = await getUserId(to); if (t) emitCallSignal(myId, t, 'peer-toggle-media', { from: username, kind, enabled, roomId }, roomId, socket.id); });
  socket.on('please-connect', async ({ to, roomId }) => { const t = await getUserId(to); if (t) emitCallSignal(myId, t, 'please-connect', { to: username, roomId }, roomId, socket.id); });

  socket.on('disconnect', async () => {
    const lastSeen = new Date();
    delete socketToUser[socket.id];
    removeOnlineSocket(myId, socket.id);
    for (const rid in callRooms) {
      const room = callRooms[rid];
      if (room.memberSockets?.get(myId) === socket.id) room.memberSockets.delete(myId);
    }
    if (isUserOnline(myId)) return;
    try {
      await pool.query('UPDATE users SET is_online=0, last_seen=? WHERE id=?', [lastSeen, myId]);
      await pool.query('DELETE FROM live_locations WHERE user_id=?', [myId]);
    } catch {}
    for (const rid in callRooms) {
      callRooms[rid].members.delete(myId);
      callRooms[rid].memberSockets?.delete(myId);
      if (callRooms[rid].members.size === 0) delete callRooms[rid];
    }
    socket.broadcast.emit('user-status', { userId: myId, username, isOnline: false, lastSeen: lastSeen.toISOString() });
    io.to('admin:live').emit('admin-user-status', { userId: myId, username, isOnline: false, lastSeen: lastSeen.toISOString(), onlineCount: Object.keys(onlineUsers).length });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 ChatApp running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`   Login: admin@chatapp.com / Admin@123456`);
});
