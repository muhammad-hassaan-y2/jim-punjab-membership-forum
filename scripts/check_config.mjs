import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT id, data, updated_at FROM organization_config`;
  console.log('organization_config:', rows);
}

main().catch(console.error);
