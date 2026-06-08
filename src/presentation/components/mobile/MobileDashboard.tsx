'use client';

import { useAccounts, useTransactions, useCategories } from "@/presentation/hooks/useApi";
import { useMonthNavigation } from "@/presentation/hooks/useMonthNavigation";
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

export function MobileDashboard() {
  const { month, year } = useMonthNavigation();
  const { data: accounts } = useAccounts();
  const { data: transactions, isLoading: isTxLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const monthlyIncome = transactions
    ?.filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0) || 0;

  const monthlyExpense = transactions
    ?.filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;

  const totalBalance = accounts?.reduce((acc, a) => acc + a.balance, 0) || 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Month */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-gray-900">Résumé</h2>
        <div className="flex items-center space-x-1 text-gray-500 bg-white px-3 py-1 rounded-full border text-xs font-bold shadow-sm">
          <Calendar className="w-3 h-3" />
          <span>{monthNames[month - 1]} {year}</span>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Solde Global</p>
          <h3 className="text-4xl font-black mb-8">{formatCurrency(totalBalance)}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Revenus</span>
              </div>
              <p className="text-lg font-black text-emerald-400">+{formatCurrency(monthlyIncome)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Dépenses</span>
              </div>
              <p className="text-lg font-black text-red-400">-{formatCurrency(monthlyExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List Mini */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Mes Comptes</h4>
          <Wallet className="w-4 h-4 text-gray-300" />
        </div>
        
        <div className="space-y-2">
          {accounts?.map(account => (
            <div key={account.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <span className="font-bold text-gray-800">{account.name}</span>
              <span className={`font-black ${account.balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {formatCurrency(account.balance)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
