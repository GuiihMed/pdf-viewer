'use client';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, Calendar, UserCheck, Trash2, Pencil, Building2, X } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { RequireRole } from '@/components/RequireRole';

function UsersManagementContent() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [siteId, setSiteId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadSites = () => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => {
        setSites(data.sites || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadUsers();
    loadSites();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setSiteId('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setSiteId(user.site_id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            name,
            role,
            siteId: role === 'client' ? siteId : null,
          }),
        });

        if (res.ok) {
          showToast('Usuário atualizado com sucesso!', 'success');
          setIsModalOpen(false);
          loadUsers();
        } else {
          const data = await res.json();
          showToast(data.error || 'Erro ao atualizar usuário.', 'error');
        }
      } else {
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            siteId: role === 'client' ? siteId : null,
          }),
        });

        if (res.ok) {
          showToast('Usuário cadastrado com sucesso!', 'success');
          setIsModalOpen(false);
          setName('');
          setEmail('');
          setPassword('');
          loadUsers();
        } else {
          const data = await res.json();
          showToast(data.error || 'Erro ao cadastrar usuário.', 'error');
        }
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;

    try {
      const res = await fetch(`/api/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Usuário excluído com sucesso.', 'success');
        loadUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao excluir usuário.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return {
        label: 'Super Admin',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      };
    }
    if (role === 'admin') {
      return {
        label: 'Admin',
        bg: 'rgba(99, 102, 241, 0.15)',
        color: '#a5b4fc',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      };
    }
    return {
      label: 'Cliente',
      bg: 'rgba(0, 163, 224, 0.15)',
      color: '#38bdf8',
      border: '1px solid rgba(0, 163, 224, 0.3)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Gerenciar Usuários</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Cadastre Super Admins, Admins ou Clientes com acesso restrito por site.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={18} /> Cadastrar Usuário
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center' }}>Carregando usuários...</div>
      ) : (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Nome / Usuário</th>
                <th style={{ padding: '12px 14px' }}>E-mail</th>
                <th style={{ padding: '12px 14px' }}>Papel</th>
                <th style={{ padding: '12px 14px' }}>Site Associado</th>
                <th style={{ padding: '12px 14px' }}>Data de Cadastro</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const badge = getRoleBadge(u.role);
                const isSuperAdmin = u.role === 'superadmin';
                const isMainSuperAdmin = u.email === 'atendimento@wdcom.com.br';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: isSuperAdmin
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : u.role === 'client'
                              ? 'linear-gradient(135deg, #00a3e0, #0077b6)'
                              : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#fff',
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#9ca3af' }}>{u.email}</td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge" style={{ background: badge.bg, color: badge.color, border: badge.border }}>
                        <Shield size={11} style={{ marginRight: 3 }} /> {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px', color: '#9ca3af' }}>
                      {u.site_name ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="#38bdf8" />
                          {u.site_name}
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                          {isSuperAdmin ? 'Todos os sites' : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px', color: '#6b7280' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      {!isMainSuperAdmin && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(u)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'rgba(99, 102, 241, 0.12)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: '#a5b4fc',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                            }}
                          >
                            <Pencil size={13} /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                            }}
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>
                {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do Usuário"
                  className="form-input"
                />
              </div>

              {!editingUser && (
                <>
                  <div className="form-group">
                    <label className="form-label">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Senha *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Nível de Permissão</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                  <option value="client">Cliente (Apenas o site associado)</option>
                  <option value="admin">Admin (Gestão de PDFs)</option>
                  <option value="superadmin">Super Admin (Gestão Total)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  {role === 'client' && 'O cliente só verá os PDFs do site associado a ele.'}
                  {role === 'admin' && 'O admin pode gerenciar PDFs, mas sem acesso a Sites e Usuários.'}
                  {role === 'superadmin' && 'O super admin tem acesso total a todas as funcionalidades.'}
                </span>
              </div>

              {(role === 'client' || role === 'admin') && (
                <div className="form-group">
                  <label className="form-label">Site Associado {role === 'client' ? '*' : '(Opcional)'}</label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="form-select"
                    required={role === 'client'}
                  >
                    <option value="">— Selecione um site —</option>
                    {sites.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.domain})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                    Este usuário só poderá ver e gerenciar os PDFs do site selecionado.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : editingUser ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersManagementPage() {
  return (
    <RequireRole requiredRole="superadmin">
      <UsersManagementContent />
    </RequireRole>
  );
}

