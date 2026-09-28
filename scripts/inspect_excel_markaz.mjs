import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const dir = 'C:/Users/Hassaan/Downloads/Excel Markaz';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));
console.log('Excel files found:', files);

for (const f of files) {
  console.log('\n=============================================');
  console.log('FILE:', f);
  const filePath = path.join(dir, f);
  const buffer = fs.readFileSync(filePath);
  const wb = (XLSX.read || (XLSX as any).default?.read || (XLSX as any).readFile ? (XLSX as any) : XLSX)(buffer, { type: 'buffer' });
  console.log('Sheet Names:', wb.SheetNames);
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log(`-- Sheet: [${sheetName}], Total Rows: ${data.length}`);
    if (data.length > 0) {
      console.log('Sample rows (up to 10):');
      console.log(JSON.stringify(data.slice(0, 10), null, 2));
    }
  }
}
