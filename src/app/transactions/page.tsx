'use client';

import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useTransactions, useCategories, useAccounts, useCreateTransaction } from "@/presentation/hooks/useApi";
import { Plus, Search, Filter } from 'lucide-react';
import { useState } from "react";

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createTx = useCreateTransaction();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTx.mutateAsync({
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        date: new Date(formData.date),
        isFixed: false
      });
      setIsAdding(false);
      setFormData({ description: '', amount: '', categoryId: '', accountId: '', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Transactions</h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle opération</span>
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-xl border shadow-md animate-in slide-in-from-top duration-300">
            <h3 className="font-bold mb-4">Ajouter une transaction</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input 
                type="date" 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Désignation" 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none md:col-span-1"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
              <select 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                required
              >
                <option value="">Catégorie</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select 
                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.accountId}
                onChange={e => setFormData({...formData, accountId: e.target.value})}
                required
              >
                <option value="">Compte</option>
                {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="Montant (€)" 
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  required
                />
                <button 
                  type="submit" 
                  disabled={createTx.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {createTx.isPending ? '...' : 'OK'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-gray-50">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher une transaction..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-white transition-colors bg-gray-100">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b bg-gray-50">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Désignation</th>
                  <th className="px-6 py-3 font-medium">Catégorie</th>
                  <th className="px-6 py-3 font-medium">Compte</th>
                  <th className="px-6 py-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions?.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tx.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {categories?.find(c => c.id === tx.categoryId)?.name || 'Inconnue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {accounts?.find(a => a.id === tx.accountId)?.name || 'Inconnu'}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 italic">Chargement des transactions...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
