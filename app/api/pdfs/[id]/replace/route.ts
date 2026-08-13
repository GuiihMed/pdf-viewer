import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { deletePdfFile, savePdfFile, downloadAndSavePdfFromUrl } from '@/lib/storage';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const pdfId = params.id;
    const existing = db.prepare('SELECT * FROM pdfs WHERE id = ?').get(pdfId) as any;
    if (!existing) {
      return NextResponse.json({ error: 'PDF não encontrado.' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pdfUrl = (formData.get('pdfUrl') as string) || '';

    if (!file && !pdfUrl) {
      return NextResponse.json({ error: 'Selecione um arquivo PDF do computador ou forneça a URL do novo PDF.' }, { status: 400 });
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
        return NextResponse.json({ error: 'Apenas arquivos .pdf são permitidos.' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await savePdfFile(buffer, file.name);
      storagePath = result.storagePath;
      fileSize = result.fileSize;
      pageCount = result.pageCount;
      originalFilename = file.name;
    }

    // Delete old file from storage
    deletePdfFile(existing.storage_path);

    // Update database record keeping the same ID and public_id
    db.prepare(`
      UPDATE pdfs
      SET original_filename = ?, storage_path = ?, file_size = ?, page_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(originalFilename, storagePath, fileSize, pageCount, pdfId);

    return NextResponse.json({
      success: true,
      message: 'Arquivo PDF substituído mantendo a mesma URL pública e iframe!',
      pdf: {
        id: pdfId,
        public_id: existing.public_id,
        original_filename: originalFilename,
        file_size: fileSize,
        page_count: pageCount,
      },
    });
  } catch (err: any) {
    console.error('Error replacing PDF:', err);
    return NextResponse.json({ error: 'Erro ao substituir arquivo PDF.' }, { status: 500 });
  }
}
