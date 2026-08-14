'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import {
  Search,
  FileText,
  Eye,
  Download,
  Share2,
  ExternalLink,
  Code,
  Tag,
  Building2,
  Filter,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  FileCheck,
  Lock,
  AlertCircle
} from 'lucide-react';
import { WdcomLogo } from '@/components/WdcomLogo';
import { useToast } from '@/components/Toast';

const DynamicBackground = dynamicImport(
  () => import('@/components/DynamicBackground').then((mod) => mod.InteractiveBackground),
  { ssr: false }
);

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const siteQuery = searchParams.get('site') || searchParams.get('s') || '';

  const [pdfs, setPdfs] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  // Embed Modal State
  const [embedModalPdf, setEmbedModalPdf] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const fetchPdfs = () => {
    if (!siteQuery) {
      setLoading(false);
      setErrorMessage('Para acessar a galeria de documentos, informe o site/cliente desejado na URL.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams();
    params.set('site', siteQuery);
    if (search) params.set('search', search);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedCategory) params.set('category', selectedCategory);

    fetch(`/api/gallery?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPdfs(data.pdfs || []);
          setAvailableTags(data.availableTags || []);
          setSiteInfo(data.site || null);
        } else {
          setErrorMessage(data.error || 'Galeria não encontrada para o site solicitado.');
        }
        setLoading(false);
      })
      .catch(() => {
        setErrorMessage('Erro de conexão ao carregar galeria.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPdfs();
  }, [siteQuery, selectedTag, selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (siteQuery) fetchPdfs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const updateFilters = (newTag?: string, newCat?: string) => {
    const nextTag = newTag !== undefined ? newTag : selectedTag;
    const nextCat = newCat !== undefined ? newCat : selectedCategory;

    setSelectedTag(nextTag);
    setSelectedCategory(nextCat);

    const params = new URLSearchParams();
    if (siteQuery) params.set('site', siteQuery);
    if (search) params.set('search', search);
    if (nextTag) params.set('tag', nextTag);
    if (nextCat) params.set('category', nextCat);

    router.replace(`/galeria?${params.toString()}`);
  };

  const getFullPublicUrl = (publicId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/view/${publicId}`;
    }
    return `https://wdcom-pdfviewer.vercel.app/view/${publicId}`;
  };

  const getIframeCode = (publicId: string) => {
    const url = getFullPublicUrl(publicId);
    return `<iframe src="${url}" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`;
  };

  const handleCopyLink = (publicId: string) => {
    const url = getFullPublicUrl(publicId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Link do visualizador copiado!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = (publicId: string) => {
    const code = getIframeCode(publicId);
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    showToast('Código de iFrame copiado com sucesso!', 'success');
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div style={{ backgroundColor: '#080c14', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <DynamicBackground />

      {/* Glass Header */}
      <header
        className="glass-header"
        style={{
          minHeight: '76px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <WdcomLogo height={44} />
            </Link>
            {siteInfo && (
              <>
                <span style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8' }}>
                  <Building2 size={16} /> {siteInfo.name}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" className="btn-secondary" style={{ fontSize: '0.84rem', padding: '8px 14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              Início
            </Link>
            <Link href="/login" className="btn-primary" style={{ fontSize: '0.84rem', padding: '8px 16px', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}>
              Painel Admin <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '40px 20px 80px 20px', position: 'relative', zIndex: 10 }}>
        
        {/* State: No Site or Error */}
        {errorMessage ? (
          <div className="glass-panel" style={{ maxWidth: '520px', margin: '60px auto', padding: '40px 24px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.85)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', color: '#f87171' }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '10px', color: '#ffffff' }}>Galeria Individual Protegida</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {errorMessage}
            </p>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 24px' }}>
              Entrar no Painel para Gerenciar Sites
            </Link>
          </div>
        ) : (
          <>
            {/* Banner Title */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div
                className="badge"
                style={{
                  background: 'rgba(0, 163, 224, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(0, 163, 224, 0.3)',
                  padding: '6px 16px',
                  marginBottom: '16px',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '24px',
                }}
              >
                <Sparkles size={14} color="#00a3e0" /> Acervo Exclusivo de Documentos
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                Galeria de Documentos — <span style={{ color: '#00a3e0' }}>{siteInfo?.name || 'Cliente'}</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto' }}>
                {siteInfo?.description || 'Explore, visualize e incorpore os arquivos e relatórios desta empresa com total segurança.'}
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass-panel" style={{ padding: '18px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                
                {/* Search Input */}
                <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome do documento ou assunto..."
                    className="form-input"
                    style={{ paddingLeft: '38px', height: '44px', fontSize: '0.9rem' }}
                  />
                  <Search size={17} color="#64748b" style={{ position: 'absolute', left: 12, top: 13 }} />
                </div>

                {/* Filter by Tag (only tags of this site) */}
                {availableTags.length > 0 && (
                  <div style={{ flex: 1, minWidth: '170px', position: 'relative' }}>
                    <select
                      value={selectedTag}
                      onChange={(e) => updateFilters(e.target.value, undefined)}
                      className="form-select"
                      style={{ height: '44px', paddingLeft: '34px', fontSize: '0.88rem' }}
                    >
                      <option value="">Todas as Tags deste Site</option>
                      {availableTags.map((t) => (
                        <option key={t.id} value={t.slug || t.name}>
                          #{t.name}
                        </option>
                      ))}
                    </select>
                    <Tag size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: 14 }} />
                  </div>
                )}
              </div>

              {/* Active Filter Badges */}
              {(selectedTag || search) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Filtros ativos:</span>
                  {selectedTag && (
                    <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                      Tag: #{selectedTag}
                      <button onClick={() => updateFilters('', undefined)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer' }}>×</button>
                    </span>
                  )}
                  {search && (
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      Busca: "{search}"
                      <button onClick={() => setSearch('')} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>×</button>
                    </span>
                  )}
                  <button
                    onClick={() => { setSearch(''); updateFilters('', ''); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto' }}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>

            {/* PDF Gallery Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(0, 163, 224, 0.2)', borderTopColor: '#00a3e0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
                Carregando documentos deste site...
              </div>
            ) : pdfs.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '520px', margin: '0 auto' }}>
                <FileText size={44} color="#64748b" style={{ margin: '0 auto 14px auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Nenhum documento encontrado</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Não encontramos PDFs vinculados a este site com os filtros selecionados.
                </p>
                <button onClick={() => { setSearch(''); updateFilters('', ''); }} className="btn-secondary">
                  Limpar Filtros de Busca
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {pdfs.map((pdf) => {
                  const publicUrl = `/view/${pdf.public_id}`;
                  return (
                    <div
                      key={pdf.id}
                      className="glass-panel"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: 'rgba(15, 23, 42, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Card Top Banner */}
                      <div
                        style={{
                          height: '120px',
                          background: 'linear-gradient(135deg, rgba(0, 163, 224, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(0, 163, 224, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                          <FileText size={26} />
                        </div>

                        {pdf.page_count && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 10,
                              right: 12,
                              background: 'rgba(0, 0, 0, 0.6)',
                              backdropFilter: 'blur(6px)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                            }}
                          >
                            {pdf.page_count} {pdf.page_count === 1 ? 'página' : 'páginas'}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: '8px',
                            lineHeight: 1.35,
                          }}
                        >
                          {pdf.title}
                        </h3>

                        {pdf.description && (
                          <p
                            style={{
                              fontSize: '0.86rem',
                              color: '#94a3b8',
                              lineHeight: 1.5,
                              marginBottom: '14px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {pdf.description}
                          </p>
                        )}

                        {/* Tags List */}
                        {pdf.tags && pdf.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            {pdf.tags.map((t: any) => (
                              <button
                                key={t.id || t.slug}
                                onClick={() => updateFilters(t.slug || t.name, undefined)}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.06)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  color: '#cbd5e1',
                                  cursor: 'pointer',
                                }}
                              >
                                #{t.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Metadata Footer */}
                        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {formatDate(pdf.created_at)}
                          </span>
                          <span>{formatBytes(pdf.file_size)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', marginTop: '14px' }}>
                          <Link
                            href={publicUrl}
                            target="_blank"
                            className="btn-primary"
                            style={{
                              padding: '9px 12px',
                              fontSize: '0.86rem',
                              background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)',
                            }}
                          >
                            <Eye size={15} /> Visualizar
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(pdf.public_id)}
                            title="Copiar Link Público"
                            className="btn-secondary"
                            style={{ padding: '9px 10px', background: 'rgba(255, 255, 255, 0.06)' }}
                          >
                            <Share2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEmbedModalPdf(pdf)}
                            title="Obter Código de Incorporação / iFrame"
                            className="btn-secondary"
                            style={{ padding: '9px 10px', background: 'rgba(255, 255, 255, 0.06)' }}
                          >
                            <Code size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Embed Modal */}
      {embedModalPdf && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '32px', background: '#0e172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={20} color="#00a3e0" /> Código de Incorporação
              </h3>
              <button
                onClick={() => setEmbedModalPdf(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Use a URL pública direta ou cole o código iFrame em qualquer página do seu site:
            </p>

            {/* Direct URL */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">URL Pública do Visualizador</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={getFullPublicUrl(embedModalPdf.public_id)}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(embedModalPdf.public_id)}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {copiedLink ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* iFrame Code */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Código HTML iFrame</label>
              <textarea
                readOnly
                rows={3}
                value={getIframeCode(embedModalPdf.public_id)}
                className="form-textarea"
                style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setEmbedModalPdf(null)} className="btn-secondary">
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handleCopyEmbed(embedModalPdf.public_id)}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
              >
                {copiedEmbed ? 'Copiado!' : 'Copiar Código do iFrame'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 20px',
          textAlign: 'center',
          fontSize: '0.86rem',
          color: '#64748b',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: 'rgba(5, 8, 16, 0.95)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          <WdcomLogo height={40} />
        </a>
        <div>
          Galeria Individual de Documentos desenvolvida por <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ color: '#00a3e0', fontWeight: 600, textDecoration: 'none' }}>WDCOM Mídia Digital</a> © 2026
        </div>
      </footer>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div style={{ color: '#ffffff', textAlign: 'center', padding: '80px' }}>Carregando galeria do site...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
