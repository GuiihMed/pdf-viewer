import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem gerenciar usuários.' }, { status: 403 });
    }

    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC');
    const users = stmt.all();
    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'Erro ao listar usuários.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getAuthUser();
    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem cadastrar usuários.' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, E-mail e Senha são obrigatórios.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, name, email.toLowerCase().trim(), passwordHash, role || 'admin');

    return NextResponse.json({ success: true, message: 'Usuário cadastrado com sucesso.' });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}
