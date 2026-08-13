'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Layers,
  Code,
  Globe,
  ArrowRight,
  Lock,
  BarChart3,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  FileCheck2
} from 'lucide-react';
import { WdcomLogo } from '@/components/WdcomLogo';

export default function LandingPage() {
  const [demoPublicId, setDemoPublicId] = useState<string>('demo-wdcom');

  useEffect(() => {
    // Generate live demo PDF in background if missing
    fetch('/api/admin/seed-demo').catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Header Navigation */}
      <header
        style={{
          height: '88px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          <WdcomLogo height={58} />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login" className="btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 20px' }}>
            Fazer Login
          </Link>
          <Link href="/login" className="btn-primary" style={{ fontSize: '0.88rem', padding: '10px 22px', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}>
            Acessar Painel <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '90px 24px 70px 24px', textAlign: 'center', maxWidth: '1080px', margin: '0 auto', flex: 1, position: 'relative' }}>
        {/* Decorative ambient background glows */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(0, 163, 224, 0.18) 0%, rgba(11, 15, 25, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="badge"
            style={{
              background: 'rgba(0, 163, 224, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(0, 163, 224, 0.35)',
              padding: '8px 20px',
              marginBottom: '28px',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '30px',
              boxShadow: '0 0 20px rgba(0, 163, 224, 0.2)',
            }}
          >
            <Sparkles size={16} color="#00a3e0" /> Sistema Profissional de Visualizador de PDF por WDCOM
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              lineHeight: 1.12,
              fontWeight: 800,
              marginBottom: '24px',
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Hospede e incorpore seus PDFs em <br />
            <span style={{
              background: 'linear-gradient(135deg, #00a3e0 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>qualquer site com iFrame exclusivo</span>
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              color: '#9ca3af',
              maxWidth: '780px',
              margin: '0 auto 40px auto',
              lineHeight: 1.65,
            }}
          >
            Plataforma de alta velocidade integrada ao <strong>Google Cloud Firestore</strong> desenvolvida pela <strong>WDCOM Mídia Digital</strong>. Gerencie documentos, controle permissões por domínio e incorpore visualizadores interativos em segundos.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              className="btn-primary"
              style={{
                padding: '16px 32px',
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)',
                boxShadow: '0 8px 25px rgba(0, 163, 224, 0.35)',
              }}
            >
              Entrar no Painel Administrativo <ArrowRight size={20} />
            </Link>

            <Link
              href={`/view/${demoPublicId}`}
              target="_blank"
              className="btn-secondary"
              style={{
                padding: '16px 28px',
                fontSize: '1.05rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileCheck2 size={20} color="#38bdf8" /> Ver Demonstração ao Vivo <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(17, 24, 39, 0.7)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Como Funciona a Plataforma WDCOM</h2>
            <p style={{ color: '#9ca3af', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Gerencie e incorpore arquivos PDF de múltiplos sites de forma centralizada e segura.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(0, 163, 224, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: 20 }}>
                <Upload size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#00a3e0', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 1</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>1. Upload do Arquivo</h3>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6 }}>Envie o arquivo PDF do computador ou insira o link de uma URL pública.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', marginBottom: 20 }}>
                <Layers size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 2</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>2. Organização</h3>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6 }}>Associe o PDF a um site/empresa e defina tags para busca imediata.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: 20 }}>
                <Code size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 3</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>3. Código de Incorporação</h3>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6 }}>Copie a URL pública exclusiva ou o código HTML do iframe responsivo.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: 20 }}>
                <Globe size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 4</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>4. Publicação e Atualizações</h3>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6 }}>Cole o iframe em seu site. Ao atualizar o PDF, o iframe atualiza automaticamente!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: '90px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Lock size={26} color="#fbbf24" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Restrição por Domínio & CSP</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Configure quais domínios autorizados podem exibir cada documento PDF via iframe. Impede roubo de links, cópias não autorizadas e hotlinking.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0, 163, 224, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Zap size={26} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Google Cloud Storage & Firestore</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Integrado nativamente ao Google Cloud. Seus PDFs ficam salvos na infraestrutura oficial da Google, garantindo velocidade máxima e alta disponibilidade.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <BarChart3 size={26} color="#34d399" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Métricas & Relatórios de Tráfego</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Acompanhe contagem de visualizações por período, origens de tráfego, tipos de dispositivos e navegadores em tempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 32px',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#6b7280',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: 'rgba(7, 10, 18, 0.95)',
        }}
      >
        <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          <img src="/og-image.png" alt="WDCOM Mídia Digital" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </a>
        <div>
          Sistema de visualizador de PDF desenvolvido por <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ color: '#00a3e0', fontWeight: 600, textDecoration: 'none' }}>WDCOM Mídia Digital</a> © 2026
        </div>
      </footer>
    </div>
  );
}
