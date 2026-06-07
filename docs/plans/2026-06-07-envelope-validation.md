# Envelope Validation Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a double display (Real vs Theoretical) for envelope balances in both 'Pilotage' and 'Transactions' pages, where 'Real' only accounts for validated transactions.

**Architecture:** Update calculation logic in both pages to separate transactions by their `checked` status. The UI will display the 'Real' remaining balance prominently and the 'Theoretical' balance as a secondary figure with a dual-layer progress bar.

**Tech Stack:** React (Next.js), Tailwind CSS, Lucide Icons.

---

### Task 1: Refactor 'Pilotage' Page Logic and UI

**Files:**
- Modify: `src/app/pilotage/page.tsx`

**Step 1: Update `getSpentForCategory`**
```typescript
  const getSpentForCategory = (categoryId: string) => {
    const catTransactions = transactions?.filter(tx => tx.categoryId === categoryId) || [];
    const spentValidated = catTransactions
      .filter(tx => tx.checked)
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    const spentTotal = catTransactions
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    return { spentValidated, spentTotal };
  };
```

**Step 2: Update the Envelope list UI in `PilotagePage`**
Implement the double balance display and dual-layer progress bar in the "Restants" section.

**Step 3: Verify and Commit**
Run `npm run lint` and commit.

---

### Task 2: Refactor 'Transactions' Page Logic and UI

**Files:**
- Modify: `src/app/transactions/page.tsx`

**Step 1: Update `envelopesSummary` useMemo**
```typescript
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
```

**Step 2: Update the Grid UI in `TransactionsPage`**
Update the top cards to show the "Réel" balance as primary and "Théorique" as secondary, with the dual-layer progress bar.

**Step 3: Verify and Commit**
Run `npm run lint` and commit.

---

### Task 3: Final Verification

**Step 1: Full project verification**
Run: `npm run lint && npx tsc --noEmit`
Expected: SUCCESS

**Step 2: Final Commit**
```bash
git commit --allow-empty -m "docs: complete cross-page envelope validation implementation"
```
