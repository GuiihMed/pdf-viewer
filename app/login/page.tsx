'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, User, Building2, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { WdcomLogo } from '@/components/WdcomLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSiteId, setRegSiteId] = useState('');
  
  // Sites list for registration
  const [sites, setSites] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/sites')
      .then((res) => res.json())
      .then((data) => {
        setSites(data.sites || []);
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingNotice(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PENDING_APPROVAL') {
          setPendingNotice(true);
          setError(null);
        } else {
          setError(data.error || 'Erro ao realizar login.');
        }
        setLoading(false);
        return;
      }

      showToast('Login realizado com sucesso! Redirecionando...', 'success');
      router.push(redirectTarget);
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          siteId: regSiteId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar cadastro.');
        setLoading(false);
        return;
      }

      setRegisterSuccess(true);
      setLoading(false);
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
          maxWidth: '460px',
          padding: '36px',
          background: 'rgba(17, 24, 39, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Brand Header WDCOM Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
            <WdcomLogo height={64} />
          </a>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '8px' }}>
            {mode === 'login' ? 'Acesse o Painel de Gerenciamento de PDFs' : 'Solicite seu Acesso ao Sistema'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setPendingNotice(false); setRegisterSuccess(false); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'login' ? 'rgba(0, 163, 224, 0.25)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#9ca3af',
              fontWeight: mode === 'login' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setPendingNotice(false); setRegisterSuccess(false); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'register' ? 'rgba(0, 163, 224, 0.25)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : '#9ca3af',
              fontWeight: mode === 'register' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Criar Conta
          </button>
        </div>

        {/* Pending Approval Screen */}
        {pendingNotice && (
          <div
            style={{
              padding: '20px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} color="#fbbf24" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>
              Aguardando Confirmação
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
              Seu cadastro foi realizado com sucesso e está <strong>aguardando aprovação do Administrador</strong>.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '10px' }}>
              Assim que o Super Admin confirmar o seu acesso, você poderá efetuar login normalmente.
            </p>
            <button
              onClick={() => setPendingNotice(false)}
              className="btn-secondary"
              style={{ marginTop: '14px', width: '100%', fontSize: '0.85rem' }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Registration Success Screen */}
        {registerSuccess && (
          <div
            style={{
              padding: '24px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={28} color="#34d399" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
              Cadastro Solicitado!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e5e7eb', lineHeight: 1.5 }}>
              Sua solicitação foi enviada para o Super Admin.
            </p>
            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'left' }}>
              ⏳ <strong>Status:</strong> Aguardando confirmação de login pelo Super Admin.
            </div>
            <button
              onClick={() => { setRegisterSuccess(false); setMode('login'); }}
              className="btn-primary"
              style={{ marginTop: '16px', width: '100%', padding: '10px', fontSize: '0.9rem' }}
            >
              Ir para Login
            </button>
          </div>
        )}

        {error && !pendingNotice && (
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

        {/* LOGIN FORM */}
        {mode === 'login' && !pendingNotice && !registerSuccess && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="E-mail"
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Senha"
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
              {loading ? 'Autenticando...' : 'Entrar'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && !pendingNotice && !registerSuccess && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="form-input"
                  placeholder="Seu Nome Completo"
                  style={{ paddingLeft: '38px' }}
                />
                <User size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="form-input"
                  placeholder="E-mail corporativo"
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="form-input"
                  placeholder="Crie uma Senha"
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            {sites.length > 0 && (
              <div className="form-group" style={{ marginBottom: '22px' }}>
                <div style={{ position: 'relative' }}>
                  <select
                    value={regSiteId}
                    onChange={(e) => setRegSiteId(e.target.value)}
                    className="form-select"
                    style={{ paddingLeft: '38px' }}
                  >
                    <option value="">Selecione seu Site/Projeto (Opcional)</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.domain})
                      </option>
                    ))}
                  </select>
                  <Building2 size={16} color="#6b7280" style={{ position: 'absolute', left: 12, top: 13 }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}
            >
              {loading ? 'Cadastrando...' : 'Solicitar Cadastro'} <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: '#ffffff', textAlign: 'center', padding: '40px' }}>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
