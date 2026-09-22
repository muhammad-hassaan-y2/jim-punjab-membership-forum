import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql, initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const result = await sql`SELECT 1 as connected, NOW() as current_time`;
    const latency = Date.now() - start;
    res.json({ 
      status: 'online', 
      database: 'Neon PostgreSQL', 
      latencyMs: latency, 
      time: result[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ----------------------------------------------------
// TRANSACTIONS CRUD
// ----------------------------------------------------

// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        id,
        receipt_no as "receiptNo",
        date,
        donor_name as "donorName",
        donor_name_urdu as "donorNameUrdu",
        phone,
        address,
        address_urdu as "addressUrdu",
        amount::float as amount,
        amount_in_words_en as "amountInWordsEn",
        amount_in_words_ur as "amountInWordsUr",
        type,
        category_id as "categoryId",
        payment_method as "paymentMethod",
        bank_name as "bankName",
        check_number as "checkNumber",
        transaction_id as "transactionId",
        description,
        description_urdu as "descriptionUrdu",
        recorded_by as "recordedBy",
        verified_by as "verifiedBy",
        created_at as "createdAt"
      FROM transactions
      ORDER BY created_at ASC
    `;
    res.json(rows);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE a transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const tx = req.body;
    const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    await sql`
      INSERT INTO transactions (
        id, receipt_no, date, donor_name, donor_name_urdu, phone, address, address_urdu,
        amount, amount_in_words_en, amount_in_words_ur, type, category_id,
        payment_method, bank_name, check_number, transaction_id, description, description_urdu,
        recorded_by, verified_by, created_at
      ) VALUES (
        ${id}, 
        ${tx.receiptNo || ''}, 
        ${tx.date || new Date().toISOString().split('T')[0]}, 
        ${tx.donorName || ''}, 
        ${tx.donorNameUrdu || ''}, 
        ${tx.phone || ''}, 
        ${tx.address || ''}, 
        ${tx.addressUrdu || ''},
        ${Number(tx.amount) || 0}, 
        ${tx.amountInWordsEn || ''}, 
        ${tx.amountInWordsUr || ''}, 
        ${tx.type || 'income'}, 
        ${tx.categoryId || 'general'},
        ${tx.paymentMethod || 'cash'}, 
        ${tx.bankName || ''}, 
        ${tx.checkNumber || ''}, 
        ${tx.transactionId || ''}, 
        ${tx.description || ''}, 
        ${tx.descriptionUrdu || ''},
        ${tx.recordedBy || ''}, 
        ${tx.verifiedBy || ''},
        ${tx.createdAt ? new Date(tx.createdAt) : new Date()}
      )
    `;

    res.status(201).json({ id, ...tx });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tx = req.body;

    await sql`
      UPDATE transactions SET
        receipt_no = COALESCE(${tx.receiptNo}, receipt_no),
        date = COALESCE(${tx.date}, date),
        donor_name = COALESCE(${tx.donorName}, donor_name),
        donor_name_urdu = COALESCE(${tx.donorNameUrdu}, donor_name_urdu),
        phone = COALESCE(${tx.phone}, phone),
        address = COALESCE(${tx.address}, address),
        address_urdu = COALESCE(${tx.addressUrdu}, address_urdu),
        amount = COALESCE(${tx.amount !== undefined ? Number(tx.amount) : null}, amount),
        amount_in_words_en = COALESCE(${tx.amountInWordsEn}, amount_in_words_en),
        amount_in_words_ur = COALESCE(${tx.amountInWordsUr}, amount_in_words_ur),
        type = COALESCE(${tx.type}, type),
        category_id = COALESCE(${tx.categoryId}, category_id),
        payment_method = COALESCE(${tx.paymentMethod}, payment_method),
        bank_name = COALESCE(${tx.bankName}, bank_name),
        check_number = COALESCE(${tx.checkNumber}, check_number),
        transaction_id = COALESCE(${tx.transactionId}, transaction_id),
        description = COALESCE(${tx.description}, description),
        description_urdu = COALESCE(${tx.descriptionUrdu}, description_urdu),
        recorded_by = COALESCE(${tx.recordedBy}, recorded_by),
        verified_by = COALESCE(${tx.verifiedBy}, verified_by)
      WHERE id = ${id}
    `;

    res.json({ message: 'Updated successfully', id });
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM transactions WHERE id = ${id}`;
    res.json({ message: 'Deleted successfully', id });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CLEAR ALL transactions (clean slate / zero demo data)
app.delete('/api/transactions', async (req, res) => {
  try {
    await sql`DELETE FROM transactions`;
    res.json({ message: 'All transactions cleared successfully' });
  } catch (error) {
    console.error("CLEAR transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// BULK replace / sync transactions
app.post('/api/transactions/bulk', async (req, res) => {
  try {
    const { transactions: list, replaceAll } = req.body;
    if (replaceAll) {
      await sql`DELETE FROM transactions`;
    }

    if (Array.isArray(list) && list.length > 0) {
      const CHUNK_SIZE = 25;
      for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        const chunk = list.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(tx => {
          const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          return sql`
            INSERT INTO transactions (
              id, receipt_no, date, donor_name, donor_name_urdu, phone, address, address_urdu,
              amount, amount_in_words_en, amount_in_words_ur, type, category_id,
              payment_method, bank_name, check_number, transaction_id, description, description_urdu,
              recorded_by, verified_by, created_at
            ) VALUES (
              ${id}, 
              ${tx.receiptNo || ''}, 
              ${tx.date || new Date().toISOString().split('T')[0]}, 
              ${tx.donorName || ''}, 
              ${tx.donorNameUrdu || ''}, 
              ${tx.phone || ''}, 
              ${tx.address || ''}, 
              ${tx.addressUrdu || ''},
              ${Number(tx.amount) || 0}, 
              ${tx.amountInWordsEn || ''}, 
              ${tx.amountInWordsUr || ''}, 
              ${tx.type || 'income'}, 
              ${tx.categoryId || 'general'},
              ${tx.paymentMethod || 'cash'}, 
              ${tx.bankName || ''}, 
              ${tx.checkNumber || ''}, 
              ${tx.transactionId || ''}, 
              ${tx.description || ''}, 
              ${tx.descriptionUrdu || ''},
              ${tx.recordedBy || ''}, 
              ${tx.verifiedBy || ''},
              ${tx.createdAt ? new Date(tx.createdAt) : new Date()}
            )
            ON CONFLICT (id) DO UPDATE SET
              receipt_no = EXCLUDED.receipt_no,
              date = EXCLUDED.date,
              donor_name = EXCLUDED.donor_name,
              donor_name_urdu = EXCLUDED.donor_name_urdu,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              address_urdu = EXCLUDED.address_urdu,
              amount = EXCLUDED.amount,
              amount_in_words_en = EXCLUDED.amount_in_words_en,
              amount_in_words_ur = EXCLUDED.amount_in_words_ur,
              type = EXCLUDED.type,
              category_id = EXCLUDED.category_id,
              payment_method = EXCLUDED.payment_method,
              bank_name = EXCLUDED.bank_name,
              check_number = EXCLUDED.check_number,
              transaction_id = EXCLUDED.transaction_id,
              description = EXCLUDED.description,
              description_urdu = EXCLUDED.description_urdu,
              recorded_by = EXCLUDED.recorded_by,
              verified_by = EXCLUDED.verified_by
          `;
        }));
      }
    }

    res.json({ message: 'Transactions saved to Neon DB', count: list ? list.length : 0 });
  } catch (error) {
    console.error("POST /api/transactions/bulk error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// SHEET TABS CRUD
// ----------------------------------------------------

app.get('/api/sheets', async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        id, 
        name, 
        name_urdu as "nameUrdu", 
        category_filter as "categoryFilter", 
        type_filter as "typeFilter", 
        color, 
        period_type as "periodType", 
        period_value as "periodValue", 
        sort_order as "sortOrder"
      FROM sheet_tabs
      ORDER BY sort_order ASC, created_at ASC
    `;
    res.json(rows);
  } catch (error) {
    console.error("GET /api/sheets error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sheets/sync', async (req, res) => {
  try {
    const { sheets } = req.body;
    if (Array.isArray(sheets)) {
      await sql`DELETE FROM sheet_tabs`;
      for (let i = 0; i < sheets.length; i++) {
        const s = sheets[i];
        await sql`
          INSERT INTO sheet_tabs (id, name, name_urdu, category_filter, type_filter, color, period_type, period_value, sort_order)
          VALUES (
            ${s.id}, 
            ${s.name}, 
            ${s.nameUrdu || s.name}, 
            ${s.categoryFilter || null}, 
            ${s.typeFilter || null}, 
            ${s.color || '#0284c7'}, 
            ${s.periodType || null}, 
            ${s.periodValue || null}, 
            ${i}
          )
        `;
      }
    }
    res.json({ message: 'Sheets synchronized with Neon DB' });
  } catch (error) {
    console.error("POST /api/sheets/sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CATEGORIES & CONFIG
// ----------------------------------------------------

app.get('/api/categories', async (req, res) => {
  try {
    const rows = await sql`
      SELECT 
        id, 
        name, 
        name_urdu as "nameUrdu", 
        type, 
        color, 
        is_zakat_eligible as "isZakatEligible", 
        description, 
        description_urdu as "descriptionUrdu"
      FROM categories
      ORDER BY name ASC
    `;
    res.json(rows);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories/sync', async (req, res) => {
  try {
    const { categories } = req.body;
    if (Array.isArray(categories)) {
      await sql`DELETE FROM categories`;
      for (const c of categories) {
        await sql`
          INSERT INTO categories (id, name, name_urdu, type, color, is_zakat_eligible, description, description_urdu)
          VALUES (
            ${c.id}, 
            ${c.name}, 
            ${c.nameUrdu || c.name}, 
            ${c.type}, 
            ${c.color || '#0284c7'}, 
            ${c.isZakatEligible || false}, 
            ${c.description || ''}, 
            ${c.descriptionUrdu || ''}
          )
        `;
      }
    }
    res.json({ message: 'Categories synchronized with Neon DB' });
  } catch (error) {
    console.error("POST /api/categories/sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const rows = await sql`SELECT data FROM organization_config WHERE id = 'default' LIMIT 1`;
    if (rows.length > 0) {
      res.json(rows[0].data);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error("GET /api/config error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const data = req.body;
    await sql`
      INSERT INTO organization_config (id, data, updated_at)
      VALUES ('default', ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    res.json({ message: 'Config saved to Neon DB' });
  } catch (error) {
    console.error("POST /api/config error:", error);
    res.status(500).json({ error: error.message });
  }
});

// START SERVER & INIT DATABASE
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`Neon PostgreSQL Connected.`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
