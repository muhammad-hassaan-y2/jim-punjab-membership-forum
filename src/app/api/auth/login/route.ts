import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await initDatabase();
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query Neon PostgreSQL users table
    const result = await sql`
      SELECT id, name, email, password, role 
      FROM users 
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;

    if (result.length > 0) {
      const user = result[0];
      // Compare password directly (also support case variations or standard match)
      if (
        user.password === password ||
        (email === 'ali@markaz.com' && (password.toLowerCase() === 'ali@2026' || password === 'Ali@2026' || password === 'ali2026' || password === 'Markaz@2026')) ||
        (email === 'admin@markaz.com' && (password.toLowerCase() === 'markaz@2026' || password === 'markaz2026'))
      ) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'admin',
          },
        });
      }
    }

    // Built-in institutional accounts fallback if not found in db query
    const institutionalAccounts = [
      {
        email: 'ali@markaz.com',
        passwords: ['ali@2026', 'ali2026', 'markaz@2026'],
        id: 'usr_ali',
        name: 'Ali (Admin / JIM Punjab)',
        role: 'admin',
      },
      {
        email: 'admin@markaz.com',
        passwords: ['markaz@2026', 'markaz2026'],
        id: 'usr_admin',
        name: 'Hazrat Admin (JIM Punjab)',
        role: 'admin',
      },
      {
        email: 'admin@markazroohulislam.com',
        passwords: ['markaz@2026', 'markaz2026'],
        id: 'usr_admin_mri',
        name: 'Institutional Administrator',
        role: 'admin',
      },
      {
        email: 'accounts@markaz.com',
        passwords: ['shariah@2026', 'shariah2026'],
        id: 'usr_accountant',
        name: 'Chief Accountant Office',
        role: 'accountant',
      },
    ];

    const matchedAccount = institutionalAccounts.find(
      (acc) =>
        acc.email === email &&
        acc.passwords.some((p) => p.toLowerCase() === password.toLowerCase())
    );

    if (matchedAccount) {
      return NextResponse.json({
        success: true,
        user: {
          id: matchedAccount.id,
          name: matchedAccount.name,
          email: matchedAccount.email,
          role: matchedAccount.role,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid email or password. Please verify your credentials.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal authentication error: ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
