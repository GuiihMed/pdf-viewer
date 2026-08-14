'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Printer,
  RotateCw,
  AlertOctagon,
  BookOpen,
  Sun,
  Moon,
  Coffee,
  MessageSquare,
  Sparkles,
  PhoneCall,
  QrCode,
  Share2,
  Lock,
  Search,
  Check,
  Copy,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { useToast } from './Toast';

interface PdfViewerProps {
  publicId: string;
  title?: string;
  description?: string;
  allowDownload?: boolean;
  allowPrint?: boolean;
  siteName?: string;
  siteDomain?: string;
  pageCount?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  publicId,
  title = 'Documento PDF',
  description = '',
  allowDownload = true,
  allowPrint = true,
  siteName = '',
  siteDomain = '',
  pageCount = 1,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'standard' | 'book'>('standard');
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'sepia'>('dark');
  
  // Modals & Panels State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState('');

  // AI Chat simulation
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Olá! Sou o Assistente de Inteligência Artificial do documento "${title}". Como posso ajudar com dúvidas, resumos ou tópicos deste PDF?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Copied states
  const [copiedLink, setCopiedLink] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://wdcom-pdfviewer.vercel.app';
  const publicViewUrl = `${currentOrigin}/view/${publicId}`;

  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    setWatermarkText(`${siteName || 'WDCOM'} • ${new Date().toLocaleDateString('pt-BR')}`);

    // Register view metric silently
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicId,
        referrer: document.referrer || 'Direct',
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [publicId, siteName]);

  const pdfStreamUrl = `/api/pdfs/stream/${publicId}`;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInput;
    if (!query.trim()) return;

    const userText = query.trim();
    setChatMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId,
          message: userText,
          conversationHistory: chatMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `📄 Com base no documento "${title}": Este material possui ${pageCount} página(s) da empresa ${siteName || 'WDCOM'}. Posso ajudar com resumos, informações sobre download ou contato comercial!`,
          },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `📄 Documento: "${title}". Você pode navegar pelas ${pageCount} páginas no leitor ou solicitar atendimento comercial pelo botão do WhatsApp.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Color background depending on theme
  const getThemeBg = () => {
    if (themeMode === 'light') return '#f8fafc';
    if (themeMode === 'sepia') return '#fbf0d9';
    return '#0b0f19';
  };

  const getHeaderBg = () => {
    if (themeMode === 'light') return '#ffffff';
    if (themeMode === 'sepia') return '#f4e4c1';
    return '#111827';
  };

  const getTextColor = () => {
    if (themeMode === 'light') return '#0f172a';
    if (themeMode === 'sepia') return '#451a03';
    return '#ffffff';
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: getThemeBg(),
        color: getTextColor(),
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* 1. Header Controls Bar */}
      {!isIframe && (
        <header
          className="pdf-viewer-header"
          style={{
            minHeight: '56px',
            backgroundColor: getHeaderBg(),
            borderBottom: `1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 30,
            flexWrap: 'wrap',
          }}
        >
          {/* Document Title & Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: '160px', flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.94rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {siteName && (
              <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(0, 163, 224, 0.15)', color: '#00a3e0', border: '1px solid rgba(0, 163, 224, 0.3)', whiteSpace: 'nowrap' }}>
                {siteName}
              </span>
            )}
          </div>

          {/* Interactive Tools Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            
            {/* ELEMENT 1: Modo Folhear / Flipbook Toggle */}
            <button
              onClick={() => setViewMode((m) => (m === 'standard' ? 'book' : 'standard'))}
              className="btn-secondary"
              title="Alternar Modo Livro / Flipbook"
              style={{
                fontSize: '0.78rem',
                padding: '6px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: viewMode === 'book' ? 'rgba(0, 163, 224, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: viewMode === 'book' ? '#38bdf8' : 'inherit',
                border: viewMode === 'book' ? '1px solid #00a3e0' : undefined,
              }}
            >
              <BookOpen size={14} /> {viewMode === 'book' ? 'Modo Livro Ativo' : 'Folhear'}
            </button>

            {/* ELEMENT 1.2: Temas de Contraste (Escuro, Claro, Sépia) */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setThemeMode('dark')}
                className="btn-icon"
                title="Modo Escuro"
                style={{ padding: '4px 6px', background: themeMode === 'dark' ? 'rgba(255,255,255,0.15)' : 'none' }}
              >
                <Moon size={13} />
              </button>
              <button
                onClick={() => setThemeMode('sepia')}
                className="btn-icon"
                title="Modo Leitura Sépia"
                style={{ padding: '4px 6px', background: themeMode === 'sepia' ? 'rgba(255,255,255,0.15)' : 'none' }}
              >
                <Coffee size={13} />
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className="btn-icon"
                title="Modo Claro"
                style={{ padding: '4px 6px', background: themeMode === 'light' ? 'rgba(0,0,0,0.1)' : 'none' }}
              >
                <Sun size={13} />
              </button>
            </div>

            {/* ELEMENT 5: Chat com IA */}
            <button
              onClick={() => setIsAiChatOpen(!isAiChatOpen)}
              className="btn-primary"
              title="Converse com o PDF via Inteligência Artificial"
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={14} /> Chat IA
            </button>

            {/* ELEMENT 6: QR Code & WhatsApp CTA */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="btn-secondary"
              title="Gerar QR Code deste PDF"
              style={{ padding: '6px 8px' }}
            >
              <QrCode size={15} />
            </button>

            <button
              onClick={() => setIsCtaModalOpen(true)}
              className="btn-secondary"
              title="Fale no WhatsApp sobre este documento"
              style={{
                fontSize: '0.78rem',
                padding: '6px 10px',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <PhoneCall size={14} /> Contato
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

            {/* Zoom Controls */}
            <button onClick={handleZoomOut} className="btn-icon" title="Diminuir Zoom" style={{ padding: '5px' }}>
              <ZoomOut size={15} />
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '34px', textAlign: 'center' }}>
              {zoom}%
            </span>
            <button onClick={handleZoomIn} className="btn-icon" title="Aumentar Zoom" style={{ padding: '5px' }}>
              <ZoomIn size={15} />
            </button>
            <button onClick={handleZoomReset} className="btn-icon" title="Ajustar 100%" style={{ padding: '5px' }}>
              <RotateCw size={13} />
            </button>

            {/* Print & Download */}
            {allowPrint && (
              <button onClick={handlePrint} className="btn-icon" title="Imprimir Documento" style={{ padding: '5px' }}>
                <Printer size={15} />
              </button>
            )}

            {allowDownload && (
              <a href={pdfStreamUrl} download className="btn-icon" title="Baixar PDF" style={{ padding: '5px' }}>
                <Download size={15} />
              </a>
            )}

            <button onClick={toggleFullscreen} className="btn-icon" title="Modo Tela Cheia" style={{ padding: '5px' }}>
              <Maximize size={15} />
            </button>
          </div>
        </header>
      )}

      {/* 2. Main PDF Canvas Area & Watermark */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* ELEMENT 2: Dynamic Security Watermark Overlay */}
        {watermarkEnabled && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                transform: 'rotate(-25deg)',
                color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.04)',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                lineHeight: 1.4,
              }}
            >
              {watermarkText}
              <div style={{ fontSize: '1.2rem', fontWeight: 600, opacity: 0.8 }}>VISUALIZAÇÃO SEGURA WDCOM</div>
            </div>
          </div>
        )}

        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#00a3e0',
              zIndex: 5,
            }}
          >
            <div className="animate-pulse-subtle" style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #00a3e0', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#9ca3af' }}>Carregando documento seguro...</div>
          </div>
        )}

        {error ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              maxWidth: '420px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
            }}
          >
            <AlertOctagon size={48} color="#f87171" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#ffffff' }}>Documento Indisponível</h3>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>{error}</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={`${pdfStreamUrl}#toolbar=${isIframe ? 0 : 1}&navpanes=0`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Não foi possível carregar o arquivo PDF.');
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              filter: themeMode === 'sepia' ? 'sepia(0.25) contrast(0.95)' : 'none',
            }}
          />
        )}
      </div>

      {/* 3. ELEMENT 5: Drawer Chat com IA */}
      {isAiChatOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: '360px',
            maxWidth: 'calc(100vw - 40px)',
            height: '480px',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* AI Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '8px', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Assistente do Documento</div>
                <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>Inteligência Artificial Ativa</div>
              </div>
            </div>
            <button
              onClick={() => setIsAiChatOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  background: msg.role === 'user' ? '#00a3e0' : 'rgba(255, 255, 255, 0.07)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.78rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} /> Analisando documento e gerando resposta...
              </div>
            )}
          </div>

          {/* Quick Suggestion Pills */}
          <div style={{ padding: '6px 12px', background: 'rgba(0, 0, 0, 0.3)', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Fazer um resumo deste documento')}
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#ddd6fe',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              📄 Resumo Executivo
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Como falar no WhatsApp com a empresa?')}
              style={{
                background: 'rgba(37, 211, 102, 0.15)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                color: '#86efac',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              💬 Contato Comercial
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage(undefined, 'Informações técnicas e quantas páginas tem')}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#bae6fd',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              📊 Páginas & Dados
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} style={{ padding: '10px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '8px', background: '#0b0f19' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Faça uma pergunta sobre o PDF..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isTyping}
              className="btn-primary"
              style={{ padding: '8px 12px', background: '#8b5cf6', borderRadius: '8px' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* 4. ELEMENT 6: QR Code Modal */}
      {isQrModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '30px', textAlign: 'center', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={18} color="#00a3e0" /> QR Code do Documento
              </h3>
              <button onClick={() => setIsQrModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicViewUrl)}`}
                alt="QR Code"
                style={{ width: 180, height: 180, display: 'block' }}
              />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '18px' }}>
              Aponte a câmera do smartphone para ler e abrir este catálogo digital instantaneamente.
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(publicViewUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '0.86rem' }}
            >
              {copiedLink ? 'Link Copiado!' : 'Copiar Link Direto'}
            </button>
          </div>
        </div>
      )}

      {/* 5. ELEMENT 6.2: WhatsApp / Direct Contact Modal */}
      {isCtaModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', background: '#0f172a' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#22c55e' }}>
              <PhoneCall size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#ffffff' }}>Atendimento Comercial</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '22px' }}>
              Gostou do catálogo ou precisa tirar dúvidas sobre "{title}"? Fale agora mesmo com a equipe através do WhatsApp.
            </p>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá! Estive visualizando o PDF "${title}" no link: ${publicViewUrl} e gostaria de mais informações.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ width: '100%', background: '#22c55e', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}
            >
              <PhoneCall size={16} /> Iniciar Conversa no WhatsApp
            </a>

            <button onClick={() => setIsCtaModalOpen(false)} className="btn-secondary" style={{ width: '100%', padding: '10px' }}>
              Voltar ao Documento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
