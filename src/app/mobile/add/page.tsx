'use client';

import { useAccounts, useCategories, useCreateTransaction } from "@/presentation/hooks/useApi";
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MobileAddPage() {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTx.mutateAsync({
        description: formData.description,
        amount: -Math.abs(parseFloat(formData.amount)), // Force negative for expenses
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        date: new Date(formData.date),
        isFixed: false
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">C'est noté !</h2>
        <p className="text-gray-500 mt-2">La dépense a été enregistrée.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b p-4 flex items-center">
        <Link href="/" className="p-2 -ml-2 text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="flex-1 text-center font-bold text-lg pr-8">Nouvelle Dépense</h1>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field (Focus of the page) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-500 mb-1 text-center">Montant</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                autoFocus
                className="w-full text-center text-5xl font-bold text-gray-800 outline-none placeholder-gray-200"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
              <span className="absolute right-4 bottom-2 text-2xl font-medium text-gray-400">€</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quoi ?</label>
              <input 
                type="text" 
                placeholder="Ex: Boulangerie, Essence..." 
                className="w-full p-4 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                <select 
                  className="w-full p-4 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Compte</label>
                <select 
                  className="w-full p-4 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner</option>
                  {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={createTx.isPending}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {createTx.isPending ? (
              <span>Enregistrement...</span>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
