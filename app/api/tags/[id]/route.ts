import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const tagId = params.id;
    const { name, description } = await request.json();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    db.prepare(`
      UPDATE tags
      SET name = ?, slug = ?, description = ?
      WHERE id = ?
    `).run(name.trim(), slug, description || '', tagId);

    return NextResponse.json({ success: true, message: 'Tag atualizada.' });
  } catch (err: any) {
    console.error('Error updating tag:', err);
    return NextResponse.json({ error: 'Erro ao atualizar tag.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const tagId = params.id;
    db.prepare('DELETE FROM tags WHERE id = ?').run(tagId);
    return NextResponse.json({ success: true, message: 'Tag excluída.' });
  } catch (err: any) {
    console.error('Error deleting tag:', err);
    return NextResponse.json({ error: 'Erro ao excluir tag.' }, { status: 500 });
  }
}
