import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ListasDaqui — Encontre Prestadores de Serviço',
  description: 'O guia de prestadores do Brasil',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <ReactQueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
