import { NextResponse } from 'next/server';
import fs from 'fs';
import db from '@/lib/db';
import { getPdfFilePath, pdfFileExists } from '@/lib/storage';

export async function GET(request: Request, { params }: { params: { publicId: string } }) {
  try {
    const publicId = params.publicId;

    const pdf = db.prepare(`
      SELECT p.*,
        (SELECT GROUP_CONCAT(ad.domain, ';') FROM allowed_domains ad WHERE ad.pdf_id = p.id) as allowed_domains_info
      FROM pdfs p
      WHERE p.public_id = ?
    `).get(publicId) as any;

    if (!pdf) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 });
    }

    if (pdf.status !== 'active') {
      return NextResponse.json({ error: 'Este documento PDF está temporariamente desativado.' }, { status: 403 });
    }

    if (!pdfFileExists(pdf.storage_path)) {
      return NextResponse.json({ error: 'Arquivo PDF não encontrado no storage.' }, { status: 404 });
    }

    // Check Referrer Domain Restriction if enabled
    const referer = request.headers.get('referer') || '';
    if (pdf.restrict_domains && referer) {
      try {
        const urlObj = new URL(referer);
        const refDomain = urlObj.hostname.toLowerCase();
        const allowedList = pdf.allowed_domains_info
          ? pdf.allowed_domains_info.split(';').map((d: string) => d.trim().toLowerCase())
          : [];

        const isAllowed = allowedList.some((allowed: string) => {
          return refDomain === allowed || refDomain.endsWith('.' + allowed);
        });

        if (!isAllowed) {
          return NextResponse.json({ error: `Incorporação bloqueada para o domínio: ${refDomain}` }, { status: 403 });
        }
      } catch (e) {
        // Invalid referer URL format
      }
    }

    const filePath = getPdfFilePath(pdf.storage_path);
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Build CSP frame-ancestors header
    let frameAncestors = "*";
    if (pdf.restrict_domains && pdf.allowed_domains_info) {
      const domains = pdf.allowed_domains_info.split(';').map((d: string) => d.trim());
      frameAncestors = `'self' ${domains.map((d: string) => `http://${d} https://${d} http://*.${d} https://*.${d}`).join(' ')}`;
    }

    // Handle Byte Range Requests for fast progressive PDF loading
    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new Response(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${encodeURIComponent(pdf.original_filename)}"`,
          'Content-Security-Policy': `frame-ancestors ${frameAncestors}`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Full stream response
    const fileStream = fs.createReadStream(filePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Length': fileSize.toString(),
        'Content-Type': 'application/pdf',
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `inline; filename="${encodeURIComponent(pdf.original_filename)}"`,
        'Content-Security-Policy': `frame-ancestors ${frameAncestors}`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Error streaming PDF:', err);
    return NextResponse.json({ error: 'Erro ao servir o arquivo PDF.' }, { status: 500 });
  }
}
