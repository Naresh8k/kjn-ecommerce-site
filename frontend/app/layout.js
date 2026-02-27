import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

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
          <div className="announcement-bar">
            🎉 Get up to 1.5% off on all prepaid orders! &nbsp;|&nbsp; Free delivery above ₹500
          </div>
          <Navbar />
          <main style={{ minHeight: '70vh', paddingBottom: '70px' }} className="page-enter">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <WhatsAppButton />
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