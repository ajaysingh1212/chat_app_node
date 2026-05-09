// ════════════════════════════════════════════════════════════════════════════
//  user-ban-ads.js — Ban System + User Ads + Razorpay Payment
//  Mount: app.use('/api', userBanAdsRouter)
//  Also exports: handleBanSocket(socket, io, pool)
// ════════════════════════════════════════════════════════════════════════════

import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

const router = express.Router();
let pool, io;

export function setBanPool(p) { pool = p; }
export function setBanIo(i) { io = i; }

// ── DB Tables for User Ads ─────────────────────────────────────────────────
export async function initBanAdsTables(poolInstance) {
  pool = poolInstance;
  const q = async (sql) => { try { await pool.query(sql); } catch(e) {} };

  await q(`CREATE TABLE IF NOT EXISTS user_ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    ad_type ENUM('banner','status','chat','notification') DEFAULT 'banner',
    media_url VARCHAR(500) DEFAULT NULL,
    media_type ENUM('image','video','gif') DEFAULT 'image',
    cta_text VARCHAR(100) DEFAULT 'Learn More',
    cta_url VARCHAR(500) DEFAULT NULL,
    action_type ENUM('website','call','whatsapp','lead') DEFAULT 'website',
    phone_number VARCHAR(40) DEFAULT NULL,
    whatsapp_number VARCHAR(40) DEFAULT NULL,
    lead_fields JSON DEFAULT NULL,
    placement_status TINYINT(1) DEFAULT 1,
    placement_chat TINYINT(1) DEFAULT 0,
    placement_calls TINYINT(1) DEFAULT 0,
    placement_home TINYINT(1) DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT 0.00,
    spent DECIMAL(10,2) DEFAULT 0.00,
    daily_budget DECIMAL(10,2) DEFAULT 0.00,
    cost_per_click DECIMAL(10,4) DEFAULT 0.0000,
    cost_per_impression DECIMAL(10,4) DEFAULT 0.0000,
    cost_per_lead DECIMAL(10,4) DEFAULT 0.0000,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_gender ENUM('all','male','female') DEFAULT 'all',
    target_age_min INT DEFAULT 13,
    target_age_max INT DEFAULT 65,
    target_location VARCHAR(500) DEFAULT NULL,
    advertiser_name VARCHAR(200) DEFAULT NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    leads BIGINT DEFAULT 0,
    verification_required TINYINT(1) DEFAULT 0,
    verification_fields JSON DEFAULT NULL,
    verification_documents JSON DEFAULT NULL,
    verification_status ENUM('not_required','requested','submitted','approved','rejected') DEFAULT 'not_required',
    status ENUM('draft','pending','approved','paused','hold','suspended','document_requested','ended','rejected') DEFAULT 'pending',
    reject_reason TEXT DEFAULT NULL,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS action_type ENUM('website','call','whatsapp','lead') DEFAULT 'website'`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40) DEFAULT NULL`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(40) DEFAULT NULL`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS lead_fields JSON DEFAULT NULL`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS placement_calls TINYINT(1) DEFAULT 0`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS cost_per_lead DECIMAL(10,4) DEFAULT 0.0000`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS leads BIGINT DEFAULT 0`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_required TINYINT(1) DEFAULT 0`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_fields JSON DEFAULT NULL`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_documents JSON DEFAULT NULL`);
  await q(`ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_status ENUM('not_required','requested','submitted','approved','rejected') DEFAULT 'not_required'`);
  await q(`ALTER TABLE user_ads MODIFY COLUMN status ENUM('draft','pending','approved','paused','hold','suspended','document_requested','ended','rejected') DEFAULT 'pending'`);

  await q(`CREATE TABLE IF NOT EXISTS user_ad_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ad_id INT DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    gateway VARCHAR(50) DEFAULT 'razorpay',
    gateway_order_id VARCHAR(200) DEFAULT NULL,
    gateway_payment_id VARCHAR(200) DEFAULT NULL,
    gateway_signature VARCHAR(500) DEFAULT NULL,
    status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS ad_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_added DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS user_ad_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    owner_user_id INT NOT NULL,
    viewer_user_id INT NULL,
    event_type ENUM('impression','click','lead','call','whatsapp','website_visit') DEFAULT 'impression',
    placement VARCHAR(50) DEFAULT NULL,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES user_ads(id) ON DELETE CASCADE,
    INDEX idx_user_ad_events_ad (ad_id),
    INDEX idx_user_ad_events_owner (owner_user_id),
    INDEX idx_user_ad_events_date (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS user_ad_leads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ad_id INT NOT NULL,
    owner_user_id INT NOT NULL,
    viewer_user_id INT NULL,
    lead_data JSON NOT NULL,
    cost DECIMAL(10,4) DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES user_ads(id) ON DELETE CASCADE,
    INDEX idx_user_ad_leads_ad (ad_id),
    INDEX idx_user_ad_leads_owner (owner_user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`CREATE TABLE IF NOT EXISTS payment_gateways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    config JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  try {
    const [gw] = await pool.query('SELECT COUNT(*) as c FROM payment_gateways');
    if (!gw[0].c) {
      await pool.query(`INSERT INTO payment_gateways (name, display_name, is_active, config) VALUES
        ('razorpay', 'Razorpay', 0, '{"key_id":"","key_secret":"","webhook_secret":""}'),
        ('stripe', 'Stripe', 0, '{"publishable_key":"","secret_key":"","webhook_secret":""}'),
        ('paypal', 'PayPal', 0, '{"client_id":"","client_secret":"","mode":"sandbox"}')`);
    }
  } catch(e) {}

  console.log('✅ Ban/Ads tables initialized');
}

// ── Auth Middleware ────────────────────────────────────────────────────────
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_32chars+';

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ════════════════════════════════════════════════════════════════════════════
//  BAN SYSTEM SOCKET HANDLER
// ════════════════════════════════════════════════════════════════════════════
export function handleBanSocket(socket, ioInstance, poolInstance) {
  io = ioInstance;
  pool = poolInstance;

  // When user connects, check ban status immediately
  socket.on('check-ban-status', async () => {
    try {
      const userId = socket.user?.id;
      if (!userId) return;
      const [rows] = await pool.query(
        'SELECT account_status, ban_reason, banned_until FROM users WHERE id=?',
        [userId]
      );
      if (!rows.length) return;
      const user = rows[0];
      if (user.account_status === 'banned') {
        // Check if temp ban expired
        if (user.banned_until && new Date(user.banned_until) < new Date()) {
          await pool.query('UPDATE users SET account_status="active", ban_reason=NULL, banned_until=NULL WHERE id=?', [userId]);
          socket.emit('ban-lifted', { message: 'Your temporary ban has expired. Welcome back!' });
        } else {
          const [req] = await pool.query(
            'SELECT id, status FROM unban_requests WHERE user_id=? ORDER BY created_at DESC LIMIT 1',
            [userId]
          );
          socket.emit('account-banned', {
            reason: user.ban_reason || 'Your account has been suspended.',
            bannedUntil: user.banned_until,
            unbanRequestStatus: req.length ? req[0].status : null,
            unbanRequestId: req.length ? req[0].id : null
          });
          socket.disconnect(true);
        }
      }
    } catch(e) {}
  });
}

// ════════════════════════════════════════════════════════════════════════════
//  PAYMENT GATEWAY ROUTES (Admin)
// ════════════════════════════════════════════════════════════════════════════

// Get active gateway config for user side
router.get('/payment/gateways/active', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name, display_name, config FROM payment_gateways WHERE is_active=1'
    );
    // Only expose public keys
    const safe = rows.map(gw => {
      const cfg = typeof gw.config === 'string' ? JSON.parse(gw.config) : (gw.config || {});
      return {
        name: gw.name,
        display_name: gw.display_name,
        key_id: cfg.key_id || cfg.publishable_key || cfg.client_id || ''
      };
    });
    res.json(safe);
  } catch(e) { res.json([]); }
});

// Create Razorpay order
router.post('/payment/create-order', requireAuth, async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  if (!amount || amount < 1) return res.status(400).json({ error: 'Minimum amount is ₹1' });

  try {
    const [gw] = await pool.query(
      "SELECT config FROM payment_gateways WHERE name='razorpay' AND is_active=1"
    );
    if (!gw.length) return res.status(400).json({ error: 'Razorpay not configured' });

    const cfg = typeof gw[0].config === 'string' ? JSON.parse(gw[0].config) : gw[0].config;
    if (!cfg.key_id || !cfg.key_secret) return res.status(400).json({ error: 'Razorpay credentials missing' });

    // Create Razorpay order via API
    const auth = Buffer.from(`${cfg.key_id}:${cfg.key_secret}`).toString('base64');
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: orderId
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(400).json({ error: err.error?.description || 'Order creation failed' });
    }

    const order = await response.json();

    // Save pending payment
    const [result] = await pool.query(
      'INSERT INTO user_ad_payments (user_id, amount, currency, gateway, gateway_order_id, status) VALUES (?,?,?,?,?,?)',
      [req.user.id, amount, currency, 'razorpay', order.id, 'pending']
    );

    res.json({
      orderId: order.id,
      paymentId: result.insertId,
      amount: order.amount,
      currency: order.currency,
      keyId: cfg.key_id
    });
  } catch(e) {
    console.error('create-order:', e);
    res.status(500).json({ error: 'Payment service error: ' + e.message });
  }
});

// Verify payment & add balance
router.post('/payment/verify', requireAuth, async (req, res) => {
  const { orderId, paymentId, signature, amount } = req.body;

  try {
    const [gw] = await pool.query(
      "SELECT config FROM payment_gateways WHERE name='razorpay' AND is_active=1"
    );
    if (!gw.length) return res.status(400).json({ error: 'Gateway not configured' });
    
    const cfg = typeof gw[0].config === 'string' ? JSON.parse(gw[0].config) : gw[0].config;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', cfg.key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSig !== signature) {
      await pool.query(
        "UPDATE user_ad_payments SET status='failed' WHERE gateway_order_id=?",
        [orderId]
      );
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment record
    await pool.query(
      "UPDATE user_ad_payments SET status='completed', gateway_payment_id=?, gateway_signature=? WHERE gateway_order_id=?",
      [paymentId, signature, orderId]
    );

    // Add to balance
    await pool.query(
      `INSERT INTO ad_balance (user_id, balance, total_added) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE balance=balance+VALUES(balance), total_added=total_added+VALUES(total_added)`,
      [req.user.id, amount, amount]
    );

    await pool.query(
      `UPDATE user_ads
       SET status='approved'
       WHERE user_id=? AND status IN ('ended','paused')
         AND start_date <= CURDATE() AND end_date >= CURDATE()
         AND (budget = 0 OR spent < budget)`,
      [req.user.id]
    );

    const [bal] = await pool.query('SELECT balance FROM ad_balance WHERE user_id=?', [req.user.id]);
    if (io) io.emit('ad-updated', { type: 'wallet-funded', userId: req.user.id });
    
    res.json({ ok: true, newBalance: bal[0]?.balance || 0 });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Get user balance
router.get('/ads/balance', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ad_balance WHERE user_id=?', [req.user.id]);
    res.json(rows[0] || { balance: 0, total_added: 0, total_spent: 0 });
  } catch(e) { res.json({ balance: 0 }); }
});

router.get('/ads/payments', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, ua.title AS ad_title
       FROM user_ad_payments p
       LEFT JOIN user_ads ua ON ua.id=p.ad_id
       WHERE p.user_id=? ORDER BY p.created_at DESC LIMIT 200`,
      [req.user.id]
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/ads/spend', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, ua.title AS ad_title
       FROM user_ad_events e JOIN user_ads ua ON ua.id=e.ad_id
       WHERE e.owner_user_id=? ORDER BY e.created_at DESC LIMIT 500`,
      [req.user.id]
    );
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.get('/ads/diagnostics', requireAuth, async (req, res) => {
  try {
    const [[balance]] = await pool.query('SELECT * FROM ad_balance WHERE user_id=?', [req.user.id]);
    const [ads] = await pool.query(
      `SELECT id,title,status,budget,spent,impressions,clicks,leads,cost_per_click,cost_per_impression,cost_per_lead,
              action_type,verification_status,reject_reason
       FROM user_ads WHERE user_id=? ORDER BY created_at DESC`,
      [req.user.id]
    );
    const [[totals]] = await pool.query(
      `SELECT COALESCE(SUM(impressions),0) impressions, COALESCE(SUM(clicks),0) clicks,
              COALESCE(SUM(leads),0) leads, COALESCE(SUM(spent),0) spent
       FROM user_ads WHERE user_id=?`,
      [req.user.id]
    );
    res.json({ balance: balance || { balance: 0, total_added: 0, total_spent: 0 }, totals, ads });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════════════════
//  USER ADS CRUD
// ════════════════════════════════════════════════════════════════════════════

// Get user's ads
router.get('/user-ads', requireAuth, async (req, res) => {
  try {
    const [ads] = await pool.query(
      'SELECT * FROM user_ads WHERE user_id=? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(ads);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Create user ad
router.post('/user-ads', requireAuth, async (req, res) => {
  const {
    title, description, adType = 'banner', mediaUrl, mediaType = 'image',
    ctaText = 'Learn More', ctaUrl, placementStatus = 1, placementChat = 0,
    placementCalls = 0, placementHome = 0, budget = 0, dailyBudget = 0, costPerClick = 0,
    costPerImpression = 0, costPerLead = 0, startDate, endDate, targetGender = 'all',
    targetAgeMin = 13, targetAgeMax = 65, targetLocation, advertiserName,
    actionType = 'website', phoneNumber, whatsappNumber, leadFields = []
  } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ error: 'title, startDate, endDate required' });
  }

  try {
    // Check if user has enough balance
    if (budget > 0) {
      const [bal] = await pool.query('SELECT balance FROM ad_balance WHERE user_id=?', [req.user.id]);
      const balance = bal[0]?.balance || 0;
      if (balance < budget) {
        return res.status(400).json({ error: `Insufficient balance. You have ₹${balance}, need ₹${budget}` });
      }

    }

    const [result] = await pool.query(
      `INSERT INTO user_ads (user_id, title, description, ad_type, media_url, media_type,
        cta_text, cta_url, action_type, phone_number, whatsapp_number, lead_fields,
        placement_status, placement_chat, placement_calls, placement_home,
        budget, daily_budget, cost_per_click, cost_per_impression, cost_per_lead,
        start_date, end_date, target_gender, target_age_min, target_age_max,
        target_location, advertiser_name, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      [req.user.id, title, description, adType, mediaUrl, mediaType,
       ctaText, ctaUrl, actionType, phoneNumber || null, whatsappNumber || null, JSON.stringify(leadFields || []),
       placementStatus, placementChat, placementCalls, placementHome,
       budget, dailyBudget, costPerClick, costPerImpression, costPerLead,
       startDate, endDate, targetGender, targetAgeMin, targetAgeMax,
       targetLocation, advertiserName]
    );

    // Notify admins
    if (io) io.emit('admin-new-user-ad', { adId: result.insertId, userId: req.user.id, title });

    res.json({ ok: true, id: result.insertId });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Update user ad
router.put('/user-ads/:id', requireAuth, async (req, res) => {
  const [ad] = await pool.query('SELECT * FROM user_ads WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  if (!ad.length) return res.status(404).json({ error: 'Ad not found' });
  if (!['draft', 'rejected', 'document_requested'].includes(ad[0].status)) {
    return res.status(400).json({ error: 'Can only edit draft, rejected, or document requested ads' });
  }

  const fields = [], vals = [];
  const allowed = ['title','description','media_url','cta_text','cta_url','target_location','phone_number','whatsapp_number','action_type'];
  allowed.forEach(k => { if (req.body[k] !== undefined) { fields.push(`${k}=?`); vals.push(req.body[k]); } });
  if (req.body.leadFields !== undefined) { fields.push('lead_fields=?'); vals.push(JSON.stringify(req.body.leadFields || [])); }
  if (req.body.verificationDocuments !== undefined) {
    fields.push('verification_documents=?', "verification_status='submitted'");
    vals.push(JSON.stringify(req.body.verificationDocuments || {}));
  }
  if (fields.length) {
    fields.push('status=?'); vals.push('pending'); vals.push(req.params.id);
    await pool.query(`UPDATE user_ads SET ${fields.join(',')} WHERE id=?`, vals);
  }
  res.json({ ok: true });
});

// Delete user ad
router.delete('/user-ads/:id', requireAuth, async (req, res) => {
  const [ad] = await pool.query('SELECT * FROM user_ads WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  if (!ad.length) return res.status(404).json({ error: 'Not found' });
  
  await pool.query('DELETE FROM user_ads WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

// ── Admin: approve/reject user ad ─────────────────────────────────────────
router.put('/admin/user-ads/:id/review', requireAuth, async (req, res) => {
  const { status, rejectReason, verificationFields = [] } = req.body;
  if (!['approved', 'rejected', 'hold', 'suspended', 'document_requested'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const [ad] = await pool.query('SELECT * FROM user_ads WHERE id=?', [req.params.id]);
    if (!ad.length) return res.status(404).json({ error: 'Ad not found' });

    const verificationStatus = status === 'document_requested' ? 'requested' : (status === 'approved' ? 'approved' : undefined);
    const fields = ['status=?', 'reject_reason=?'];
    const vals = [status, rejectReason || null];
    if (status === 'document_requested') {
      fields.push('verification_required=1', 'verification_fields=?', 'verification_status=?');
      vals.push(JSON.stringify(verificationFields || []), verificationStatus);
    } else if (verificationStatus) {
      fields.push('verification_status=?');
      vals.push(verificationStatus);
    }
    vals.push(req.params.id);
    await pool.query(`UPDATE user_ads SET ${fields.join(',')} WHERE id=?`, vals);

    // Notify user via socket
    if (io) {
      io.to(`user:${ad[0].user_id}`).emit('user-ad-reviewed', {
        adId: parseInt(req.params.id),
        status,
        rejectReason: rejectReason || null,
        verificationFields,
        title: ad[0].title
      });
    }

    // If approved, push live ad to all users
    if (status === 'approved') {
      io.emit('ad-updated', { type: 'user-ad-approved', adId: parseInt(req.params.id) });
    }

    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Get all user-submitted ads (admin)
router.get('/admin/user-ads', requireAuth, async (req, res) => {
  const { status } = req.query;
  const where = status ? 'WHERE ua.status=?' : '';
  const params = status ? [status] : [];
  try {
    const [ads] = await pool.query(
      `SELECT ua.*, u.username, u.email FROM user_ads ua JOIN users u ON u.id=ua.user_id
       ${where} ORDER BY ua.created_at DESC LIMIT 100`,
      params
    );
    res.json(ads);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Public: Get all active ads (system + user) ────────────────────────────
router.get('/all-ads', async (req, res) => {
  const { placement = 'status' } = req.query;
  const validPlacements = ['status', 'chat', 'calls', 'home'];
  if (!validPlacements.includes(placement)) return res.json([]);
  const col = `placement_${placement}`;

  try {
    // System ads
    const [sysAds] = await pool.query(
      `SELECT id, title, description, ad_type, media_url, media_type, cta_text, cta_url,
              bg_color, text_color, border_color, advertiser_name, advertiser_logo, priority,
              'system' as source
       FROM ads WHERE status='active' AND ${col}=1
         AND start_date <= CURDATE() AND end_date >= CURDATE()
       ORDER BY priority DESC LIMIT 2`
    );

    // User ads
    const [userAds] = await pool.query(
      `SELECT ua.id, ua.title, ua.description, ua.ad_type, ua.media_url, ua.media_type,
              ua.cta_text, ua.cta_url, ua.action_type, ua.phone_number, ua.whatsapp_number,
              ua.lead_fields, ua.cost_per_click, ua.cost_per_impression, ua.cost_per_lead,
              '#1a2433' as bg_color, '#ffffff' as text_color,
              '#00bfa5' as border_color, ua.advertiser_name, NULL as advertiser_logo,
              ua.priority, 'user' as source
       FROM user_ads ua WHERE ua.status='approved' AND ua.${col}=1
         AND ua.start_date <= CURDATE() AND ua.end_date >= CURDATE()
         AND (ua.budget = 0 OR ua.spent < ua.budget)
       ORDER BY RAND() LIMIT 1`
    );

    let combined = [...sysAds, ...userAds];
    if (!combined.length) {
      const [fallbackSys] = await pool.query(
        `SELECT id, title, description, ad_type, media_url, media_type, cta_text, cta_url,
                bg_color, text_color, border_color, advertiser_name, advertiser_logo, priority,
                'system' as source
         FROM ads WHERE status='active'
           AND (placement_status=1 OR placement_chat=1 OR placement_calls=1 OR placement_home=1)
           AND start_date <= CURDATE() AND end_date >= CURDATE()
         ORDER BY priority DESC, RAND() LIMIT 1`
      );
      const [fallbackUser] = await pool.query(
        `SELECT ua.id, ua.title, ua.description, ua.ad_type, ua.media_url, ua.media_type,
                ua.cta_text, ua.cta_url, ua.action_type, ua.phone_number, ua.whatsapp_number,
                ua.lead_fields, ua.cost_per_click, ua.cost_per_impression, ua.cost_per_lead,
                '#1a2433' as bg_color, '#ffffff' as text_color,
                '#00bfa5' as border_color, ua.advertiser_name, NULL as advertiser_logo,
                ua.priority, 'user' as source
         FROM user_ads ua WHERE ua.status='approved'
           AND (ua.placement_status=1 OR ua.placement_chat=1 OR ua.placement_calls=1 OR ua.placement_home=1)
           AND ua.start_date <= CURDATE() AND ua.end_date >= CURDATE()
           AND (ua.budget = 0 OR ua.spent < ua.budget)
         ORDER BY RAND() LIMIT 1`
      );
      combined = [...fallbackSys, ...fallbackUser].slice(0, 1);
    }

    res.json(combined);
  } catch(e) { res.json([]); }
});

async function chargeUserAdEvent(adId, eventType, viewerUserId, placement, leadData = null) {
  const [ads] = await pool.query('SELECT * FROM user_ads WHERE id=?', [adId]);
  if (!ads.length || !['approved'].includes(ads[0].status)) return false;
  const ad = ads[0];
  const costMap = {
    impression: Number(ad.cost_per_impression || 0),
    click: Number(ad.cost_per_click || 0),
    call: Number(ad.cost_per_click || 0),
    whatsapp: Number(ad.cost_per_click || 0),
    website_visit: Number(ad.cost_per_click || 0),
    lead: Number(ad.cost_per_lead || ad.cost_per_click || 0)
  };
  const cost = costMap[eventType] ?? 0;
  if (eventType === 'impression') {
    await pool.query('UPDATE user_ads SET impressions=impressions+1, spent=spent+? WHERE id=?', [cost, adId]);
  } else if (eventType === 'lead') {
    await pool.query('UPDATE user_ads SET leads=leads+1, spent=spent+? WHERE id=?', [cost, adId]);
    await pool.query('INSERT INTO user_ad_leads (ad_id, owner_user_id, viewer_user_id, lead_data, cost) VALUES (?,?,?,?,?)',
      [adId, ad.user_id, viewerUserId || null, JSON.stringify(leadData || {}), cost]);
  } else {
    await pool.query('UPDATE user_ads SET clicks=clicks+1, spent=spent+? WHERE id=?', [cost, adId]);
  }
  await pool.query(
    'INSERT INTO user_ad_events (ad_id, owner_user_id, viewer_user_id, event_type, placement, cost) VALUES (?,?,?,?,?,?)',
    [adId, ad.user_id, viewerUserId || null, eventType, placement || null, cost]
  );
  if (cost > 0) {
    await pool.query(
      'UPDATE ad_balance SET balance=GREATEST(balance-?,0), total_spent=total_spent+? WHERE user_id=?',
      [cost, cost, ad.user_id]
    );
  }
  await pool.query(
    `UPDATE user_ads ua
     LEFT JOIN ad_balance ab ON ab.user_id=ua.user_id
     SET ua.status='ended'
     WHERE ua.id=? AND ((ua.budget > 0 AND ua.spent >= ua.budget) OR COALESCE(ab.balance,0) <= 0)`,
    [adId]
  );
  return true;
}

// Track ad event for user ads
router.post('/user-ads/:id/event', async (req, res) => {
  const { eventType = 'impression', userId, placement, leadData } = req.body;
  try {
    const ok = await chargeUserAdEvent(req.params.id, eventType, userId, placement, leadData);
    res.json({ ok });
  } catch { res.json({ ok: false }); }
});

router.post('/ads/:id/event', async (req, res) => {
  const { eventType = 'impression', userId, placement } = req.body;
  try {
    await pool.query('INSERT INTO ad_events (ad_id, user_id, event_type, placement, ip_address) VALUES (?,?,?,?,?)',
      [req.params.id, userId || null, eventType === 'website_visit' ? 'click' : eventType, placement || null, req.ip]);
    if (eventType === 'impression') {
      await pool.query('UPDATE ads SET impressions=impressions+1, spend=spend+cost_per_impression WHERE id=?', [req.params.id]);
    } else {
      await pool.query('UPDATE ads SET clicks=clicks+1, spend=spend+cost_per_click WHERE id=?', [req.params.id]);
    }
    await pool.query(`UPDATE ads SET status='ended' WHERE id=? AND status='active' AND budget > 0 AND spend >= budget`, [req.params.id]);
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
});

router.get('/user-ads/:id/leads', requireAuth, async (req, res) => {
  try {
    const [ad] = await pool.query('SELECT id FROM user_ads WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!ad.length) return res.status(404).json({ error: 'Ad not found' });
    const [leads] = await pool.query('SELECT * FROM user_ad_leads WHERE ad_id=? ORDER BY created_at DESC', [req.params.id]);
    leads.forEach(l => { try { l.lead_data = typeof l.lead_data === 'string' ? JSON.parse(l.lead_data) : l.lead_data; } catch {} });
    res.json(leads);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Payment gateways (admin)
router.get('/admin/payment-gateways', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_gateways ORDER BY id');
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.put('/admin/payment-gateways/:name', requireAuth, async (req, res) => {
  const { isActive, config } = req.body;
  try {
    await pool.query(
      'UPDATE payment_gateways SET is_active=?, config=? WHERE name=?',
      [isActive ? 1 : 0, JSON.stringify(config || {}), req.params.name]
    );
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Budget auto-management (call from setInterval)
export async function runAdsBudgetCycle(poolInstance, ioInstance) {
  pool = poolInstance;
  io = ioInstance;
  try {
    // End expired system ads
    const [exp] = await pool.query(
      "UPDATE ads SET status='ended' WHERE status='active' AND end_date < CURDATE()"
    );
    // End over-budget system ads
    const [ob] = await pool.query(
      "UPDATE ads SET status='ended' WHERE status='active' AND budget > 0 AND spend >= budget"
    );
    // Activate scheduled system ads
    const [act] = await pool.query(
      "UPDATE ads SET status='active' WHERE status='draft' AND start_date <= CURDATE() AND end_date >= CURDATE() AND budget > 0"
    );
    // End expired user ads
    await pool.query(
      "UPDATE user_ads SET status='ended' WHERE status='approved' AND end_date < CURDATE()"
    );
    // End over-budget or wallet-empty user ads
    await pool.query(
      `UPDATE user_ads ua
       LEFT JOIN ad_balance ab ON ab.user_id=ua.user_id
       SET ua.status='ended'
       WHERE ua.status='approved' AND ((ua.budget > 0 AND ua.spent >= ua.budget) OR COALESCE(ab.balance,0) <= 0)`
    );

    if ((exp.affectedRows + ob.affectedRows + act.affectedRows) > 0) {
      if (io) io.emit('ad-updated', { type: 'auto-cycle' });
    }
  } catch(e) { console.error('ads budget cycle:', e.message); }
}

export default router;
