'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Globe,
  Tag,
  Eye,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Copy,
  Code,
  Edit3
} from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin stats:', err);
        setLoading(false);
      });
  }, []);

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copiada com sucesso!`, 'success');
  };

  if (loading || !stats) {
    return (
      <div style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        Carregando dados do painel...
      </div>
    );
  }

  const kpis = stats.kpis || {
    totalPdfs: 0,
    activePdfs: 0,
    inactivePdfs: 0,
    totalViews: 0,
    views7d: 0,
    views30d: 0,
    totalSites: 0,
    totalTags: 0,
  };

  const viewsChart = Array.isArray(stats.viewsChart) ? stats.viewsChart : [];
  const recentPdfs = Array.isArray(stats.recentPdfs) ? stats.recentPdfs : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Dashboard Administrativo</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Visão geral da plataforma, estatísticas de visualização e arquivos recentes.
          </p>
        </div>

        <Link href="/admin/pdfs/new" className="btn-primary">
          <Plus size={18} /> Cadastrar Novo PDF
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Total de PDFs</span>
            <FileText size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f3f4f6' }}>{kpis.totalPdfs}</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '6px' }}>
            {kpis.activePdfs} ativos • {kpis.inactivePdfs} inativos
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Visualizações Totais</span>
            <Eye size={20} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f3f4f6' }}>{kpis.totalViews}</div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '6px' }}>
            {kpis.views7d} nos últimos 7 dias
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Sites / Projetos</span>
            <Globe size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f3f4f6' }}>{kpis.totalSites}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>Domínios cadastrados</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Tags de Organização</span>
            <Tag size={20} color="#c084fc" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f3f4f6' }}>{kpis.totalTags}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>Categorização ativa</div>
        </div>
      </div>

      {/* Analytics Chart Box */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#6366f1" /> Visualizações nos Últimos 14 Dias
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Evolução do tráfego de documentos em todos os sites</p>
          </div>
          <span className="badge badge-active">{kpis.views30d} views em 30 dias</span>
        </div>

        {/* Interactive SVG Bar Chart */}
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
          {viewsChart.length > 0 ? (
            viewsChart.map((item: any, idx: number) => {
              const maxCount = Math.max(...viewsChart.map((v: any) => (v && typeof v.count === 'number' ? v.count : 0)), 1);
              const count = item && typeof item.count === 'number' ? item.count : 0;
              const heightPct = Math.max((count / maxCount) * 100, 10);
              const dateStr = item && item.date ? String(item.date) : '';
              const dateLabel = dateStr.length >= 5 ? dateStr.slice(5) : dateStr;

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '4px' }}>{count}</div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '32px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.2) 100%)',
                      borderRadius: '6px 6px 0 0',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      transition: 'height 0.3s ease',
                    }}
                    title={`${dateStr}: ${count} visualizações`}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {dateLabel}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', alignSelf: 'center' }}>
              Sem dados de visualização recentes.
            </div>
          )}
        </div>
      </div>

      {/* Recent PDFs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#f3f4f6' }}>PDFs Cadastrados Recentes</h3>
          <Link href="/admin/pdfs" style={{ fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Ver todos <ArrowUpRight size={16} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>PDF / Título</th>
                <th style={{ padding: '12px 14px' }}>Site</th>
                <th style={{ padding: '12px 14px' }}>Tags</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Views</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentPdfs.map((pdf: any) => {
                const publicUrl = typeof window !== 'undefined'
                  ? `${window.location.origin}/view/${pdf.public_id}`
                  : `/view/${pdf.public_id}`;
                const iframeCode = `<iframe src="${publicUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`;

                return (
                  <tr key={pdf.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px' }}>
                      <Link href={`/admin/pdfs/${pdf.id}`} style={{ fontWeight: 600, color: '#f9fafb', textDecoration: 'none' }}>
                        {pdf.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {pdf.public_id}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {pdf.site_name ? (
                        <span className="badge badge-site">{pdf.site_name}</span>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Sem site</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {pdf.tags_list ? (
                        <span className="badge badge-tag">{pdf.tags_list}</span>
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${pdf.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {pdf.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600, color: '#818cf8' }}>
                      {pdf.views_count || 0}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => copyText(publicUrl, 'URL')}
                          className="btn-icon"
                          title="Copiar URL"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => copyText(iframeCode, 'Iframe')}
                          className="btn-icon"
                          title="Copiar iframe"
                        >
                          <Code size={14} />
                        </button>
                        <Link href={`/admin/pdfs/${pdf.id}/edit`} className="btn-icon" title="Editar / Substituir">
                          <Edit3 size={14} />
                        </Link>
                        <Link href={`/view/${pdf.public_id}`} target="_blank" className="btn-icon" title="Visualizar">
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
