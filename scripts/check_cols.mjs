import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'transactions' 
    ORDER BY ordinal_position
  `;
  console.log('Transactions columns:', cols.map(c => `${c.column_name} (${c.data_type})`));
}

main().catch(console.error);
