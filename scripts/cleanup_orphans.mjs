import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Check current orphan count
  const orphans = await sql`SELECT count(*) FROM transactions WHERE sheet_id IS NULL`;
  console.log(`Found ${orphans[0].count} orphan transactions (sheet_id = NULL)`);
  
  if (Number(orphans[0].count) > 0) {
    // Delete orphan rows
    await sql`DELETE FROM transactions WHERE sheet_id IS NULL`;
    console.log(`✅ Deleted ${orphans[0].count} orphan transactions`);
  } else {
    console.log('No orphan transactions to clean up.');
  }

  // Verify final state
  const summary = await sql`
    SELECT sheet_id, count(*) as count 
    FROM transactions 
    GROUP BY sheet_id 
    ORDER BY count DESC
  `;
  console.log('Remaining transactions by sheet:', summary);
}

main().catch(console.error);
