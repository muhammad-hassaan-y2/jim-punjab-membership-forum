import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { neon } from '@neondatabase/serverless';
import { convertNumberToUrduWords } from '../src/utils/urduNumberToWords.ts';
import { convertNumberToEnglishWords } from '../src/utils/englishNumberToWords.ts';

const dir = 'C:\\Users\\Hassaan\\Downloads\\financial sheets';
const conn = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Q4GTJ3Bqurap@ep-rapid-flower-b43ib5x8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(conn);

function cleanNum(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const s = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseFsdZone2() {
  const fp = path.join(dir, 'MEMBERSHIP PERFORMA JIM FSD ZONE 2 (3).xlsx');
  const wb = xlsx.readFile(fp);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const results = [];
  for (let i = 6; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[1] || '').trim();
    if (!name || name.toLowerCase().includes('total')) continue;

    const sr = r[0] ? String(r[0]).trim() : String(results.length + 1);
    const branch = String(r[2] || '').trim();
    const phone = String(r[3] || '').trim();
    const guardian = String(r[4] || '').trim();
    const profession = String(r[5] || '').trim();

    const monthlyVal = String(r[6] || '').trim();
    const quarterlyVal = String(r[7] || '').trim();
    const halfYearlyVal = String(r[8] || '').trim();
    const annuallyVal = String(r[9] || '').trim();

    const targetAmount = cleanNum(r[10]);
    const paid = cleanNum(r[11]);

    const isAnnual = annuallyVal.includes('✔') || annuallyVal.toLowerCase().includes('annual');
    const isQuarter = quarterlyVal.includes('✔') || quarterlyVal.toLowerCase().includes('quarter');
    const isHalf = halfYearlyVal.includes('✔') || halfYearlyVal.toLowerCase().includes('half');
    const isMonth = monthlyVal.includes('✔') || monthlyVal.toLowerCase().includes('month');

    let preferred = 'Monthly';
    if (isAnnual) preferred = 'Annually';
    else if (isHalf) preferred = 'Half Yearly';
    else if (isQuarter) preferred = 'Quarterly';

    results.push({
      sheetId: 'sheet-30-faisalabad-zone-2',
      index: results.length + 1,
      receiptNo: sr,
      donorName: name,
      branchName: branch || 'Faisalabad Zone 2',
      zila: 'Faisalabad Zone 2',
      phone: phone,
      sarparastAla: guardian,
      profession: profession,
      preferredPeriod: preferred,
      monthlyAmount: isMonth ? (targetAmount > 0 ? Math.round(targetAmount / 12) : 0) : 0,
      quarterlyAmount: isQuarter ? (targetAmount > 0 ? Math.round(targetAmount / 4) : 0) : 0,
      annuallyAmount: isAnnual ? targetAmount : 0,
      targetAmount: targetAmount,
      paid: paid,
      description: 'Faisalabad Zone 2 Annual Report 2026',
    });
  }
  return results;
}

function parseNarowalZone2() {
  const fp = path.join(dir, 'Membership Performa Narowal 2 (1) (1) (3).xlsx');
  const wb = xlsx.readFile(fp);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const results = [];
  for (let i = 8; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[1] || '').trim();
    if (!name || name.toLowerCase().includes('total')) continue;

    const sr = r[0] ? String(r[0]).trim() : String(results.length + 1);
    const branch = String(r[2] || '').trim();
    const phone = String(r[3] || '').trim();
    const guardian = String(r[4] || '').trim();
    const profession = String(r[5] || '').trim();

    const monthlyVal = String(r[6] || '').trim();
    const quarterlyVal = String(r[7] || '').trim();
    const halfYearlyVal = String(r[8] || '').trim();
    const annuallyVal = String(r[9] || '').trim();

    const targetAmount = cleanNum(r[10]);
    const paid = cleanNum(r[11]);

    const isAnnual = annuallyVal.includes('✔') || annuallyVal.toLowerCase().includes('annual');
    const isQuarter = quarterlyVal.includes('✔') || quarterlyVal.toLowerCase().includes('quarter');
    const isHalf = halfYearlyVal.includes('✔') || halfYearlyVal.toLowerCase().includes('half');
    const isMonth = monthlyVal.includes('✔') || monthlyVal.toLowerCase().includes('month') || monthlyVal.toLowerCase() === 'monthly';

    let preferred = 'Monthly';
    if (isAnnual) preferred = 'Annually';
    else if (isHalf) preferred = 'Half Yearly';
    else if (isQuarter) preferred = 'Quarterly';

    results.push({
      sheetId: 'sheet-48-narowal-zone-2',
      index: results.length + 1,
      receiptNo: sr,
      donorName: name,
      branchName: branch || 'Narowal Zone 2',
      zila: 'Narowal Zone 2',
      phone: phone,
      sarparastAla: guardian,
      profession: profession,
      preferredPeriod: preferred,
      monthlyAmount: isMonth ? (targetAmount > 0 ? Math.round(targetAmount / 12) : 0) : 0,
      quarterlyAmount: isQuarter ? (targetAmount > 0 ? Math.round(targetAmount / 4) : 0) : 0,
      annuallyAmount: isAnnual ? targetAmount : 0,
      targetAmount: targetAmount,
      paid: paid,
      description: 'Narowal Zone 2 Annual Report 2026',
    });
  }
  return results;
}

async function ingestAll() {
  console.log('=== INGESTING FAISALABAD ZONE 2 & NAROWAL ZONE 2 INTO NEON DB ===\n');

  const fsdRecords = parseFsdZone2();
  const narowalRecords = parseNarowalZone2();
  const allRecords = [...fsdRecords, ...narowalRecords];

  console.log(`Parsed ${fsdRecords.length} records for Faisalabad Zone 2.`);
  console.log(`Parsed ${narowalRecords.length} records for Narowal Zone 2.`);
  console.log(`Total new records to ingest: ${allRecords.length}.\n`);

  let insertedCount = 0;
  const chunkSize = 25;

  for (let i = 0; i < allRecords.length; i += chunkSize) {
    const chunk = allRecords.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (item) => {
      const id = `tx-${item.sheetId}-${item.index}`;
      const amount = Number(item.paid) || 0;
      const targetAmount = Number(item.targetAmount) || 0;
      const enWords = amount > 0 ? convertNumberToEnglishWords(amount) : '';
      const urWords = amount > 0 ? convertNumberToUrduWords(amount) : '';
      const defaultMonths = JSON.stringify({ jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 });

      await sql`
        INSERT INTO transactions (
          id, receipt_no, date, donor_name, donor_name_urdu, phone, address, address_urdu,
          amount, amount_in_words_en, amount_in_words_ur, type, category_id, payment_method,
          branch_name, zila, sheet_id, monthly_amount, quarterly_amount, annually_amount,
          months_data, sarparast_ala, target_amount, profession, description, recorded_by
        )
        VALUES (
          ${id},
          ${item.receiptNo},
          '2026-09-27',
          ${item.donorName},
          ${item.donorName},
          ${item.phone},
          ${item.branchName},
          ${item.branchName},
          ${amount},
          ${enWords},
          ${urWords},
          'income',
          'membership',
          'cash',
          ${item.branchName},
          ${item.zila},
          ${item.sheetId},
          ${item.monthlyAmount},
          ${item.quarterlyAmount},
          ${item.annuallyAmount},
          ${defaultMonths},
          ${item.sarparastAla},
          ${targetAmount},
          ${item.profession},
          ${item.description},
          'Markaz Admin'
        )
        ON CONFLICT (id) DO UPDATE SET
          receipt_no = EXCLUDED.receipt_no,
          donor_name = EXCLUDED.donor_name,
          phone = EXCLUDED.phone,
          branch_name = EXCLUDED.branch_name,
          zila = EXCLUDED.zila,
          amount = EXCLUDED.amount,
          target_amount = EXCLUDED.target_amount,
          monthly_amount = EXCLUDED.monthly_amount,
          quarterly_amount = EXCLUDED.quarterly_amount,
          annually_amount = EXCLUDED.annually_amount,
          sarparast_ala = EXCLUDED.sarparast_ala,
          profession = EXCLUDED.profession
      `;
      insertedCount++;
    }));
    console.log(`Ingested ${insertedCount} / ${allRecords.length} records...`);
  }

  // Verify total count in DB
  const countRes = await sql`SELECT COUNT(*) FROM transactions`;
  console.log(`\n🎉 Ingestion Complete! Total transactions now in Neon DB: ${countRes[0].count}`);

  const fsdCount = await sql`SELECT COUNT(*), SUM(amount), SUM(target_amount) FROM transactions WHERE sheet_id = 'sheet-30-faisalabad-zone-2'`;
  console.log(`   - Faisalabad Zone 2 in DB: ${fsdCount[0].count} donors, Paid: Rs. ${Number(fsdCount[0].sum).toLocaleString()}, Target: Rs. ${Number(fsdCount[0].sum_1 || fsdCount[0].sum).toLocaleString()}`);

  const narowalCount = await sql`SELECT COUNT(*), SUM(amount), SUM(target_amount) FROM transactions WHERE sheet_id = 'sheet-48-narowal-zone-2'`;
  console.log(`   - Narowal Zone 2 in DB: ${narowalCount[0].count} donors, Paid: Rs. ${Number(narowalCount[0].sum).toLocaleString()}`);
}

ingestAll().catch(console.error);
