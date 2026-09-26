import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_Q4GTJ3Bqurap@ep-rapid-flower-b43ib5x8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function distributeTransactions() {
  console.log('--- Distributing District-Specific Transactions ---');

  // 1. Ensure sheet_id column exists
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sheet_id VARCHAR(100)`;

  // 2. Fetch all sheets
  const sheets = await sql`SELECT id, name, city_name as "cityName" FROM sheet_tabs ORDER BY sort_order ASC`;
  console.log(`Found ${sheets.length} sheets in Neon DB.`);

  // 3. Assign existing Lahore transactions to sheet-38-lahore-zone-1
  const lahoreSheet = sheets.find(s => s.id === 'sheet-38-lahore-zone-1') || sheets.find(s => (s.cityName || '').toLowerCase().includes('lahore'));
  if (lahoreSheet) {
    const updatedLahore = await sql`
      UPDATE transactions 
      SET sheet_id = ${lahoreSheet.id}
      WHERE (sheet_id IS NULL OR sheet_id = '') AND (LOWER(zila) = 'lahore' OR zila IS NULL)
      RETURNING id
    `;
    console.log(`Assigned ${updatedLahore.length} existing transactions to Lahore sheet (${lahoreSheet.id}).`);
  }

  // 4. For every sheet, ensure it has 5 initial rows with its own District / City name
  for (const sheet of sheets) {
    const cityName = sheet.cityName || sheet.name.replace(/\s*\(.*?\)/, '').trim() || 'Punjab';
    
    // Check if sheet already has transactions
    const existing = await sql`
      SELECT count(*)::int as count FROM transactions 
      WHERE sheet_id = ${sheet.id} OR (sheet_id IS NULL AND LOWER(zila) = LOWER(${cityName}))
    `;

    if (existing[0]?.count === 0) {
      console.log(`Seeding 5 initial rows for ${sheet.name} (Zila / City: ${cityName})...`);
      const newTxs = [];
      const todayStr = '2026-09-26';

      for (let i = 1; i <= 5; i++) {
        const id = `tx-${sheet.id}-${i}-${Date.now().toString(36)}`;
        newTxs.push(sql`
          INSERT INTO transactions (
            id, sheet_id, receipt_no, date, donor_name, donor_name_urdu, branch_name, zila, phone, address, address_urdu,
            monthly_amount, quarterly_amount, annually_amount, months_data,
            amount, amount_in_words_en, amount_in_words_ur, type, category_id,
            payment_method, bank_name, check_number, transaction_id, description, description_urdu,
            recorded_by, verified_by, created_at
          ) VALUES (
            ${id},
            ${sheet.id},
            ${String(i)},
            ${todayStr},
            ${''},
            ${''},
            ${sheet.name},
            ${cityName},
            ${''},
            ${''},
            ${''},
            0, 0, 0,
            ${JSON.stringify({ jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 })},
            0,
            ${''},
            ${''},
            'income',
            'membership',
            'Cash',
            ${''},
            ${''},
            ${''},
            ${''},
            ${''},
            'Admin',
            'Verified',
            NOW()
          )
        `);
      }
      await Promise.all(newTxs);
    } else {
      // Ensure existing transactions have sheet_id set
      await sql`
        UPDATE transactions 
        SET sheet_id = ${sheet.id}, zila = ${cityName}
        WHERE sheet_id IS NULL AND LOWER(zila) = LOWER(${cityName})
      `;
    }
  }

  console.log('✅ All sheets now have district-specific transactions!');
}

distributeTransactions().catch(console.error);
