import { useState } from 'react';
import { useAccounts, useCategories, useCreateTransaction } from "@/presentation/hooks/useApi";
import { CheckCircle2 } from 'lucide-react';

export function MobileEntryForm() {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.accountId) {
      alert("Veuillez sélectionner une catégorie et un compte");
      return;
    }
    await createTx.mutateAsync({
      description: formData.description,
      amount: -Math.abs(parseFloat(formData.amount)),
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: new Date(formData.date),
      isFixed: false,
      checked: false
    });
    setIsSuccess(true);
    setFormData({ ...formData, amount: '', description: '' });
    setTimeout(() => setIsSuccess(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">C&apos;est noté !</h2>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Montant</label>
        <div className="relative inline-block">
          <input 
            type="number" step="0.01" placeholder="0.00" autoFocus
            className="w-full text-center text-6xl font-black text-gray-900 outline-none placeholder-gray-100 bg-transparent"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            required
          />
          <span className="absolute -right-6 top-4 text-2xl font-bold text-gray-300">€</span>
        </div>
      </div>

      <div className="space-y-4">
        <input 
          type="text" placeholder="Quoi ? (ex: Courses)" 
          className="w-full p-5 bg-white rounded-2xl border-none shadow-sm text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          required
        />

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Catégorie</label>
          <div className="flex flex-wrap gap-2">
            {categories?.filter(c => c.type === 'EXPENSE').map(c => (
              <button
                key={c.id} type="button"
                onClick={() => setFormData({...formData, categoryId: c.id})}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.categoryId === c.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 border border-gray-100'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Compte</label>
          <div className="flex flex-wrap gap-2">
            {accounts?.map(a => (
              <button
                key={a.id} type="button"
                onClick={() => setFormData({...formData, accountId: a.id})}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.accountId === a.id ? 'bg-gray-800 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'}`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction d&apos;hier ?</label>
          <button
            type="button"
            onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const today = new Date();
              const isYesterday = formData.date === yesterday.toISOString().split('T')[0];
              setFormData({
                ...formData,
                date: isYesterday ? today.toISOString().split('T')[0] : yesterday.toISOString().split('T')[0]
              });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative ${formData.date !== new Date().toISOString().split('T')[0] ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.date !== new Date().toISOString().split('T')[0] ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <button 
        type="submit" disabled={createTx.isPending}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
      >
        {createTx.isPending ? 'ENREGISTREMENT...' : 'ENREGISTRER'}
      </button>
    </form>
  );
}
