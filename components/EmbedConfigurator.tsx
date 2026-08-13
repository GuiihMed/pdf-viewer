'use client';
import React, { useState } from 'react';
import { Copy, Code, Check, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useToast } from './Toast';

interface EmbedConfiguratorProps {
  publicId: string;
  title: string;
}

export const EmbedConfigurator: React.FC<EmbedConfiguratorProps> = ({ publicId, title }) => {
  const { showToast } = useToast();
  const [height, setHeight] = useState<string>('800');
  const [width, setWidth] = useState<string>('100%');
  const [allowFullscreen, setAllowFullscreen] = useState<boolean>(true);
  const [responsiveWrapper, setResponsiveWrapper] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<'url' | 'iframe' | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pdf.exemplo.com';
  const publicUrl = `${origin}/view/${publicId}`;

  const generatedIframeCode = responsiveWrapper
    ? `<div style="width:${width};height:${height.endsWith('px') || height.endsWith('vh') || height.endsWith('%') ? height : height + 'px'};">
  <iframe
    src="${publicUrl}"
    style="width:100%;height:100%;border:0;"
    ${allowFullscreen ? 'allowfullscreen' : ''}>
  </iframe>
</div>`
    : `<iframe
  src="${publicUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  ${allowFullscreen ? 'allowfullscreen' : ''}>
</iframe>`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedType('url');
    showToast('URL pública copiada!', 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyIframe = () => {
    navigator.clipboard.writeText(generatedIframeCode);
    setCopiedType('iframe');
    showToast('Código HTML de iframe copiado!', 'success');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Quick Copy Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase' }}>URL Pública Exclusiva</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {publicUrl}
            </div>
          </div>
          <button onClick={copyUrl} className="btn-primary">
            {copiedType === 'url' ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedType === 'url' ? 'URL Copiada!' : 'Copiar URL'}</span>
          </button>
        </div>
      </div>

      {/* Iframe Code Customizer */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} color="#818cf8" /> Gerador de Código Iframe
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Altura (Height)</label>
            <select className="form-select" value={height} onChange={(e) => setHeight(e.target.value)}>
              <option value="600">600 px</option>
              <option value="800">800 px (Recomendado)</option>
              <option value="1000">1000 px</option>
              <option value="100vh">100vh (Altura Total da Tela)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Largura (Width)</label>
            <select className="form-select" value={width} onChange={(e) => setWidth(e.target.value)}>
              <option value="100%">100% (Largura Total)</option>
              <option value="900px">900 px</option>
              <option value="1200px">1200 px</option>
            </select>
          </div>

          <div className="form-group" style={{ justifyContent: 'center' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
              <input
                type="checkbox"
                checked={responsiveWrapper}
                onChange={(e) => setResponsiveWrapper(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#6366f1' }}
              />
              <span>Wrapper Responsivo (DIV)</span>
            </label>
          </div>

          <div className="form-group" style={{ justifyContent: 'center' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
              <input
                type="checkbox"
                checked={allowFullscreen}
                onChange={(e) => setAllowFullscreen(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#6366f1' }}
              />
              <span>Permitir Tela Cheia (Fullscreen)</span>
            </label>
          </div>
        </div>

        {/* Code Box Display */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <pre
            style={{
              background: '#090d16',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {generatedIframeCode}
          </pre>
          <button
            onClick={copyIframe}
            className="btn-primary"
            style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {copiedType === 'iframe' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedType === 'iframe' ? 'Copiado!' : 'Copiar Código HTML'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="#34d399" /> Prévia de Incorporação no Site Externo
          </h3>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className="btn-icon"
              style={{ background: previewDevice === 'desktop' ? 'rgba(99, 102, 241, 0.3)' : 'transparent' }}
              title="Visão Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className="btn-icon"
              style={{ background: previewDevice === 'tablet' ? 'rgba(99, 102, 241, 0.3)' : 'transparent' }}
              title="Visão Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className="btn-icon"
              style={{ background: previewDevice === 'mobile' ? 'rgba(99, 102, 241, 0.3)' : 'transparent' }}
              title="Visão Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Screen Mockup */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            background: '#070a12',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: previewDevice === 'mobile' ? '380px' : previewDevice === 'tablet' ? '768px' : '100%',
              height: previewDevice === 'mobile' ? '550px' : '650px',
              transition: 'all 0.3s ease',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <iframe
              src={publicUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen={allowFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
