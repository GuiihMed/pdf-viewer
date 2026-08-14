import { NextResponse } from 'next/server';
import db, { ensureDbSynced } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { generatePublicId, savePdfFile, downloadAndSavePdfFromUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await ensureDbSynced();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const siteId = searchParams.get('siteId') || '';
    const tagId = searchParams.get('tagId') || '';
    const status = searchParams.get('status') || '';
    const publicId = searchParams.get('publicId') || '';

    // If publicId is missing, this is an administrative list query
    const user = !publicId ? getAuthUser() : null;
    if (!publicId && !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    let query = `
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
      WHERE 1=1
    `;

    const params: any[] = [];

    // Multi-tenancy: non-superadmin users can only see PDFs from their assigned site
    if (user && user.role !== 'superadmin' && user.siteId) {
      query += ` AND p.site_id = ?`;
      params.push(user.siteId);
    }

    if (publicId) {
      query += ` AND p.public_id = ?`;
      params.push(publicId);
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.original_filename LIKE ? OR p.public_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (siteId) {
      query += ` AND p.site_id = ?`;
      params.push(siteId);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (tagId) {
      query += ` AND p.id IN (SELECT pdf_id FROM pdf_tags WHERE tag_id = ?)`;
      params.push(tagId);
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

      const allowedDomains = p.allowed_domains_info
        ? p.allowed_domains_info.split(';')
        : [];

      return {
        ...p,
        storage_path: p.storage_path ? p.storage_path.split('|||')[0] : '',
        allow_download: Boolean(p.allow_download),
        allow_print: Boolean(p.allow_print),
        allow_embed: Boolean(p.allow_embed),
        restrict_domains: Boolean(p.restrict_domains),
        tags,
        allowedDomains,
      };
    });

    return NextResponse.json({ pdfs });
  } catch (err: any) {
    console.error('Error fetching PDFs:', err);
    return NextResponse.json({ error: err.message || 'Erro ao carregar lista de PDFs.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pdfUrl = (formData.get('pdfUrl') as string) || '';
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const category = (formData.get('category') as string) || '';
    // Multi-tenancy: non-superadmin users can only create PDFs for their own site
    let siteId = (formData.get('siteId') as string) || null;
    if (user.role !== 'superadmin' && user.siteId) {
      siteId = user.siteId;
    }
    const status = (formData.get('status') as string) || 'active';
    const allowDownload = formData.get('allowDownload') === 'true' ? 1 : 0;
    const allowPrint = formData.get('allowPrint') === 'true' ? 1 : 0;
    const allowEmbed = formData.get('allowEmbed') === 'true' ? 1 : 0;
    const restrictDomains = formData.get('restrictDomains') === 'true' ? 1 : 0;
    const tagIdsRaw = (formData.get('tagIds') as string) || '[]';
    const allowedDomainsRaw = (formData.get('allowedDomains') as string) || '';

    if (!title) {
      return NextResponse.json({ error: 'O Título do PDF é obrigatório.' }, { status: 400 });
    }

    if (!file && !pdfUrl) {
      return NextResponse.json({ error: 'Selecione um arquivo PDF do computador ou insira a URL do PDF.' }, { status: 400 });
    }

    let storagePath = '';
    let fileSize = 0;
    let pageCount = 1;
    let originalFilename = '';

    if (pdfUrl) {
      try {
        const result = await downloadAndSavePdfFromUrl(pdfUrl);
        storagePath = result.storagePath;
        fileSize = result.fileSize;
        pageCount = result.pageCount;
        originalFilename = result.originalFilename;
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Erro ao processar URL do PDF.' }, { status: 400 });
      }
    } else if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Apenas arquivos com extensão .pdf são permitidos.' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await savePdfFile(buffer, file.name);
      storagePath = result.storagePath;
      fileSize = result.fileSize;
      pageCount = result.pageCount;
      originalFilename = file.name;
    }

    const pdfId = `pdf_${Date.now()}`;
    const publicId = generatePublicId();

    const insertStmt = db.prepare(`
      INSERT INTO pdfs (id, public_id, title, description, category, original_filename, storage_path, file_size, page_count, site_id, status, allow_download, allow_print, allow_embed, restrict_domains)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      pdfId,
      publicId,
      title,
      description,
      category,
      originalFilename,
      storagePath,
      fileSize,
      pageCount,
      siteId,
      status,
      allowDownload,
      allowPrint,
      allowEmbed,
      restrictDomains
    );

    // Save Tags
    let tagIds: string[] = [];
    try {
      tagIds = JSON.parse(tagIdsRaw);
    } catch (e) {}

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      const insertTagRel = db.prepare('INSERT INTO pdf_tags (pdf_id, tag_id) VALUES (?, ?)');
      for (const tId of tagIds) {
        insertTagRel.run(pdfId, tId);
      }
    }

    // Save Allowed Domains
    if (restrictDomains && allowedDomainsRaw) {
      const domains = allowedDomainsRaw
        .split('\n')
        .map(d => d.trim().toLowerCase())
        .filter(d => d.length > 0);

      const insertDomain = db.prepare('INSERT INTO allowed_domains (id, pdf_id, domain) VALUES (?, ?, ?)');
      domains.forEach((d, idx) => {
        insertDomain.run(`dom_${pdfId}_${idx}`, pdfId, d);
      });
    }

    // If site has a configured Wix Webhook URL, forward the PDF link and metadata to Wix
    if (siteId) {
      try {
        const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId) as any;
        if (site && site.wix_webhook_url) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wdcom-pdfviewer.vercel.app';
          fetch(site.wix_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'pdf.created',
              pdf: {
                id: pdfId,
                publicId: publicId,
                title: title,
                description: description,
                publicViewUrl: `${appUrl}/view/${publicId}`,
                streamPdfUrl: `${appUrl}/api/pdfs/stream/${publicId}`,
                embedIframeCode: `<iframe src="${appUrl}/view/${publicId}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
              },
            }),
          }).catch((e) => console.warn('Could not dispatch to Wix Webhook:', e.message));
        }
      } catch (e) {}
    }

    await persistStateAsync();

    return NextResponse.json({
      success: true,
      pdf: {
        id: pdfId,
        public_id: publicId,
        title,
        publicUrl: `/view/${publicId}`,
      },
    });
  } catch (err: any) {
    console.error('Error creating PDF:', err);
    return NextResponse.json({ error: err.message || 'Erro ao cadastrar PDF.' }, { status: 500 });
  }
}
