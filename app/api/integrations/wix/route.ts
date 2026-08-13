import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { generatePublicId, savePdfFile, downloadAndSavePdfFromUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request via Webhook API Key Header or Query Param
    const apiKey = request.headers.get('x-api-key') || new URL(request.url).searchParams.get('apiKey');
    
    // Find site matching this webhook API key or allow superadmin token
    let siteId: string | null = null;
    let siteName = 'Wix Integration';

    if (apiKey) {
      const site = db.prepare('SELECT * FROM sites WHERE id = ? OR slug = ?').get(apiKey, apiKey) as any;
      if (site) {
        siteId = site.id;
        siteName = site.name;
      }
    }

    // 2. Parse Wix Webhook Payload
    const contentType = request.headers.get('content-type') || '';
    let pdfUrl = '';
    let title = '';
    let description = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      pdfUrl = body.pdfUrl || body.fileUrl || body.url || body.link || '';
      title = body.title || body.name || body.fileName || `PDF de ${siteName}`;
      description = body.description || body.notes || 'Sincronizado automaticamente via Wix Webhook';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      title = (formData.get('title') as string) || (file ? file.name : `PDF de ${siteName}`);
      description = (formData.get('description') as string) || 'Sincronizado via Wix FormData';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { storagePath, fileSize, pageCount, originalFilename } = await savePdfFile(buffer, file.name);

        const newPdfId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const publicId = generatePublicId();
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO pdfs (id, public_id, title, description, category, original_filename, storage_path, file_size, page_count, site_id, status, allow_download, allow_print, allow_embed, restrict_domains, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newPdfId, publicId, title, description, 'Wix Import', originalFilename, storagePath, fileSize, pageCount, siteId, 'active', 1, 1, 1, 0, now, now);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wdcom-pdfviewer.vercel.app';
        return NextResponse.json({
          success: true,
          message: 'PDF recebido e cadastrado com sucesso do Wix!',
          pdf: {
            id: newPdfId,
            publicId: publicId,
            title: title,
            publicViewUrl: `${appUrl}/view/${publicId}`,
            streamPdfUrl: `${appUrl}/api/pdfs/stream/${publicId}`,
            embedIframeCode: `<iframe src="${appUrl}/view/${publicId}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
          },
        });
      }
    }

    if (!pdfUrl) {
      return NextResponse.json({ error: 'Nenhuma URL de PDF ou arquivo enviado no payload do Wix.' }, { status: 400 });
    }

    // Download PDF from Wix URL and register in system
    const { storagePath, fileSize, pageCount, originalFilename } = await downloadAndSavePdfFromUrl(pdfUrl);
    const newPdfId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const publicId = generatePublicId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO pdfs (id, public_id, title, description, category, original_filename, storage_path, file_size, page_count, site_id, status, allow_download, allow_print, allow_embed, restrict_domains, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newPdfId, publicId, title, description, 'Wix Import', originalFilename, storagePath, fileSize, pageCount, siteId, 'active', 1, 1, 1, 0, now, now);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wdcom-pdfviewer.vercel.app';

    return NextResponse.json({
      success: true,
      message: 'PDF importado e cadastrado com sucesso do Wix!',
      pdf: {
        id: newPdfId,
        publicId: publicId,
        title: title,
        publicViewUrl: `${appUrl}/view/${publicId}`,
        streamPdfUrl: `${appUrl}/api/pdfs/stream/${publicId}`,
        embedIframeCode: `<iframe src="${appUrl}/view/${publicId}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
      },
    });
  } catch (err: any) {
    console.error('Wix Webhook import error:', err);
    return NextResponse.json({ error: err.message || 'Erro ao processar integração com Wix.' }, { status: 500 });
  }
}
