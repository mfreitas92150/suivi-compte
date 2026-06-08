'use client';

import { useState } from 'react';
import { useTransactions, useCategories } from "@/presentation/hooks/useApi";
import { useMonthNavigation } from "@/presentation/hooks/useMonthNavigation";
import { Plus, X, ArrowLeft } from 'lucide-react';
import { MobileEntryForm } from './MobileEntryForm';

export function MobileTransactionList() {
  const { month, year } = useMonthNavigation();
  const { data: transactions, isLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const [showAddForm, setShowAddForm] = useState(false);

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => setShowAddForm(false)}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-xl font-black text-gray-900">Nouvelle Opération</h2>
        </div>
        <MobileEntryForm onSuccess={() => setShowAddForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-gray-900">Opérations</h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {transactions?.length || 0} Transactions
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 font-bold">Chargement...</div>
        ) : transactions?.length === 0 ? (
          <div className="py-12 text-center text-gray-400 italic">Aucune opération ce mois-ci</div>
        ) : (
          transactions?.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">{tx.description}</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {categories?.find(c => c.id === tx.categoryId)?.name || 'Inconnue'} • {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <span className={`font-black text-lg ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} €
              </span>
            </div>
          )).reverse()
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center active:scale-95 transition-all z-40"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
