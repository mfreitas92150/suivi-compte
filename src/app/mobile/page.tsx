'use client';

import { useState } from 'react';
import { MobileNavigation } from '@/presentation/components/mobile/MobileNavigation';
import { MobileEntryForm } from '@/presentation/components/mobile/MobileEntryForm';
import { MobileEnvelopeList } from '@/presentation/components/mobile/MobileEnvelopeList';

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<'saisie' | 'enveloppes'>('saisie');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main className="p-4">
        {activeTab === 'saisie' ? (
          <MobileEntryForm />
        ) : (
          <MobileEnvelopeList />
        )}
      </main>
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
