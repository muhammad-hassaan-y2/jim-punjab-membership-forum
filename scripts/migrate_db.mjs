import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  // 1. Add profession to transactions
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS profession VARCHAR(255)`;
  console.log('✅ Added profession column to transactions table');

  // 2. Add target_amount and name_urdu to projects if missing
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_amount NUMERIC(15, 2) DEFAULT 10000000`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS name_urdu VARCHAR(255)`;
  console.log('✅ Updated projects columns');

  // 3. Seed default project
  await sql`
    INSERT INTO projects (id, name, year, description, target_amount)
    VALUES ('proj-2026', 'JIM Punjab Official Districts & Zones 2026', '2026', 'Official Working Sheets for all Punjab districts and zones', 10000000)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      year = EXCLUDED.year,
      description = EXCLUDED.description,
      target_amount = EXCLUDED.target_amount
  `;
  console.log('✅ Seeded default project');

  // 4. Seed default organization_config
  await sql`
    INSERT INTO organization_config (id, data, updated_at)
    VALUES ('default', ${JSON.stringify({
      nameEnglish: 'JIM Punjab',
      subHeaderEnglish: 'Jamaat Islahul Muslimeen Punjab',
      nameUrdu: 'جماعت اصلاح المسلمین پنجاب',
      subHeaderUrdu: 'پنجاب زون (Punjab Zone)',
      addressEnglish: 'Markaz Rooh-ul-Islam, Punjab, Pakistan',
      addressUrdu: 'مرکز روح الاسلام، پنجاب، پاکستان',
      phone: '+92 300 1234567',
      email: 'info@jimpunjab.org',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      receiptPrefix: 'JIM-PB-',
      receiptCounter: 1,
      targetToCollect: 10000000
    })}, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
  console.log('✅ Seeded organization_config');

  // 5. Seed default categories
  await sql`
    INSERT INTO categories (id, name, name_urdu, type, color, is_zakat_eligible, description)
    VALUES 
      ('membership', 'Membership Fund', 'ممبر شپ فنڈ', 'income', '#059669', false, 'Regular monthly/quarterly/annual subscriptions'),
      ('zakat', 'Zakat Fund', 'زکوٰۃ فنڈ', 'income', '#d97706', true, 'Eligible for Shariah-compliant Zakat disbursement'),
      ('sadqa', 'Sadqa / General Charity', 'صدقات و عطیات', 'income', '#2563eb', false, 'Voluntary general donations'),
      ('operations', 'Administrative & Events', 'انتظامی و دعوتی اخراجات', 'expense', '#dc2626', false, 'Operational, venue, and logistical disbursements')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('✅ Seeded categories');
}

main().catch(console.error);
