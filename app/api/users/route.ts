import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem gerenciar usuários.' }, { status: 403 });
    }

    const stmt = db.prepare('SELECT id, name, email, role, site_id, status, created_at FROM users ORDER BY created_at DESC');
    const users = stmt.all().map((u: any) => {
      let siteName = null;
      if (u.site_id) {
        const site = db.prepare('SELECT name FROM sites WHERE id = ?').get(u.site_id) as any;
        siteName = site ? site.name : null;
      }
      return { ...u, status: u.status || 'active', site_name: siteName };
    });
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

    const { name, email, password, role, siteId, status } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, E-mail e Senha são obrigatórios.' }, { status: 400 });
    }

    if (role === 'client' && !siteId) {
      return NextResponse.json({ error: 'Para usuários do tipo Cliente, é obrigatório associar um Site.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, site_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, cleanEmail, passwordHash, role || 'client', siteId || null, status || 'active');

    return NextResponse.json({ success: true, message: 'Usuário cadastrado com sucesso.' });
  } catch (err: any) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: 'Erro ao criar usuário.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = getAuthUser();
    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem editar ou aprovar usuários.' }, { status: 403 });
    }

    const { userId, name, email, password, role, siteId, status, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    if (targetUser.email === 'atendimento@wdcom.com.br' && email && email !== 'atendimento@wdcom.com.br') {
      return NextResponse.json({ error: 'O e-mail do Super Admin principal não pode ser alterado.' }, { status: 403 });
    }

    // Quick status approval / rejection action
    if (action === 'approve') {
      const finalSiteId = siteId || targetUser.site_id || null;
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run('active', userId, finalSiteId);
      return NextResponse.json({ success: true, message: 'Usuário aprovado e ativado com sucesso!' });
    }

    if (action === 'reject') {
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run('rejected', userId);
      return NextResponse.json({ success: true, message: 'Cadastro recusado.' });
    }

    // Standard edit
    if (role === 'client' && !siteId) {
      return NextResponse.json({ error: 'Para usuários do tipo Cliente, é obrigatório associar um Site.' }, { status: 400 });
    }

    if (email && email.toLowerCase().trim() !== targetUser.email.toLowerCase().trim()) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: 'Este e-mail já está sendo utilizado por outro usuário.' }, { status: 400 });
      }
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email.toLowerCase().trim(), userId);
    }

    if (password && password.trim().length > 0) {
      const newHash = bcrypt.hashSync(password.trim(), 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    }

    db.prepare(`
      UPDATE users SET name = ?, role = ?, site_id = ? WHERE id = ?
    `).run(name || targetUser.name, role || targetUser.role, siteId || null, userId);

    if (status) {
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, userId);
    }

    return NextResponse.json({ success: true, message: 'Usuário e dados de acesso atualizados com sucesso.' });
  } catch (err: any) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = getAuthUser();
    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem excluir usuários.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    if (targetUser.email === 'atendimento@wdcom.com.br') {
      return NextResponse.json({ error: 'O Super Admin principal não pode ser excluído.' }, { status: 403 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso.' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Erro ao excluir usuário.' }, { status: 500 });
  }
}
