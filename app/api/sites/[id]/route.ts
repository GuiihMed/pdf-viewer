import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const siteId = params.id;
    const { name, domain, description, wix_webhook_url, status } = await request.json();

    const slug = domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const stmt = db.prepare(`
      UPDATE sites
      SET name = ?, domain = ?, slug = ?, description = ?, wix_webhook_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, domain.toLowerCase().trim(), slug, description || '', wix_webhook_url || null, status || 'active', siteId);

    return NextResponse.json({ success: true, message: 'Site atualizado.' });
  } catch (err: any) {
    console.error('Error updating site:', err);
    return NextResponse.json({ error: 'Erro ao atualizar site.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const siteId = params.id;
    db.prepare('DELETE FROM sites WHERE id = ?').run(siteId);
    return NextResponse.json({ success: true, message: 'Site excluído.' });
  } catch (err: any) {
    console.error('Error deleting site:', err);
    return NextResponse.json({ error: 'Erro ao excluir site.' }, { status: 500 });
  }
}
