import { useCategories, useEnvelopes, useTransactions } from "@/presentation/hooks/useApi";

export function MobileEnvelopeList() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const { data: categories } = useCategories();
  const { data: envelopes } = useEnvelopes({ month, year });
  const { data: transactions } = useTransactions({ month, year });

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];

  const getSpent = (catId: string) => 
    transactions?.filter(tx => tx.categoryId === catId).reduce((acc, tx) => acc + Math.abs(tx.amount), 0) || 0;

  // Calculate total budget and total spent for expense categories
  const totalBudget = expenseCategories.reduce((acc, cat) => {
    const budget = envelopes?.find(e => e.categoryId === cat.id)?.amount || 0;
    return acc + budget;
  }, 0);

  const totalSpent = expenseCategories.reduce((acc, cat) => {
    return acc + getSpent(cat.id);
  }, 0);

  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gray-900 rounded-3xl text-white shadow-xl mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Reste à dépenser</p>
        <h2 className="text-3xl font-black">{totalRemaining.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</h2>
      </div>

      {expenseCategories.map(cat => {
        const budget = envelopes?.find(e => e.categoryId === cat.id)?.amount || 0;
        const spent = getSpent(cat.id);
        const remaining = budget - spent;
        const percent = budget > 0 ? (spent / budget) * 100 : 0;

        return (
          <div key={cat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-black text-gray-900">{cat.name}</h4>
                <p className="text-xs font-bold text-gray-400">Restant: <span className={remaining < 0 ? 'text-red-500' : 'text-emerald-500'}>{remaining.toLocaleString('fr-FR')} €</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Budget</p>
                <p className="font-black text-gray-900">{budget.toLocaleString('fr-FR')} €</p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${percent > 100 ? 'bg-red-500' : percent > 85 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
