import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const { categories } = await req.json();
    if (Array.isArray(categories)) {
      await sql`DELETE FROM categories`;
      for (const c of categories) {
        await sql`
          INSERT INTO categories (id, name, name_urdu, type, color, is_zakat_eligible, description, description_urdu)
          VALUES (
            ${c.id}, 
            ${c.nameEnglish || c.name || 'Category'}, 
            ${c.nameUrdu || c.nameEnglish || c.name || 'Category'}, 
            ${c.type}, 
            ${c.color || '#0284c7'}, 
            ${c.isZakatEligible || false}, 
            ${c.description || ''}, 
            ${c.descriptionUrdu || ''}
          )
        `;
      }
    }
    return NextResponse.json({ message: 'Categories synchronized with Neon DB' });
  } catch (error: any) {
    console.error("POST /api/categories/sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
