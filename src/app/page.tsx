'use client';

import { useState, useEffect } from 'react';
import DashboardOverview from '@/presentation/components/dashboard/DashboardOverview';
import MobileOverview from '@/presentation/components/mobile/MobileOverview';

export default function RootPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile === null) return null;

  return isMobile ? <MobileOverview /> : <DashboardOverview />;
}
