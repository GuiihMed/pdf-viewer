import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { publicId, referrer, userAgent } = await request.json();

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID é obrigatório.' }, { status: 400 });
    }

    const pdf = db.prepare('SELECT id FROM pdfs WHERE public_id = ? AND status = "active"').get(publicId) as any;
    if (!pdf) {
      return NextResponse.json({ error: 'PDF não encontrado ou inativo.' }, { status: 404 });
    }

    // Determine device type
    const ua = userAgent || '';
    let device = 'Desktop';
    if (/mobile/i.test(ua)) device = 'Mobile';
    else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

    // Determine browser
    let browser = 'Outro';
    if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';

    const viewId = `vw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.prepare(`
      INSERT INTO pdf_views (id, pdf_id, referrer, user_agent, device, browser)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(viewId, pdf.id, referrer || 'Direct', ua, device, browser);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error logging view:', err);
    return NextResponse.json({ error: 'Erro ao registrar visualização.' }, { status: 500 });
  }
}
