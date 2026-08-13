import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicId = 'demo-wdcom';
    const pdfId = 'pdf_demo_wdcom';

    // 1. Create a PDF document in memory using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw header banner (WDCOM Cyan)
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0, 0.639, 0.878), // #00a3e0
    });

    page.drawText('WDCOM MIDIA DIGITAL', {
      x: 40,
      y: height - 60,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('Visualizador & Hospedagem de PDFs de Alta Performance', {
      x: 40,
      y: height - 85,
      size: 13,
      font: fontRegular,
      color: rgb(0.9, 0.95, 1),
    });

    // Content Section
    page.drawText('DOCUMENTO DE DEMONSTRACAO AO VIVO', {
      x: 40,
      y: height - 170,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    const bodyLines = [
      'Este e um documento oficial de demonstracao do sistema WDCOM PDF Viewer.',
      'O arquivo esta hospedado na infraestrutura em nuvem do Google Cloud Firestore.',
      '',
      'Recursos ativos neste visualizador:',
      '  • Renderizacao em tempo real sem perda de qualidade',
      '  • Protecao de incorporacao e restricao por dominio',
      '  • Controle de download e impressao dinamico',
      '  • Carregamento responsivo para dispositivos móveis e desktop',
      '',
      'Para saber mais acesse: http://wdcom.com.br/',
    ];

    let currentY = height - 210;
    for (const line of bodyLines) {
      page.drawText(line, {
        x: 40,
        y: currentY,
        size: 12,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      currentY -= 22;
    }

    // Footer banner
    page.drawRectangle({
      x: 40,
      y: 40,
      width: width - 80,
      height: 1,
      color: rgb(0.8, 0.85, 0.9),
    });

    page.drawText('WDCOM Mídia Digital - Todos os direitos reservados - 2026', {
      x: 40,
      y: 20,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    const fileBuffer = Buffer.from(pdfBytes);
    const base64Data = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
    const storagePath = `demo-wdcom-2026.pdf|||${base64Data}`;

    // 2. Insert into Firestore
    const demoPdf = {
      id: pdfId,
      public_id: publicId,
      title: 'Demonstração Oficial WDCOM PDF Viewer',
      description: 'Documento interativo de demonstração ao vivo hospedado no Google Cloud Firestore.',
      category: 'Demonstração',
      original_filename: 'demo-wdcom-2026.pdf',
      storage_path: storagePath,
      file_size: fileBuffer.length,
      page_count: 1,
      site_id: null,
      status: 'active',
      allow_download: 1,
      allow_print: 1,
      allow_embed: 1,
      restrict_domains: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Firestore system state
    const docRef = firestore.collection('system').doc('db_state');
    const doc = await docRef.get();
    let currentState: any = doc.exists ? doc.data() : { pdfs: [] };
    if (!currentState.pdfs) currentState.pdfs = [];

    const existingIdx = currentState.pdfs.findIndex((p: any) => p.public_id === publicId);
    if (existingIdx >= 0) {
      currentState.pdfs[existingIdx] = demoPdf;
    } else {
      currentState.pdfs.unshift(demoPdf);
    }

    await docRef.set(currentState, { merge: true });

    return NextResponse.json({
      success: true,
      publicId: publicId,
      demoUrl: `/view/${publicId}`,
    });
  } catch (err: any) {
    console.error('Error generating demo PDF:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar PDF de demonstração.' }, { status: 500 });
  }
}
