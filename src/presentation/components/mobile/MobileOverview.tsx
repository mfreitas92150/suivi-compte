'use client';

import { useState } from 'react';
import { MobileEnvelopeList } from '@/presentation/components/mobile/MobileEnvelopeList';
import { MobileNavigation, MobileTab } from '@/presentation/components/mobile/MobileNavigation';
import { MobileDashboard } from '@/presentation/components/mobile/MobileDashboard';
import { MobileTransactionList } from '@/presentation/components/mobile/MobileTransactionList';

export default function MobileOverview() {
  const [activeTab, setActiveTab] = useState<MobileTab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="p-4">
        {activeTab === 'dashboard' && <MobileDashboard />}
        {activeTab === 'enveloppes' && <MobileEnvelopeList />}
        {activeTab === 'transactions' && <MobileTransactionList />}
      </main>
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
