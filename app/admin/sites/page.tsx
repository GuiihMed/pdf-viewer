'use client';
import React, { useState, useEffect } from 'react';
import { Globe, Plus, Edit3, Trash2, CheckCircle2, AlertCircle, FileText, Eye, ExternalLink, Share2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { RequireRole } from '@/components/RequireRole';

function SitesManagementContent() {
  const { showToast } = useToast();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [wixWebhookUrl, setWixWebhookUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  const loadSites = () => {
    setLoading(true);
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => {
        setSites(data.sites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDomain('');
    setDescription('');
    setWixWebhookUrl('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (site: any) => {
    setEditingId(site.id);
    setName(site.name);
    setDomain(site.domain);
    setDescription(site.description || '');
    setWixWebhookUrl(site.wix_webhook_url || '');
    setStatus(site.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/sites/${editingId}` : '/api/sites';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain, description, wix_webhook_url: wixWebhookUrl, status }),
      });

      if (res.ok) {
        showToast(editingId ? 'Site atualizado!' : 'Site cadastrado com sucesso!', 'success');
        setIsModalOpen(false);
        loadSites();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao salvar site.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão ao salvar site.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este site? Os PDFs associados permanecerão no sistema sem site atribuído.')) {
      return;
    }

    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Site excluído.', 'success');
        loadSites();
      }
    } catch (e) {
      showToast('Erro ao excluir site.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Sites / Projetos</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Organize seus PDFs por site/domínio de destino.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={18} /> Cadastrar Novo Site
        </button>
      </div>

      {/* Sites Grid List */}
      {loading ? (
        <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center' }}>Carregando sites...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {sites.map((site) => (
            <div key={site.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22d3ee',
                    }}
                  >
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6' }}>{site.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: '#67e8f9', fontFamily: 'monospace' }}>{site.domain}</div>
                  </div>
                </div>

                <span className={`badge ${site.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {site.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {site.description && (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.4 }}>{site.description}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={14} color="#818cf8" /> <strong style={{ color: '#ffffff' }}>{site.pdfs_count || 0}</strong> PDFs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} color="#34d399" /> <strong style={{ color: '#ffffff' }}>{site.total_views || 0}</strong> Views
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <a
                  href={`/galeria?site=${site.slug || site.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <ExternalLink size={13} /> Galeria do Site
                </a>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/galeria?site=${site.slug || site.id}`;
                    navigator.clipboard.writeText(url);
                    showToast('Link da Galeria do site copiado!', 'success');
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 10px' }}
                  title="Copiar Link da Galeria deste Site"
                >
                  <Share2 size={13} />
                </button>
                <button onClick={() => handleOpenEdit(site)} className="btn-secondary" style={{ padding: '6px 10px' }} title="Editar">
                  <Edit3 size={13} />
                </button>
                <button onClick={() => handleDelete(site.id)} className="btn-danger" style={{ padding: '6px 10px' }} title="Excluir">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Site Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#ffffff' }}>
              {editingId ? 'Editar Site' : 'Cadastrar Novo Site'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Site / Empresa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Meu Site Principal"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Domínio Principal *</label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="meusite.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL do Webhook do Wix (Para Enviar PDFs Direto ao Wix)</label>
                <input
                  type="url"
                  value={wixWebhookUrl}
                  onChange={(e) => setWixWebhookUrl(e.target.value)}
                  placeholder="https://seu-site.wixsite.com/_functions/receberPdf"
                  className="form-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                  Quando você subir um PDF para este site, o sistema enviará o arquivo e o link automaticamente para o Wix!
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : 'Salvar Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SitesManagementPage() {
  return (
    <RequireRole requiredRole="superadmin">
      <SitesManagementContent />
    </RequireRole>
  );
}
