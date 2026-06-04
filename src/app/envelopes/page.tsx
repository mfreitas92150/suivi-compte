'use client';

import { useState } from 'react';
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useCategories, useEnvelopes, useTransactions, useUpsertEnvelope } from "@/presentation/hooks/useApi";
import { Wallet, ChevronLeft, ChevronRight, Edit2, Check, X, TrendingDown, Target, AlertCircle } from 'lucide-react';

export default function EnvelopesPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: categories } = useCategories();
  const { data: envelopes, isLoading: envLoading } = useEnvelopes({ month, year });
  const { data: transactions } = useTransactions({ month, year });
  const upsertEnvelope = useUpsertEnvelope();

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const startEdit = (categoryId: string, currentAmount: number) => {
    setEditingCategoryId(categoryId);
    setEditValue(currentAmount.toString());
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditValue('');
  };

  const saveEdit = async (categoryId: string) => {
    const amount = parseFloat(editValue);
    if (!isNaN(amount)) {
      await upsertEnvelope.mutateAsync({
        categoryId,
        amount,
        month,
        year
      });
    }
    setEditingCategoryId(null);
  };

  const getSpentForCategory = (categoryId: string) => {
    return transactions?.filter(tx => tx.categoryId === categoryId).reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;
  };

  const totalBudgeted = expenseCategories.reduce((acc, cat) => {
    const env = envelopes?.find(e => e.categoryId === cat.id);
    return acc + (env?.amount || 0);
  }, 0);

  const totalSpent = expenseCategories.reduce((acc, cat) => {
    return acc + getSpentForCategory(cat.id);
  }, 0);

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Header with Month Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Gestion des Enveloppes</h2>
            <p className="text-gray-500 font-medium">Définissez et suivez vos budgets par catégorie</p>
          </div>

          <div className="flex items-center bg-white rounded-2xl border shadow-sm p-1">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="px-6 py-2 text-sm font-black text-gray-900 uppercase min-w-[160px] text-center">
              {monthName}
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Budgeté" 
            value={`${totalBudgeted.toLocaleString('fr-FR')} €`} 
            icon={<Target className="w-6 h-6" />}
            color="blue"
          />
          <StatCard 
            title="Total Dépensé" 
            value={`${totalSpent.toLocaleString('fr-FR')} €`} 
            icon={<TrendingDown className="w-6 h-6" />}
            color="rose"
          />
          <StatCard 
            title="Solde Restant" 
            value={`${(totalBudgeted - totalSpent).toLocaleString('fr-FR')} €`} 
            icon={<Wallet className="w-6 h-6" />}
            color={(totalBudgeted - totalSpent) >= 0 ? 'emerald' : 'rose'}
          />
        </div>

        {/* Envelopes List */}
        <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Détail par catégorie</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {expenseCategories.length} catégories
            </span>
          </div>
          <div className="divide-y">
            {envLoading ? (
              <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Chargement des enveloppes...</div>
            ) : expenseCategories.length === 0 ? (
              <div className="p-12 text-center text-gray-400">Aucune catégorie de dépense configurée.</div>
            ) : (
              expenseCategories.map(cat => {
                const env = envelopes?.find(e => e.categoryId === cat.id);
                const budget = env?.amount || 0;
                const spent = getSpentForCategory(cat.id);
                const remaining = budget - spent;
                const percent = budget > 0 ? (spent / budget) * 100 : 0;
                const isEditing = editingCategoryId === cat.id;

                return (
                  <div key={cat.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-black text-gray-900">{cat.name}</h4>
                          {percent > 100 && <AlertCircle className="w-5 h-5 text-rose-500 animate-bounce" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                          <span>Dépensé: <span className="text-gray-900 font-bold">{spent.toLocaleString('fr-FR')} €</span></span>
                          <span>•</span>
                          <span>Restant: <span className={`font-bold ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{remaining.toLocaleString('fr-FR')} €</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <div className="flex items-center bg-white rounded-xl p-1 border-2 border-blue-500 shadow-sm animate-in zoom-in-95 duration-200">
                            <input
                              autoFocus
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 bg-transparent border-none focus:ring-0 font-black text-right px-2"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(cat.id);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <div className="flex items-center gap-1 ml-2 pr-1">
                              <button onClick={() => saveEdit(cat.id)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEdit(cat.id, budget)}
                            className="flex flex-col items-end group/btn"
                          >
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-blue-600 transition-colors">Budget</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-gray-900">{budget.toLocaleString('fr-FR')} €</span>
                              <Edit2 className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span>Utilisation</span>
                        <span className={percent > 100 ? 'text-rose-600 font-black' : ''}>{Math.round(percent)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            percent > 100 ? 'bg-rose-500' : 
                            percent > 85 ? 'bg-amber-500' : 
                            'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const colorClasses = colors[color] || colors.blue;

  return (
    <div className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm flex items-center gap-4 ${colorClasses.split(' ')[2]}`}>
      <div className={`p-4 rounded-2xl ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
