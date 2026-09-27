import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Q4GTJ3Bqurap@ep-rapid-flower-b43ib5x8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(connectionString);

async function main() {
  console.log('Adding new columns to transactions table...');
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sarparast_ala VARCHAR(255);`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS target_amount NUMERIC(15, 2) DEFAULT 0;`;

  console.log('Clearing dummy records from transactions table so sheet starts empty...');
  const res = await sql`DELETE FROM transactions;`;
  console.log('Cleared transactions table. User can enter data cleanly.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
