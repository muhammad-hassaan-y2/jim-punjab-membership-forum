import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const sheets = await sql`SELECT id, name, city_name, sort_order FROM sheet_tabs ORDER BY sort_order ASC LIMIT 10`;
  const sheetCount = await sql`SELECT count(*) FROM sheet_tabs`;
  const txCount = await sql`SELECT count(*) FROM transactions`;
  console.log('Total sheet_tabs in DB:', sheetCount[0].count);
  console.log('Sample sheets:', sheets);
  console.log('Total transactions in DB:', txCount[0].count);
}

main().catch(console.error);
