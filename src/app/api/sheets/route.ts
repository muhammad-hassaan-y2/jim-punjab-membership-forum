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
        project_id as "projectId",
        project_name as "projectName",
        project_year as "projectYear",
        city_name as "cityName",
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

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Sheet ID required' }, { status: 400 });
    }
    await sql`DELETE FROM sheet_tabs WHERE id = ${id}`;
    return NextResponse.json({ message: 'Sheet deleted successfully', id });
  } catch (error: any) {
    console.error("DELETE /api/sheets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const { id, name, cityName, nameUrdu } = body;
    if (!id) {
      return NextResponse.json({ error: 'Sheet ID required' }, { status: 400 });
    }
    await sql`
      UPDATE sheet_tabs 
      SET 
        name = COALESCE(${name}, name),
        city_name = COALESCE(${cityName || name}, city_name),
        name_urdu = COALESCE(${nameUrdu || name}, name_urdu)
      WHERE id = ${id}
    `;
    return NextResponse.json({ message: 'Sheet updated successfully' });
  } catch (error: any) {
    console.error("PATCH /api/sheets error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
