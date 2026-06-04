'use client';

import { useState } from 'react';
import { ExpenseGroup } from '@/core/domain/entities';
import { Plus, Trash2, Save, X, Layers, Loader2 } from 'lucide-react';

interface GroupListConfigProps {
  groups: ExpenseGroup[];
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
}

export default function GroupListConfig({ 
  groups, 
  onCreate, 
  onUpdate, 
  onDelete,
  isProcessing = false 
}: GroupListConfigProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName || isProcessing) return;
    onCreate(newName);
    setNewName('');
    setIsAdding(false);
  };

  const startEdit = (group: ExpenseGroup) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  const handleUpdate = () => {
    if (editingId && editName && !isProcessing) {
      onUpdate(editingId, editName);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Layers className="w-5 h-5" /></div>
          Groupes de Charges
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all shadow-md shadow-amber-100 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Ajouter un groupe
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Formulaire d'ajout */}
        {isAdding && (
          <div className={`bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 animate-in fade-in zoom-in-95 duration-200 ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ex: Maison & Énergie"
                disabled={isProcessing}
                className="flex-1 bg-white border-2 border-amber-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                autoFocus
              />
              <button 
                onClick={handleAdd}
                disabled={isProcessing || !newName}
                className="px-6 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50 flex justify-center items-center"
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
        )}

        {/* Liste des groupes */}
        {groups.map(group => (
          <div key={group.id} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-all ${isProcessing && editingId === group.id ? 'bg-gray-50 opacity-60' : ''}`}>
            {editingId === group.id ? (
              <div className="flex-1 flex gap-3">
                <input 
                  type="text" 
                  disabled={isProcessing}
                  className="flex-1 bg-gray-50 border-2 border-amber-100 rounded-xl px-4 py-1 text-sm font-bold outline-none text-gray-900"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdate();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                />
                <button 
                  onClick={handleUpdate} 
                  disabled={isProcessing}
                  className="px-4 bg-amber-600 text-white rounded-xl font-bold text-xs flex justify-center items-center"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sauver'}
                </button>
                <button 
                  onClick={() => setEditingId(null)} 
                  disabled={isProcessing}
                  className="p-1 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-gray-900">{group.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEdit(group)}
                    disabled={isProcessing}
                    className="p-2 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(group.id)}
                    disabled={isProcessing}
                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {groups.length === 0 && !isAdding && (
          <div className="py-10 text-center border-2 border-dashed rounded-3xl bg-gray-50">
            <p className="text-sm font-bold text-gray-400">Aucun groupe configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
