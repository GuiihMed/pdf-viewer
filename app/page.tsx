'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import {
  Upload,
  Layers,
  Code,
  Globe,
  ArrowRight,
  Lock,
  BarChart3,
  Zap,
  Sparkles,
  ExternalLink,
  FileCheck,
  FileText,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { WdcomLogo } from '@/components/WdcomLogo';

const DynamicBackground = dynamicImport(
  () => import('@/components/DynamicBackground').then((mod) => mod.InteractiveBackground),
  { ssr: false }
);

export default function LandingPage() {
  const [demoPublicId, setDemoPublicId] = useState<string>('demo-wdcom');

  useEffect(() => {
    fetch('/api/admin/seed-demo').catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#080c14', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', position: 'relative' }}>
      <DynamicBackground />

      {/* Header Navigation */}
      <header
        className="glass-header"
        style={{
          height: '88px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '100%',
          width: '100%',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
            <WdcomLogo height={56} />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/galeria" className="btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 163, 224, 0.3)', color: '#38bdf8' }}>
              📚 Galeria de PDFs
            </Link>
            <Link href="/login" className="btn-secondary" style={{ fontSize: '0.88rem', padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              Fazer Login
            </Link>
            <Link href="/login" className="btn-primary" style={{ fontSize: '0.88rem', padding: '10px 22px', background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)' }}>
              Acessar Painel <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '100px 24px 80px 24px', textAlign: 'center', maxWidth: '1120px', margin: '0 auto', flex: 1, position: 'relative', zIndex: 10 }}>
        <div
          className="badge"
          style={{
            background: 'rgba(0, 163, 224, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(0, 163, 224, 0.3)',
            padding: '8px 22px',
            marginBottom: '32px',
            fontSize: '0.92rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '30px',
            boxShadow: '0 0 30px rgba(0, 163, 224, 0.15)',
          }}
        >
          <FileText size={16} color="#00a3e0" /> Plataforma de Hospedagem & Embed de PDFs por WDCOM
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.6rem, 5.8vw, 4.4rem)',
            lineHeight: 1.12,
            fontWeight: 800,
            marginBottom: '26px',
            letterSpacing: '-0.03em',
            color: '#ffffff',
          }}
        >
          Visualizador de PDF Inteligente para <br />
          <span style={{
            background: 'linear-gradient(135deg, #00a3e0 0%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Empresas, Agências e Portais Corporativos</span>
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '820px',
            margin: '0 auto 44px auto',
            lineHeight: 1.65,
            fontWeight: 400,
          }}
        >
          Hospede catálogos, manuais, contratos e relatórios com renderização ultrarrápida. Incorpore no seu site via iFrame responsivo mantendo a mesma URL pública mesmo se trocar o arquivo.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/galeria"
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #00a3e0 0%, #0077b6 100%)',
              boxShadow: '0 10px 30px rgba(0, 163, 224, 0.35)',
              borderRadius: '10px',
            }}
          >
            Explorar Galeria de PDFs <ArrowRight size={20} />
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
              backdropFilter: 'blur(12px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '10px',
            }}
          >
            <FileCheck size={20} color="#38bdf8" /> Ver Demonstração ao Vivo <ExternalLink size={16} />
          </Link>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(15, 23, 42, 0.65)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Como Funciona a Plataforma WDCOM</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
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
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>Envie o arquivo PDF do computador ou insira o link de uma URL pública.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', marginBottom: 20 }}>
                <Layers size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 2</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>2. Organização</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>Associe o PDF a um site/empresa e defina tags para busca imediata.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: 20 }}>
                <Code size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 3</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>3. Código de Incorporação</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>Copie a URL pública exclusiva ou o código HTML do iframe responsivo.</p>
            </div>

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: 20 }}>
                <Globe size={26} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Passo 4</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10, color: '#ffffff' }}>4. Publicação e Atualizações</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>Cole o iframe em seu site. Ao atualizar o PDF, o iframe atualiza automaticamente!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Recursos Criados para Suas Necessidades</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
              Uma solução completa criada para agilizar a publicação e segurança dos seus documentos corporativos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            <div className="glass-panel" style={{ padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0, 163, 224, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <Building2 size={26} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Gerenciamento Multi-Empresas</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.65 }}>
                Cadastre diferentes sites e empresas. Cada cliente acessa exclusivamente seus próprios documentos com total isolamento de dados.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <ShieldCheck size={26} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Proteção & Restrição de Domínios</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.65 }}>
                Defina com precisão quais domínios web têm permissão para exibir o PDF via iFrame. Evite compartilhamento indevido ou cópias.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '36px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                <BarChart3 size={26} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 12, color: '#ffffff' }}>Métricas & Relatórios de Acessos</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.94rem', lineHeight: 1.65 }}>
                Acompanhe o número total de leituras por PDF, dispositivo utilizado e taxa de engajamento dos seus usuários.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#64748b',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'rgba(5, 8, 16, 0.95)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          <WdcomLogo height={48} />
        </a>
        <div>
          Sistema de visualizador de PDF desenvolvido por <a href="http://wdcom.com.br/" target="_blank" rel="noopener noreferrer" style={{ color: '#00a3e0', fontWeight: 600, textDecoration: 'none' }}>WDCOM Mídia Digital</a> © 2026
        </div>
      </footer>
    </div>
  );
}
