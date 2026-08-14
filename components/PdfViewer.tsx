'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Printer,
  RotateCw,
  AlertOctagon,
  Lock,
  FileX
} from 'lucide-react';

interface PdfViewerProps {
  publicId: string;
  title?: string;
  allowDownload?: boolean;
  allowPrint?: boolean;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  publicId,
  title = 'Documento PDF',
  allowDownload = true,
  allowPrint = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if loaded inside an iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

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
  }, [publicId]);

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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0b0f19',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Reader Control Header Bar */}
      {!isIframe && (
        <header
          className="pdf-viewer-header"
          style={{
            minHeight: '52px',
            backgroundColor: '#111827',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f3f4f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: '120px' }}>
            {title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={handleZoomOut} className="btn-icon" title="Diminuir Zoom" style={{ padding: '6px' }}>
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '38px', textAlign: 'center', color: '#a5b4fc' }}>
              {zoom}%
            </span>
            <button onClick={handleZoomIn} className="btn-icon" title="Aumentar Zoom" style={{ padding: '6px' }}>
              <ZoomIn size={16} />
            </button>
            <button onClick={handleZoomReset} className="btn-icon" title="Ajustar 100%" style={{ padding: '6px' }}>
              <RotateCw size={14} />
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

            {allowPrint && (
              <button onClick={handlePrint} className="btn-icon" title="Imprimir Documento" style={{ padding: '6px' }}>
                <Printer size={16} />
              </button>
            )}

            {allowDownload && (
              <a href={pdfStreamUrl} download className="btn-icon" title="Baixar PDF" style={{ padding: '6px' }}>
                <Download size={16} />
              </a>
            )}

            <button onClick={toggleFullscreen} className="btn-icon" title="Modo Tela Cheia" style={{ padding: '6px' }}>
              <Maximize size={16} />
            </button>
          </div>
        </header>
      )}

      {/* Main Viewer Area */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              color: '#818cf8',
              zIndex: 5,
            }}
          >
            <div className="animate-pulse-subtle" style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#9ca3af' }}>Carregando documento PDF...</div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
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
            <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#ffffff' }}>Acesso Restrito ou Documento Indisponível</h3>
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
            }}
          />
        )}
      </div>
    </div>
  );
};
