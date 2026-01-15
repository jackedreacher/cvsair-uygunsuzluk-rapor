const express = require("express");
const cors = require("cors");
const { pool } = require("./db");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ALLOW_ORIGIN || "*",
  credentials: true
};
app.use(cors(corsOptions));

// State Machine Definitions
const allowedTransitions = {
  yeni: ["triyaj"],
  triyaj: ["bolum_acik"],
  bolum_acik: ["aksiyon_planlandi"],
  aksiyon_planlandi: ["aksiyon_tamamlandi"],
  aksiyon_tamamlandi: ["kalite_incelemesi"],
  kalite_incelemesi: ["dogrulandi", "iade"],
  dogrulandi: ["kapatildi"],
  iade: ["bolum_acik"],
  kapatildi: ["yeniden_acildi"],
  yeniden_acildi: ["bolum_acik"]
};

// Mailer Setup
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Health Check
app.get("/", (req, res) => res.json({ status: "Cvsair API is running", timestamp: new Date() }));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// --- API ENDPOINTS ---

// 1. Create Nonconformity (Uygunsuzluk Oluştur)
app.post("/api/nc", async (req, res) => {
  const {
    reported_date,
    department_id,
    reporter_id,
    origin,
    title,
    description,
    root_cause,
    corrective_action,
    responsible_id,
    due_date
  } = req.body;

  try {
    // Generate Code (NCR-YYYY-XXXXXX)
    const code = `NCR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1e6).toString().padStart(6, "0")}`;
    
    const insertQuery = `
      INSERT INTO nonconformities
      (code, reported_date, department_id, reporter_id, origin, title, description, root_cause, corrective_action, responsible_id, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'yeni')
      RETURNING id, code
    `;
    
    const insertValues = [
      code, 
      reported_date || null, 
      department_id, 
      reporter_id, 
      origin, 
      title, 
      description, 
      root_cause, 
      corrective_action, 
      responsible_id, 
      due_date || null // Convert empty string to null
    ];

    const insertResult = await pool.query(insertQuery, insertValues);
    const nc = insertResult.rows[0];

    // Log creation transition
    await pool.query(
      `INSERT INTO nc_transitions (nc_id, from_status, to_status, actor_id, note)
       VALUES ($1, NULL, 'yeni', $2, 'create')`,
      [nc.id, reporter_id]
    );

    // Auto-assign logic based on rules
    const rule = await pool.query(
      `SELECT default_assignee_id FROM assignment_rules
       WHERE department_id = $1 AND active = true
       ORDER BY id DESC LIMIT 1`,
      [department_id]
    );

    const assigneeId = rule.rows[0]?.default_assignee_id || responsible_id;
    
    if (assigneeId) {
      await pool.query(
        `INSERT INTO nc_assignments (nc_id, assignee_id, reason, active)
         VALUES ($1, $2, 'auto', true)`,
        [nc.id, assigneeId]
      );

      // Send Email Notification
      const user = await pool.query(`SELECT email FROM users WHERE id = $1`, [assigneeId]);
      const email = user.rows[0]?.email;
      if (email && process.env.SMTP_HOST) {
        try {
          await mailer.sendMail({
            to: email,
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            subject: `Yeni Uygunsuzluk Atandı: ${nc.code}`,
            text: `Size yeni bir uygunsuzluk kaydı atandı: ${nc.code}. Lütfen sisteme giriş yapıp kontrol ediniz.`
          });
        } catch (mailError) {
          console.error("Mail sending failed:", mailError);
        }
      }
    }

    res.status(201).json({ success: true, id: nc.id, code: nc.code });
  } catch (error) {
    console.error("Create NC Error:", error);
    res.status(500).json({ error: "create_failed", details: error.message });
  }
});

// 2. Assign User (Sorumlu Ata)
app.post("/api/nc/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { assignee_id, actor_id, reason } = req.body;

  try {
    // Deactivate current assignment
    await pool.query(`UPDATE nc_assignments SET active = false WHERE nc_id = $1 AND active = true`, [id]);
    
    // Create new assignment
    await pool.query(
      `INSERT INTO nc_assignments (nc_id, assignee_id, reason, active)
       VALUES ($1, $2, $3, true)`,
      [id, assignee_id, reason || "manual"]
    );

    // Log transition (audit)
    await pool.query(
      `INSERT INTO nc_transitions (nc_id, from_status, to_status, actor_id, note)
       VALUES ($1, NULL, NULL, $2, 'assign_change')`,
      [id, actor_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Assign Error:", error);
    res.status(500).json({ error: "assign_failed" });
  }
});

// 3. Status Transition (Durum Değiştir)
app.post("/api/nc/:id/transition", async (req, res) => {
  const { id } = req.params;
  const { to_status, actor_id, note } = req.body;

  try {
    const current = await pool.query(`SELECT status FROM nonconformities WHERE id = $1`, [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "not_found" });
    
    const fromStatus = current.rows[0].status;

    // Check if transition is allowed
    const allowed = allowedTransitions[fromStatus] || [];
    // Allow admin override or strict check? For now strict.
    if (!allowed.includes(to_status)) {
      return res.status(400).json({ 
        error: "invalid_transition", 
        message: `Cannot transition from ${fromStatus} to ${to_status}` 
      });
    }

    // Special logic for completion
    const finalStatus = to_status === "aksiyon_tamamlandi" ? "kalite_incelemesi" : to_status;

    // Update status
    await pool.query(`UPDATE nonconformities SET status = $1 WHERE id = $2`, [finalStatus, id]);
    
    // Log transition
    await pool.query(
      `INSERT INTO nc_transitions (nc_id, from_status, to_status, actor_id, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, fromStatus, finalStatus, actor_id, note || ""]
    );

    // Notify Quality Team if ready for review
    if (finalStatus === "kalite_incelemesi") {
      const qualityUsers = await pool.query(
        `SELECT u.email FROM users u
         JOIN user_roles ur ON ur.user_id = u.id
         JOIN roles r ON r.id = ur.role_id
         WHERE r.code = 'QUALITY' AND u.is_active = true`
      );
      
      for (const row of qualityUsers.rows) {
        if (process.env.SMTP_HOST) {
            try {
                await mailer.sendMail({
                    to: row.email,
                    from: process.env.SMTP_FROM || process.env.SMTP_USER,
                    subject: `İnceleme Bekleyen Kayıt: ${id}`,
                    text: `Kayıt ${id} aksiyonları tamamlandı ve kalite incelemesine hazır.`
                });
            } catch (e) { console.error("Quality mail error", e); }
        }
      }
    }

    res.json({ success: true, status: finalStatus });
  } catch (error) {
    console.error("Transition Error:", error);
    res.status(500).json({ error: "transition_failed" });
  }
});

// 4. List Nonconformities
app.get("/api/nc", async (req, res) => {
  const { status, department_id, assignee_id } = req.query;
  
  let query = `
    SELECT nc.*, d.name as department_name, u.full_name as assignee_name 
    FROM nonconformities nc
    LEFT JOIN departments d ON nc.department_id = d.id
    LEFT JOIN nc_assignments nca ON nc.id = nca.nc_id AND nca.active = true
    LEFT JOIN users u ON nca.assignee_id = u.id
    WHERE 1=1
  `;
  
  const values = [];
  let paramCount = 1;

  if (status) {
    query += ` AND nc.status = $${paramCount}`;
    values.push(status);
    paramCount++;
  }

  if (department_id) {
    query += ` AND nc.department_id = $${paramCount}`;
    values.push(department_id);
    paramCount++;
  }

  if (assignee_id) {
      // Filter by current assignee
      query += ` AND nca.assignee_id = $${paramCount}`;
      values.push(assignee_id);
      paramCount++;
  }

  query += ` ORDER BY nc.created_at DESC`;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({ error: "list_failed" });
  }
});

// 5. Get Single Nonconformity Detail
app.get("/api/nc/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Main Details
    const ncQuery = `
      SELECT nc.*, d.name as department_name, u.full_name as assignee_name 
      FROM nonconformities nc
      LEFT JOIN departments d ON nc.department_id = d.id
      LEFT JOIN nc_assignments nca ON nc.id = nca.nc_id AND nca.active = true
      LEFT JOIN users u ON nca.assignee_id = u.id
      WHERE nc.id = $1
    `;
    const ncResult = await pool.query(ncQuery, [id]);
    
    if (ncResult.rows.length === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    const nc = ncResult.rows[0];

    // History (Transitions)
    const historyQuery = `
      SELECT t.*, u.full_name as actor_name 
      FROM nc_transitions t
      LEFT JOIN users u ON t.actor_id = u.id
      WHERE t.nc_id = $1
      ORDER BY t.created_at DESC
    `;
    const historyResult = await pool.query(historyQuery, [id]);

    res.json({ ...nc, history: historyResult.rows });
  } catch (error) {
    console.error("Get Detail Error:", error);
    res.status(500).json({ error: "get_detail_failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
