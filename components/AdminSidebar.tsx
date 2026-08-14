'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Globe,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Building2,
  UserCheck
} from 'lucide-react';
import { useToast } from './Toast';
import { WdcomLogo } from './WdcomLogo';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('Sessão encerrada com sucesso', 'info');
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  // Build nav items based on role
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Gerenciar PDFs', icon: FileText, href: '/admin/pdfs' },
    { label: 'Cadastrar PDF', icon: Upload, href: '/admin/pdfs/new' },
    { label: 'Ver Galeria Pública', icon: ExternalLink, href: '/galeria', target: '_blank' },
    // Only superadmin sees Sites, Tags, and Users management
    ...(isSuperAdmin
      ? [
          { label: 'Sites / Projetos', icon: Globe, href: '/admin/sites' },
          { label: 'Tags', icon: Tag, href: '/admin/tags' },
          { label: 'Aprovar Cadastros', icon: UserCheck, href: '/admin/users' },
          { label: 'Usuários', icon: Users, href: '/admin/users' },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="btn-icon"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 50,
          display: 'none',
        }}
        aria-label="Abrir menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: '#0f172a',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Main Logo WDCOM Linked to http://wdcom.com.br/ */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', transition: 'opacity 0.2s ease' }}>
            <WdcomLogo height={52} />
          </a>
        </div>

        {/* User Info Pill */}
        {user && (
          <div
            style={{
              margin: '14px 14px 6px 14px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isSuperAdmin
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#fff',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
            {/* Role badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: isSuperAdmin ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 163, 224, 0.12)',
              border: isSuperAdmin ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(0, 163, 224, 0.25)',
              fontSize: '0.7rem',
              color: isSuperAdmin ? '#fbbf24' : '#38bdf8',
              fontWeight: 600,
              letterSpacing: '0.3px',
            }}>
              {isSuperAdmin ? (
                <>
                  <Users size={11} />
                  <span>Super Admin</span>
                </>
              ) : (
                <>
                  <Building2 size={11} />
                  <span>Cliente</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                target={(item as any).target}
                rel={(item as any).target === '_blank' ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#9ca3af',
                  backgroundColor: isActive ? 'rgba(0, 163, 224, 0.18)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 163, 224, 0.35)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} color={isActive ? '#38bdf8' : '#9ca3af'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <ExternalLink size={16} />
            <span>Página Inicial</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={16} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>
    </>
  );
};
