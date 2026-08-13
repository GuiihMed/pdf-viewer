import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { deletePdfFile } from '@/lib/storage';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const pdfId = params.id;
    const stmt = db.prepare(`
      SELECT p.*, s.name as site_name, s.domain as site_domain,
        (SELECT COUNT(*) FROM pdf_views pv WHERE pv.pdf_id = p.id) as views_count,
        (SELECT GROUP_CONCAT(t.id || ':' || t.name || ':' || t.slug, ';')
         FROM pdf_tags pt
         JOIN tags t ON t.id = pt.tag_id
         WHERE pt.pdf_id = p.id) as tags_info,
        (SELECT GROUP_CONCAT(ad.domain, ';')
         FROM allowed_domains ad
         WHERE ad.pdf_id = p.id) as allowed_domains_info
      FROM pdfs p
      LEFT JOIN sites s ON s.id = p.site_id
      WHERE p.id = ? OR p.public_id = ?
    `);

    const pdf = stmt.get(pdfId, pdfId) as any;
    if (!pdf) {
      return NextResponse.json({ error: 'PDF não encontrado.' }, { status: 404 });
    }

    // Multi-tenancy check for admin operations (non-public access)
    const user = getAuthUser();
    if (user && user.role !== 'superadmin' && user.siteId && pdf.site_id !== user.siteId) {
      return NextResponse.json({ error: 'Acesso negado. Este PDF pertence a outro site.' }, { status: 403 });
    }

    const tags = pdf.tags_info
      ? pdf.tags_info.split(';').map((tStr: string) => {
          const [id, name, slug] = tStr.split(':');
          return { id, name, slug };
        })
      : [];

    const allowedDomains = pdf.allowed_domains_info
      ? pdf.allowed_domains_info.split(';')
      : [];

    return NextResponse.json({
      pdf: {
        ...pdf,
        allow_download: Boolean(pdf.allow_download),
        allow_print: Boolean(pdf.allow_print),
        allow_embed: Boolean(pdf.allow_embed),
        restrict_domains: Boolean(pdf.restrict_domains),
        tags,
        allowedDomains,
      },
    });
  } catch (err: any) {
    console.error('Error getting PDF:', err);
    return NextResponse.json({ error: 'Erro ao buscar detalhes do PDF.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const pdfId = params.id;

    // Multi-tenancy: verify ownership
    const existingPdf = db.prepare('SELECT id, site_id FROM pdfs WHERE id = ?').get(pdfId) as any;
    if (!existingPdf) {
      return NextResponse.json({ error: 'PDF não encontrado.' }, { status: 404 });
    }
    if (user.role !== 'superadmin' && user.siteId && existingPdf.site_id !== user.siteId) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para editar este PDF.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      siteId,
      status,
      allowDownload,
      allowPrint,
      allowEmbed,
      restrictDomains,
      tagIds,
      allowedDomains,
    } = body;

    // Non-superadmin users cannot change the site_id of a PDF
    const finalSiteId = user.role !== 'superadmin' && user.siteId ? user.siteId : (siteId || null);

    const updateStmt = db.prepare(`
      UPDATE pdfs
      SET title = ?, description = ?, category = ?, site_id = ?, status = ?,
          allow_download = ?, allow_print = ?, allow_embed = ?, restrict_domains = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      title,
      description || '',
      category || '',
      finalSiteId,
      status || 'active',
      allowDownload ? 1 : 0,
      allowPrint ? 1 : 0,
      allowEmbed ? 1 : 0,
      restrictDomains ? 1 : 0,
      pdfId
    );

    // Update Tags
    db.prepare('DELETE FROM pdf_tags WHERE pdf_id = ?').run(pdfId);
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const insertTagRel = db.prepare('INSERT INTO pdf_tags (pdf_id, tag_id) VALUES (?, ?)');
      tagIds.forEach(tId => insertTagRel.run(pdfId, tId));
    }

    // Update Allowed Domains
    db.prepare('DELETE FROM allowed_domains WHERE pdf_id = ?').run(pdfId);
    if (restrictDomains && Array.isArray(allowedDomains)) {
      const insertDomain = db.prepare('INSERT INTO allowed_domains (id, pdf_id, domain) VALUES (?, ?, ?)');
      allowedDomains.forEach((d: string, idx: number) => {
        const clean = d.trim().toLowerCase();
        if (clean) insertDomain.run(`dom_${pdfId}_${idx}_${Date.now()}`, pdfId, clean);
      });
    }

    return NextResponse.json({ success: true, message: 'PDF atualizado com sucesso.' });
  } catch (err: any) {
    console.error('Error updating PDF:', err);
    return NextResponse.json({ error: 'Erro ao atualizar PDF.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const pdfId = params.id;
    const pdf = db.prepare('SELECT id, storage_path, site_id FROM pdfs WHERE id = ?').get(pdfId) as any;
    if (!pdf) {
      return NextResponse.json({ error: 'PDF não encontrado.' }, { status: 404 });
    }

    // Multi-tenancy: verify ownership
    if (user.role !== 'superadmin' && user.siteId && pdf.site_id !== user.siteId) {
      return NextResponse.json({ error: 'Acesso negado. Você não tem permissão para excluir este PDF.' }, { status: 403 });
    }

    // Delete file from disk
    deletePdfFile(pdf.storage_path);

    // Delete database records (cascades automatically via FKs)
    db.prepare('DELETE FROM pdfs WHERE id = ?').run(pdfId);

    return NextResponse.json({ success: true, message: 'PDF excluído com sucesso.' });
  } catch (err: any) {
    console.error('Error deleting PDF:', err);
    return NextResponse.json({ error: 'Erro ao excluir PDF.' }, { status: 500 });
  }
}
