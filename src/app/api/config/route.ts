import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const rows = await sql`SELECT data FROM organization_config WHERE id = 'default' LIMIT 1`;
    if (rows.length > 0) {
      return NextResponse.json(rows[0].data);
    } else {
      return NextResponse.json(null);
    }
  } catch (error: any) {
    console.error("GET /api/config error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDatabase();
    const data = await req.json();
    await sql`
      INSERT INTO organization_config (id, data, updated_at)
      VALUES ('default', ${JSON.stringify(data)}, NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    return NextResponse.json({ message: 'Config saved to Neon DB' });
  } catch (error: any) {
    console.error("POST /api/config error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
