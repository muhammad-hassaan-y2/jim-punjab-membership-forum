import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const rows = await sql`
      SELECT 
        id,
        sheet_id as "sheetId",
        receipt_no as "receiptNo",
        date,
        donor_name as "donorName",
        donor_name_urdu as "donorNameUrdu",
        branch_name as "branchName",
        zila,
        phone,
        sarparast_ala as "sarparastAla",
        profession,
        address,
        address_urdu as "addressUrdu",
        monthly_amount::float as "monthlyAmount",
        quarterly_amount::float as "quarterlyAmount",
        annually_amount::float as "annuallyAmount",
        target_amount::float as "targetAmount",
        months_data as "monthsData",
        amount::float as amount,
        amount_in_words_en as "amountInWordsEn",
        amount_in_words_ur as "amountInWordsUr",
        type,
        category_id as "categoryId",
        payment_method as "paymentMode",
        bank_name as "bankName",
        check_number as "checkNumber",
        transaction_id as "transactionId",
        description as "notes",
        description_urdu as "descriptionUrdu",
        recorded_by as "recordedBy",
        verified_by as "verifiedBy",
        created_at as "createdAt"
      FROM transactions
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDatabase();
    const tx = await req.json();
    const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    await sql`
      INSERT INTO transactions (
        id, sheet_id, receipt_no, date, donor_name, donor_name_urdu, branch_name, zila, phone, sarparast_ala, profession, address, address_urdu,
        monthly_amount, quarterly_amount, annually_amount, target_amount, months_data,
        amount, amount_in_words_en, amount_in_words_ur, type, category_id,
        payment_method, bank_name, check_number, transaction_id, description, description_urdu,
        recorded_by, verified_by, created_at
      ) VALUES (
        ${id}, 
        ${tx.sheetId || null},
        ${tx.receiptNo || ''}, 
        ${tx.date || new Date().toISOString().split('T')[0]}, 
        ${tx.donorName || ''}, 
        ${tx.donorNameUrdu || ''}, 
        ${tx.branchName || ''},
        ${tx.zila || ''},
        ${tx.phone || ''}, 
        ${tx.sarparastAla || ''}, 
        ${tx.profession || ''},
        ${tx.address || ''}, 
        ${tx.addressUrdu || ''},
        ${Number(tx.monthlyAmount) || 0},
        ${Number(tx.quarterlyAmount) || 0},
        ${Number(tx.annuallyAmount) || 0},
        ${Number(tx.targetAmount) || 0},
        ${JSON.stringify(tx.monthsData || {})},
        ${Number(tx.amount) || 0}, 
        ${tx.amountInWordsEn || ''}, 
        ${tx.amountInWordsUr || ''}, 
        ${tx.type || 'income'}, 
        ${tx.categoryId || 'membership'},
        ${tx.paymentMethod || tx.paymentMode || 'Cash'}, 
        ${tx.bankName || ''}, 
        ${tx.checkNumber || ''}, 
        ${tx.transactionId || ''}, 
        ${tx.notes || tx.description || ''}, 
        ${tx.descriptionUrdu || ''},
        ${tx.recordedBy || ''}, 
        ${tx.verifiedBy || ''},
        ${tx.createdAt ? new Date(tx.createdAt) : new Date()}
      )
    `;

    return NextResponse.json({ id, ...tx }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const sheetId = searchParams.get('sheetId');
    
    if (sheetId) {
      await sql`DELETE FROM transactions WHERE sheet_id = ${sheetId}`;
      return NextResponse.json({ message: `Transactions for sheet ${sheetId} cleared successfully` });
    } else {
      await sql`DELETE FROM transactions`;
      return NextResponse.json({ message: 'All transactions cleared successfully' });
    }
  } catch (error: any) {
    console.error("CLEAR transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
