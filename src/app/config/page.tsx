'use client';

import DashboardLayout from "@/presentation/components/DashboardLayout";
import AccountListConfig from "@/presentation/components/AccountListConfig";
import RecurringListConfig from "@/presentation/components/RecurringListConfig";
import GroupListConfig from "@/presentation/components/GroupListConfig";
import CategoryListConfig from "@/presentation/components/CategoryListConfig";
import { 
  useRecurringTransactions, 
  useUpdateRecurringTransaction, 
  useCreateRecurringTransaction,
  useDeleteRecurringTransaction,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAccounts,
  useUpdateAccount,
  useCreateAccount,
  useDeleteAccount,
  useExpenseGroups,
  useCreateExpenseGroup,
  useUpdateExpenseGroup,
  useDeleteExpenseGroup
} from "@/presentation/hooks/useApi";

export default function ConfigPage() {
  const { data: recurring, isLoading: loadingRecurring } = useRecurringTransactions();
  const { data: categories } = useCategories();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: groups, isLoading: loadingGroups } = useExpenseGroups();

  const updateRecurring = useUpdateRecurringTransaction();
  const createRecurring = useCreateRecurringTransaction();
  const deleteRecurring = useDeleteRecurringTransaction();
  
  const updateAccount = useUpdateAccount();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const createGroup = useCreateExpenseGroup();
  const updateGroup = useUpdateExpenseGroup();
  const deleteGroup = useDeleteExpenseGroup();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  if (loadingRecurring || loadingAccounts || loadingGroups) return <DashboardLayout><div>Chargement...</div></DashboardLayout>;

  const incomes = recurring?.filter(r => r.type === 'INCOME') || [];
  const expenses = recurring?.filter(r => r.type === 'EXPENSE') || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Configuration</h1>
        </div>

        {/* SECTION 1: COMPTES BANCAIRES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Fondations</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          <section className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <AccountListConfig 
              accounts={accounts || []}
              onCreate={(data) => createAccount.mutate(data)}
              onUpdate={(id, data) => updateAccount.mutate({ id, ...data })}
              onDelete={(id) => {
                if (confirm('Voulez-vous vraiment supprimer ce compte ?')) {
                  deleteAccount.mutate(id);
                }
              }}
              isProcessing={createAccount.isPending || updateAccount.isPending || deleteAccount.isPending}
            />
          </section>
        </div>

        {/* SECTION 2: STRUCTURE & ENVELOPPES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Structure & Enveloppes</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GROUPES DE CHARGES */}
            <section className="bg-white p-6 rounded-[2rem] border shadow-sm h-full">
              <GroupListConfig 
                groups={groups || []}
                onCreate={(name) => createGroup.mutate(name)}
                onUpdate={(id, name) => updateGroup.mutate({ id, name })}
                onDelete={(id) => {
                  if (confirm('Voulez-vous vraiment supprimer ce groupe ? Toutes les charges associées n\'auront plus de groupe.')) {
                    deleteGroup.mutate(id);
                  }
                }}
                isProcessing={createGroup.isPending || updateGroup.isPending || deleteGroup.isPending}
              />
            </section>

            {/* CATÉGORIES (ENVELOPPES) */}
            <section className="bg-white p-6 rounded-[2rem] border shadow-sm h-full">
              <CategoryListConfig 
                categories={categories || []}
                onCreate={(data) => createCategory.mutate(data)}
                onUpdate={(id, data) => updateCategory.mutate({ id, ...data })}
                onDelete={(id) => {
                  if (confirm('Voulez-vous vraiment supprimer cette catégorie ? Toutes les transactions et enveloppes associées seront impactées.')) {
                    deleteCategory.mutate(id);
                  }
                }}
                isProcessing={createCategory.isPending || updateCategory.isPending || deleteCategory.isPending}
              />
            </section>
          </div>
        </div>

        {/* SECTION 3: TEMPLATES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Templates & Automatisation</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* REVENUS FIXES (TEMPLATES) */}
            <section className="bg-white p-6 rounded-[2rem] border shadow-sm">
              <RecurringListConfig 
                title="Revenus Fixes"
                items={incomes}
                categories={categories || []}
                type="INCOME"
                onCreate={(data) => createRecurring.mutate(data)}
                onUpdate={(id, data) => updateRecurring.mutate({ id, ...data })}
                onDelete={(id) => {
                  if (confirm('Voulez-vous vraiment supprimer ce template de revenu ?')) {
                    deleteRecurring.mutate(id);
                  }
                }}
                isProcessing={createRecurring.isPending || updateRecurring.isPending || deleteRecurring.isPending}
              />
            </section>

            {/* CHARGES FIXES (TEMPLATES) */}
            <section className="bg-white p-6 rounded-[2rem] border shadow-sm">
              <RecurringListConfig 
                title="Charges Fixes"
                items={expenses}
                categories={categories || []}
                groups={groups || []}
                type="EXPENSE"
                onCreate={(data) => createRecurring.mutate(data)}
                onUpdate={(id, data) => updateRecurring.mutate({ id, ...data })}
                onDelete={(id) => {
                  if (confirm('Voulez-vous vraiment supprimer ce template de charge ?')) {
                    deleteRecurring.mutate(id);
                  }
                }}
                isProcessing={createRecurring.isPending || updateRecurring.isPending || deleteRecurring.isPending}
              />
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
