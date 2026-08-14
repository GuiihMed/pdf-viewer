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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPdf = async () => {
      try {
        const res = await fetch(`/api/pdfs/${pdfId}`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted) {
          if (data.pdf) {
            setPdf(data.pdf);
            setLoading(false);
          } else if (retryCount < 4) {
            // Auto retry in case serverless container is warming or sync is catching up
            setTimeout(() => {
              if (isMounted) setRetryCount((prev) => prev + 1);
            }, 1000);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (retryCount < 4) {
            setTimeout(() => {
              if (isMounted) setRetryCount((prev) => prev + 1);
            }, 1000);
          } else {
            setLoading(false);
          }
        }
      }
    };

    fetchPdf();
    return () => {
      isMounted = false;
    };
  }, [pdfId, retryCount]);

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
    return (
      <div style={{ color: '#9ca3af', padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0, 163, 224, 0.2)',
          borderTopColor: '#00a3e0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '1.05rem', color: '#e5e7eb' }}>Carregando dados e gerando links do PDF...</p>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '520px', margin: '40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
          <FileText size={28} />
        </div>
        <h2 style={{ fontSize: '1.35rem', color: '#f3f4f6', margin: 0 }}>PDF em processamento ou não localizado</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
          O arquivo foi enviado para o sistema. Se acabou de cadastrar, aguarde alguns instantes ou atualize a página.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button onClick={() => { setLoading(true); setRetryCount(0); }} className="btn-secondary" style={{ padding: '10px 18px' }}>
            Tentar Novamente
          </button>
          <Link href="/admin/pdfs" className="btn-primary" style={{ padding: '10px 18px' }}>
            Ir para Meus PDFs
          </Link>
        </div>
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
