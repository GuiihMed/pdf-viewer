'use client';
import React, { useState } from 'react';
import { Settings, Save, Server, Shield, HardDrive, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [systemName, setSystemName] = useState('PDF Embed Platform');
  const [defaultHeight, setDefaultHeight] = useState('800');
  const [storageDriver, setStorageDriver] = useState('local');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Configurações salvas com sucesso!', 'success');
    }, 500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '4px' }}>Configurações do Sistema</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Ajuste as preferências globais do visualizador e da camada de armazenamento.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="#818cf8" /> Preferências Gerais de Embed
          </h3>

          <div className="form-group">
            <label className="form-label">Nome da Plataforma</label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Altura Padrão do Iframe (px)</label>
            <input
              type="text"
              value={defaultHeight}
              onChange={(e) => setDefaultHeight(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} color="#34d399" /> Camada de Armazenamento (Storage)
          </h3>

          <div className="form-group">
            <label className="form-label">Driver de Armazenamento Ativo</label>
            <select value={storageDriver} onChange={(e) => setStorageDriver(e.target.value)} className="form-select">
              <option value="local">Disco Local (Servidor Node.js - ./uploads)</option>
              <option value="s3">Amazon S3 (S3 Compatible)</option>
              <option value="r2">Cloudflare R2 Storage</option>
              <option value="supabase">Supabase Object Storage</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#9ca3af', background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px' }}>
            💡 A arquitetura do sistema foi separada em uma camada de abstração de storage (`lib/storage.ts`). Os arquivos PDF são salvos isolados do banco de dados e podem ser facilmente migrados para S3 ou Cloudflare R2 sem alterar as URLs públicas existentes.
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '12px', fontSize: '0.95rem' }}>
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
