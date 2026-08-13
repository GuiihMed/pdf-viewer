'use client';
import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Edit3, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function TagsManagementPage() {
  const { showToast } = useToast();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTags = () => {
    setLoading(true);
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => {
        setTags(data.tags || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/tags/${editingId}` : '/api/tags';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        showToast(editingId ? 'Tag atualizada!' : 'Tag criada com sucesso!', 'success');
        setIsModalOpen(false);
        loadTags();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao salvar tag.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão ao salvar tag.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Tag excluída.', 'success');
        loadTags();
      }
    } catch (e) {
      showToast('Erro ao excluir tag.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Gerenciamento de Tags</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Crie e gerencie tags para categorizar seus PDFs.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={18} /> Criar Nova Tag
        </button>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center' }}>Carregando tags...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {tags.map((tag) => (
            <div key={tag.id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-tag" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  <TagIcon size={13} /> {tag.name}
                </span>

                <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                  {tag.pdfs_count || 0} PDFs
                </div>
              </div>

              {tag.description && (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4 }}>{tag.description}</p>
              )}

              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                Slug: {tag.slug}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button onClick={() => handleOpenEdit(tag)} className="btn-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '6px' }}>
                  <Edit3 size={13} /> Editar
                </button>
                <button onClick={() => handleDelete(tag.id)} className="btn-danger" style={{ padding: '6px 10px' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Tag Modal */}
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#ffffff' }}>
              {editingId ? 'Editar Tag' : 'Criar Nova Tag'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome da Tag *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: catalogo-2026"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição (Opcional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : 'Salvar Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
