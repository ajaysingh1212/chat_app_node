// ════════════════════════════════════════════════════════════════════════════
//  ChatApp Admin Panel — admin.js  (UPDATED: realtime ban, media upload, online fix)
//  All admin API routes — mount as: app.use('/admin-api', adminRouter)
// ════════════════════════════════════════════════════════════════════════════

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ADMIN_SECRET_CHANGE_ME_32chars+';

// ── Multer for admin uploads ──────────────────────────────────────────────
const uploadDir = join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const adminStorage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `admin-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});
const adminUpload = multer({
  storage: adminStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for ads
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'video/', 'audio/'];
    cb(null, allowed.some(t => file.mimetype.startsWith(t)));
  }
});

// ── Admin JWT Middleware ──────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid admin token' });
  }
}

function requirePermission(perm) {
  return (req, res, next) => {
    const perms = req.admin?.permissions || {};
    if (req.admin?.role === 'superadmin' || perms[perm]) return next();
    res.status(403).json({ error: 'Insufficient permissions' });
  };
}

// ── Pool + IO injected from main server ──────────────────────────────────
let pool;
let io; // Socket.IO instance for realtime events

export function setPool(p) { pool = p; }
export function setIo(ioInstance) { io = ioInstance; }

async function logActivity(adminId, action, targetType, targetId, details, ip) {
  try {
    await pool.query(
      'INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details, ip_address) VALUES (?,?,?,?,?,?)',
      [adminId, action, targetType, targetId, JSON.stringify(details), ip]
    );
  } catch {}
}

// ── Helper: emit to a specific user via socket room ──────────────────────
function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
function emitToAdmins(event, data) {
  if (!io) return;
  io.to('admin:live').emit(event, data);
}
async function getRealtimeOnlineIds() {
  if (!io) return [];
  const sockets = await io.fetchSockets();
  return [...new Set(sockets.map(s => s.data?.userId).filter(Boolean))];
}

// ══════════════════════════════════════════════
//  MEDIA UPLOAD (for admin use — ads, avatars)
// ══════════════════════════════════════════════

router.post('/upload/media', requireAdmin, adminUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    let finalName = file.filename;
    let finalSize = file.size;

    // Compress images
    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('gif')) {
      const outName = `c-${file.filename.replace(/\.[^.]+$/, '.jpg')}`;
      const outPath = join(uploadDir, outName);
      try {
        await sharp(file.path)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(outPath);
        const cs = fs.statSync(outPath).size;
        if (cs < file.size) {
          fs.unlinkSync(file.path);
          finalName = outName;
          finalSize = cs;
        } else {
          fs.unlinkSync(outPath);
        }
      } catch {}
    }

    res.json({
      url: `/uploads/${finalName}`,
      name: file.originalname,
      size: finalSize,
      type: file.mimetype
    });
  } catch (e) {
    console.error('admin upload error:', e);
    res.status(500).json({ error: 'Upload failed: ' + e.message });
  }
});

// ══════════════════════════════════════════════
//  ADMIN AUTH
// ══════════════════════════════════════════════

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE email=? AND is_active=1', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    await pool.query('UPDATE admin_users SET last_login=NOW() WHERE id=?', [admin.id]);
    let permissions = {};
    try { permissions = typeof admin.permissions === 'string' ? JSON.parse(admin.permissions) : (admin.permissions || {}); } catch {}
    const token = jwt.sign({
      id: admin.id, username: admin.username, email: admin.email,
      role: admin.role, permissions
    }, ADMIN_JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role, avatar_url: admin.avatar_url, permissions } });
  } catch (e) { console.error('admin login:', e); res.status(500).json({ error: 'Server error' }); }
});

router.get('/me', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT id,username,email,role,avatar_url,permissions,last_login FROM admin_users WHERE id=?', [req.admin.id]);
  res.json(rows[0] || {});
});

router.put('/me/avatar', requireAdmin, adminUpload.single('file'), async (req, res) => {
  const file = req.file;
  let url = req.body.url;
  if (file) {
    const outName = `admin-av-${Date.now()}.jpg`;
    const outPath = join(uploadDir, outName);
    await sharp(file.path).resize(200, 200, { fit: 'cover' }).jpeg({ quality: 90 }).toFile(outPath);
    fs.unlinkSync(file.path);
    url = `/uploads/${outName}`;
  }
  if (!url) return res.status(400).json({ error: 'No image provided' });
  await pool.query('UPDATE admin_users SET avatar_url=? WHERE id=?', [url, req.admin.id]);
  res.json({ url });
});

// ══════════════════════════════════════════════
//  DASHBOARD STATS
// ══════════════════════════════════════════════

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [[stats]] = await pool.query('SELECT * FROM admin_stats');
    const [userGrowth] = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);
    const [msgGrowth] = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);
    const [topUsers] = await pool.query(`
      SELECT u.id, u.username, u.email, u.avatar_color, u.is_online,
             COUNT(m.id) AS message_count
      FROM users u LEFT JOIN messages m ON m.sender_id = u.id
      GROUP BY u.id ORDER BY message_count DESC LIMIT 10
    `);

    // Get real-time online count from Socket.IO if available
    let realtimeOnline = stats.online_users;
    if (io) {
      const onlineIds = await getRealtimeOnlineIds();
      realtimeOnline = onlineIds.length;
      stats.online_users = realtimeOnline;
    }

    res.json({ stats, userGrowth, msgGrowth, topUsers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════
//  USER MANAGEMENT
// ══════════════════════════════════════════════

router.get('/users', requireAdmin, async (req, res) => {
  const { search, status, page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = ['1=1'];
  const params = [];
  if (search) { where.push('(u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); const s = `%${search}%`; params.push(s, s, s); }
  if (status) { where.push('u.account_status = ?'); params.push(status); }
  const validSorts = { created_at: 'u.created_at', username: 'u.username', email: 'u.email', last_seen: 'u.last_seen' };
  const sortCol = validSorts[sort] || 'u.created_at';
  const sortOrd = order === 'ASC' ? 'ASC' : 'DESC';
  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users u WHERE ${where.join(' AND ')}`, params);
    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.phone, u.about, u.avatar_color, u.avatar_url, u.profile_pic,
             u.is_online, u.last_seen, u.created_at, u.account_status, u.ban_reason, u.banned_until,
             (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) AS message_count,
             (SELECT COUNT(*) FROM contacts WHERE user_id = u.id) AS contact_count
      FROM users u WHERE ${where.join(' AND ')}
      ORDER BY ${sortCol} ${sortOrd}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Enrich with realtime online status from socket if available
    if (io) {
      const onlineUserIds = new Set(await getRealtimeOnlineIds());
      users.forEach(u => { u.is_online = onlineUserIds.has(u.id) ? 1 : 0; });
    }

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.*,
             (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) AS message_count,
             (SELECT COUNT(*) FROM contacts WHERE user_id = u.id) AS contact_count,
             (SELECT COUNT(*) FROM group_members WHERE user_id = u.id) AS group_count,
             (SELECT COUNT(*) FROM call_history WHERE caller_id = u.id OR callee_id = u.id) AS call_count
      FROM users u WHERE u.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    // Realtime online check
    if (io) {
      const onlineUserIds = new Set(await getRealtimeOnlineIds());
      const isOnline = onlineUserIds.has(rows[0].id);
      rows[0].is_online = isOnline ? 1 : 0;
    }

    const [bans] = await pool.query(`
      SELECT ub.*, au.username AS banned_by_name FROM user_bans ub
      JOIN admin_users au ON au.id = ub.banned_by WHERE ub.user_id = ?
      ORDER BY ub.created_at DESC LIMIT 5
    `, [req.params.id]);
    res.json({ ...rows[0], ban_history: bans });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── BAN USER — with realtime socket kick ─────────────────────────────────
router.post('/users/:id/ban', requireAdmin, requirePermission('ban_users'), async (req, res) => {
  const { reason, banType = 'permanent', bannedUntil } = req.body;
  const userId = parseInt(req.params.id);
  try {
    await pool.query(
      'INSERT INTO user_bans (user_id, banned_by, reason, ban_type, banned_until) VALUES (?,?,?,?,?)',
      [userId, req.admin.id, reason || 'Violated terms of service', banType, bannedUntil || null]
    );
    await pool.query(
      'UPDATE users SET account_status="banned", ban_reason=?, banned_until=? WHERE id=?',
      [reason || null, bannedUntil || null, userId]
    );

    // ── REALTIME: Force-kick the user via socket ──────────────────────
    emitToUser(userId, 'account-banned', {
      reason: reason || 'Your account has been banned.',
      banType,
      bannedUntil: bannedUntil || null,
      adminName: req.admin.username
    });
    setTimeout(async () => {
      try {
        io?.in(`user:${userId}`).disconnectSockets(true);
        await pool.query('UPDATE users SET is_online=0, last_seen=NOW() WHERE id=?', [userId]);
        emitToAdmins('admin-user-status', { userId, isOnline: false });
      } catch {}
    }, 700);
    emitToAdmins('admin-user-updated', { userId, account_status: 'banned' });

    await logActivity(req.admin.id, 'ban_user', 'user', userId, { reason, banType }, req.ip);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── UNBAN USER — with realtime notification ──────────────────────────────
router.post('/users/:id/unban', requireAdmin, requirePermission('ban_users'), async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    await pool.query('UPDATE user_bans SET is_active=0, lifted_at=NOW(), lifted_by=? WHERE user_id=? AND is_active=1', [req.admin.id, userId]);
    await pool.query('UPDATE users SET account_status="active", ban_reason=NULL, banned_until=NULL WHERE id=?', [userId]);

    // ── REALTIME: Notify user they are unbanned ───────────────────────
    emitToUser(userId, 'account-unbanned', {
      message: 'Your account has been restored! You can now login.',
      adminName: req.admin.username
    });
    emitToAdmins('admin-user-updated', { userId, account_status: 'active' });

    await logActivity(req.admin.id, 'unban_user', 'user', userId, {}, req.ip);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update user
router.put('/users/:id', requireAdmin, requirePermission('manage_users'), async (req, res) => {
  const { username, email, phone, about, account_status } = req.body;
  const fields = []; const vals = [];
  if (username) { fields.push('username=?'); vals.push(username); }
  if (email) { fields.push('email=?'); vals.push(email.toLowerCase()); }
  if (phone !== undefined) { fields.push('phone=?'); vals.push(phone); }
  if (about !== undefined) { fields.push('about=?'); vals.push(about); }
  if (account_status) {
    fields.push('account_status=?'); vals.push(account_status);
    // If activating, clear ban fields
    if (account_status === 'active') {
      fields.push('ban_reason=NULL', 'banned_until=NULL');
      emitToUser(parseInt(req.params.id), 'account-unbanned', { message: 'Your account status has been updated.' });
    }
  }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=?`, vals);
  emitToAdmins('admin-user-updated', { userId: parseInt(req.params.id), account_status });
  await logActivity(req.admin.id, 'update_user', 'user', req.params.id, req.body, req.ip);
  res.json({ ok: true });
});

// Delete user
router.delete('/users/:id', requireAdmin, requirePermission('delete_users'), async (req, res) => {
  // Force disconnect first
  emitToUser(parseInt(req.params.id), 'account-deleted', { message: 'Your account has been deleted.' });
  await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
  await logActivity(req.admin.id, 'delete_user', 'user', req.params.id, {}, req.ip);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  UNBAN REQUESTS
// ══════════════════════════════════════════════

router.get('/unban-requests', requireAdmin, async (req, res) => {
  const { status = 'pending' } = req.query;
  const [rows] = await pool.query(`
    SELECT ur.*, u.username, u.email AS user_email, u.avatar_color, u.account_status
    FROM unban_requests ur JOIN users u ON u.id = ur.user_id
    WHERE ur.status = ?
    ORDER BY ur.created_at DESC LIMIT 50
  `, [status]);
  res.json(rows);
});

router.post('/unban-requests', async (req, res) => {
  const { userId, email, username, reason, appealMessage } = req.body;
  if (!userId || !reason) return res.status(400).json({ error: 'userId and reason required' });
  const [existing] = await pool.query('SELECT id FROM unban_requests WHERE user_id=? AND status="pending"', [userId]);
  if (existing.length) return res.status(409).json({ error: 'You already have a pending request' });
  const [user] = await pool.query('SELECT account_status FROM users WHERE id=?', [userId]);
  if (!user.length || user[0].account_status !== 'banned') return res.status(400).json({ error: 'Account is not banned' });
  await pool.query(
    'INSERT INTO unban_requests (user_id, email, username, reason, appeal_message) VALUES (?,?,?,?,?)',
    [userId, email, username, reason, appealMessage || null]
  );
  emitToAdmins('admin-unban-request', { userId: parseInt(userId), username, email });
  res.json({ ok: true });
});

router.put('/unban-requests/:id', requireAdmin, async (req, res) => {
  const { status, reviewNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const [req_rows] = await pool.query('SELECT * FROM unban_requests WHERE id=?', [req.params.id]);
  if (!req_rows.length) return res.status(404).json({ error: 'Request not found' });
  await pool.query(
    'UPDATE unban_requests SET status=?, reviewed_by=?, reviewed_at=NOW(), review_note=? WHERE id=?',
    [status, req.admin.id, reviewNote || null, req.params.id]
  );
  if (status === 'approved') {
    const userId = req_rows[0].user_id;
    await pool.query('UPDATE users SET account_status="active", ban_reason=NULL, banned_until=NULL WHERE id=?', [userId]);
    await pool.query('UPDATE user_bans SET is_active=0, lifted_at=NOW(), lifted_by=? WHERE user_id=? AND is_active=1', [req.admin.id, userId]);

    // ── REALTIME: Notify user of approval ────────────────────────────
    emitToUser(userId, 'unban-request-approved', {
      message: 'Great news! Your unban request has been approved. You can now login.',
      reviewNote: reviewNote || null
    });
  } else {
    // Notify of rejection
    emitToUser(req_rows[0].user_id, 'unban-request-rejected', {
      message: 'Your unban request has been reviewed.',
      reviewNote: reviewNote || null
    });
  }
  await logActivity(req.admin.id, status === 'approved' ? 'approve_unban' : 'reject_unban', 'unban_request', req.params.id, { reviewNote }, req.ip);
  emitToAdmins('admin-unban-reviewed', { id: parseInt(req.params.id), status, userId: req_rows[0].user_id });
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  ADS MANAGEMENT
// ══════════════════════════════════════════════

router.get('/ads', requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const where = ['1=1']; const params = [];
  if (status) { where.push('a.status = ?'); params.push(status); }
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ads a WHERE ${where.join(' AND ')}`, params);
  const [ads] = await pool.query(`
    SELECT a.*, au.username AS created_by_name
    FROM ads a JOIN admin_users au ON au.id = a.created_by
    WHERE ${where.join(' AND ')} ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  res.json({ ads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/ads/:id', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM ads WHERE id=?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Ad not found' });
  const [events] = await pool.query(`
    SELECT event_type, placement, COUNT(*) AS count, DATE(created_at) AS date
    FROM ad_events WHERE ad_id=? GROUP BY event_type, placement, DATE(created_at)
    ORDER BY date DESC LIMIT 30
  `, [req.params.id]);
  res.json({ ...rows[0], analytics: events });
});

router.post('/ads', requireAdmin, requirePermission('manage_ads'), adminUpload.single('media'), async (req, res) => {
  try {
    let mediaUrl = req.body.media_url;
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
    }
    const {
      title, description, ad_type = 'banner', media_type = 'image',
      cta_text = 'Learn More', cta_url, target_url,
      placement_status = 1, placement_chat = 0, placement_calls = 0, placement_home = 0,
      budget = 0, daily_budget = 0, cost_per_click = 0, cost_per_impression = 0,
      start_date, end_date,
      target_gender = 'all', target_age_min = 13, target_age_max = 65,
      target_location, target_interests,
      bg_color = '#1a2433', text_color = '#ffffff', border_color = '#00bfa5',
      advertiser_name, advertiser_logo, advertiser_email,
      status = 'draft', priority = 1
    } = req.body;
    if (!title || !start_date || !end_date) return res.status(400).json({ error: 'title, start_date, end_date required' });
    const [result] = await pool.query(`
      INSERT INTO ads (title, description, ad_type, media_url, media_type, cta_text, cta_url, target_url,
        placement_status, placement_chat, placement_calls, placement_home,
        budget, daily_budget, cost_per_click, cost_per_impression, start_date, end_date,
        target_gender, target_age_min, target_age_max, target_location, target_interests,
        bg_color, text_color, border_color, advertiser_name, advertiser_logo, advertiser_email,
        status, priority, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [title, description, ad_type, mediaUrl, media_type, cta_text, cta_url, target_url,
        placement_status ? 1 : 0, placement_chat ? 1 : 0, placement_calls ? 1 : 0, placement_home ? 1 : 0,
        budget, daily_budget, cost_per_click, cost_per_impression, start_date, end_date,
        target_gender, target_age_min, target_age_max, target_location, target_interests,
        bg_color, text_color, border_color, advertiser_name, advertiser_logo, advertiser_email,
        status, priority, req.admin.id]);

    // Notify all connected users about new active ad
    if (status === 'active' && io) {
      io.emit('ad-updated', { type: 'new', adId: result.insertId });
    }
    emitToAdmins('admin-ad-updated', { type: 'new', adId: result.insertId, status });

    await logActivity(req.admin.id, 'create_ad', 'ad', result.insertId, { title }, req.ip);
    res.json({ ok: true, id: result.insertId });
  } catch (e) { console.error('create ad:', e); res.status(500).json({ error: e.message }); }
});

router.put('/ads/:id', requireAdmin, requirePermission('manage_ads'), adminUpload.single('media'), async (req, res) => {
  try {
    let mediaUrl = req.body.media_url;
    if (req.file) mediaUrl = `/uploads/${req.file.filename}`;
    const fields = []; const vals = [];
    const allowed = ['title','description','ad_type','media_type','cta_text','cta_url','target_url',
      'placement_status','placement_chat','placement_calls','placement_home',
      'budget','daily_budget','cost_per_click','cost_per_impression','start_date','end_date',
      'target_gender','target_age_min','target_age_max','target_location','target_interests',
      'bg_color','text_color','border_color','advertiser_name','advertiser_logo','advertiser_email',
      'status','priority'];
    allowed.forEach(k => { if (req.body[k] !== undefined) { fields.push(`${k}=?`); vals.push(req.body[k]); } });
    if (mediaUrl) { fields.push('media_url=?'); vals.push(mediaUrl); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(req.params.id);
    await pool.query(`UPDATE ads SET ${fields.join(',')} WHERE id=?`, vals);

    // Notify users of ad status change
    if (io) io.emit('ad-updated', { type: 'status', adId: parseInt(req.params.id), status: req.body.status || null });
    emitToAdmins('admin-ad-updated', { type: 'status', adId: parseInt(req.params.id), status: req.body.status || null });

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/ads/:id', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  await pool.query('DELETE FROM ads WHERE id=?', [req.params.id]);
  if (io) io.emit('ad-updated', { type: 'deleted', adId: parseInt(req.params.id) });
  emitToAdmins('admin-ad-updated', { type: 'deleted', adId: parseInt(req.params.id) });
  res.json({ ok: true });
});

router.get('/user-ads', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  const { status = '' } = req.query;
  const params = [];
  const where = status ? 'WHERE ua.status=?' : '';
  if (status) params.push(status);
  try {
    const [ads] = await pool.query(`
      SELECT ua.*, u.username, u.email
      FROM user_ads ua JOIN users u ON u.id=ua.user_id
      ${where}
      ORDER BY ua.created_at DESC LIMIT 100
    `, params);
    res.json(ads);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/user-ads/:id/review', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  const { status, rejectReason, verificationFields = [] } = req.body;
  if (!['approved','rejected','hold','suspended','document_requested'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const [rows] = await pool.query('SELECT * FROM user_ads WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Ad not found' });
    const ad = rows[0];
    const fields = ['status=?', 'reject_reason=?'];
    const vals = [status, rejectReason || null];
    if (status === 'document_requested') {
      fields.push('verification_required=1', 'verification_fields=?', "verification_status='requested'");
      vals.push(JSON.stringify(verificationFields || []));
    }
    if (status === 'approved') fields.push("verification_required=0", "verification_status='approved'");
    if (status === 'rejected') fields.push("verification_status='rejected'");
    vals.push(req.params.id);
    await pool.query(`UPDATE user_ads SET ${fields.join(',')} WHERE id=?`, vals);
    emitToUser(ad.user_id, 'user-ad-reviewed', { adId: parseInt(req.params.id), status, rejectReason: rejectReason || null, verificationFields, title: ad.title });
    if (status === 'approved' && io) io.emit('ad-updated', { type: 'user-ad-approved', adId: parseInt(req.params.id) });
    emitToAdmins('admin-ad-updated', { type: 'user-ad-reviewed', adId: parseInt(req.params.id), status });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/ad-payments', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.username, u.email, ua.title AS ad_title
      FROM user_ad_payments p
      JOIN users u ON u.id=p.user_id
      LEFT JOIN user_ads ua ON ua.id=p.ad_id
      ORDER BY p.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/ad-spend', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, u.username, ua.title AS ad_title
      FROM user_ad_events e
      JOIN users u ON u.id=e.owner_user_id
      JOIN user_ads ua ON ua.id=e.ad_id
      ORDER BY e.created_at DESC LIMIT 700
    `);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/ad-diagnostics', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  try {
    const [[sys]] = await pool.query(`SELECT COUNT(*) total_ads, COALESCE(SUM(impressions),0) impressions, COALESCE(SUM(clicks),0) clicks, COALESCE(SUM(spend),0) spend FROM ads`);
    const [[user]] = await pool.query(`SELECT COUNT(*) total_ads, COALESCE(SUM(impressions),0) impressions, COALESCE(SUM(clicks),0) clicks, COALESCE(SUM(leads),0) leads, COALESCE(SUM(spent),0) spend FROM user_ads`);
    const [[pay]] = await pool.query(`SELECT COALESCE(SUM(amount),0) total_payments, COUNT(*) payment_count FROM user_ad_payments WHERE status='completed'`);
    res.json({ systemAds: sys, userAds: user, payments: pay });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/user-ads/:id/leads', requireAdmin, requirePermission('manage_ads'), async (req, res) => {
  try {
    const [leads] = await pool.query('SELECT * FROM user_ad_leads WHERE ad_id=? ORDER BY created_at DESC', [req.params.id]);
    leads.forEach(l => { try { l.lead_data = typeof l.lead_data === 'string' ? JSON.parse(l.lead_data) : l.lead_data; } catch {} });
    res.json(leads);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Public: Get active ads for user-facing app
router.get('/public/ads', async (req, res) => {
  const { placement = 'status' } = req.query;
  const placementCol = `placement_${placement}`;
  const validPlacements = ['status', 'chat', 'calls', 'home'];
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
  } catch (e) { res.json([]); }
});

// Track ad event + deduct budget
router.post('/public/ads/:id/event', async (req, res) => {
  const { eventType = 'impression', userId, placement } = req.body;
  try {
    await pool.query('INSERT INTO ad_events (ad_id, user_id, event_type, placement, ip_address) VALUES (?,?,?,?,?)',
      [req.params.id, userId || null, eventType, placement, req.ip]);

    if (eventType === 'impression') {
      await pool.query('UPDATE ads SET impressions=impressions+1, spend=spend+cost_per_impression WHERE id=?', [req.params.id]);
    }
    if (eventType === 'click') {
      await pool.query('UPDATE ads SET clicks=clicks+1, spend=spend+cost_per_click WHERE id=?', [req.params.id]);
    }

    // Auto-pause if budget exceeded
    await pool.query(`
      UPDATE ads SET status='ended'
      WHERE id=? AND status='active' AND budget > 0 AND spend >= budget
    `, [req.params.id]);

    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

// ══════════════════════════════════════════════
//  API KEY MANAGEMENT
// ══════════════════════════════════════════════

router.get('/api-keys', requireAdmin, async (req, res) => {
  const [keys] = await pool.query(`
    SELECT ak.*, au.username AS created_by_name
    FROM api_keys ak JOIN admin_users au ON au.id = ak.created_by
    ORDER BY ak.created_at DESC
  `);
  keys.forEach(k => { k.api_secret = k.api_secret.slice(0, 8) + '••••••••••••••••'; });
  res.json(keys);
});

router.post('/api-keys', requireAdmin, requirePermission('manage_api_keys'), async (req, res) => {
  const { keyName, ownerName, ownerEmail, maxUsers = 100, rateLimitPerMin = 60, rateLimitPerDay = 10000, permissions, expiresAt } = req.body;
  if (!keyName || !ownerName || !ownerEmail) return res.status(400).json({ error: 'keyName, ownerName, ownerEmail required' });
  const apiKey = 'ck_' + crypto.randomBytes(24).toString('hex');
  const apiSecret = 'sk_' + crypto.randomBytes(32).toString('hex');
  const [result] = await pool.query(
    'INSERT INTO api_keys (key_name, api_key, api_secret, owner_name, owner_email, max_users, rate_limit_per_min, rate_limit_per_day, permissions, expires_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [keyName, apiKey, apiSecret, ownerName, ownerEmail, maxUsers, rateLimitPerMin, rateLimitPerDay, JSON.stringify(permissions || {}), expiresAt || null, req.admin.id]
  );
  await logActivity(req.admin.id, 'create_api_key', 'api_key', result.insertId, { keyName, ownerEmail }, req.ip);
  res.json({ ok: true, id: result.insertId, apiKey, apiSecret });
});

router.put('/api-keys/:id', requireAdmin, requirePermission('manage_api_keys'), async (req, res) => {
  const { status, maxUsers, rateLimitPerMin, rateLimitPerDay, permissions } = req.body;
  const fields = []; const vals = [];
  if (status) { fields.push('status=?'); vals.push(status); }
  if (maxUsers) { fields.push('max_users=?'); vals.push(maxUsers); }
  if (rateLimitPerMin) { fields.push('rate_limit_per_min=?'); vals.push(rateLimitPerMin); }
  if (rateLimitPerDay) { fields.push('rate_limit_per_day=?'); vals.push(rateLimitPerDay); }
  if (permissions) { fields.push('permissions=?'); vals.push(JSON.stringify(permissions)); }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  await pool.query(`UPDATE api_keys SET ${fields.join(',')} WHERE id=?`, vals);
  res.json({ ok: true });
});

router.delete('/api-keys/:id', requireAdmin, requirePermission('manage_api_keys'), async (req, res) => {
  await pool.query('UPDATE api_keys SET status="revoked" WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  ROLES MANAGEMENT
// ══════════════════════════════════════════════

router.get('/roles', requireAdmin, async (req, res) => {
  const [roles] = await pool.query('SELECT * FROM admin_roles ORDER BY id ASC');
  res.json(roles);
});

router.post('/roles', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  const { roleName, displayName, description, permissions, color = '#00bfa5' } = req.body;
  if (!roleName || !displayName || !permissions) return res.status(400).json({ error: 'roleName, displayName, permissions required' });
  await pool.query(
    'INSERT INTO admin_roles (role_name, display_name, description, permissions, color, created_by) VALUES (?,?,?,?,?,?)',
    [roleName, displayName, description, JSON.stringify(permissions), color, req.admin.id]
  );
  res.json({ ok: true });
});

router.put('/roles/:id', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  const { displayName, description, permissions, color } = req.body;
  const [role] = await pool.query('SELECT is_system FROM admin_roles WHERE id=?', [req.params.id]);
  if (!role.length) return res.status(404).json({ error: 'Role not found' });
  const fields = []; const vals = [];
  if (displayName) { fields.push('display_name=?'); vals.push(displayName); }
  if (description !== undefined) { fields.push('description=?'); vals.push(description); }
  if (permissions) { fields.push('permissions=?'); vals.push(JSON.stringify(permissions)); }
  if (color) { fields.push('color=?'); vals.push(color); }
  if (!fields.length) return res.json({ ok: true });
  vals.push(req.params.id);
  await pool.query(`UPDATE admin_roles SET ${fields.join(',')} WHERE id=?`, vals);
  res.json({ ok: true });
});

router.delete('/roles/:id', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  const [role] = await pool.query('SELECT is_system FROM admin_roles WHERE id=?', [req.params.id]);
  if (!role.length) return res.status(404).json({ error: 'Not found' });
  if (role[0].is_system) return res.status(403).json({ error: 'Cannot delete system roles' });
  await pool.query('DELETE FROM admin_roles WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

router.put('/admin-users/:id/role', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Only superadmin can assign roles' });
  const { role, permissions } = req.body;
  await pool.query('UPDATE admin_users SET role=?, permissions=? WHERE id=?', [role, JSON.stringify(permissions || {}), req.params.id]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  ADMIN USERS MANAGEMENT
// ══════════════════════════════════════════════

router.get('/admin-users', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  const [admins] = await pool.query('SELECT id, username, email, role, avatar_url, is_active, last_login, created_at FROM admin_users ORDER BY id ASC');
  res.json(admins);
});

router.post('/admin-users', requireAdmin, requirePermission('manage_roles'), async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Only superadmin can create admin users' });
  const { username, email, password, role = 'moderator', permissions } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'username, email, password required' });
  const hash = await bcrypt.hash(password, 12);
  try {
    await pool.query(
      'INSERT INTO admin_users (username, email, password_hash, role, permissions) VALUES (?,?,?,?,?)',
      [username, email.toLowerCase(), hash, role, JSON.stringify(permissions || {})]
    );
    res.json({ ok: true });
  } catch (e) { res.status(409).json({ error: 'Username or email already taken' }); }
});

router.delete('/admin-users/:id', requireAdmin, async (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Only superadmin can delete admins' });
  if (parseInt(req.params.id) === req.admin.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  await pool.query('UPDATE admin_users SET is_active=0 WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════
//  APP SETTINGS
// ══════════════════════════════════════════════

router.get('/settings', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM app_settings ORDER BY setting_key ASC');
  res.json(rows);
});

router.put('/settings', requireAdmin, requirePermission('manage_settings'), async (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) return res.status(400).json({ error: 'settings array required' });
  for (const s of settings) {
    await pool.query(
      'INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE setting_value=?, updated_by=?',
      [s.key, s.value, s.type || 'string', s.description || '', s.value, req.admin.id]
    );
  }
  // Broadcast settings change to all connected clients if needed
  if (io) io.emit('settings-updated', { updatedBy: req.admin.username });
  res.json({ ok: true });
});

router.get('/payment-gateways', requireAdmin, requirePermission('manage_settings'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,display_name,is_active,config,created_at FROM payment_gateways ORDER BY id ASC');
    rows.forEach(r => {
      try { r.config = typeof r.config === 'string' ? JSON.parse(r.config) : (r.config || {}); } catch { r.config = {}; }
      if (r.config.key_secret) r.config.key_secret = '********';
      if (r.config.secret_key) r.config.secret_key = '********';
      if (r.config.client_secret) r.config.client_secret = '********';
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/payment-gateways/:name', requireAdmin, requirePermission('manage_settings'), async (req, res) => {
  const { isActive, config = {} } = req.body;
  try {
    const [oldRows] = await pool.query('SELECT config FROM payment_gateways WHERE name=?', [req.params.name]);
    const oldConfig = oldRows[0]?.config ? (typeof oldRows[0].config === 'string' ? JSON.parse(oldRows[0].config) : oldRows[0].config) : {};
    const merged = { ...oldConfig, ...config };
    for (const key of ['key_secret','secret_key','client_secret']) {
      if (merged[key] === '********') merged[key] = oldConfig[key] || '';
    }
    await pool.query('UPDATE payment_gateways SET is_active=?, config=? WHERE name=?', [isActive ? 1 : 0, JSON.stringify(merged), req.params.name]);
    emitToAdmins('admin-payment-gateway-updated', { name: req.params.name, isActive: !!isActive });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════
//  ACTIVITY LOG
// ══════════════════════════════════════════════

router.get('/activity', requireAdmin, async (req, res) => {
  const [logs] = await pool.query(`
    SELECT al.*, au.username AS admin_name, au.avatar_url AS admin_avatar
    FROM admin_activity_log al JOIN admin_users au ON au.id = al.admin_id
    ORDER BY al.created_at DESC LIMIT 100
  `);
  res.json(logs);
});

// ══════════════════════════════════════════════
//  REALTIME — Admin socket events endpoint
// ══════════════════════════════════════════════

// Get current online user count (realtime)
router.get('/online-count', requireAdmin, async (req, res) => {
  try {
    if (io) {
      const onlineIds = await getRealtimeOnlineIds();
      res.json({ count: onlineIds.length, onlineIds });
    } else {
      const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_online=1');
      res.json({ count });
    }
  } catch { res.json({ count: 0 }); }
});

export default router;
export { ADMIN_JWT_SECRET };
