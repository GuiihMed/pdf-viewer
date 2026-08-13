'use client';
import React from 'react';
import Link from 'next/link';
import { Eye, Edit3, Copy, Code, Trash2, Globe, Tag, Calendar, FileText, Download, Lock } from 'lucide-react';
import { useToast } from './Toast';

export interface PdfItem {
  id: string;
  public_id: string;
  title: string;
  description: string;
  original_filename: string;
  file_size: number;
  page_count: number;
  site_id: string;
  site_name?: string;
  site_domain?: string;
  status: 'active' | 'inactive';
  views_count: number;
  created_at: string;
  allow_download: boolean;
  allow_print: boolean;
  restrict_domains: boolean;
  tags: { id: string; name: string; slug: string }[];
  allowedDomains?: string[];
}

interface PdfCardProps {
  pdf: PdfItem;
  onDelete?: (id: string) => void;
}

export const PdfCard: React.FC<PdfCardProps> = ({ pdf, onDelete }) => {
  const { showToast } = useToast();

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/view/${pdf.public_id}`
    : `/view/${pdf.public_id}`;

  const iframeCode = `<iframe src="${publicUrl}" width="100%" height="800" frameborder="0" allowfullscreen></iframe>`;

  const copyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(publicUrl);
    showToast('URL pública copiada para a área de transferência!', 'success');
  };

  const copyIframe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(iframeCode);
    showToast('Código iframe copiado com sucesso!', 'success');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner / Visual Thumbnail Cover */}
      <div
        style={{
          height: '130px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`badge ${pdf.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
            {pdf.status === 'active' ? 'Ativo' : 'Inativo'}
          </span>

          {pdf.restrict_domains && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Lock size={10} style={{ marginRight: 3 }} /> Domínio Restrito
            </span>
          )}
        </div>

        {/* Thumbnail Visual Center Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={24} color="#a5b4fc" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>ID: <code style={{ color: '#a5b4fc' }}>{pdf.public_id}</code></div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
              {pdf.page_count} {pdf.page_count === 1 ? 'página' : 'páginas'} • {formatFileSize(pdf.file_size)}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <Link href={`/admin/pdfs/${pdf.id}`} style={{ textDecoration: 'none' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                color: '#f9fafb',
                marginBottom: '4px',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {pdf.title}
            </h3>
          </Link>

          {pdf.description && (
            <p
              style={{
                fontSize: '0.82rem',
                color: '#9ca3af',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {pdf.description}
            </p>
          )}
        </div>

        {/* Site & Tags badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
          {pdf.site_name && (
            <span className="badge badge-site">
              <Globe size={11} /> {pdf.site_name}
            </span>
          )}

          {pdf.tags?.map((t) => (
            <span key={t.id} className="badge badge-tag">
              <Tag size={11} /> {t.name}
            </span>
          ))}
        </div>

        {/* Views & Date info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#6b7280',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} color="#818cf8" />
            <strong style={{ color: '#e0e7ff' }}>{pdf.views_count || 0}</strong> visualizações
          </div>
          <div>{new Date(pdf.created_at).toLocaleDateString('pt-BR')}</div>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
          <button onClick={copyUrl} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '7px 8px' }}>
            <Copy size={13} /> Copiar URL
          </button>
          <button onClick={copyIframe} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '7px 8px' }}>
            <Code size={13} /> Copiar iframe
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
          <Link
            href={`/view/${pdf.public_id}`}
            target="_blank"
            className="btn-primary"
            style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px' }}
          >
            <Eye size={14} /> Visualizar
          </Link>

          <Link href={`/admin/pdfs/${pdf.id}/edit`} className="btn-icon" title="Editar METADADOS e substituir PDF">
            <Edit3 size={15} />
          </Link>

          {onDelete && (
            <button onClick={() => onDelete(pdf.id)} className="btn-icon" title="Excluir PDF" style={{ color: '#f87171' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
