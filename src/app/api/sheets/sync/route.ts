import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const { sheets } = await req.json();
    if (Array.isArray(sheets)) {
      await sql`DELETE FROM sheet_tabs`;
      for (let i = 0; i < sheets.length; i++) {
        const s = sheets[i];
        await sql`
          INSERT INTO sheet_tabs (id, name, name_urdu, category_filter, type_filter, color, period_type, period_value, sort_order)
          VALUES (
            ${s.id}, 
            ${s.name}, 
            ${s.nameUrdu || s.name}, 
            ${s.categoryFilter || null}, 
            ${s.typeFilter || null}, 
            ${s.color || '#0284c7'}, 
            ${s.periodType || null}, 
            ${s.periodValue || null}, 
            ${i}
          )
        `;
      }
    }
    return NextResponse.json({ message: 'Sheets synchronized with Neon DB' });
  } catch (error: any) {
    console.error("POST /api/sheets/sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
