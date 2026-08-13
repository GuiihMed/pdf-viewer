import React from 'react';
import db from '@/lib/db';
import { PdfViewer } from '@/components/PdfViewer';
import { AlertTriangle, FileQuestion } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { publicId: string } }): Promise<Metadata> {
  const pdf = db.prepare('SELECT title, description FROM pdfs WHERE public_id = ?').get(params.publicId) as any;
  if (!pdf) {
    return {
      title: 'PDF Não Encontrado',
      robots: 'noindex, nofollow',
    };
  }
  return {
    title: `${pdf.title} | Visualizador de PDF`,
    description: pdf.description || 'Visualizador seguro de documentos PDF',
    robots: 'noindex, nofollow',
  };
}

export default function PublicPdfViewPage({ params }: { params: { publicId: string } }) {
  const publicId = params.publicId;

  const pdf = db.prepare('SELECT * FROM pdfs WHERE public_id = ?').get(publicId) as any;

  if (!pdf) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          className="glass-panel"
          style={{ maxWidth: '420px', padding: '36px', textAlign: 'center', background: 'rgba(17, 24, 39, 0.85)' }}
        >
          <FileQuestion size={52} color="#f87171" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>Documento Não Encontrado (404)</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
            O arquivo PDF solicitado não existe ou a URL digitada é inválida.
          </p>
        </div>
      </div>
    );
  }

  if (pdf.status !== 'active') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          className="glass-panel"
          style={{ maxWidth: '440px', padding: '36px', textAlign: 'center', background: 'rgba(17, 24, 39, 0.85)' }}
        >
          <AlertTriangle size={52} color="#fbbf24" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>Documento Temporariamente Indisponível</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Este documento PDF foi temporariamente desativado pelo administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PdfViewer
      publicId={pdf.public_id}
      title={pdf.title}
      allowDownload={Boolean(pdf.allow_download)}
      allowPrint={Boolean(pdf.allow_print)}
    />
  );
}
