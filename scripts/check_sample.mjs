import 'dotenv/config';
import { sql } from '../src/lib/db.ts';

const sample = await sql`
  SELECT sheet_id, receipt_no, donor_name, branch_name, zila, phone, sarparast_ala, profession, target_amount, amount 
  FROM transactions 
  WHERE sheet_id IN ('sheet-34-gujarat-zone-1', 'sheet-49-nankana-sahib') 
  ORDER BY sheet_id, (receipt_no::int) ASC 
  LIMIT 6
`;

console.log(JSON.stringify(sample, null, 2));
process.exit(0);
