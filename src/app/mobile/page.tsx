'use client';

import { useState } from 'react';
import { MobileNavigation } from '@/presentation/components/mobile/MobileNavigation';

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<'saisie' | 'enveloppes'>('saisie');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="p-4">
        {activeTab === 'saisie' ? (
          <div>Vue Saisie (En cours)</div>
        ) : (
          <div>Vue Enveloppes (En cours)</div>
        )}
      </main>
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
