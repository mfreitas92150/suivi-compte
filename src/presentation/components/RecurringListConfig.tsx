'use client';

import { useState } from 'react';
import { RecurringTransaction, Category, ExpenseGroup } from '@/core/domain/entities';
import { Plus, Trash2, Save, X, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface RecurringListConfigProps {
  title: string;
  items: RecurringTransaction[];
  categories: Category[];
  groups?: ExpenseGroup[];
  type: 'INCOME' | 'EXPENSE';
  onCreate: (data: { label: string; amount: number; type: 'INCOME' | 'EXPENSE'; categoryId?: string; groupId?: string }) => void;
  onUpdate: (id: string, data: Partial<RecurringTransaction>) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
}

export default function RecurringListConfig({ 
  title,
  items, 
  categories,
  groups = [],
  type,
  onCreate, 
  onUpdate, 
  onDelete,
  isProcessing = false 
}: RecurringListConfigProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', amount: 0, categoryId: '', groupId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RecurringTransaction>>({});

  const handleAdd = () => {
    if (!newItem.label || isProcessing) return;
    onCreate({ 
      ...newItem, 
      type, 
      categoryId: newItem.categoryId || undefined,
      groupId: newItem.groupId || undefined
    });
    setNewItem({ label: '', amount: 0, categoryId: '', groupId: '' });
    setIsAdding(false);
  };

  const startEdit = (item: RecurringTransaction) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleUpdate = () => {
    if (editingId && editForm.label && !isProcessing) {
      onUpdate(editingId, editForm);
      setEditingId(null);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <div className={`p-2 rounded-xl ${type === 'INCOME' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
            {type === 'INCOME' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          {title}
          <span className={`ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${type === 'INCOME' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            Total : {totalAmount.toLocaleString('fr-FR')} €
          </span>
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 ${
              type === 'INCOME' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' 
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
            }`}
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Formulaire d'ajout */}
        {isAdding && (
          <div className={`p-6 rounded-2xl border-2 border-dashed animate-in fade-in zoom-in-95 duration-200 ${
            type === 'INCOME' ? 'bg-blue-50/50 border-blue-200' : 'bg-rose-50/50 border-rose-200'
          } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 ${type === 'INCOME' ? 'text-blue-400' : 'text-rose-400'}`}>Libellé</label>
                <input 
                  type="text" 
                  placeholder={type === 'INCOME' ? "Ex: Salaire" : "Ex: Loyer, Netflix..."}
                  disabled={isProcessing}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-400 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
                  value={newItem.label}
                  onChange={e => setNewItem({...newItem, label: e.target.value})}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {type === 'EXPENSE' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 text-rose-400">Groupe</label>
                    <select 
                      className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-400 text-gray-900 appearance-none disabled:bg-gray-100"
                      value={newItem.groupId}
                      disabled={isProcessing}
                      onChange={e => setNewItem({...newItem, groupId: e.target.value})}
                    >
                      <option value="">Sans groupe</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 ${type === 'INCOME' ? 'text-blue-400' : 'text-rose-400'}`}>Montant prévu</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01"
                      disabled={isProcessing}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-blue-400 text-gray-900 text-right pr-8 disabled:bg-gray-100"
                      value={newItem.amount}
                      onChange={e => setNewItem({...newItem, amount: parseFloat(e.target.value) || 0})}
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
                  disabled={isProcessing || !newItem.label}
                  className={`flex-1 rounded-xl py-2 font-bold text-sm text-white disabled:opacity-50 flex justify-center items-center shadow-md ${
                    type === 'INCOME' 
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' 
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                  }`}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer l\'ajout'}
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-500 bg-white border-2 border-gray-100 hover:bg-gray-50 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des items */}
        {items.map(item => {
          const isCurrentlyProcessing = isProcessing && editingId === item.id;
          
          return (
            <div key={item.id} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all ${isCurrentlyProcessing ? 'bg-gray-50 opacity-60' : ''}`}>
              {editingId === item.id ? (
                <div className="flex-1 space-y-4 p-2">
                  <div>
                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 ${type === 'INCOME' ? 'text-blue-400' : 'text-rose-400'}`}>Libellé</label>
                    <input 
                      type="text" 
                      disabled={isProcessing}
                      className="w-full bg-gray-50 border-2 border-blue-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 disabled:bg-gray-100 focus:border-blue-400"
                      value={editForm.label}
                      onChange={e => setEditForm({...editForm, label: e.target.value})}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {type === 'EXPENSE' && (
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 text-rose-400">Groupe</label>
                        <select 
                          className="w-full bg-gray-50 border-2 border-blue-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 appearance-none disabled:bg-gray-100 focus:border-blue-400"
                          value={editForm.groupId || ''}
                          disabled={isProcessing}
                          onChange={e => setEditForm({...editForm, groupId: e.target.value || undefined})}
                        >
                          <option value="">Sans groupe</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className={`block text-[10px] font-black uppercase tracking-widest mb-1 ml-1 ${type === 'INCOME' ? 'text-blue-400' : 'text-rose-400'}`}>Montant prévu</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          disabled={isProcessing}
                          className="w-full bg-gray-50 border-2 border-blue-100 rounded-xl px-4 py-2 text-sm font-bold outline-none text-gray-900 text-right pr-8 disabled:bg-gray-100 focus:border-blue-400"
                          value={editForm.amount}
                          onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
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
                      className="flex-1 bg-blue-600 text-white rounded-xl py-2 font-bold text-sm flex justify-center items-center disabled:opacity-50 shadow-md shadow-blue-100"
                    >
                      {isCurrentlyProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer les modifications'}
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
                    <div className={`p-3 rounded-xl ${type === 'INCOME' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                      {type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.label}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{type === 'INCOME' ? 'Revenu Fixe' : 'Charge Fixe'}</p>
                        {item.group && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100 uppercase">
                            {item.group.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900 mr-4">{item.amount.toLocaleString('fr-FR')} €</span>
                    <button 
                      onClick={() => startEdit(item)}
                      disabled={isProcessing}
                      className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-20"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      disabled={isProcessing}
                      className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {items.length === 0 && !isAdding && (
          <div className="py-10 text-center border-2 border-dashed rounded-3xl bg-gray-50">
            <p className="text-sm font-bold text-gray-400">Aucun template configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
