'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Globe,
  Tag,
  Copy,
  Code,
  Eye,
  Edit3,
  Trash2,
  X,
  RotateCcw
} from 'lucide-react';
import { PdfCard, PdfItem } from '@/components/PdfCard';
import { useToast } from '@/components/Toast';

export default function PdfGalleryPage() {
  const { showToast } = useToast();
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [tagId, setTagId] = useState('');
  const [status, setStatus] = useState('');

  const loadPdfs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (siteId) params.append('siteId', siteId);
    if (tagId) params.append('tagId', tagId);
    if (status) params.append('status', status);

    fetch(`/api/pdfs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setPdfs(data.pdfs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Load metadata filters options
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []));
    fetch('/api/tags').then((r) => r.json()).then((d) => setTags(d.tags || []));
    loadPdfs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPdfs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, siteId, tagId, status]);

  const resetFilters = () => {
    setSearch('');
    setSiteId('');
    setTagId('');
    setStatus('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este PDF? Esta ação removerá o arquivo do storage e desativará a URL pública.')) {
      return;
    }

    try {
      const res = await fetch(`/api/pdfs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('PDF excluído com sucesso.', 'success');
        setPdfs((prev) => prev.filter((p) => p.id !== id));
      } else {
        showToast('Erro ao excluir PDF.', 'error');
      }
    } catch (e) {
      showToast('Erro ao excluir PDF.', 'error');
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Galeria de PDFs</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Gerencie, visualize e obtenha os códigos de incorporação de todos os seus documentos.
          </p>
        </div>

        <Link href="/admin/pdfs/new" className="btn-primary">
          <Plus size={18} /> Cadastrar PDF
        </Link>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Text Search Input */}
          <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por título, descrição, tag, site ou ID..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Site */}
          <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="form-select" style={{ flex: 1, minWidth: '160px' }}>
            <option value="">Todos os Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.domain})
              </option>
            ))}
          </select>

          {/* Filter Tag */}
          <select value={tagId} onChange={(e) => setTagId(e.target.value)} className="form-select" style={{ flex: 1, minWidth: '140px' }}>
            <option value="">Todas as Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select" style={{ flex: 1, minWidth: '130px' }}>
            <option value="">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="btn-icon"
              style={{ background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.3)' : 'transparent' }}
              title="Visualização em Cards"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className="btn-icon"
              style={{ background: viewMode === 'table' ? 'rgba(99, 102, 241, 0.3)' : 'transparent' }}
              title="Visualização em Tabela"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {(search || siteId || tagId || status) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#9ca3af' }}>
            <span>Filtros ativos.</span>
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={13} /> Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Gallery Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>Carregando galeria de PDFs...</div>
      ) : pdfs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
          <FileText size={48} color="#6b7280" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f3f4f6' }}>Nenhum PDF encontrado</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Tente ajustar seus filtros ou cadastre um novo documento PDF.</p>
          <Link href="/admin/pdfs/new" className="btn-primary">
            <Plus size={16} /> Cadastrar PDF
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {pdfs.map((pdf) => (
            <PdfCard key={pdf.id} pdf={pdf} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Título / Documento</th>
                <th style={{ padding: '12px 14px' }}>Site</th>
                <th style={{ padding: '12px 14px' }}>Tags</th>
                <th style={{ padding: '12px 14px' }}>Páginas</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Views</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pdfs.map((pdf) => {
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
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {pdf.public_id} • {pdf.original_filename}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {pdf.site_name ? <span className="badge badge-site">{pdf.site_name}</span> : '-'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {pdf.tags?.map((t) => (
                          <span key={t.id} className="badge badge-tag">{t.name}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#9ca3af' }}>{pdf.page_count} pag.</td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${pdf.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {pdf.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600, color: '#818cf8' }}>
                      {pdf.views_count}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => copyText(publicUrl, 'URL')} className="btn-icon" title="Copiar URL">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => copyText(iframeCode, 'Iframe')} className="btn-icon" title="Copiar iframe">
                          <Code size={14} />
                        </button>
                        <Link href={`/admin/pdfs/${pdf.id}/edit`} className="btn-icon" title="Editar">
                          <Edit3 size={14} />
                        </Link>
                        <Link href={`/view/${pdf.public_id}`} target="_blank" className="btn-icon" title="Visualizar">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleDelete(pdf.id)} className="btn-icon" title="Excluir" style={{ color: '#f87171' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
