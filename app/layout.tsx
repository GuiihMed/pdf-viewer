import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'WDCOM PDF | Hospedagem e Visualização Online de PDFs',
  description: 'Plataforma SaaS por WDCOM para hospedagem, gerenciamento e incorporação de arquivos PDF via iframe em múltiplos sites.',
  icons: {
    icon: '/wdcom-logo.png',
    shortcut: '/wdcom-logo.png',
    apple: '/wdcom-logo.png',
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
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
