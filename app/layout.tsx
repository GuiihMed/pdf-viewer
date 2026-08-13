import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  metadataBase: new URL('https://wdcom-pdfviewer.vercel.app'),
  title: 'WDCOM PDF | Sistema de Visualização e Hospedagem de PDFs por WDCOM',
  description: 'Sistema de visualizador de PDF feito pela WDCOM. Hospede e incorpore seus documentos em qualquer site via iframe exclusivo.',
  keywords: ['WDCOM', 'PDF Viewer', 'Visualizador de PDF', 'Hospedagem de PDF', 'Iframe PDF', 'WDCOM Mídia Digital'],
  authors: [{ name: 'WDCOM Mídia Digital', url: 'http://wdcom.com.br/' }],
  creator: 'WDCOM Mídia Digital',
  publisher: 'WDCOM Mídia Digital',
  icons: {
    icon: '/wdcom-logo.png',
    shortcut: '/wdcom-logo.png',
    apple: '/wdcom-logo.png',
  },
  openGraph: {
    title: 'WDCOM PDF | Sistema de Visualização e Hospedagem de PDFs',
    description: 'Sistema de visualizador de PDF feito pela WDCOM. Hospede e incorpore seus documentos em qualquer site via iframe exclusivo.',
    url: 'https://wdcom-pdfviewer.vercel.app',
    siteName: 'WDCOM PDF Embed',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WDCOM Mídia Digital - Sistema de Visualizador de PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WDCOM PDF | Sistema de Visualização e Hospedagem de PDFs',
    description: 'Sistema de visualizador de PDF feito pela WDCOM. Hospede e incorpore seus documentos em qualquer site via iframe exclusivo.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/wdcom-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/wdcom-logo.png" />
        <meta property="og:image" content="https://wdcom-pdfviewer.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://wdcom-pdfviewer.vercel.app/og-image.png" />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
