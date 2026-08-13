'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { WdcomLogo } from '@/components/WdcomLogo';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar login.');
        setLoading(false);
        return;
      }

      showToast('Login realizado com sucesso! Redirecionando...', 'success');
      router.push('/admin');
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0b0f19',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          background: 'rgba(17, 24, 39, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Brand Header WDCOM */}
        <div style={{ textAlign: 'center', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <WdcomLogo size={56} showText={false} />
          <h1 style={{ fontSize: '1.6rem', marginTop: '12px', marginBottom: '4px' }}>
            WDCOM <span style={{ color: '#00a3e0' }}>PDF</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Acesso Restrito ao Painel Administrativo
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Secure Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail de Acesso</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="atendimento@wdcom.com.br"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
