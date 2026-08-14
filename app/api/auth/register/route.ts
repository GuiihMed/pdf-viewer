import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db, { ensureDbSynced, persistStateAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const { name, email, password, siteId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, E-mail e Senha são obrigatórios.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user with status 'pending'
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, site_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, cleanEmail, passwordHash, 'client', siteId || null, 'pending');

    await persistStateAsync();

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação do Administrador.',
    });
  } catch (err: any) {
    console.error('Error during self registration:', err);
    return NextResponse.json({ error: 'Erro ao realizar cadastro.' }, { status: 500 });
  }
}
