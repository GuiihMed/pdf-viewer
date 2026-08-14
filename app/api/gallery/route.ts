import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const siteSlug = searchParams.get('site') || searchParams.get('siteSlug') || '';
    const siteId = searchParams.get('siteId') || '';
    const tagSlug = searchParams.get('tag') || searchParams.get('tagSlug') || '';
    const category = searchParams.get('category') || '';

    // Resolving site if filtered by slug or id
    let resolvedSiteId = siteId;
    let siteInfo = null;
    if (siteSlug) {
      const site = db.prepare('SELECT * FROM sites WHERE slug = ? OR id = ?').get(siteSlug, siteSlug) as any;
      if (site) {
        resolvedSiteId = site.id;
        siteInfo = {
          id: site.id,
          name: site.name,
          domain: site.domain,
          slug: site.slug,
          description: site.description,
        };
      }
    } else if (siteId) {
      const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId) as any;
      if (site) {
        siteInfo = {
          id: site.id,
          name: site.name,
          domain: site.domain,
          slug: site.slug,
          description: site.description,
        };
      }
    }

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
      WHERE p.status = 'active'
    `;

    const params: any[] = [];

    if (resolvedSiteId) {
      query += ` AND p.site_id = ?`;
      params.push(resolvedSiteId);
    }

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

    // Public list of active sites and tags for filter tabs
    const sites = db.prepare('SELECT id, name, domain, slug FROM sites WHERE status = "active" ORDER BY name ASC').all();
    const tags = db.prepare('SELECT id, name, slug FROM tags ORDER BY name ASC').all();

    return NextResponse.json({
      success: true,
      site: siteInfo,
      total: pdfs.length,
      pdfs,
      availableSites: sites,
      availableTags: tags,
    });
  } catch (err: any) {
    console.error('Public Gallery API Error:', err);
    return NextResponse.json({ error: 'Erro ao listar galeria de PDFs pública.' }, { status: 500 });
  }
}
