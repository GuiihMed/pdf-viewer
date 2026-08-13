'use client';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, Calendar, UserCheck } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function UsersManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
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

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        showToast('Novo administrador cadastrado!', 'success');
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        loadUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao cadastrar usuário.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Usuários Administradores</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Gerencie o acesso de administradores ao painel.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Cadastrar Administrador
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
                <th style={{ padding: '12px 14px' }}>Papel / Função</th>
                <th style={{ padding: '12px 14px' }}>Data de Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </td>
                  <td style={{ padding: '14px', color: '#9ca3af' }}>{u.email}</td>
                  <td style={{ padding: '14px' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                      <Shield size={11} style={{ marginRight: 3 }} /> {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#6b7280' }}>
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#ffffff' }}>Cadastrar Novo Administrador</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do Administrador"
                  className="form-input"
                />
              </div>

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

              <div className="form-group">
                <label className="form-label">Nível de Permissão</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                  <option value="admin">Admin (Gestão de PDFs)</option>
                  <option value="superadmin">Super Admin (Gestão Total)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
