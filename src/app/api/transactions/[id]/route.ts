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
        phone = COALESCE(${tx.phone}, phone),
        address = COALESCE(${tx.address}, address),
        address_urdu = COALESCE(${tx.addressUrdu}, address_urdu),
        amount = COALESCE(${tx.amount !== undefined ? Number(tx.amount) : null}, amount),
        amount_in_words_en = COALESCE(${tx.amountInWordsEn}, amount_in_words_en),
        amount_in_words_ur = COALESCE(${tx.amountInWordsUr}, amount_in_words_ur),
        type = COALESCE(${tx.type}, type),
        category_id = COALESCE(${tx.categoryId}, category_id),
        payment_method = COALESCE(${tx.paymentMethod}, payment_method),
        bank_name = COALESCE(${tx.bankName}, bank_name),
        check_number = COALESCE(${tx.checkNumber}, check_number),
        transaction_id = COALESCE(${tx.transactionId}, transaction_id),
        description = COALESCE(${tx.description}, description),
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
