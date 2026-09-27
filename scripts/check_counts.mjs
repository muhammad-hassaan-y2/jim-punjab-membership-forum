import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const cats = await sql`SELECT count(*) FROM categories`;
  const shared = await sql`SELECT count(*) FROM shared_sheets`;
  const config = await sql`SELECT count(*) FROM organization_config`;
  const sheets = await sql`SELECT count(*) FROM sheet_tabs`;
  const txs = await sql`SELECT count(*) FROM transactions`;
  console.log({
    categories: cats[0].count,
    shared_sheets: shared[0].count,
    organization_config: config[0].count,
    sheet_tabs: sheets[0].count,
    transactions: txs[0].count,
  });
}

main().catch(console.error);
