import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const stmt = db.prepare(`
      SELECT t.*,
        (SELECT COUNT(*) FROM pdf_tags pt WHERE pt.tag_id = t.id) as pdfs_count
      FROM tags t
      ORDER BY t.name ASC
    `);
    const tags = stmt.all();
    return NextResponse.json({ tags });
  } catch (err: any) {
    console.error('Error fetching tags:', err);
    return NextResponse.json({ error: 'Erro ao listar tags.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Nome da tag é obrigatório.' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tagId = `tag_${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO tags (id, name, slug, description)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(tagId, name.trim(), slug, description || '');

    return NextResponse.json({ success: true, tag: { id: tagId, name, slug } });
  } catch (err: any) {
    console.error('Error creating tag:', err);
    return NextResponse.json({ error: 'Erro ao cadastrar tag.' }, { status: 500 });
  }
}
