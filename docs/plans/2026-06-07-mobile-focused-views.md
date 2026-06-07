# Mobile Focused Views Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a mobile-first focused interface with two tabs: Rapid Entry (Saisie) and Envelope View.

**Architecture:** Single container page at `/mobile` managing tab state, with dedicated components for navigation and content. Adheres to Clean Architecture by using existing application hooks.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Lucide React, TanStack Query (via `useApi.ts`).

---

### Task 1: Main Container and Navigation

**Files:**
- Create: `src/app/mobile/page.tsx`
- Create: `src/presentation/components/mobile/MobileNavigation.tsx`

**Step 1: Create MobileNavigation component**
Create a fixed bottom navigation bar with two tabs.

```tsx
import { PlusCircle, Target } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'saisie' | 'enveloppes';
  onTabChange: (tab: 'saisie' | 'enveloppes') => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-20 pb-4 z-50">
      <button 
        onClick={() => onTabChange('saisie')}
        className={`flex flex-col items-center space-y-1 ${activeTab === 'saisie' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <PlusCircle className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Saisie</span>
      </button>
      <button 
        onClick={() => onTabChange('enveloppes')}
        className={`flex flex-col items-center space-y-1 ${activeTab === 'enveloppes' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Target className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Enveloppes</span>
      </button>
    </nav>
  );
}
```

**Step 2: Create the main Mobile page container**
Implement the state-driven container.

```tsx
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
```

**Step 3: Commit**
```bash
git add src/app/mobile/page.tsx src/presentation/components/mobile/MobileNavigation.tsx
git commit -m "feat: base de la version mobile avec navigation par onglets"
```

---

### Task 2: Rapid Entry Form (Saisie)

**Files:**
- Create: `src/presentation/components/mobile/MobileEntryForm.tsx`
- Modify: `src/app/mobile/page.tsx`

**Step 1: Implement MobileEntryForm**
Focus on amount display, chips for categories/accounts, and "Yesterday" toggle.

```tsx
import { useState } from 'react';
import { useAccounts, useCategories, useCreateTransaction } from "@/presentation/hooks/useApi";
import { Save, CheckCircle2 } from 'lucide-react';

export function MobileEntryForm() {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTx.mutateAsync({
      description: formData.description,
      amount: -Math.abs(parseFloat(formData.amount)),
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: new Date(formData.date),
      isFixed: false,
      checked: false
    });
    setIsSuccess(true);
    setFormData({ ...formData, amount: '', description: '' });
    setTimeout(() => setIsSuccess(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">C'est noté !</h2>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Montant</label>
        <div className="relative inline-block">
          <input 
            type="number" step="0.01" placeholder="0.00" autoFocus
            className="w-full text-center text-6xl font-black text-gray-900 outline-none placeholder-gray-100"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            required
          />
          <span className="absolute -right-6 top-4 text-2xl font-bold text-gray-300">€</span>
        </div>
      </div>

      <div className="space-y-4">
        <input 
          type="text" placeholder="Quoi ? (ex: Courses)" 
          className="w-full p-5 bg-white rounded-2xl border-none shadow-sm text-lg font-medium"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          required
        />

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {categories?.filter(c => c.type === 'EXPENSE').map(c => (
              <button
                key={c.id} type="button"
                onClick={() => setFormData({...formData, categoryId: c.id})}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.categoryId === c.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 border border-gray-100'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Compte</label>
          <div className="flex flex-wrap gap-2">
            {accounts?.map(a => (
              <button
                key={a.id} type="button"
                onClick={() => setFormData({...formData, accountId: a.id})}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.accountId === a.id ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'}`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        type="submit" disabled={createTx.isPending}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
      >
        {createTx.isPending ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
      </button>
    </form>
  );
}
```

**Step 2: Integrate in Mobile page**
Update `src/app/mobile/page.tsx` to use the form.

**Step 3: Commit**
```bash
git add src/presentation/components/mobile/MobileEntryForm.tsx src/app/mobile/page.tsx
git commit -m "feat: formulaire de saisie rapide optimisé pour mobile"
```

---

### Task 3: Envelope List View (Enveloppes)

**Files:**
- Create: `src/presentation/components/mobile/MobileEnvelopeList.tsx`
- Modify: `src/app/mobile/page.tsx`

**Step 1: Implement MobileEnvelopeList**
Focus on progress bars and "Remaining" balance.

```tsx
import { useCategories, useEnvelopes, useTransactions } from "@/presentation/hooks/useApi";

export function MobileEnvelopeList() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const { data: categories } = useCategories();
  const { data: envelopes } = useEnvelopes({ month, year });
  const { data: transactions } = useTransactions({ month, year });

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];

  const getSpent = (catId: string) => 
    transactions?.filter(tx => tx.categoryId === catId).reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gray-900 rounded-3xl text-white shadow-xl mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Reste à dépenser</p>
        <h2 className="text-3xl font-black">2 450,00 €</h2>
      </div>

      {expenseCategories.map(cat => {
        const budget = envelopes?.find(e => e.categoryId === cat.id)?.amount || 0;
        const spent = getSpent(cat.id);
        const remaining = budget - spent;
        const percent = budget > 0 ? (spent / budget) * 100 : 0;

        return (
          <div key={cat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-black text-gray-900">{cat.name}</h4>
                <p className="text-xs font-bold text-gray-400">Restant: <span className={remaining < 0 ? 'text-red-500' : 'text-emerald-500'}>{remaining.toLocaleString('fr-FR')} €</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Budget</p>
                <p className="font-black text-gray-900">{budget.toLocaleString('fr-FR')} €</p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${percent > 100 ? 'bg-red-500' : percent > 85 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Integrate in Mobile page**
Update `src/app/mobile/page.tsx` to use the list.

**Step 3: Commit**
```bash
git add src/presentation/components/mobile/MobileEnvelopeList.tsx src/app/mobile/page.tsx
git commit -m "feat: vue des enveloppes optimisée pour mobile"
```
