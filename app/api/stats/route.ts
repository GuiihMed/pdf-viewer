import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const isSuperAdmin = user.role === 'superadmin';
    const userSiteId = user.siteId;

    // Get all data via standard queries first
    const allPdfs = db.prepare(`
      SELECT p.*, s.name as site_name, s.domain as site_domain,
        (SELECT COUNT(*) FROM pdf_views pv WHERE pv.pdf_id = p.id) as views_count,
        (SELECT GROUP_CONCAT(t.name, ', ')
         FROM pdf_tags pt
         JOIN tags t ON t.id = pt.tag_id
         WHERE pt.pdf_id = p.id) as tags_list
      FROM pdfs p
      LEFT JOIN sites s ON s.id = p.site_id
      ORDER BY p.created_at DESC
    `).all() as any[];

    // Filter by site if not superadmin
    const filteredPdfs = isSuperAdmin
      ? allPdfs
      : allPdfs.filter((p: any) => p.site_id === userSiteId);

    const filteredPdfIds = filteredPdfs.map((p: any) => p.id);

    // Calculate KPIs from filtered data
    const totalPdfs = filteredPdfs.length;
    const activePdfs = filteredPdfs.filter((p: any) => p.status === 'active').length;
    const inactivePdfs = filteredPdfs.filter((p: any) => p.status === 'inactive').length;

    // Sites and tags only visible for superadmin
    const totalSites = isSuperAdmin
      ? (db.prepare('SELECT COUNT(*) as count FROM sites').get() as any).count
      : 1;
    const totalTags = (db.prepare('SELECT COUNT(*) as count FROM tags').get() as any).count;

    // Views - need to get raw views and filter
    const allViewsChart = db.prepare(`
      SELECT strftime('%Y-%m-%d', viewed_at) as date, COUNT(*) as count
      FROM pdf_views
      WHERE viewed_at >= datetime('now', '-14 days')
      GROUP BY strftime('%Y-%m-%d', viewed_at)
      ORDER BY date ASC
    `).all() as any[];

    // For total views, compute from filtered pdfs
    const totalViews = filteredPdfs.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0);

    // For 7d and 30d views, we need the raw view data scoped
    const allViews = db.prepare('SELECT * FROM pdf_views WHERE 1=1').all() as any[];
    const filteredViews = isSuperAdmin
      ? allViews
      : allViews.filter((v: any) => filteredPdfIds.includes(v.pdf_id));

    const now = Date.now();
    const views7d = filteredViews.filter((v: any) => new Date(v.viewed_at).getTime() >= now - 7 * 86400000).length;
    const views30d = filteredViews.filter((v: any) => new Date(v.viewed_at).getTime() >= now - 30 * 86400000).length;

    // Views chart for filtered PDFs
    let viewsChart = allViewsChart;
    if (!isSuperAdmin) {
      // Rebuild chart from filtered views
      const chartMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const dStr = new Date(now - i * 86400000).toISOString().slice(0, 10);
        chartMap.set(dStr, 0);
      }
      filteredViews.forEach((v: any) => {
        const dStr = v.viewed_at ? v.viewed_at.slice(0, 10) : '';
        if (chartMap.has(dStr)) {
          chartMap.set(dStr, (chartMap.get(dStr) || 0) + 1);
        }
      });
      viewsChart = Array.from(chartMap.entries()).map(([date, count]) => ({ date, count }));
    }

    // Recent PDFs (filtered)
    const recentPdfs = filteredPdfs.slice(0, 6);

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
