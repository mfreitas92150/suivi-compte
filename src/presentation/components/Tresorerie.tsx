'use client';

import { Account } from "@/core/domain/entities";
import { Wallet, Edit2, Check, X, Info, AlertCircle } from 'lucide-react';
import { useState, useEffect } from "react";

interface TresorerieProps {
  initialAccounts: Account[] | undefined;
  onSave?: (id: string, newBalance: number) => Promise<void>;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'CHECKING': return 'Courant';
    case 'SAVINGS': return 'Épargne';
    case 'INVESTMENT': return 'Investissement';
    case 'OTHER': return 'Autre';
    default: return type;
  }
};

export default function Tresorerie({ initialAccounts, onSave }: TresorerieProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialAccounts && initialAccounts.length > 0) {
      setAccounts(initialAccounts);
    }
  }, [initialAccounts]);

  const total = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const startEditing = (account: Account) => {
    setEditingId(account.id);
    setEditValue(account.balance.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSave = async (id: string) => {
    const val = parseFloat(editValue.replace(',', '.'));
    if (isNaN(val)) return;

    setIsSaving(true);
    try {
      // Mise à jour locale immédiate
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance: val } : a));
      
      if (onSave) {
        await onSave(id, val);
      }
      setEditingId(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center space-x-2 text-gray-800">
          <Wallet className="w-5 h-5 text-blue-600" />
          <span>Trésorerie</span>
        </h3>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-300 cursor-help" />
          <div className="absolute right-0 top-6 w-56 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none leading-relaxed">
            Mettez à jour les soldes de vos comptes ici. Cliquez sur le montant ou le crayon pour modifier.
          </div>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {accounts.map((account) => (
          <div 
            key={account.id} 
            className={`group flex justify-between items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
              editingId === account.id 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white'
            }`}
            onClick={() => editingId !== account.id && startEditing(account)}
          >
            <div className="flex-1">
              <p className="font-bold text-gray-900">{account.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{getTypeLabel(account.type)}</p>
            </div>

            <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
              {editingId === account.id ? (
                <div className="flex items-center space-x-1 animate-in slide-in-from-right-2 duration-200">
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-32 p-2 pr-8 bg-white border-2 border-blue-400 rounded-lg text-right font-black text-blue-700 outline-none shadow-md"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(account.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      disabled={isSaving}
                      autoFocus
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">€</span>
                  </div>
                  <button 
                    onClick={() => handleSave(account.id)}
                    disabled={isSaving}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md active:scale-95 transition-transform disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="p-2 bg-white text-gray-400 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-black tabular-nums ${account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                  <Edit2 className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl bg-gray-50/50">
            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm font-medium italic">Aucun compte à afficher</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t-4 border-double border-gray-100">
        <div className="flex justify-between items-center px-2">
          <div>
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] block mb-1">Total Disponible</span>
            <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Automatique</span>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black text-gray-900 tabular-nums tracking-tight">
              {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
