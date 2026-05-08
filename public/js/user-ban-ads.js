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
    placement_status TINYINT(1) DEFAULT 1,
    placement_chat TINYINT(1) DEFAULT 0,
    placement_home TINYINT(1) DEFAULT 0,
    budget DECIMAL(10,2) DEFAULT 0.00,
    spent DECIMAL(10,2) DEFAULT 0.00,
    daily_budget DECIMAL(10,2) DEFAULT 0.00,
    cost_per_click DECIMAL(10,4) DEFAULT 0.0000,
    cost_per_impression DECIMAL(10,4) DEFAULT 0.0000,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    target_gender ENUM('all','male','female') DEFAULT 'all',
    target_age_min INT DEFAULT 13,
    target_age_max INT DEFAULT 65,
    target_location VARCHAR(500) DEFAULT NULL,
    advertiser_name VARCHAR(200) DEFAULT NULL,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    status ENUM('draft','pending','approved','paused','ended','rejected') DEFAULT 'pending',
    reject_reason TEXT DEFAULT NULL,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

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

    const [bal] = await pool.query('SELECT balance FROM ad_balance WHERE user_id=?', [req.user.id]);
    
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
    placementHome = 0, budget = 0, dailyBudget = 0, costPerClick = 0,
    costPerImpression = 0, startDate, endDate, targetGender = 'all',
    targetAgeMin = 13, targetAgeMax = 65, targetLocation, advertiserName
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
        cta_text, cta_url, placement_status, placement_chat, placement_home,
        budget, daily_budget, cost_per_click, cost_per_impression,
        start_date, end_date, target_gender, target_age_min, target_age_max,
        target_location, advertiser_name, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      [req.user.id, title, description, adType, mediaUrl, mediaType,
       ctaText, ctaUrl, placementStatus, placementChat, placementHome,
       budget, dailyBudget, costPerClick, costPerImpression,
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
  if (!['draft', 'rejected'].includes(ad[0].status)) {
    return res.status(400).json({ error: 'Can only edit draft or rejected ads' });
  }

  const fields = [], vals = [];
  const allowed = ['title','description','media_url','cta_text','cta_url','target_location'];
  allowed.forEach(k => { if (req.body[k] !== undefined) { fields.push(`${k}=?`); vals.push(req.body[k]); } });
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
  const { status, rejectReason } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const [ad] = await pool.query('SELECT * FROM user_ads WHERE id=?', [req.params.id]);
    if (!ad.length) return res.status(404).json({ error: 'Ad not found' });

    await pool.query(
      'UPDATE user_ads SET status=?, reject_reason=? WHERE id=?',
      [status, rejectReason || null, req.params.id]
    );

    // Notify user via socket
    if (io) {
      io.to(`user:${ad[0].user_id}`).emit('user-ad-reviewed', {
        adId: parseInt(req.params.id),
        status,
        rejectReason: rejectReason || null,
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
  const validPlacements = ['status', 'chat', 'home'];
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
              ua.cta_text, ua.cta_url, '#1a2433' as bg_color, '#ffffff' as text_color,
              '#00bfa5' as border_color, ua.advertiser_name, NULL as advertiser_logo,
              ua.priority, 'user' as source
       FROM user_ads ua WHERE ua.status='approved' AND ua.${col}=1
         AND ua.start_date <= CURDATE() AND ua.end_date >= CURDATE()
         AND ua.spent < ua.budget
       ORDER BY RAND() LIMIT 1`
    );

    res.json([...sysAds, ...userAds]);
  } catch(e) { res.json([]); }
});

// Track ad event for user ads
router.post('/user-ads/:id/event', async (req, res) => {
  const { eventType = 'impression', userId } = req.body;
  try {
    const [ads] = await pool.query('SELECT user_id,cost_per_impression,cost_per_click FROM user_ads WHERE id=?', [req.params.id]);
    if (!ads.length) return res.json({ ok: false });
    const cost = eventType === 'click' ? Number(ads[0].cost_per_click || 0) : Number(ads[0].cost_per_impression || 0);
    if (eventType === 'impression') {
      await pool.query(
        'UPDATE user_ads SET impressions=impressions+1, spent=spent+cost_per_impression WHERE id=?',
        [req.params.id]
      );
    } else if (eventType === 'click') {
      await pool.query(
        'UPDATE user_ads SET clicks=clicks+1, spent=spent+cost_per_click WHERE id=?',
        [req.params.id]
      );
    }
    if (cost > 0) {
      await pool.query(
        'UPDATE ad_balance SET balance=GREATEST(balance-?,0), total_spent=total_spent+? WHERE user_id=?',
        [cost, cost, ads[0].user_id]
      );
    }
    // Auto-end if budget exhausted
    await pool.query(
      `UPDATE user_ads ua
       LEFT JOIN ad_balance ab ON ab.user_id=ua.user_id
       SET ua.status='ended'
       WHERE ua.id=? AND ((ua.budget > 0 AND ua.spent >= ua.budget) OR COALESCE(ab.balance,0) <= 0)`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch { res.json({ ok: false }); }
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
