'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useTransactions, useCategories, useAccounts, useCreateTransaction, useDeleteTransaction, useEnvelopes, useUpdateTransaction } from "@/presentation/hooks/useApi";
import { 
  Plus, Search, ChevronDown, Calendar, Tag, CreditCard, 
  Loader2, Trash2, X, CheckCircle2, Circle
} from 'lucide-react';

export default function TransactionsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);
  
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const [localYear, setLocalYear] = useState(year);

  // --- Hooks API ---
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: envelopes } = useEnvelopes({ month, year });
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();
  const updateTx = useUpdateTransaction();

  const [isAdding, setIsAdding] = useState(false);
  const addFormRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Scroll to form when adding
  useEffect(() => {
    if (isAdding) {
      // Small timeout to ensure the element is rendered and animation has started
      const timer = setTimeout(() => {
        addFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdding]);

  // Handle Escape key to cancel adding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdding) {
        setIsAdding(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding]);

  // --- Date Selector Helpers ---
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const years = [2026, 2025, 2024];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Logic ---
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(tx => 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories?.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm, categories]);

  const expenseCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => c.type === 'EXPENSE');
  }, [categories]);

  const envelopesSummary = useMemo(() => {
    if (!categories || !envelopes || !transactions) return [];
    
    return categories
      .filter(c => c.type === 'EXPENSE')
      .map(cat => {
        const env = envelopes.find(e => e.categoryId === cat.id);
        const budget = env?.amount || 0;
        const catTransactions = transactions.filter(tx => tx.categoryId === cat.id);
        
        const spentValidated = catTransactions
          .filter(tx => tx.checked)
          .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
        const spentTotal = catTransactions
          .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
        
        return {
          id: cat.id,
          name: cat.name,
          budget,
          spentValidated,
          spentTotal,
          remainingReal: budget - spentValidated,
          remainingTheo: budget - spentTotal,
          percentValidated: budget > 0 ? (spentValidated / budget) * 100 : 0,
          percentTotal: budget > 0 ? (spentTotal / budget) * 100 : 0
        };
      })
      .sort((a, b) => b.budget - a.budget);
  }, [categories, envelopes, transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Force amount to be negative (expense) by default
      const enteredAmount = parseFloat(formData.amount);
      const amount = enteredAmount > 0 ? -enteredAmount : enteredAmount;

      await createTx.mutateAsync({
        description: formData.description,
        amount: amount,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
        date: new Date(formData.date),
        isFixed: false,
        checked: false
      });
      setIsAdding(false);
      setFormData({ 
        description: '', 
        amount: '', 
        categoryId: '', 
        accountId: '', 
        date: new Date().toISOString().split('T')[0] 
      });
    } catch {
      alert("Erreur lors de la création");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cette transaction ?")) {
      await deleteTx.mutateAsync(id);
    }
  };

  const handleToggleChecked = async (txId: string, currentChecked: boolean) => {
    await updateTx.mutateAsync({ id: txId, checked: !currentChecked });
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-10 px-4">
        
        {/* HEADER & DATE SELECTOR */}
        <div className="flex justify-between items-center">
          <div className="relative" ref={selectorRef}>
            <button 
              onClick={() => { setIsSelectorOpen(!isSelectorOpen); setLocalYear(year); }}
              className="group flex flex-col items-start focus:outline-none"
            >
              <h2 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-2 uppercase">
                {monthNames[month - 1]} <span className="text-blue-600">{year}</span>
                <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
              </h2>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Journal des transactions</p>
            </button>

            {isSelectorOpen && (
              <div className="absolute top-full left-0 mt-4 w-[320px] bg-white border rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex h-80">
                  <div className="w-1/3 border-r bg-gray-50/50 flex flex-col">
                    <div className="p-3 text-[10px] font-black uppercase text-gray-600 text-center border-b">Années</div>
                    <div className="flex-1 overflow-y-auto">
                      {years.map(y => (
                        <button key={y} onClick={() => setLocalYear(y)} className={`w-full p-4 text-sm font-black transition-all ${localYear === y ? 'bg-white text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>{y}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="p-3 text-[10px] font-black uppercase text-gray-600 text-center border-b">Mois ({localYear})</div>
                    <div className="flex-1 overflow-y-auto p-2">
                      {monthNames.map((m, i) => (
                        <button key={m} onClick={() => { setCurrentDate(new Date(localYear, i, 1)); setIsSelectorOpen(false); }} className={`w-full p-3 text-sm text-left rounded-xl transition-all ${month === i + 1 && year === localYear ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-blue-50'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`${isAdding ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white'} px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:opacity-80 transition-all shadow-lg`}
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Annuler' : 'Nouvelle opération'}
          </button>
        </div>

        {/* SUMMARY CARDS (ENVELOPES RECAP) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {envelopesSummary.length > 0 ? (
            envelopesSummary.map((item) => (
              <div 
                key={item.id} 
                className={`${item.remainingReal < 0 ? 'bg-rose-50 border-rose-200 shadow-rose-100' : 'bg-white border-gray-100'} p-4 rounded-2xl border shadow-sm space-y-3 transition-all`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black uppercase tracking-widest truncate max-w-[120px] ${item.remainingReal < 0 ? 'text-rose-700' : 'text-gray-500'}`}>{item.name}</span>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.remainingReal < 0 ? 'bg-rose-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.remainingReal.toLocaleString('fr-FR')} € <span className="text-[8px] opacity-80 uppercase ml-1">Réel</span>
                    </span>
                    {item.remainingReal !== item.remainingTheo && (
                      <span className={`text-[9px] font-bold mt-1 ${item.remainingTheo < 0 ? 'text-rose-400' : 'text-gray-400'}`}>
                        {item.remainingTheo.toLocaleString('fr-FR')} € <span className="text-[8px] opacity-80 uppercase">Théo.</span>
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black ${item.remainingReal < 0 ? 'text-rose-900' : 'text-gray-900'}`}>{item.spentValidated.toLocaleString('fr-FR')} €</span>
                    <span className={`text-[10px] font-bold ${item.remainingReal < 0 ? 'text-rose-400' : 'text-gray-400'}`}>/ {item.budget.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    {/* Layer 1: Theoretical */}
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
                        item.remainingTheo < 0 ? 'bg-rose-200' : 'bg-blue-200'
                      }`}
                      style={{ width: `${Math.min(item.percentTotal, 100)}%` }}
                    />
                    {/* Layer 2: Validated */}
                    <div 
                      className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
                        item.remainingReal < 0 ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(item.percentValidated, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-50 p-6 rounded-2xl border border-dashed text-center">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Aucune enveloppe définie pour ce mois</p>
            </div>
          )}
        </div>

        {isAdding && (
          <div ref={addFormRef} className="bg-white p-8 rounded-[2rem] border-2 border-blue-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Plus className="w-6 h-6" /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Ajouter une transaction</h3>
              </div>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-6 w-full">
                {/* Line 1: Date, Category, Account */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm text-gray-900"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Catégorie</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm appearance-none text-gray-900"
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Compte</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm appearance-none text-gray-900"
                      value={formData.accountId}
                      onChange={e => setFormData({...formData, accountId: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Line 2: Designation, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Désignation</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Courses Carrefour" 
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm text-gray-900"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Montant</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-sm text-gray-900"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Button: Separated */}
              <div className="w-full md:w-auto self-stretch flex items-end">
                <button 
                  type="submit" 
                  disabled={createTx.isPending}
                  className="w-full md:w-24 h-[calc(100%-24px)] bg-blue-600 text-white rounded-3xl font-black uppercase hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex flex-col items-center justify-center gap-2"
                >
                  {createTx.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-[10px]">Valider</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-wrap gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher une transaction ou une catégorie..." 
                className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold shadow-sm text-gray-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
              {filteredTransactions.length} opérations trouvées
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] border-b bg-white">
                  <th className="px-8 py-5 w-10"></th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Désignation</th>
                  <th className="px-8 py-5">Catégorie</th>
                  <th className="px-8 py-5">Compte</th>
                  <th className="px-8 py-5 text-right">Montant</th>
                  <th className="px-8 py-5 text-right w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((tx) => {
                  const category = categories?.find(c => c.id === tx.categoryId);
                  const account = accounts?.find(a => a.id === tx.accountId);
                  
                  return (
                    <tr key={tx.id} className={`group hover:bg-blue-50/30 transition-colors ${tx.checked ? 'opacity-60 bg-gray-50/30' : ''}`}>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => handleToggleChecked(tx.id, tx.checked)}
                          disabled={updateTx.isPending && updateTx.variables?.id === tx.id}
                          className={`p-1 rounded-full transition-all disabled:opacity-50 ${tx.checked ? 'text-rose-600 bg-rose-50' : 'text-gray-200 hover:text-blue-500 hover:bg-blue-50'}`}
                        >
                          {updateTx.isPending && updateTx.variables?.id === tx.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                          ) : tx.checked ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-white transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-sm font-bold ${tx.checked ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className={`text-sm font-bold ${tx.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{tx.description}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-gray-300" />
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest group-hover:bg-white transition-colors ${tx.checked ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {category?.name || 'Sans catégorie'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                          <span className={`text-xs font-bold ${tx.checked ? 'text-gray-300' : 'text-gray-600'}`}>{account?.name || 'Compte inconnu'}</span>
                        </div>
                      </td>
                      <td className={`px-8 py-5 text-right font-black text-base ${tx.checked ? 'text-gray-300' : tx.amount < 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-gray-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                
                {transactionsLoading && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">Chargement des opérations...</p>
                      </div>
                    </td>
                  </tr>
                )}
                
                {!transactionsLoading && filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Search className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm font-bold">Aucune transaction trouvée</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">Essayez de modifier vos filtres ou la période</p>
                      </div>
                    </td>
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
