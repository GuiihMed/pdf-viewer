'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requiredRole?: string;
}

export function RequireRole({ children, requiredRole = 'superadmin' }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          if (requiredRole === 'superadmin' && data.user.role === 'superadmin') {
            setAuthorized(true);
          } else if (requiredRole !== 'superadmin') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
        }
        setChecking(false);
      })
      .catch(() => {
        setChecking(false);
      });
  }, [requiredRole]);

  if (checking) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        Verificando permissões...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Shield size={28} color="#f87171" />
        </div>
        <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 700 }}>Acesso Restrito</h2>
        <p style={{ color: '#9ca3af', maxWidth: '400px', lineHeight: 1.6 }}>
          Você não tem permissão para acessar esta página. Entre em contato com o administrador do sistema.
        </p>
        <button
          onClick={() => router.push('/admin')}
          className="btn-primary"
          style={{ marginTop: '8px' }}
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
