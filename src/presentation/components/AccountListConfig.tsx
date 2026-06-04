'use client';

import { useState } from 'react';
import { Account, AccountType } from '@/core/domain/entities';
import { Plus, Trash2, Save, X, Landmark, Wallet, CreditCard, Banknote, Loader2 } from 'lucide-react';

interface AccountListConfigProps {
  accounts: Account[];
  onCreate: (data: { name: string; type: AccountType; balance: number }) => void;
  onUpdate: (id: string, data: Partial<Account>) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
}

const getTypeLabel = (type: AccountType) => {
  switch (type) {
    case 'CHECKING': return 'Courant';
    case 'SAVINGS': return 'Épargne';
    case 'INVESTMENT': return 'Investissement';
    case 'OTHER': return 'Autre';
    default: return type;
  }
};

export default function AccountListConfig({ 
  accounts, 
  onCreate, 
  onUpdate, 
  onDelete,
  isProcessing = false 
}: AccountListConfigProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'CHECKING' as AccountType, balance: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Account>>({});

  const handleAdd = () => {
    if (!newAccount.name || isProcessing) return;
    onCreate(newAccount);
    setNewAccount({ name: '', type: 'CHECKING', balance: 0 });
    setIsAdding(false);
  };

  const startEdit = (account: Account) => {
    setEditingId(account.id);
    setEditForm(account);
  };

  const handleUpdate = () => {
    if (editingId && editForm.name && !isProcessing) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'CHECKING': return <Banknote className="w-4 h-4" />;
      case 'SAVINGS': return <Landmark className="w-4 h-4" />;
      case 'INVESTMENT': return <CreditCard className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Landmark className="w-5 h-5" /></div>
          Comptes Bancaires
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Ajouter un compte
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Formulaire d'ajout */}
        {isAdding && (
          <div className={`bg-indigo-50/50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 animate-in fade-in zoom-in-95 duration-200 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Nom du compte</label>
                <input 
                  type="text" 
                  placeholder="Ex: Boursorama Joint"
                  disabled={isProcessing}
                  className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-400 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Type</label>
                  <select 
                    className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-400 appearance-none text-gray-900 disabled:bg-gray-100"
                    value={newAccount.type}
                    disabled={isProcessing}
                    onChange={e => setNewAccount({...newAccount, type: e.target.value as AccountType})}
                  >
                    <option value="CHECKING">Courant</option>
                    <option value="SAVINGS">Épargne</option>
                    <option value="INVESTMENT">Investissement</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Solde Initial</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      disabled={isProcessing}
                      className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-indigo-400 text-gray-900 text-right pr-8 disabled:bg-gray-100"
                      value={newAccount.balance}
                      onChange={e => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') setIsAdding(false);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">€</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleAdd}
                  disabled={isProcessing || !newAccount.name}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center shadow-md shadow-indigo-100"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer la création'}
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-500 bg-white border-2 border-indigo-100 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des comptes */}
        {accounts.map(account => (
          <div key={account.id} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all ${isProcessing && editingId === account.id ? 'bg-gray-50 opacity-60' : ''}`}>
            {editingId === account.id ? (
              <div className="flex-1 space-y-4 p-2">
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Nom du compte</label>
                  <input 
                    type="text" 
                    disabled={isProcessing}
                    className="w-full bg-gray-50 border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 disabled:bg-gray-100 focus:border-indigo-400"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Type</label>
                    <select 
                      className="w-full bg-gray-50 border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 disabled:bg-gray-100 focus:border-indigo-400"
                      value={editForm.type}
                      disabled={isProcessing}
                      onChange={e => setEditForm({...editForm, type: e.target.value as AccountType})}
                    >
                      <option value="CHECKING">Courant</option>
                      <option value="SAVINGS">Épargne</option>
                      <option value="INVESTMENT">Investissement</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Solde actuel</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isProcessing}
                        className="w-full bg-gray-50 border-2 border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 text-right pr-8 disabled:bg-gray-100 focus:border-indigo-400"
                        value={editForm.balance}
                        onChange={e => setEditForm({...editForm, balance: parseFloat(e.target.value) || 0})}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleUpdate();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">€</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleUpdate} 
                    disabled={isProcessing}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-bold text-sm flex justify-center items-center disabled:opacity-50 shadow-md shadow-indigo-100"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer les modifications'}
                  </button>
                  <button 
                    onClick={() => setEditingId(null)} 
                    disabled={isProcessing}
                    className="px-4 py-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    account.type === 'CHECKING' ? 'bg-blue-50 text-blue-600' :
                    account.type === 'SAVINGS' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {getTypeIcon(account.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{account.name}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{getTypeLabel(account.type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900 mr-4">{account.balance.toLocaleString('fr-FR')} €</span>
                  <button 
                    onClick={() => startEdit(account)}
                    disabled={isProcessing}
                    className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-20"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(account.id)}
                    disabled={isProcessing}
                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-20"
                    >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {accounts.length === 0 && !isAdding && (
          <div className="py-10 text-center border-2 border-dashed rounded-3xl bg-gray-50">
            <p className="text-sm font-bold text-gray-400">Aucun compte configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
