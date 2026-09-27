import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const rows = await sql`
      SELECT 
        id, 
        name, 
        year, 
        description, 
        target_amount::float as "targetAmount", 
        created_at as "createdAt"
      FROM projects
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDatabase();
    const project = await req.json();
    const id = project.id || `proj-${Date.now()}`;
    const name = project.name || 'Untitled Project';
    const year = String(project.year || new Date().getFullYear());
    const description = project.description || '';
    const targetAmount = Number(project.targetAmount) || 10000000;

    await sql`
      INSERT INTO projects (id, name, year, description, target_amount, created_at)
      VALUES (${id}, ${name}, ${year}, ${description}, ${targetAmount}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        year = EXCLUDED.year,
        description = EXCLUDED.description,
        target_amount = EXCLUDED.target_amount
    `;

    return NextResponse.json({
      id,
      name,
      year,
      description,
      targetAmount,
      createdAt: new Date().toISOString()
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await initDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
