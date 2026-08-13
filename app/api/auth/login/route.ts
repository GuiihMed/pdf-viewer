import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
    }

    // Check account status
    const status = user.status || 'active';
    if (status === 'pending') {
      return NextResponse.json({
        error: 'Sua conta está aguardando confirmação e aprovação do administrador.',
        code: 'PENDING_APPROVAL'
      }, { status: 403 });
    }

    if (status === 'rejected') {
      return NextResponse.json({
        error: 'Sua solicitação de cadastro foi recusada pelo administrador.',
        code: 'ACCOUNT_REJECTED'
      }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      siteId: user.site_id || null,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        site_id: user.site_id || null,
        status: user.status,
      },
    });

    response.cookies.set({
      name: 'pdf_admin_token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erro interno no servidor ao fazer login.' }, { status: 500 });
  }
}
