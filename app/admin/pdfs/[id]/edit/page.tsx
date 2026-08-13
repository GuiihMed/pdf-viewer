'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw, Upload, CheckCircle2, AlertCircle, FileText, Tag as TagIcon, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function EditPdfPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const pdfId = params.id as string;

  const [pdf, setPdf] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [siteId, setSiteId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState('active');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowPrint, setAllowPrint] = useState(true);
  const [restrictDomains, setRestrictDomains] = useState(false);
  const [allowedDomainsRaw, setAllowedDomainsRaw] = useState('');

  // Replacement File State
  const [replaceMode, setReplaceMode] = useState<'file' | 'url'>('file');
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementUrl, setReplacementUrl] = useState('');
  const [replacing, setReplacing] = useState(false);

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []));
    fetch('/api/tags').then((r) => r.json()).then((d) => setTags(d.tags || []));

    fetch(`/api/pdfs/${pdfId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pdf) {
          const p = data.pdf;
          setPdf(p);
          setTitle(p.title || '');
          setDescription(p.description || '');
          setCategory(p.category || '');
          setSiteId(p.site_id || '');
          setStatus(p.status || 'active');
          setAllowDownload(Boolean(p.allow_download));
          setAllowPrint(Boolean(p.allow_print));
          setRestrictDomains(Boolean(p.restrict_domains));
          setSelectedTagIds(p.tags ? p.tags.map((t: any) => t.id) : []);
          setAllowedDomainsRaw(p.allowedDomains ? p.allowedDomains.join('\n') : '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pdfId]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const allowedDomainsList = allowedDomainsRaw
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    try {
      const res = await fetch(`/api/pdfs/${pdfId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          siteId,
          status,
          allowDownload,
          allowPrint,
          restrictDomains,
          tagIds: selectedTagIds,
          allowedDomains: allowedDomainsList,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao atualizar dados do PDF.');
        setSaving(false);
        return;
      }

      showToast('Informações do PDF atualizadas com sucesso!', 'success');
      setSaving(false);
      router.push(`/admin/pdfs/${pdfId}`);
    } catch (err) {
      setError('Erro de conexão ao salvar alterações.');
      setSaving(false);
    }
  };

  const handleReplaceFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replaceMode === 'file' && !replacementFile) {
      setError('Por favor, escolha um novo arquivo PDF para substituir.');
      return;
    }
    if (replaceMode === 'url' && !replacementUrl.trim()) {
      setError('Por favor, insira o link/URL do novo PDF para substituir.');
      return;
    }

    setReplacing(true);
    setError(null);

    const formData = new FormData();
    if (replaceMode === 'file' && replacementFile) {
      formData.append('file', replacementFile);
    } else {
      formData.append('pdfUrl', replacementUrl.trim());
    }

    try {
      const res = await fetch(`/api/pdfs/${pdfId}/replace`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao substituir arquivo PDF.');
        setReplacing(false);
        return;
      }

      showToast('Arquivo PDF substituído mantendo a mesma URL pública e iframe!', 'success');
      setReplacing(false);
      setReplacementFile(null);
      setReplacementUrl('');
      router.push(`/admin/pdfs/${pdfId}`);
    } catch (err) {
      setError('Erro de conexão ao substituir o arquivo.');
      setReplacing(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: '48px', textAlign: 'center' }}>Carregando dados do PDF...</div>;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href={`/admin/pdfs/${pdfId}`} className="btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Editar PDF & Substituir Arquivo</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            ID Público: <code style={{ color: '#00a3e0' }}>{pdf?.public_id}</code>
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Replacement File Box */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(0, 163, 224, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(0, 163, 224, 0.3)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="#00a3e0" /> Substituição Transparente do Arquivo PDF
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px' }}>
          Ao substituir o arquivo, a URL pública (<code style={{ color: '#38bdf8' }}>/view/{pdf?.public_id}</code>) e o código iframe já instalados nos sites dos clientes continuarão funcionando normalmente sem necessidade de re-instalação!
        </p>

        {/* Option Tabs for Replacement: File vs URL */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => setReplaceMode('file')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: replaceMode === 'file' ? '#00a3e0' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={14} /> Novo Arquivo PDF
          </button>
          <button
            type="button"
            onClick={() => setReplaceMode('url')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: replaceMode === 'url' ? '#00a3e0' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LinkIcon size={14} /> Nova URL do PDF
          </button>
        </div>

        <form onSubmit={handleReplaceFile} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {replaceMode === 'file' ? (
            <>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => e.target.files && setReplacementFile(e.target.files[0])}
                id="replacement-file-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="replacement-file-input" className="btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={16} /> {replacementFile ? replacementFile.name : 'Selecionar Novo Arquivo .PDF'}
              </label>
            </>
          ) : (
            <input
              type="url"
              value={replacementUrl}
              onChange={(e) => setReplacementUrl(e.target.value)}
              placeholder="https://exemplo.com/novo-documento.pdf"
              className="form-input"
              style={{ flex: 1, minWidth: '280px', padding: '10px 14px', fontSize: '0.9rem' }}
            />
          )}

          <button
            type="submit"
            disabled={replacing}
            className="btn-primary"
            style={{ background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
          >
            {replacing ? 'Substituindo...' : 'Confirmar Substituição do PDF'}
          </button>
        </form>
      </div>

      {/* Metadata Update Form */}
      <form onSubmit={handleUpdateMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '8px' }}>Informações do Documento</h3>

          <div className="form-group">
            <label className="form-label">Título do PDF *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Site / Projeto Pertencente</label>
              <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="form-select">
                <option value="">Selecione o site (Opcional)</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status do PDF</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                <option value="active">Ativo (PDF visível no iframe)</option>
                <option value="inactive">Inativo (Exibir tela de indisponível)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags de Categorização</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className="badge"
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(0, 163, 224, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#ffffff' : '#9ca3af',
                      border: isSelected ? '1px solid #00a3e0' : '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '6px 12px',
                    }}
                  >
                    <TagIcon size={12} /> {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Rules */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '8px' }}>Permissões & Segurança do Embed</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#00a3e0' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Permitir Botão de Download</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={allowPrint}
                onChange={(e) => setAllowPrint(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#00a3e0' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Permitir Impressão</span>
            </label>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={restrictDomains}
                onChange={(e) => setRestrictDomains(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                Restringir Incorporação aos Domínios Autorizados
              </span>
            </label>

            {restrictDomains && (
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Domínios Permitidos (um por linha)</label>
                <textarea
                  rows={3}
                  value={allowedDomainsRaw}
                  onChange={(e) => setAllowedDomainsRaw(e.target.value)}
                  placeholder="meusite.com&#10;www.meusite.com"
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ padding: '14px', fontSize: '1rem', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
        >
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
