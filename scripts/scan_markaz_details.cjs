const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = 'C:/Users/Hassaan/Downloads/Excel Markaz';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(f => {
  const wb = XLSX.readFile(path.join(dir, f));
  console.log('\n======================================================');
  console.log('FILE:', f);
  wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log('\n--- Sheet [' + name + '] in ' + f + ' (Rows: ' + rows.length + ') ---');
    rows.forEach((r, idx) => {
      if (r && r.length > 0 && r.some(c => c !== null && c !== '')) {
        console.log('Row ' + idx + ':', JSON.stringify(r));
      }
    });
  });
});
