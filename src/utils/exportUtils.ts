import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Transaction, OrganizationConfig, FundCategory } from '../types/finance';
import { convertNumberToUrduWords } from './urduNumberToWords';
import { convertNumberToEnglishWords } from './englishNumberToWords';

export function exportTransactionsToExcel(
  transactions: Transaction[],
  categories: FundCategory[],
  orgConfig: OrganizationConfig,
  fileName: string = 'JIM_Punjab_Accounting_Ledger'
) {
  const rows = transactions.map((t, index) => {
    const months = t.monthsData || {};
    const target = (t.targetAmount !== undefined && t.targetAmount > 0)
      ? t.targetAmount
      : (t.annuallyAmount && t.annuallyAmount > 0 
          ? t.annuallyAmount 
          : (t.quarterlyAmount && t.quarterlyAmount > 0 
              ? t.quarterlyAmount * 4 
              : (t.monthlyAmount && t.monthlyAmount > 0 ? t.monthlyAmount * 12 : t.amount)));
    const paid = Object.values(months).length > 0 
      ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
      : Number(t.amount || 0);
    const balance = Math.max(0, target - paid);

    return {
      'Sr #': index + 1,
      'Donor Name / نام دہندہ': t.donorName || t.donorNameUrdu || '',
      'Branch Name / برانچ': t.branchName || '',
      'Zila / ضلع': t.zila || t.city || '',
      'Phone / فون نمبر': t.phone || '',
      'Receipt No / رسید نمبر': t.receiptNo,
      'Sarparast-e-Ala / سرپرست اعلیٰ': t.sarparastAla || '',
      'Monthly / ماہانہ رقم': t.monthlyAmount || 0,
      'Quarterly / سہ ماہی رقم': t.quarterlyAmount || 0,
      'Annually / سالانہ رقم': t.annuallyAmount || 0,
      'Jan / جنوری': months.jan || 0,
      'Feb / فروری': months.feb || 0,
      'Mar / مارچ': months.mar || 0,
      'Apr / اپریل': months.apr || 0,
      'May / مئی': months.may || 0,
      'Jun / جون': months.jun || 0,
      'Jul / جولائی': months.jul || 0,
      'Aug / اگست': months.aug || 0,
      'Sep / ستمبر': months.sep || 0,
      'Oct / اکتوبر': months.oct || 0,
      'Nov / نومبر': months.nov || 0,
      'Dec / دسمبر': months.dec || 0,
      'Money Paid / کل وصولی': paid,
      'Target Money / معینہ ہدف': target,
      'Total Remaining / واجب الادا': balance,
      'Payment Mode / طریقہ': t.paymentMode || 'Cash',
      'Bank Name / بینک': t.bankName || '',
      'Remarks / کیفیات': t.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // Sr #
    { wch: 16 }, // Receipt No
    { wch: 12 }, // Date
    { wch: 25 }, // Donor Name
    { wch: 20 }, // Branch
    { wch: 16 }, // Zila
    { wch: 16 }, // Phone
    { wch: 14 }, // Monthly
    { wch: 14 }, // Quarterly
    { wch: 14 }, // Annually
    { wch: 10 }, // Jan
    { wch: 10 }, // Feb
    { wch: 10 }, // Mar
    { wch: 10 }, // Apr
    { wch: 10 }, // May
    { wch: 10 }, // Jun
    { wch: 10 }, // Jul
    { wch: 10 }, // Aug
    { wch: 10 }, // Sep
    { wch: 10 }, // Oct
    { wch: 10 }, // Nov
    { wch: 10 }, // Dec
    { wch: 16 }, // Total Paid
    { wch: 16 }, // Balance Due
    { wch: 14 }, // Payment Mode
    { wch: 20 }, // Bank Name
    { wch: 28 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Sheets');

  // Summary sheet
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const summaryData = [
    { 'Metric / پیمانہ': 'Organization / ادارہ', 'Value / قدر': `${orgConfig.nameUrdu} / ${orgConfig.nameEnglish}` },
    { 'Metric / پیمانہ': 'Total Transactions / کل اندراجات', 'Value / قدر': transactions.length },
    { 'Metric / پیمانہ': 'Total Income (آمدن)', 'Value / قدر': `${orgConfig.currencySymbol} ${totalIncome.toLocaleString()}` },
    { 'Metric / پیمانہ': 'Total Expense (اخراجات)', 'Value / قدر': `${orgConfig.currencySymbol} ${totalExpense.toLocaleString()}` },
    { 'Metric / پیمانہ': 'Net Balance (خالص بقایا)', 'Value / قدر': `${orgConfig.currencySymbol} ${netBalance.toLocaleString()}` },
    { 'Metric / پیمانہ': 'Report Generated On / تاریخ رپورٹ', 'Value / قدر': new Date().toLocaleString() },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTransactionsToCSV(transactions: Transaction[], fileName: string = 'financial_records') {
  const headers = ['Receipt No', 'Date', 'Donor Name', 'Amount', 'Type', 'Category', 'Payment Mode', 'Bank', 'Reference', 'Status', 'Notes'];
  const csvRows = [
    headers.join(','),
    ...transactions.map(t => [
      `"${t.receiptNo}"`,
      `"${t.date}"`,
      `"${(t.donorNameUrdu || t.donorName).replace(/"/g, '""')}"`,
      t.amount,
      `"${t.type}"`,
      `"${t.categoryId}"`,
      `"${t.paymentMode}"`,
      `"${(t.bankName || '').replace(/"/g, '""')}"`,
      `"${(t.reference || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(','))
  ];

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function parseExcelOrCSVFile(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedTransactions: Transaction[] = jsonRows.map((row, index) => {
          const receiptNo = row['Receipt No'] || row['Receipt No / رسید نمبر'] || row['receiptNo'] || row['رسید نمبر'] || `REC-${Date.now()}-${index + 1}`;
          const date = row['Date'] || row['Date / تاریخ'] || row['date'] || row['تاریخ'] || new Date().toISOString().slice(0, 10);
          const name = row['Donor / Payee Name (اسم گرامی)'] || row['Donor Name'] || row['donorName'] || row['Name'] || row['اسم گرامی'] || 'Donor';
          const amountRaw = row['Amount / رقم'] || row['Amount'] || row['amount'] || row['رقم'] || 0;
          const amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw).replace(/[^0-9.]/g, '')) || 0;
          const category = row['Category'] || row['categoryId'] || row['شعبہ فنڈ'] || 'membership';
          const paymentMode = row['Payment Mode'] || row['paymentMode'] || row['طریقہ'] || 'Online';
          const bank = row['Bank Name / بینک'] || row['bankName'] || row['بینک'] || '';
          const ref = row['Reference / بتوسط'] || row['reference'] || row['بتوسط'] || '';
          const address = row['Address / پتہ'] || row['address'] || row['پتہ'] || '';
          const notes = row['Notes / تفصیل'] || row['notes'] || row['تفصیل'] || '';
          const type = String(row['Type'] || row['Type / نوعیت'] || '').toLowerCase().includes('exp') ? 'expense' : 'income';

          return {
            id: `tx-import-${Date.now()}-${index}`,
            receiptNo: String(receiptNo),
            date: String(date),
            donorName: String(name),
            donorNameUrdu: String(name),
            phone: String(row['Phone'] || row['موبائل'] || ''),
            address: String(address),
            reference: String(ref),
            amount: amount,
            amountInWordsUrdu: convertNumberToUrduWords(amount),
            amountInWordsEnglish: convertNumberToEnglishWords(amount),
            categoryId: String(category).toLowerCase().includes('zakat') ? 'zakat' : 
                        String(category).toLowerCase().includes('fitr') ? 'fitrana' :
                        String(category).toLowerCase().includes('sadaq') ? 'sadaqat' :
                        String(category).toLowerCase().includes('construct') ? 'construction' :
                        String(category).toLowerCase().includes('sal') ? 'salaries' : 'membership',
            paymentMode: paymentMode as any,
            bankName: String(bank),
            chequeOrTxnNo: String(row['Cheque/Txn #'] || ''),
            type: type as any,
            status: 'verified',
            notes: String(notes),
            createdAt: new Date().toISOString(),
          };
        });

        resolve(parsedTransactions);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function exportBackupJSON(data: Record<string, any>, fileName: string = 'jamia_finance_backup') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function downloadReceiptAsPDF(elementId: string, receiptNo: string) {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5',
    });

    const imgWidth = 210;
    const pageHeight = 148;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
    pdf.save(`Receipt_${receiptNo.replace(/[\/\\]/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}

export async function downloadReceiptAsImage(elementId: string, receiptNo: string) {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = `Receipt_${receiptNo.replace(/[\/\\]/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
}

export function printSheetAsPDF(
  sheetName: string,
  transactions: Transaction[],
  categories: FundCategory[],
  orgConfig: OrganizationConfig
) {
  const categoryMap = new Map(categories.map(c => [c.id, c.nameEnglish]));

  const totalInflows = transactions.filter(t => t.type === 'income' && t.status !== 'cancelled').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOutflows = transactions.filter(t => t.type === 'expense' && t.status !== 'cancelled').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netBalance = totalInflows - totalOutflows;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Please allow popups to print / save as PDF.');
    return;
  }

  const totalPledged = transactions.reduce((sum, t) => {
    const tgt = t.annuallyAmount && t.annuallyAmount > 0 
      ? t.annuallyAmount 
      : (t.quarterlyAmount && t.quarterlyAmount > 0 
          ? t.quarterlyAmount * 4 
          : (t.monthlyAmount && t.monthlyAmount > 0 ? t.monthlyAmount * 12 : t.amount));
    return sum + (Number(tgt) || 0);
  }, 0);

  const totalPaidSum = transactions.reduce((sum, t) => {
    const months = t.monthsData || {};
    const paid = Object.values(months).length > 0
      ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
      : Number(t.amount || 0);
    return sum + paid;
  }, 0);

  const totalBalanceDue = Math.max(0, totalPledged - totalPaidSum);

  const tableRowsHtml = transactions.length === 0
    ? `<tr><td colspan="15" style="text-align: center; padding: 24px; color: #64748b;">No records recorded in this sheet yet.</td></tr>`
    : transactions.map((t, index) => {
        const months = t.monthsData || {};
        const tgt = t.annuallyAmount && t.annuallyAmount > 0 
          ? t.annuallyAmount 
          : (t.quarterlyAmount && t.quarterlyAmount > 0 
              ? t.quarterlyAmount * 4 
              : (t.monthlyAmount && t.monthlyAmount > 0 ? t.monthlyAmount * 12 : t.amount));
        const paid = Object.values(months).length > 0
          ? Object.values(months).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
          : Number(t.amount || 0);
        const bal = Math.max(0, tgt - paid);

        return `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 4px 5px; font-family: monospace; text-align: center; color: #64748b;">${index + 1}</td>
            <td style="padding: 4px 5px; font-family: monospace; font-weight: bold; color: #2563eb;">${t.receiptNo || '---'}</td>
            <td style="padding: 4px 5px; font-family: monospace; text-align: center;">${t.date || '---'}</td>
            <td style="padding: 4px 5px; font-weight: 600;">${t.donorName || t.donorNameUrdu || '---'}</td>
            <td style="padding: 4px 5px; color: #334155;">${t.branchName || '---'}</td>
            <td style="padding: 4px 5px; color: #334155;">${t.zila || t.city || '---'}</td>
            <td style="padding: 4px 5px; font-family: monospace;">${t.phone || '---'}</td>
            <td style="padding: 4px 5px; text-align: right; font-family: monospace;">${t.monthlyAmount ? Number(t.monthlyAmount).toLocaleString() : '-'}</td>
            <td style="padding: 4px 5px; text-align: right; font-family: monospace;">${t.quarterlyAmount ? Number(t.quarterlyAmount).toLocaleString() : '-'}</td>
            <td style="padding: 4px 5px; text-align: right; font-family: monospace;">${t.annuallyAmount ? Number(t.annuallyAmount).toLocaleString() : '-'}</td>
            <td style="padding: 4px 5px; text-align: right; font-family: monospace; font-weight: bold; color: #059669;">${Number(paid).toLocaleString()}</td>
            <td style="padding: 4px 5px; text-align: right; font-family: monospace; font-weight: bold; color: ${bal > 0 ? '#e11d48' : '#059669'};">${bal > 0 ? Number(bal).toLocaleString() : 'Paid ✓'}</td>
            <td style="padding: 4px 5px; text-align: center;">${t.paymentMode || 'Cash'}</td>
            <td style="padding: 4px 5px; color: #475569;">${t.bankName || '---'}</td>
            <td style="padding: 4px 5px; color: #64748b; font-size: 9px;">${t.notes || '---'}</td>
          </tr>
        `;
      }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${sheetName} - Financial Accounting Schedule</title>
        <style>
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 12px;
            color: #1e293b;
            font-size: 10px;
            background: #ffffff;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #059669;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .org-title {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
          }
          .org-sub {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
          }
          .sheet-badge {
            display: inline-block;
            background: #059669;
            color: white;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 5px;
            font-size: 11px;
            margin-top: 3px;
          }
          .kpi-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }
          .kpi-card {
            flex: 1;
            padding: 6px 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
          }
          .kpi-label {
            font-size: 8px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
          }
          .kpi-value {
            font-size: 12px;
            font-weight: 900;
            font-family: monospace;
            margin-top: 1px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 800;
            text-align: left;
            padding: 5px 6px;
            border-bottom: 2px solid #cbd5e1;
            font-size: 8px;
            text-transform: uppercase;
          }
          .footer-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 9px;
            color: #64748b;
          }
          .sign-box {
            text-align: center;
            border-top: 1px solid #94a3b8;
            width: 170px;
            padding-top: 5px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div class="org-title">${orgConfig.nameEnglish} (Jamaat Islahul Muslimeen Punjab)</div>
            <div class="org-sub">Institutional Membership Fund Accounts Schedule • Phone: ${orgConfig.phone}</div>
            <div class="sheet-badge">${sheetName} — Membership Accounting Register</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 11px;">Official Accounting Ledger</div>
            <div style="color: #64748b; font-size: 9px; margin-top: 2px;">Date: ${new Date().toLocaleString()}</div>
            <div style="color: #059669; font-weight: bold; font-size: 9px; margin-top: 2px;">Neon DB Verified</div>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-label">Total Donors Enrolled</div>
            <div class="kpi-value" style="color: #2563eb;">${transactions.length} Donors</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Target Pledged</div>
            <div class="kpi-value" style="color: #475569;">${orgConfig.currencySymbol} ${totalPledged.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Collected (Paid)</div>
            <div class="kpi-value" style="color: #059669;">${orgConfig.currencySymbol} ${totalPaidSum.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Outstanding Arrears</div>
            <div class="kpi-value" style="color: #e11d48;">${orgConfig.currencySymbol} ${totalBalanceDue.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th style="width: 75px;">Receipt No</th>
              <th style="width: 65px; text-align: center;">Date</th>
              <th>Donor Name</th>
              <th>Branch</th>
              <th>Zila</th>
              <th>Phone</th>
              <th style="text-align: right;">Monthly</th>
              <th style="text-align: right;">Quarterly</th>
              <th style="text-align: right;">Annually</th>
              <th style="text-align: right;">Total Paid</th>
              <th style="text-align: right;">Balance Due</th>
              <th style="text-align: center;">Mode</th>
              <th>Bank Name</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer-box">
          <div>
            <div><strong>${orgConfig.nameEnglish}</strong> • Department of Finance & Accounts</div>
            <div>All contributions recorded exclusively under Membership Fund (ممبر شپ فنڈ).</div>
          </div>
          <div class="sign-box">
            <div style="font-weight: bold; color: #0f172a;">${orgConfig.signatoryName}</div>
            <div style="font-size: 8px; color: #64748b;">${orgConfig.signatoryTitle}</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function exportRawGridToExcel(
  sheetName: string,
  gridData: Record<number, Record<string, string>>,
  rowCount: number,
  colLetters: string[]
) {
  let lastNonEmptyRow = 1;
  for (let r = rowCount; r >= 1; r--) {
    if (colLetters.some(col => !!gridData[r]?.[col]?.trim())) {
      lastNonEmptyRow = r;
      break;
    }
  }

  const rows: Record<string, string>[] = [];
  const exportCount = Math.max(lastNonEmptyRow, 1);
  for (let r = 1; r <= exportCount; r++) {
    const rowObj: Record<string, string> = { 'Row #': String(r) };
    colLetters.forEach(col => {
      rowObj[col] = gridData[r]?.[col] || '';
    });
    rows.push(rowObj);
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function printRawGridAsPDF(
  sheetName: string,
  gridData: Record<number, Record<string, string>>,
  rowCount: number,
  colLetters: string[],
  orgConfig: OrganizationConfig
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print.');
    return;
  }

  let activeCols = colLetters.filter(col => {
    for (let r = 1; r <= rowCount; r++) {
      if (gridData[r]?.[col]?.trim()) return true;
    }
    return false;
  });
  if (activeCols.length === 0) {
    activeCols = colLetters.slice(0, 10);
  }

  let tableHeaderHtml = `<th style="width: 35px; text-align: center;">#</th>`;
  activeCols.forEach(col => {
    tableHeaderHtml += `<th style="text-align: center;">Col ${col}</th>`;
  });

  let lastNonEmptyRow = 1;
  for (let r = rowCount; r >= 1; r--) {
    if (colLetters.some(col => !!gridData[r]?.[col]?.trim())) {
      lastNonEmptyRow = r;
      break;
    }
  }
  const maxRowToShow = Math.max(lastNonEmptyRow, 10);

  let tableRowsHtml = '';
  for (let r = 1; r <= maxRowToShow; r++) {
    let rowCellsHtml = `<td style="text-align: center; font-weight: bold; background: #f8fafc;">${r}</td>`;
    activeCols.forEach(col => {
      const val = gridData[r]?.[col] || '';
      rowCellsHtml += `<td>${val}</td>`;
    });
    tableRowsHtml += `<tr>${rowCellsHtml}</tr>`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${sheetName} - Print</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 12px; }
          .header-box { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #0f172a; margin-bottom: 14px; }
          .org-title { font-size: 16px; font-weight: 800; color: #0f172a; }
          .sheet-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #0284c7; color: white; font-weight: bold; font-size: 10px; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
          th { background-color: #0f172a; color: white; border: 1px solid #334155; padding: 6px 8px; text-align: left; font-weight: 700; }
          td { border: 1px solid #cbd5e1; padding: 5px 8px; }
          tr:nth-child(even) td { background-color: #f8fafc; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div class="org-title">${orgConfig.nameEnglish}</div>
            <div class="sheet-badge">${sheetName} — Raw Excel / Google Sheet Grid</div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div style="font-weight: bold; color: #059669; margin-top: 2px;">Neon DB Synchronized</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 350);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

