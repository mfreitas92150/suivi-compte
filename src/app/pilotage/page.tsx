'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useCategories, useEnvelopes, useTransactions, useUpsertEnvelope, useAccounts, useUpdateAccount, useRecurringTransactions, useMonthlyItems, useCreateMonthlyItem, useUpdateMonthlyItem, useDeleteMonthlyItem, useInitializeMonth } from "@/presentation/hooks/useApi";
import { Wallet, ChevronDown, Filter, CheckCircle2, Circle, TrendingUp, TrendingDown, Landmark, ReceiptText, Plus, Loader2, Trash2, RefreshCcw } from 'lucide-react';

// --- Types ---
interface ChecklistItem {
  id: string;
  label: string;
  amount: number;
  checked: boolean;
  recurringId?: string;
}

export default function PilotagePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const [localYear, setLocalYear] = useState(year);

  // --- Hooks API ---
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const updateAccount = useUpdateAccount();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: envelopes, isLoading: envLoading } = useEnvelopes({ month, year });
  const upsertEnvelope = useUpsertEnvelope();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions({ month, year });
  const { data: recurringData, isLoading: recurringLoading } = useRecurringTransactions();
  
  const { data: monthlyItems, isLoading: itemsLoading } = useMonthlyItems({ month, year });
  const createMonthlyItem = useCreateMonthlyItem();
  const updateMonthlyItem = useUpdateMonthlyItem();
  const deleteMonthlyItem = useDeleteMonthlyItem();
  const initializeMonth = useInitializeMonth();

  const [localBalances, setLocalBalances] = useState<Record<string, number>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isPageLoading = accountsLoading || categoriesLoading || envLoading || transactionsLoading || recurringLoading || itemsLoading;
  const isInitialized = (envelopes && envelopes.length > 0) || (monthlyItems && monthlyItems.length > 0);

  const handleInitialize = async () => {
    try {
      await initializeMonth.mutateAsync({ month, year });
    } catch (err: any) {
      alert(err.response?.data?.error || "Erreur lors de l'initialisation");
    }
  };

  const handleApplyTemplate = async () => {
    if (!categories) return;
    const expenseCats = categories.filter(c => c.type === 'EXPENSE' && c.defaultAmount !== null && c.defaultAmount !== undefined);
    if (expenseCats.length === 0) {
      alert("Aucun template n'est défini dans la configuration.");
      return;
    }

    if (confirm(`Voulez-vous appliquer le template pour ${expenseCats.length} enveloppes ?`)) {
      for (const cat of expenseCats) {
        try {
          await upsertEnvelope.mutateAsync({
            categoryId: cat.id,
            amount: cat.defaultAmount!,
            month,
            year
          });
        } catch (err) {
          console.error(`Failed to apply template for category ${cat.name}:`, err);
        }
      }
    }
  };

  // --- Derived Data ---
  const fixedIncomes = useMemo(() => {
    if (!monthlyItems) return [];
    return monthlyItems
      .filter(i => i.type === 'INCOME' && i.recurringId)
      .map(i => ({ id: i.id, label: i.label, amount: i.amount, checked: i.checked, recurringId: i.recurringId }));
  }, [monthlyItems]);

  const exceptionalIncomes = useMemo(() => {
    if (!monthlyItems) return [];
    return monthlyItems
      .filter(i => i.type === 'INCOME' && !i.recurringId)
      .map(i => ({ id: i.id, label: i.label, amount: i.amount, checked: i.checked }));
  }, [monthlyItems]);

  const fixedCharges = useMemo(() => {
    if (!monthlyItems || !recurringData) return [];
    return monthlyItems
      .filter(i => i.type === 'EXPENSE' && i.recurringId)
      .map(i => {
        const recurring = recurringData.find(r => r.id === i.recurringId);
        return { 
          id: i.id, 
          label: i.label, 
          amount: i.amount, 
          checked: i.checked, 
          recurringId: i.recurringId,
          group: recurring?.group 
        };
      });
  }, [monthlyItems, recurringData]);

  const exceptionalCharges = useMemo(() => {
    if (!monthlyItems) return [];
    return monthlyItems
      .filter(i => i.type === 'EXPENSE' && !i.recurringId)
      .map(i => ({ id: i.id, label: i.label, amount: i.amount, checked: i.checked }));
  }, [monthlyItems]);

  const chargeGroups = useMemo(() => {
    if (!fixedCharges) return [];
    const groups = Array.from(new Set(fixedCharges.filter(r => r.group).map(r => r.group!.name)));
    return groups.map(groupName => ({
      label: groupName,
      ids: fixedCharges.filter(r => r.group?.name === groupName).map(r => r.id)
    }));
  }, [fixedCharges]);

  // --- Logic ---
  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const checkingAccounts = useMemo(() => {
    return accounts?.filter(a => a.type === 'CHECKING') || [];
  }, [accounts]);

  const totalTreasury = checkingAccounts.reduce((acc, a) => {
    const localBal = localBalances[a.id];
    return acc + (localBal !== undefined ? localBal : a.balance);
  }, 0);
  
  const incomesToCome = [...fixedIncomes, ...exceptionalIncomes]
    .filter(i => !i.checked)
    .reduce((acc, i) => acc + i.amount, 0);
    
  const chargesToCome = [...fixedCharges, ...exceptionalCharges]
    .filter(i => !i.checked)
    .reduce((acc, i) => acc + i.amount, 0);

  const totalFixedIncomes = fixedIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalFixedCharges = fixedCharges.reduce((acc, i) => acc + i.amount, 0);

  const resteAVivre = totalTreasury + incomesToCome - chargesToCome;

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const years = [2026, 2025, 2024];

  const getSpentForCategory = (categoryId: string) => {
    return transactions?.filter(tx => tx.categoryId === categoryId).reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;
  };

  const handleToggleCheck = async (id: string, checked: boolean) => {
    await updateMonthlyItem.mutateAsync({ id, month, year, checked: !checked });
  };

  const handleUpdateAmount = async (id: string, amount: number) => {
    await updateMonthlyItem.mutateAsync({ id, month, year, amount });
  };

  const handleAddItem = async (type: 'INCOME' | 'EXPENSE') => {
    await createMonthlyItem.mutateAsync({
      label: 'Nouveau...',
      amount: 0,
      type,
      month,
      year,
      checked: false
    });
  };

  const handleUpdateLabel = useCallback(async (id: string, label: string) => {
    await updateMonthlyItem.mutateAsync({ id, month, year, label });
  }, [month, year, updateMonthlyItem]);

  const handleDeleteItem = async (id: string) => {
    if (confirm("Supprimer cet élément ?")) {
      await deleteMonthlyItem.mutateAsync({ id, month, year });
    }
  };

  const budgetAVentiler = totalFixedIncomes - totalFixedCharges;
  const totalVentile = expenseCategories.reduce((acc, cat) => acc + (envelopes?.find(e => e.categoryId === cat.id)?.amount || 0), 0);
  const restantApresVentilation = budgetAVentiler - totalVentile;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Pilotage budgétaire</p>
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
        </div>

        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 bg-white/50 rounded-[2rem] border-2 border-dashed border-gray-100 p-10">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-lg font-black uppercase tracking-tight text-gray-900">Chargement des données</p>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">Synchronisation avec le NAS...</p>
            </div>
          </div>
        ) : !isInitialized ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-10">
            <div className="p-6 bg-blue-50 rounded-full">
              <RefreshCcw className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase">Mois non initialisé</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Ce mois ne contient aucune donnée de pilotage. Souhaitez-vous récupérer les informations des templates (revenus, charges et enveloppes) ?
              </p>
            </div>
            <button 
              onClick={handleInitialize}
              disabled={initializeMonth.isPending}
              className="px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {initializeMonth.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Initialiser le mois
            </button>
          </div>
        ) : (
          <>
            {/* TOP ROW: TREASURY & RESTE A VIVRE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Trésorerie" icon={<Landmark className="w-4 h-4" />}>
              <div className="space-y-2">
                {checkingAccounts.map(account => (
                  <div key={account.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-xl border border-gray-100 group">
                    <span className="text-sm font-bold text-gray-700">{account.name}</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        key={`${account.id}-${account.balance}`}
                        defaultValue={account.balance}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setLocalBalances(prev => ({ ...prev, [account.id]: isNaN(val) ? 0 : val }));
                        }}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val !== account.balance) {
                            updateAccount.mutate({ id: account.id, balance: val });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        className="w-28 text-right bg-transparent border-b border-transparent focus:border-blue-400 focus:outline-none font-black text-sm transition-colors text-gray-900"
                      />
                      <span className="text-xs font-bold text-gray-500">€</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-xl shadow-md mt-2">
                  <span className="font-black uppercase text-[10px] tracking-widest">Total Trésorerie</span>
                  <span className="text-lg font-black">{totalTreasury.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </Section>

          {(() => {
            const getBgColor = () => {
              if (resteAVivre > 500) return 'bg-emerald-600';
              if (resteAVivre >= 0) return 'bg-orange-500';
              return 'bg-rose-600';
            };
            const getBorderColor = () => {
              if (resteAVivre > 500) return 'border-emerald-500/50';
              if (resteAVivre >= 0) return 'border-orange-400/50';
              return 'border-rose-500/50';
            };

            return (
              <div className={`${getBgColor()} p-6 rounded-[1.5rem] text-white shadow-lg relative overflow-hidden group h-full flex flex-col justify-center transition-colors duration-500`}>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Reste à vivre actuel</p>
                  <h3 className="text-4xl font-black mb-4">{resteAVivre.toLocaleString('fr-FR')} €</h3>
                  <div className={`grid grid-cols-2 gap-6 text-[10px] font-bold border-t ${getBorderColor()} pt-4`}>
                    <div>
                      <p className="opacity-70 mb-0.5 uppercase tracking-tighter">Encaissements à venir</p>
                      <p className="text-lg">+{incomesToCome.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                      <p className="opacity-70 mb-0.5 uppercase tracking-tighter">Décaissements à venir</p>
                      <p className="text-lg">-{chargesToCome.toLocaleString('fr-FR')} €</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Section title="Revenus fixes" icon={<TrendingUp className="w-4 h-4" />} badge={`${totalFixedIncomes.toLocaleString('fr-FR')} €`}>
              <Checklist 
                items={fixedIncomes} 
                onToggle={(id, checked) => handleToggleCheck(id, checked)} 
                accentColor="blue" 
                updatingId={updateMonthlyItem.isPending ? updateMonthlyItem.variables?.id : null}
              />
            </Section>
            
            <Section title="Revenus exceptionnels" icon={<TrendingUp className="w-4 h-4" />} color="emerald" onAdd={() => handleAddItem('INCOME')}>
              <Checklist 
                items={exceptionalIncomes} 
                onToggle={(id, checked) => handleToggleCheck(id, checked)} 
                onUpdateAmount={(id, val) => handleUpdateAmount(id, val)}
                onUpdateLabel={handleUpdateLabel}
                onDelete={(id) => handleDeleteItem(id)}
                accentColor="emerald" 
                emptyMessage="Aucun revenu exceptionnel" 
                isEditableLabel={true}
                updatingId={updateMonthlyItem.isPending ? updateMonthlyItem.variables?.id : null}
              />
            </Section>
          </div>

          <div className="space-y-6">
            <Section title="Charges fixes" icon={<TrendingDown className="w-4 h-4" />} badge={`${totalFixedCharges.toLocaleString('fr-FR')} €`} color="rose">
              <div className="space-y-4">
                {chargeGroups.map(group => {
                  const groupItems = fixedCharges.filter(item => group.ids.includes(item.id));
                  const paidInGroup = groupItems.filter(i => i.checked).reduce((acc, i) => acc + i.amount, 0);
                  const remainingInGroup = groupItems.filter(i => !i.checked).reduce((acc, i) => acc + i.amount, 0);
                  const isExpanded = expandedGroups[group.label];
                  
                  return (
                    <div key={group.label} className="space-y-1">
                      <button 
                        onClick={() => toggleGroup(group.label)}
                        className="w-full flex justify-between items-center px-2 py-2 bg-rose-50/50 rounded-lg hover:bg-rose-100/50 transition-colors group/btn"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown className={`w-3 h-3 text-rose-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider text-left">{group.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Payé</p>
                            <p className="text-[10px] font-black text-gray-500">{paidInGroup.toLocaleString('fr-FR')}€</p>
                          </div>
                          <div className="text-right border-l border-rose-200 pl-3">
                            <p className="text-[8px] font-bold text-rose-400 uppercase leading-none">Reste</p>
                            <p className={`text-[10px] font-black ${remainingInGroup > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                              {remainingInGroup.toLocaleString('fr-FR')}€
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="animate-in slide-in-from-top-1 duration-200">
                          <Checklist 
                            items={groupItems} 
                            onToggle={(id, checked) => handleToggleCheck(id, checked)} 
                            accentColor="rose" 
                            updatingId={updateMonthlyItem.isPending ? updateMonthlyItem.variables?.id : null}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Charges exceptionnelles" icon={<TrendingDown className="w-4 h-4" />} color="rose" onAdd={() => handleAddItem('EXPENSE')}>
              <Checklist 
                items={exceptionalCharges} 
                onToggle={(id, checked) => handleToggleCheck(id, checked)} 
                onUpdateAmount={(id, val) => handleUpdateAmount(id, val)}
                onUpdateLabel={handleUpdateLabel}
                onDelete={(id) => handleDeleteItem(id)}
                accentColor="rose" 
                emptyMessage="Aucune charge exceptionnelle" 
                isEditableLabel={true}
                updatingId={updateMonthlyItem.isPending ? updateMonthlyItem.variables?.id : null}
              />
            </Section>
          </div>

          <div className="space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet className="w-4 h-4" /></div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight uppercase">Suivi Enveloppes</h3>
                </div>
                <button 
                  onClick={handleApplyTemplate}
                  disabled={upsertEnvelope.isPending}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {upsertEnvelope.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Template
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end border-b pb-2">
                  <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Préparation</span>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-600 uppercase">A ventiler</p>
                    <p className="text-sm font-black text-emerald-600">{budgetAVentiler.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {expenseCategories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center text-xs border-b border-gray-100/50 pb-1">
                      <span className="text-gray-700 font-medium truncate pr-1">{cat.name}</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          key={`${cat.id}-${envelopes?.find(e => e.categoryId === cat.id)?.amount}`}
                          className="w-16 text-right bg-transparent border-b border-transparent focus:border-indigo-400 focus:outline-none font-bold text-gray-900"
                          defaultValue={envelopes?.find(e => e.categoryId === cat.id)?.amount || 0}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            const current = envelopes?.find(e => e.categoryId === cat.id)?.amount || 0;
                            console.log("PilotagePage.envelopeUpdate", { categoryId: cat.id, val, current });
                            if (!isNaN(val) && val !== current) {
                              upsertEnvelope.mutate({
                                categoryId: cat.id,
                                amount: val,
                                month,
                                year
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          }}
                        />
                        <span className="text-[10px] font-bold text-gray-400">€</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-gray-50 rounded-xl flex justify-between items-center mt-2">
                   <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Reste après ventilation</span>
                   <span className={`text-xs font-black ${restantApresVentilation < 0 ? 'text-rose-500' : 'text-gray-900'}`}>{restantApresVentilation.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-100">
                <div className="flex justify-between items-end border-b pb-2">
                  <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Restants</span>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-600 uppercase">Dispo réel</p>
                    <p className="text-sm font-black text-blue-600">{resteAVivre.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {expenseCategories.map(cat => {
                      const env = envelopes?.find(e => e.categoryId === cat.id);
                      const budget = env?.amount || 0;
                      const spent = getSpentForCategory(cat.id);
                      const remaining = budget - spent;
                      const percent = budget > 0 ? (spent / budget) * 100 : 0;
                      
                      return (
                        <div key={cat.id} className="group">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                            <span className={`font-black ${remaining < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                              {remaining.toLocaleString('fr-FR')} €
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${remaining < 0 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Section({ title, icon, children, badge, color = 'blue', onAdd }: { title: string, icon: React.ReactNode, children: React.ReactNode, badge?: string, color?: string, onAdd?: () => void }) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">{title}</h3>
          {onAdd && (
            <button onClick={onAdd} className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${colorMap[color]}`}>
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        {badge && <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${colorMap[color]}`}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string, checked: boolean) => void;
  onUpdateAmount?: (id: string, amount: number) => void;
  onUpdateLabel?: (id: string, label: string) => void;
  onDelete?: (id: string) => void;
  accentColor: string;
  emptyMessage?: string;
  isEditableLabel?: boolean;
  updatingId?: string | null;
}

function Checklist({ items, onToggle, onUpdateAmount, onUpdateLabel, onDelete, accentColor, emptyMessage = "Rien à afficher", isEditableLabel = false, updatingId = null }: ChecklistProps) {
  const [editingLabel, setEditingLabel] = useState<{ id: string, value: string } | null>(null);

  useEffect(() => {
    if (!editingLabel) return;

    // Ne pas déclencher si la valeur est la même que celle d'origine
    const originalItem = items.find(i => i.id === editingLabel.id);
    if (originalItem?.label === editingLabel.value) return;

    const timer = setTimeout(() => {
      onUpdateLabel?.(editingLabel.id, editingLabel.value);
    }, 500);

    return () => clearTimeout(timer);
  }, [editingLabel?.id, editingLabel?.value, onUpdateLabel, items]);

  if (items.length === 0) return <p className="text-center py-4 text-gray-300 italic text-[10px]">{emptyMessage}</p>;
  
  const colors: any = { blue: 'text-blue-600', emerald: 'text-emerald-600', rose: 'text-rose-600' };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id} className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-all group border border-transparent">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <button 
              onClick={() => onToggle(item.id, item.checked)} 
              disabled={updatingId === item.id}
              className="flex items-center disabled:opacity-50"
            >
              {updatingId === item.id ? (
                <Loader2 className={`w-4 h-4 animate-spin ${colors[accentColor]}`} />
              ) : item.checked ? (
                <CheckCircle2 className={`w-4 h-4 ${colors[accentColor]}`} />
              ) : (
                <Circle className="w-4 h-4 text-gray-200 group-hover:text-gray-300" />
              )}
            </button>
            {isEditableLabel && !item.checked ? (
              <input
                type="text"
                value={editingLabel?.id === item.id ? editingLabel.value : item.label}
                onChange={(e) => setEditingLabel({ id: item.id, value: e.target.value })}
                onBlur={() => setEditingLabel(null)}
                className="text-[11px] font-bold text-gray-700 bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none w-full"
              />
            ) : (
              <span className={`text-[11px] font-bold ${item.checked ? 'text-gray-600 line-through' : 'text-gray-700'}`}>{item.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              {isEditableLabel && !item.checked ? (
                <input
                  type="number"
                  defaultValue={item.amount}
                  onBlur={(e) => onUpdateAmount?.(item.id, parseFloat(e.target.value))}
                  className="w-16 text-right bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none font-black text-[11px] text-gray-900"
                />
              ) : (
                <span className={`text-right font-black text-[11px] ${item.checked ? 'text-gray-300' : 'text-gray-900'}`}>
                  {item.amount.toLocaleString('fr-FR')}
                </span>
              )}
              <span className={`text-[9px] font-bold ${item.checked ? 'text-gray-200' : 'text-gray-600'}`}>€</span>
            </div>
            {onDelete && (
              <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
