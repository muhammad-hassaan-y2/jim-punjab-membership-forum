import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();
    const start = Date.now();
    const result = await sql`SELECT 1 as connected, NOW() as current_time`;
    const latency = Date.now() - start;
    return NextResponse.json({ 
      status: 'online', 
      database: 'Neon PostgreSQL', 
      latencyMs: latency, 
      time: result[0]?.current_time 
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
