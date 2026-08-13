import React from 'react';
import Link from 'next/link';
import {
  Upload,
  Layers,
  Code,
  Globe,
  ArrowRight,
  Lock,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navigation */}
      <header
        style={{
          height: '74px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/wdcom-logo.png"
            alt="WDCOM Logo"
            style={{ width: '42px', height: 'auto', objectFit: 'contain' }}
          />
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.35rem', color: '#00a3e0' }}>
              WDCOM <span style={{ color: '#ffffff', fontWeight: 600 }}>PDF</span>
            </span>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Plataforma por WDCOM</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login" className="btn-secondary" style={{ fontSize: '0.88rem' }}>
            Fazer Login
          </Link>
          <Link href="/admin" className="btn-primary" style={{ fontSize: '0.88rem' }}>
            Acessar Painel <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px 24px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto', flex: 1 }}>
        <div
          className="badge"
          style={{
            background: 'rgba(0, 163, 224, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(0, 163, 224, 0.3)',
            padding: '6px 16px',
            marginBottom: '24px',
          }}
        >
          ⚡ Plataforma SaaS Desenvolvida por WDCOM
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '20px',
            letterSpacing: '-0.03em',
          }}
        >
          Hospede e incorpore seus PDFs em <br />
          <span style={{ color: '#00a3e0' }}>qualquer site via iframe exclusivo</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#9ca3af',
            maxWidth: '720px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6,
          }}
        >
          Faça upload dos seus documentos, organize por sites e tags e incorpore seus PDFs em qualquer site usando uma URL pública exclusiva ou código iframe responsivo — desenvolvido com a tecnologia da <strong>WDCOM</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}>
            Entrar no Painel Administrativo <ArrowRight size={18} />
          </Link>
          <Link href="/view/8f72a91c" target="_blank" className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
            Ver Demonstração ao Vivo
          </Link>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section style={{ padding: '60px 24px', background: 'rgba(17, 24, 39, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Como Funciona o Fluxo WDCOM</h2>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>Gerencie dezenas de PDFs para múltiplos sites de forma centralizada.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0, 163, 224, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: 16 }}>
                <Upload size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#00a3e0', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Passo 1</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>1. Envie o PDF</h3>
              <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>Faça upload do arquivo PDF. O sistema valida e armazena com segurança no storage.</p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', marginBottom: 16 }}>
                <Layers size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Passo 2</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>2. Organize</h3>
              <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>Associe o PDF a um site/projeto específico e atribua tags para busca rápida.</p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: 16 }}>
                <Code size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Passo 3</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>3. Incorpore</h3>
              <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>O sistema gera automaticamente a URL pública exclusiva e o código HTML de iframe.</p>
            </div>

            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: 16 }}>
                <Globe size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Passo 4</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>4. Publique</h3>
              <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>Cole o iframe no site de destino. Se precisar atualizar o arquivo, a URL se mantém!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <Lock size={32} color="#f59e0b" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Restrição por Domínio & CSP</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Configure quais domínios externos estão autorizados a incorporar cada PDF. Impede acessos indevidos e hotlinking por sites não autorizados.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <img src="/wdcom-logo.png" alt="WDCOM" style={{ width: 32, height: 'auto', marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Substituição sem Alterar Iframe</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Substitua o arquivo PDF mantendo a mesma URL pública e o mesmo identificador único (`public_id`). Seus clientes nunca precisarão mudar o iframe.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <BarChart3 size={32} color="#10b981" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Métricas & Analytics em Tempo Real</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Acompanhe total de visualizações por dia, origem do tráfego (referrer), dispositivos utilizados e performance de cada documento.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 32px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#6b7280',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <img src="/wdcom-logo.png" alt="WDCOM" style={{ height: '20px', width: 'auto' }} />
        <span>Desenvolvido por <strong>WDCOM</strong> © 2026</span>
      </footer>
    </div>
  );
}
