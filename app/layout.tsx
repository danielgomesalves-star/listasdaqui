import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listasdaqui.com.br';

export const metadata: Metadata = {
  title: 'ListasDaqui — Encontre Prestadores de Serviço',
  description: 'O guia de prestadores do Brasil. Encontre eletricistas, encanadores, pintores e mais na sua cidade.',
  manifest: '/manifest.json',
  themeColor: '#0EA5E9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ListasDaqui',
  },
  openGraph: {
    title: 'ListasDaqui — Encontre Prestadores de Serviço',
    description: 'O guia de prestadores do Brasil. Encontre eletricistas, encanadores, pintores e mais na sua cidade.',
    url: baseUrl,
    siteName: 'ListasDaqui',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: `${baseUrl}/og-default.png`, width: 1200, height: 630, alt: 'ListasDaqui' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ListasDaqui — Encontre Prestadores de Serviço',
    description: 'O guia de prestadores do Brasil.',
    images: [`${baseUrl}/og-default.png`],
  },
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
