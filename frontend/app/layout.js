import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';
import PublicShell from '@/components/PublicShell';

export const metadata = {
  title: 'KJN Shop — Farm & Agricultural Equipment',
  description: 'Shop farm equipment, garden tools, chaff cutters, motors, and more at best prices.',
  keywords: 'farm equipment, agricultural tools, sprayers, motors, garden tools',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <PublicShell>
            {children}
          </PublicShell>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Nunito, sans-serif', fontWeight: 600 },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}