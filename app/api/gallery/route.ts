import { NextResponse } from 'next/server';
import db, { ensureDbSynced } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await ensureDbSynced();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const siteParam = searchParams.get('site') || searchParams.get('siteSlug') || searchParams.get('siteId') || '';
    const tagSlug = searchParams.get('tag') || searchParams.get('tagSlug') || '';
    const category = searchParams.get('category') || '';

    // A Galeria agora é estritamente individual por Site/Cliente.
    // É obrigatório passar o identificador do site (slug ou id) na URL.
    if (!siteParam) {
      return NextResponse.json({
        success: false,
        error: 'É necessário informar o identificador do site para acessar a galeria individual.',
        requiresSite: true,
      }, { status: 400 });
    }

    // Resolving site
    const currentSite = db.prepare('SELECT * FROM sites WHERE slug = ? OR id = ? OR domain = ?').get(siteParam, siteParam, siteParam.toLowerCase().trim()) as any;
    if (!currentSite) {
      return NextResponse.json({
        success: false,
        error: 'Empresa ou Site não encontrado.',
        siteNotFound: true,
      }, { status: 404 });
    }

    if (currentSite.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'A galeria deste site está temporariamente desativada.',
        siteInactive: true,
      }, { status: 403 });
    }

    const siteInfo = {
      id: currentSite.id,
      name: currentSite.name,
      domain: currentSite.domain,
      slug: currentSite.slug,
      description: currentSite.description,
    };

    let query = `
      SELECT p.id, p.public_id, p.title, p.description, p.category, p.original_filename,
             p.file_size, p.page_count, p.site_id, p.status, p.allow_download, p.allow_print,
             p.allow_embed, p.created_at, p.updated_at,
             s.name as site_name, s.domain as site_domain, s.slug as site_slug,
             (SELECT COUNT(*) FROM pdf_views pv WHERE pv.pdf_id = p.id) as views_count,
             (SELECT GROUP_CONCAT(t.id || ':' || t.name || ':' || t.slug, ';')
              FROM pdf_tags pt
              JOIN tags t ON t.id = pt.tag_id
              WHERE pt.pdf_id = p.id) as tags_info
      FROM pdfs p
      LEFT JOIN sites s ON s.id = p.site_id
      WHERE p.status = 'active' AND p.site_id = ?
    `;

    const params: any[] = [currentSite.id];

    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.original_filename LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (tagSlug) {
      query += ` AND p.id IN (
        SELECT pt.pdf_id FROM pdf_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE t.slug = ? OR t.id = ? OR t.name = ?
      )`;
      params.push(tagSlug, tagSlug, tagSlug);
    }

    query += ` ORDER BY p.created_at DESC`;

    const stmt = db.prepare(query);
    const pdfs = stmt.all(...params).map((p: any) => {
      const tags = p.tags_info
        ? p.tags_info.split(';').map((tStr: string) => {
            const [id, name, slug] = tStr.split(':');
            return { id, name, slug };
          })
        : [];

      return {
        id: p.id,
        public_id: p.public_id,
        title: p.title,
        description: p.description,
        category: p.category,
        original_filename: p.original_filename,
        file_size: p.file_size,
        page_count: p.page_count,
        site_id: p.site_id,
        site_name: p.site_name,
        site_domain: p.site_domain,
        site_slug: p.site_slug,
        views_count: p.views_count || 0,
        allow_download: Boolean(p.allow_download),
        allow_print: Boolean(p.allow_print),
        allow_embed: Boolean(p.allow_embed),
        created_at: p.created_at,
        tags,
      };
    });

    // Apenas as tags que possuem PDFs vinculados a ESTE site específico
    const allTags = db.prepare('SELECT id, name, slug FROM tags ORDER BY name ASC').all();
    const sitePdfIds = db.prepare('SELECT id FROM pdfs WHERE site_id = ? AND status = "active"').all(currentSite.id).map((p: any) => p.id);
    const siteTagIds = new Set(
      db.prepare('SELECT tag_id FROM pdf_tags WHERE pdf_id IN (' + (sitePdfIds.map(() => '?').join(',') || "''") + ')')
        .all(...sitePdfIds)
        .map((pt: any) => pt.tag_id)
    );

    const availableTags = allTags.filter((t: any) => siteTagIds.has(t.id) || pdfs.some((p: any) => p.tags.some((pt: any) => pt.id === t.id)));

    return NextResponse.json({
      success: true,
      site: siteInfo,
      total: pdfs.length,
      pdfs,
      availableTags,
    });
  } catch (err: any) {
    console.error('Individual Site Gallery API Error:', err);
    return NextResponse.json({ error: 'Erro ao carregar galeria do site.' }, { status: 500 });
  }
}
