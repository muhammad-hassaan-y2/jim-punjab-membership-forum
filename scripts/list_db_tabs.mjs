import 'dotenv/config';
import { sql } from '../src/lib/db.ts';

const tabs = await sql`SELECT id, name, name_urdu as "nameUrdu", city_name as "cityName", sort_order as "sortOrder" FROM sheet_tabs ORDER BY sort_order ASC`;
console.log('Total sheet tabs in DB:', tabs.length);
tabs.forEach(t => console.log(`${t.id} | ${t.name} | ${t.cityName}`));
process.exit(0);
