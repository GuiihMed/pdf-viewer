'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft, CheckCircle2, FileText, Lock, Globe, Tag as TagIcon, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function NewPdfPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [sites, setSites] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Source Type Mode: 'file' | 'url'
  const [sourceType, setSourceType] = useState<'file' | 'url'>('file');

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Catálogo');
  const [siteId, setSiteId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState('active');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowPrint, setAllowPrint] = useState(true);
  const [restrictDomains, setRestrictDomains] = useState(false);
  const [allowedDomainsRaw, setAllowedDomainsRaw] = useState('');

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []));
    fetch('/api/tags').then((r) => r.json()).then((d) => setTags(d.tags || []));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Por favor, selecione um arquivo válido com extensão .pdf');
        return;
      }
      setError(null);
      setFile(selected);
      if (!title) {
        // Auto populate title from filename
        const cleanName = selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUrlBlur = () => {
    if (pdfUrl && !title) {
      try {
        const urlObj = new URL(pdfUrl.startsWith('http') ? pdfUrl : `https://${pdfUrl}`);
        const parts = urlObj.pathname.split('/');
        const filename = parts[parts.length - 1];
        if (filename) {
          const cleanName = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
          if (cleanName) {
            setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
          }
        }
      } catch (e) {}
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === 'file' && !file) {
      setError('Por favor, faça o upload de um arquivo PDF.');
      return;
    }
    if (sourceType === 'url' && !pdfUrl.trim()) {
      setError('Por favor, insira o link/URL do arquivo PDF.');
      return;
    }
    if (!title) {
      setError('O título do PDF é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (sourceType === 'file' && file) {
      formData.append('file', file);
    } else {
      formData.append('pdfUrl', pdfUrl.trim());
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('siteId', siteId);
    formData.append('status', status);
    formData.append('allowDownload', String(allowDownload));
    formData.append('allowPrint', String(allowPrint));
    formData.append('restrictDomains', String(restrictDomains));
    formData.append('tagIds', JSON.stringify(selectedTagIds));
    formData.append('allowedDomains', allowedDomainsRaw);

    try {
      const res = await fetch('/api/pdfs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar PDF.');
        setLoading(false);
        return;
      }

      showToast('PDF cadastrado com sucesso!', 'success');
      router.push('/admin/pdfs');
    } catch (err) {
      setError('Erro de conexão ao enviar o arquivo.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/admin/pdfs" className="btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Cadastrar Novo PDF</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Faça upload do documento ou insira um link direto para o PDF.
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

      {/* Selector Tabs: Upload File vs URL Link */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          background: 'rgba(17, 24, 39, 0.6)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => { setSourceType('file'); setError(null); }}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: sourceType === 'file' ? 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' : 'transparent',
            color: sourceType === 'file' ? '#ffffff' : '#9ca3af',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={18} /> Upload de Arquivo PDF
        </button>

        <button
          type="button"
          onClick={() => { setSourceType('url'); setError(null); }}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: sourceType === 'url' ? 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' : 'transparent',
            color: sourceType === 'url' ? '#ffffff' : '#9ca3af',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <LinkIcon size={18} /> Inserir Link / URL do PDF
        </button>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sourceType === 'file' ? (
          /* Upload Drop Zone */
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '2px dashed rgba(0, 163, 224, 0.4)' }}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              id="pdf-file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="pdf-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(0, 163, 224, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Upload size={30} />
              </div>

              {file ? (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} /> {file.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 4 }}>
                    Tamanho: {(file.size / (1024 * 1024)).toFixed(2)} MB • Clique para alterar o arquivo
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6' }}>
                    Clique para selecionar ou arraste um arquivo .PDF aqui
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 4 }}>
                    Suporta apenas arquivos de formato PDF
                  </div>
                </div>
              )}
            </label>
          </div>
        ) : (
          /* URL Input Zone */
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00a3e0' }}>
              <LinkIcon size={22} />
              <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', margin: 0 }}>Inserir URL Externa do PDF</h3>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', margin: 0 }}>
              Insira o link completo do arquivo PDF na web. O sistema fará o download e preparará o iframe exclusivo.
            </p>
            <div className="form-group" style={{ marginTop: '6px' }}>
              <input
                type="url"
                required={sourceType === 'url'}
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://exemplo.com/documentos/catalogo-2026.pdf"
                className="form-input"
                style={{ fontSize: '0.95rem', padding: '12px 16px' }}
              />
            </div>
          </div>
        )}

        {/* PDF Metadata Fields */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', marginBottom: '8px' }}>Informações do Documento</h3>

          <div className="form-group">
            <label className="form-label">Título do PDF *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Catálogo de Produtos 2026"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo das informações contidas neste PDF..."
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
              <label className="form-label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                <option value="active">Ativo (Permitir Acesso)</option>
                <option value="inactive">Inativo (Bloquear Acesso)</option>
              </select>
            </div>
          </div>

          {/* Tags Selection Badges */}
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

        {/* Security & Access Controls */}
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
                  placeholder="meusite.com&#10;www.meusite.com&#10;empresa.com.br"
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ padding: '14px', fontSize: '1rem', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
        >
          {loading ? 'Processando e Cadastrando PDF...' : 'Salvar e Gerar Código Iframe'}
        </button>
      </form>
    </div>
  );
}
