'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { Gift, Truck, Zap, Shield, Smartphone, Star } from 'lucide-react';

const RS = String.fromCharCode(8377);

const TICKER_ITEMS = [
  { Icon: Gift,       text: 'Get 1.5% off on all prepaid orders!',        code: 'PREPAID' },
  { Icon: Truck,      text: 'Free delivery on orders above ' + RS + '500', code: null },
  { Icon: Zap,        text: 'Flash sale - up to 30% off on farm equipment', code: null },
  { Icon: Shield,     text: '100% genuine products. 7-day easy returns',   code: null },
  { Icon: Smartphone, text: 'Download the KJN app for exclusive deals',    code: null },
  { Icon: Star,       text: 'Rated 4.8/5 by 10,000+ happy farmers',       code: null },
];

const REPEATED = [...TICKER_ITEMS, ...TICKER_ITEMS];

function AnnouncementTicker() {
  return (
    <div className="relative overflow-hidden bg-primary-900 text-white py-2 select-none">
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker 36s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-track">
        {REPEATED.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-8 text-xs sm:text-sm font-semibold whitespace-nowrap"
          >
            <item.Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
            <span>{item.text}</span>
            {item.code && (
              <span className="bg-white/20 border border-white/30 font-extrabold px-2 py-0.5 rounded text-[10px] tracking-widest">
                {item.code}
              </span>
            )}
            <span className="mx-4 opacity-30">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <AnnouncementTicker />
      <Navbar />
      <main className="min-h-[70vh] pb-20 md:pb-0 page-enter">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </>
  );
}

