import 'dotenv/config';
import { sql } from '../src/lib/db.ts';

const counts = await sql`
  SELECT sheet_id, zila, count(*) as count 
  FROM transactions 
  GROUP BY sheet_id, zila 
  ORDER BY count DESC
`;
console.log('Existing transactions in DB:');
counts.forEach(c => console.log(`${c.sheet_id} | ${c.zila} : ${c.count} transactions`));
process.exit(0);
