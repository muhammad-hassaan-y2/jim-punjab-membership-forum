import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const rows = await sql`
      SELECT 
        id, 
        name, 
        name_urdu as "nameUrdu", 
        category_filter as "categoryFilter", 
        type_filter as "typeFilter", 
        color, 
        period_type as "periodType", 
        period_value as "periodValue", 
        sort_order as "sortOrder"
      FROM sheet_tabs
      ORDER BY sort_order ASC, created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/sheets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
