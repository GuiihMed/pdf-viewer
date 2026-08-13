import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const totalPdfs = (db.prepare('SELECT COUNT(*) as count FROM pdfs').get() as any).count;
    const activePdfs = (db.prepare("SELECT COUNT(*) as count FROM pdfs WHERE status = 'active'").get() as any).count;
    const inactivePdfs = (db.prepare("SELECT COUNT(*) as count FROM pdfs WHERE status = 'inactive'").get() as any).count;
    const totalSites = (db.prepare('SELECT COUNT(*) as count FROM sites').get() as any).count;
    const totalTags = (db.prepare('SELECT COUNT(*) as count FROM tags').get() as any).count;
    const totalViews = (db.prepare('SELECT COUNT(*) as count FROM pdf_views').get() as any).count;

    const views7d = (db.prepare("SELECT COUNT(*) as count FROM pdf_views WHERE viewed_at >= datetime('now', '-7 days')").get() as any).count;
    const views30d = (db.prepare("SELECT COUNT(*) as count FROM pdf_views WHERE viewed_at >= datetime('now', '-30 days')").get() as any).count;

    // View trend data for chart (last 14 days)
    const viewsChart = db.prepare(`
      SELECT strftime('%Y-%m-%d', viewed_at) as date, COUNT(*) as count
      FROM pdf_views
      WHERE viewed_at >= datetime('now', '-14 days')
      GROUP BY strftime('%Y-%m-%d', viewed_at)
      ORDER BY date ASC
    `).all();

    // Recent PDFs table
    const recentPdfs = db.prepare(`
      SELECT p.*, s.name as site_name, s.domain as site_domain,
        (SELECT COUNT(*) FROM pdf_views pv WHERE pv.pdf_id = p.id) as views_count,
        (SELECT GROUP_CONCAT(t.name, ', ')
         FROM pdf_tags pt
         JOIN tags t ON t.id = pt.tag_id
         WHERE pt.pdf_id = p.id) as tags_list
      FROM pdfs p
      LEFT JOIN sites s ON s.id = p.site_id
      ORDER BY p.created_at DESC
      LIMIT 6
    `).all();

    return NextResponse.json({
      kpis: {
        totalPdfs,
        activePdfs,
        inactivePdfs,
        totalSites,
        totalTags,
        totalViews,
        views7d,
        views30d,
      },
      viewsChart,
      recentPdfs,
    });
  } catch (err: any) {
    console.error('Error getting stats:', err);
    return NextResponse.json({ error: 'Erro ao obter estatísticas.' }, { status: 500 });
  }
}
