import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const { sheets } = await req.json();
    if (Array.isArray(sheets)) {
      await sql`DELETE FROM sheet_tabs`;
      const chunkSize = 10;
      for (let i = 0; i < sheets.length; i += chunkSize) {
        const chunk = sheets.slice(i, i + chunkSize);
        await Promise.all(chunk.map((s, idx) => {
          const sortIdx = i + idx;
          return sql`
            INSERT INTO sheet_tabs (
              id, name, name_urdu, project_id, project_name, project_year, city_name,
              category_filter, type_filter, color, period_type, period_value, sort_order
            )
            VALUES (
              ${s.id}, 
              ${s.name}, 
              ${s.nameUrdu || s.name}, 
              ${s.projectId || null},
              ${s.projectName || null},
              ${s.projectYear || null},
              ${s.cityName || s.name},
              ${s.categoryFilter || null}, 
              ${s.typeFilter || null}, 
              ${s.color || '#0284c7'}, 
              ${s.periodType || null}, 
              ${s.periodValue || null}, 
              ${s.sortOrder !== undefined ? s.sortOrder : sortIdx}
            )
          `;
        }));
      }
    }
    return NextResponse.json({ message: 'Sheets synchronized with Neon DB' });
  } catch (error: any) {
    console.error("POST /api/sheets/sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
