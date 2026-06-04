'use client';

import { useState } from 'react';
import { Category, CategoryType } from '@/core/domain/entities';
import { Plus, Trash2, Save, X, Tag, Loader2 } from 'lucide-react';

interface CategoryListConfigProps {
  categories: Category[];
  onCreate: (data: { name: string, type: CategoryType, defaultAmount?: number | null }) => void;
  onUpdate: (id: string, data: { name: string, defaultAmount?: number | null }) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
}

export default function CategoryListConfig({ 
  categories, 
  onCreate, 
  onUpdate, 
  onDelete,
  isProcessing = false 
}: CategoryListConfigProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const handleAdd = () => {
    console.log("CategoryListConfig.handleAdd", { newName, newAmount });
    if (!newName || isProcessing) return;
    onCreate({ 
      name: newName, 
      type: 'EXPENSE', 
      defaultAmount: newAmount ? parseFloat(newAmount) : null 
    });
    setNewName('');
    setNewAmount('');
    setIsAdding(false);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditAmount(category.defaultAmount?.toString() || '');
  };

  const handleUpdate = () => {
    console.log("CategoryListConfig.handleUpdate", { editingId, editName, editAmount });
    if (editingId && editName && !isProcessing) {
      onUpdate(editingId, { 
        name: editName, 
        defaultAmount: editAmount ? parseFloat(editAmount) : null 
      });
      setEditingId(null);
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Tag className="w-5 h-5" /></div>
          Templates d&apos;enveloppes
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-md shadow-amber-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Ajouter un template
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Formulaire d'ajout */}
        {isAdding && (
          <div className={`bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 animate-in fade-in zoom-in-95 duration-200 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Nom de l'enveloppe (ex: Alimentation)"
                disabled={isProcessing}
                className="flex-[2] bg-white border-2 border-amber-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                autoFocus
              />
              <div className="flex-1 relative">
                <input 
                  type="number" 
                  placeholder="Budget"
                  disabled={isProcessing}
                  className="w-full bg-white border-2 border-amber-100 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100 pr-8"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') setIsAdding(false);
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">€</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAdd}
                  disabled={isProcessing || !newName}
                  className="flex-1 sm:flex-none px-6 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50 flex justify-center items-center h-10"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Valider'}
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  disabled={isProcessing}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des catégories */}
        <div className="grid grid-cols-1 gap-3">
          {expenseCategories.map(category => (
            <div key={category.id} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all ${isProcessing && editingId === category.id ? 'bg-gray-50 opacity-60' : ''}`}>
              {editingId === category.id ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    disabled={isProcessing}
                    className="flex-[2] bg-gray-50 border-2 border-amber-100 rounded-xl px-3 py-1.5 text-sm font-bold outline-none text-gray-900"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleUpdate();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                  <div className="flex-1 relative">
                    <input 
                      type="number" 
                      disabled={isProcessing}
                      className="w-full bg-gray-50 border-2 border-amber-100 rounded-xl px-3 py-1.5 text-sm font-black outline-none text-gray-900 pr-8"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">€</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdate} 
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none px-4 bg-amber-600 text-white rounded-xl font-bold text-xs flex justify-center items-center h-9"
                    >
                      {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ok'}
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      disabled={isProcessing}
                      className="p-1 text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{category.name}</span>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                        Budget : {category.defaultAmount?.toLocaleString('fr-FR') || 0} €
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(category)}
                      disabled={isProcessing}
                      className="p-1.5 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(category.id)}
                      disabled={isProcessing}
                      className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {expenseCategories.length === 0 && !isAdding && (
          <div className="py-10 text-center border-2 border-dashed rounded-3xl bg-gray-50">
            <p className="text-sm font-bold text-gray-400">Aucune catégorie configurée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
