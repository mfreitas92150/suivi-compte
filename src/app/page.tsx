'use client';

import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useAccounts, useTransactions, useCategories, useUpdateAccount } from "@/presentation/hooks/useApi";
import Tresorerie from "@/presentation/components/Tresorerie";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Home() {
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: categories } = useCategories();
  const updateAccount = useUpdateAccount();

  const handleUpdateBalance = async (id: string, balance: number) => {
    await updateAccount.mutateAsync({ id, balance });
  };

  // Mock data for annual chart
  const annualData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Fév', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Avr', income: 2780, expense: 3908 },
    { name: 'Mai', income: 1890, expense: 4800 },
    { name: 'Juin', income: 2390, expense: 3800 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Vue d'ensemble</h2>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Juin 2026</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenus (Juin)</p>
              <h3 className="text-2xl font-bold text-green-600">+2 450 €</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dépenses (Juin)</p>
              <h3 className="text-2xl font-bold text-red-600">-1 820 €</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mois en cours</p>
              <h3 className="text-2xl font-bold">Juin 2026</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6">Synthèse Annuelle</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar name="Revenus" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Dépenses" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accounts List (Trésorerie) */}
          <Tresorerie initialAccounts={accounts} onSave={handleUpdateBalance} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Dernières Opérations</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wider border-b">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Désignation</th>
                  <th className="pb-3 font-medium">Catégorie</th>
                  <th className="pb-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions?.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm text-gray-600">
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 font-medium text-gray-800">{tx.description}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {categories?.find(c => c.id === tx.categoryId)?.name || 'Inconnue'}
                      </span>
                    </td>
                    <td className={`py-4 text-right font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
