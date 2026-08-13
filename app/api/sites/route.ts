import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Non-superadmin users only see their assigned site
    if (user.role !== 'superadmin' && user.siteId) {
      const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(user.siteId) as any;
      if (site) {
        return NextResponse.json({ sites: [site] });
      }
      return NextResponse.json({ sites: [] });
    }

    const stmt = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM pdfs p WHERE p.site_id = s.id) as pdfs_count,
        (SELECT COUNT(*) FROM pdf_views pv JOIN pdfs p ON p.id = pv.pdf_id WHERE p.site_id = s.id) as total_views
      FROM sites s
      ORDER BY s.name ASC
    `);
    const sites = stmt.all();
    return NextResponse.json({ sites });
  } catch (err: any) {
    console.error('Error fetching sites:', err);
    return NextResponse.json({ error: 'Erro ao listar sites.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getAuthUser();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas Super Admins podem criar sites.' }, { status: 403 });
    }

    const { name, domain, description, status } = await request.json();

    if (!name || !domain) {
      return NextResponse.json({ error: 'Nome e Domínio são obrigatórios.' }, { status: 400 });
    }

    const slug = domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const siteId = `site_${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO sites (id, name, domain, slug, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(siteId, name, domain.toLowerCase().trim(), slug, description || '', status || 'active');

    return NextResponse.json({ success: true, site: { id: siteId, name, domain, slug } });
  } catch (err: any) {
    console.error('Error creating site:', err);
    return NextResponse.json({ error: 'Erro ao cadastrar site.' }, { status: 500 });
  }
}
