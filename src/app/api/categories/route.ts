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
        type, 
        color, 
        is_zakat_eligible as "isZakatEligible", 
        description, 
        description_urdu as "descriptionUrdu"
      FROM categories
      ORDER BY name ASC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
