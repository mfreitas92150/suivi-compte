'use client';

import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useAccounts, useTransactions, useCategories, useUpdateAccount, useAnnualStats } from "@/presentation/hooks/useApi";
import { useMonthNavigation } from "@/presentation/hooks/useMonthNavigation";
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
import { TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';

export default function DashboardOverview() {
  const { month, year } = useMonthNavigation();
  const { data: accounts } = useAccounts();
  const { data: transactions, isLoading: isTxLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const { data: annualStats, isLoading: isStatsLoading } = useAnnualStats(year);
  const updateAccount = useUpdateAccount();

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const shortMonthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  const handleUpdateBalance = async (id: string, balance: number) => {
    await updateAccount.mutateAsync({ id, balance });
  };

  // Calculate monthly totals from transactions
  const monthlyIncome = transactions
    ?.filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0) || 0;

  const monthlyExpense = transactions
    ?.filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;

  const totalBalance = accounts?.reduce((acc, a) => acc + a.balance, 0) || 0;

  // Format data for annual chart
  const chartData = annualStats?.map(stat => ({
    name: shortMonthNames[stat.month - 1],
    income: stat.income,
    expense: stat.expense,
  })) || [];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Vue d&apos;ensemble</h2>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{monthNames[month - 1]} {year}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenus ({monthNames[month - 1]})</p>
              <h3 className="text-2xl font-bold text-green-600">
                {isTxLoading ? '...' : `+${formatCurrency(monthlyIncome)}`}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dépenses ({monthNames[month - 1]})</p>
              <h3 className="text-2xl font-bold text-red-600">
                {isTxLoading ? '...' : `-${formatCurrency(monthlyExpense)}`}
              </h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Solde Global</p>
              <h3 className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6">Synthèse Annuelle {year}</h3>
            <div className="h-80">
              {isStatsLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Chargement...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar name="Revenus" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar name="Dépenses" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
            {isTxLoading ? (
               <div className="py-8 text-center text-gray-400">Chargement des transactions...</div>
            ) : (
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
                  {transactions?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        Aucune transaction ce mois-ci
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
