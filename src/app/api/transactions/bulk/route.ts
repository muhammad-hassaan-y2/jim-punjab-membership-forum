import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const { transactions: list, replaceAll } = await req.json();
    if (replaceAll) {
      await sql`DELETE FROM transactions`;
    }

    if (Array.isArray(list) && list.length > 0) {
      const CHUNK_SIZE = 25;
      for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        const chunk = list.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(tx => {
          const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          return sql`
            INSERT INTO transactions (
              id, receipt_no, date, donor_name, donor_name_urdu, phone, address, address_urdu,
              amount, amount_in_words_en, amount_in_words_ur, type, category_id,
              payment_method, bank_name, check_number, transaction_id, description, description_urdu,
              recorded_by, verified_by, created_at
            ) VALUES (
              ${id}, 
              ${tx.receiptNo || ''}, 
              ${tx.date || new Date().toISOString().split('T')[0]}, 
              ${tx.donorName || ''}, 
              ${tx.donorNameUrdu || ''}, 
              ${tx.phone || ''}, 
              ${tx.address || ''}, 
              ${tx.addressUrdu || ''},
              ${Number(tx.amount) || 0}, 
              ${tx.amountInWordsEn || ''}, 
              ${tx.amountInWordsUr || ''}, 
              ${tx.type || 'income'}, 
              ${tx.categoryId || 'general'},
              ${tx.paymentMethod || 'cash'}, 
              ${tx.bankName || ''}, 
              ${tx.checkNumber || ''}, 
              ${tx.transactionId || ''}, 
              ${tx.description || ''}, 
              ${tx.descriptionUrdu || ''},
              ${tx.recordedBy || ''}, 
              ${tx.verifiedBy || ''},
              ${tx.createdAt ? new Date(tx.createdAt) : new Date()}
            )
            ON CONFLICT (id) DO UPDATE SET
              receipt_no = EXCLUDED.receipt_no,
              date = EXCLUDED.date,
              donor_name = EXCLUDED.donor_name,
              donor_name_urdu = EXCLUDED.donor_name_urdu,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              address_urdu = EXCLUDED.address_urdu,
              amount = EXCLUDED.amount,
              amount_in_words_en = EXCLUDED.amount_in_words_en,
              amount_in_words_ur = EXCLUDED.amount_in_words_ur,
              type = EXCLUDED.type,
              category_id = EXCLUDED.category_id,
              payment_method = EXCLUDED.payment_method,
              bank_name = EXCLUDED.bank_name,
              check_number = EXCLUDED.check_number,
              transaction_id = EXCLUDED.transaction_id,
              description = EXCLUDED.description,
              description_urdu = EXCLUDED.description_urdu,
              recorded_by = EXCLUDED.recorded_by,
              verified_by = EXCLUDED.verified_by
          `;
        }));
      }
    }

    return NextResponse.json({ message: 'Transactions saved to Neon DB', count: list ? list.length : 0 });
  } catch (error: any) {
    console.error("POST /api/transactions/bulk error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
