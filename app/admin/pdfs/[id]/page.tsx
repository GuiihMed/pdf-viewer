'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Eye,
  Globe,
  Tag,
  Calendar,
  FileText,
  Lock,
  Download,
  Printer,
  TrendingUp,
  Code
} from 'lucide-react';
import { EmbedConfigurator } from '@/components/EmbedConfigurator';
import { useToast } from '@/components/Toast';

export default function PdfDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const pdfId = params.id as string;

  const [pdf, setPdf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pdfs/${pdfId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pdf) setPdf(data.pdf);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pdfId]);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este PDF? Esta ação removerá o arquivo do storage e desativará a URL pública.')) {
      return;
    }

    try {
      const res = await fetch(`/api/pdfs/${pdfId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('PDF excluído com sucesso.', 'success');
        router.push('/admin/pdfs');
      } else {
        showToast('Erro ao excluir PDF.', 'error');
      }
    } catch (e) {
      showToast('Erro ao excluir PDF.', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>Carregando detalhes do PDF...</div>;
  }

  if (!pdf) {
    return (
      <div style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>
        <h2>PDF não encontrado</h2>
        <Link href="/admin/pdfs" className="btn-secondary" style={{ marginTop: '16px' }}>
          Voltar para Galeria
        </Link>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin/pdfs" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>{pdf.title}</h1>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Public ID: <code style={{ color: '#a5b4fc' }}>{pdf.public_id}</code></span>
              <span>•</span>
              <span className={`badge ${pdf.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                {pdf.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={`/admin/pdfs/${pdf.id}/edit`} className="btn-secondary">
            <Edit3 size={16} /> Editar & Substituir Arquivo
          </Link>
          <Link href={`/view/${pdf.public_id}`} target="_blank" className="btn-primary">
            <Eye size={16} /> Visualizar
          </Link>
          <button onClick={handleDelete} className="btn-danger" title="Excluir PDF">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Metadata Overview Bar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase' }}>Site Associado</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#67e8f9', marginTop: 2 }}>
            {pdf.site_name ? `${pdf.site_name} (${pdf.site_domain})` : 'Nenhum site atribuído'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase' }}>Visualizações Totais</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#34d399', marginTop: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={14} /> {pdf.views_count || 0} acessos
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase' }}>Arquivo / Páginas</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6', marginTop: 2 }}>
            {pdf.page_count} {pdf.page_count === 1 ? 'página' : 'páginas'} ({formatFileSize(pdf.file_size)})
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase' }}>Data de Cadastro</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f3f4f6', marginTop: 2 }}>
            {new Date(pdf.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Embed Configurator & Live Preview */}
      <EmbedConfigurator publicId={pdf.public_id} title={pdf.title} />
    </div>
  );
}
