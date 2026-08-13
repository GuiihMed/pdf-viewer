import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'PDF Embed Platform | Hospedagem e Visualização Online de PDFs',
  description: 'Plataforma SaaS para hospedagem, gerenciamento e incorporação de arquivos PDF via iframe em múltiplos sites.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
