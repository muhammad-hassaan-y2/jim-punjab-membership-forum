import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;
    const rows = await sql`
      SELECT id, name, data, row_count as "rowCount", updated_at as "updatedAt"
      FROM shared_sheets
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching shared sheet:', error);
    return NextResponse.json({ error: 'Failed to fetch shared sheet' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;
    const body = await request.json();
    const { name, data, rowCount } = body;

    await sql`
      INSERT INTO shared_sheets (id, name, data, row_count, updated_at)
      VALUES (${id}, ${name || 'Shared Sheet'}, ${JSON.stringify(data || {})}, ${rowCount || 100}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        data = EXCLUDED.data,
        row_count = EXCLUDED.row_count,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving shared sheet:', error);
    return NextResponse.json({ error: 'Failed to save shared sheet' }, { status: 500 });
  }
}
