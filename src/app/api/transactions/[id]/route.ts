import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDatabase();
    const { id } = await params;
    const tx = await req.json();

    await sql`
      UPDATE transactions SET
        receipt_no = COALESCE(${tx.receiptNo}, receipt_no),
        date = COALESCE(${tx.date}, date),
        donor_name = COALESCE(${tx.donorName}, donor_name),
        donor_name_urdu = COALESCE(${tx.donorNameUrdu}, donor_name_urdu),
        branch_name = COALESCE(${tx.branchName}, branch_name),
        zila = COALESCE(${tx.zila}, zila),
        phone = COALESCE(${tx.phone}, phone),
        sarparast_ala = COALESCE(${tx.sarparastAla}, sarparast_ala),
        profession = COALESCE(${tx.profession}, profession),
        address = COALESCE(${tx.address}, address),
        address_urdu = COALESCE(${tx.addressUrdu}, address_urdu),
        monthly_amount = COALESCE(${tx.monthlyAmount !== undefined ? Number(tx.monthlyAmount) : null}, monthly_amount),
        quarterly_amount = COALESCE(${tx.quarterlyAmount !== undefined ? Number(tx.quarterlyAmount) : null}, quarterly_amount),
        annually_amount = COALESCE(${tx.annuallyAmount !== undefined ? Number(tx.annuallyAmount) : null}, annually_amount),
        target_amount = COALESCE(${tx.targetAmount !== undefined ? Number(tx.targetAmount) : null}, target_amount),
        months_data = COALESCE(${tx.monthsData !== undefined ? JSON.stringify(tx.monthsData) : null}::jsonb, months_data),
        amount = COALESCE(${tx.amount !== undefined ? Number(tx.amount) : null}, amount),
        amount_in_words_en = COALESCE(${tx.amountInWordsEn}, amount_in_words_en),
        amount_in_words_ur = COALESCE(${tx.amountInWordsUr}, amount_in_words_ur),
        type = COALESCE(${tx.type}, type),
        category_id = COALESCE(${tx.categoryId}, category_id),
        payment_method = COALESCE(${tx.paymentMethod || tx.paymentMode}, payment_method),
        bank_name = COALESCE(${tx.bankName}, bank_name),
        check_number = COALESCE(${tx.checkNumber || tx.chequeOrTxnNo}, check_number),
        transaction_id = COALESCE(${tx.transactionId}, transaction_id),
        description = COALESCE(${tx.notes || tx.description}, description),
        description_urdu = COALESCE(${tx.descriptionUrdu}, description_urdu),
        recorded_by = COALESCE(${tx.recordedBy}, recorded_by),
        verified_by = COALESCE(${tx.verifiedBy}, verified_by)
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: 'Updated successfully', id });
  } catch (error: any) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initDatabase();
    const { id } = await params;
    await sql`DELETE FROM transactions WHERE id = ${id}`;
    return NextResponse.json({ message: 'Deleted successfully', id });
  } catch (error: any) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
