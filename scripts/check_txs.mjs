import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, sheet_id, receipt_no, donor_name, branch_name, zila, amount, created_at 
    FROM transactions 
    ORDER BY created_at ASC 
    LIMIT 25
  `;
  console.log('Sample rows:', rows);
  const sheetSummary = await sql`
    SELECT sheet_id, zila, count(*) as count 
    FROM transactions 
    GROUP BY sheet_id, zila
  `;
  console.log('Sheet distribution:', sheetSummary);
}

main().catch(console.error);
