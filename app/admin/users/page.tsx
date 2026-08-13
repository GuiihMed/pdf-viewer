'use client';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, CheckCircle2, XCircle, Clock, Building2, Pencil, Trash2, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { RequireRole } from '@/components/RequireRole';

function UsersManagementContent() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // Approval Modal state
  const [approveModalUser, setApproveModalUser] = useState<any>(null);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [approving, setApproving] = useState(false);

  // User Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [siteId, setSiteId] = useState('');
  const [status, setStatus] = useState('active');
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

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const activeUsers = users.filter((u) => u.status !== 'pending');

  const openApproveModal = (user: any) => {
    setApproveModalUser(user);
    setSelectedSiteId(user.site_id || '');
  };

  const handleConfirmApproval = async () => {
    if (!approveModalUser) return;
    setApproving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: approveModalUser.id,
          action: 'approve',
          siteId: selectedSiteId || null,
        }),
      });

      if (res.ok) {
        showToast(`Cadastro de "${approveModalUser.name}" aprovado com sucesso!`, 'success');
        setApproveModalUser(null);
        loadUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao aprovar cadastro.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (user: any) => {
    if (!confirm(`Tem certeza que deseja recusar a solicitação de "${user.name}"?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'reject',
        }),
      });

      if (res.ok) {
        showToast(`Solicitação de "${user.name}" recusada.`, 'info');
        loadUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao rejeitar usuário.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setSiteId('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setSiteId(user.site_id || '');
    setStatus(user.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: editingUser.id,
            name,
            role,
            siteId: role === 'client' ? siteId : null,
            status,
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
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            siteId: role === 'client' ? siteId : null,
            status,
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

  const getStatusBadge = (userStatus: string) => {
    if (userStatus === 'pending') {
      return {
        label: 'Aguardando Confirmação',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        icon: Clock,
      };
    }
    if (userStatus === 'rejected') {
      return {
        label: 'Recusado',
        bg: 'rgba(239, 68, 68, 0.15)',
        color: '#f87171',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        icon: XCircle,
      };
    }
    return {
      label: 'Ativo',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#34d399',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      icon: CheckCircle2,
    };
  };

  const getRoleBadge = (userRole: string) => {
    if (userRole === 'superadmin') {
      return { label: 'Super Admin', color: '#fbbf24' };
    }
    if (userRole === 'admin') {
      return { label: 'Admin', color: '#a5b4fc' };
    }
    return { label: 'Cliente', color: '#38bdf8' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Gestão de Usuários & Aprovações</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Aprove solicitações de cadastros e gerencie os acessos ao painel.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={18} /> Cadastrar Usuário
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'pending' ? '#fbbf24' : '#9ca3af',
            border: activeTab === 'pending' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={16} />
          Confirmar Logins
          {pendingUsers.length > 0 && (
            <span style={{
              background: '#f59e0b',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: '10px',
              padding: '2px 7px',
            }}>
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'all' ? 'rgba(0, 163, 224, 0.2)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'all' ? '#38bdf8' : '#9ca3af',
            border: activeTab === 'all' ? '1px solid rgba(0, 163, 224, 0.4)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={16} />
          Todos os Usuários ({users.length})
        </button>
      </div>

      {/* PENDING APPROVALS TAB */}
      {activeTab === 'pending' && (
        <>
          {pendingUsers.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
              <CheckCircle2 size={40} color="#34d399" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '4px' }}>Nenhum cadastro pendente!</h3>
              <p style={{ fontSize: '0.85rem' }}>Todas as solicitações de login foram analisadas.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#fbbf24', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} /> Solicitando Confirmação de Acesso ({pendingUsers.length})
              </h2>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Nome</th>
                    <th style={{ padding: '12px 14px' }}>E-mail</th>
                    <th style={{ padding: '12px 14px' }}>Site Solicitado</th>
                    <th style={{ padding: '12px 14px' }}>Data do Pedido</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ação do Super Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#fff',
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: '#9ca3af' }}>{u.email}</td>
                      <td style={{ padding: '14px', color: '#9ca3af' }}>
                        {u.site_name ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                            <Building2 size={14} /> {u.site_name}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Não especificado</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', color: '#6b7280' }}>
                        {new Date(u.created_at).toLocaleDateString('pt-BR')} às {new Date(u.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openApproveModal(u)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#34d399',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.82rem',
                            }}
                          >
                            <CheckCircle2 size={15} /> Confirmar & Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(u)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.82rem',
                            }}
                          >
                            <XCircle size={15} /> Recusar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ALL USERS TAB */}
      {activeTab === 'all' && (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Nome / Usuário</th>
                <th style={{ padding: '12px 14px' }}>E-mail</th>
                <th style={{ padding: '12px 14px' }}>Papel</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Site Associado</th>
                <th style={{ padding: '12px 14px' }}>Cadastro</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const sBadge = getStatusBadge(u.status);
                const rBadge = getRoleBadge(u.role);
                const isMainSuperAdmin = u.email === 'atendimento@wdcom.com.br';
                const StatusIcon = sBadge.icon;

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: u.role === 'superadmin'
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
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: rBadge.color, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Shield size={11} style={{ marginRight: 4 }} /> {rBadge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge" style={{ background: sBadge.bg, color: sBadge.color, border: sBadge.border }}>
                        <StatusIcon size={11} style={{ marginRight: 4 }} /> {sBadge.label}
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
                          {u.role === 'superadmin' ? 'Todos os sites' : '—'}
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

      {/* APPROVAL MODAL */}
      {approveModalUser && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '28px', background: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#34d399" /> Confirmar & Aprovar Login
              </h2>
              <button onClick={() => setApproveModalUser(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>{approveModalUser.name}</div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{approveModalUser.email}</div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Associar ao Site *</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">— Selecione um site para este cliente —</option>
                {sites.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.domain})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px', display: 'block' }}>
                O cliente só terá acesso aos PDFs do site que você definir acima.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setApproveModalUser(null)} className="btn-secondary">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={approving || !selectedSiteId}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                {approving ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT / CREATE MODAL */}
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
                <label className="form-label">Status da Conta</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                  <option value="active">Ativo (Permitir Login)</option>
                  <option value="pending">Pendente (Aguardando Confirmação)</option>
                  <option value="rejected">Recusado (Acesso Bloqueado)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nível de Permissão</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                  <option value="client">Cliente (Apenas o site associado)</option>
                  <option value="admin">Admin (Gestão de PDFs)</option>
                  <option value="superadmin">Super Admin (Gestão Total)</option>
                </select>
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
