import { Home, Target, List } from 'lucide-react';

export type MobileTab = 'dashboard' | 'enveloppes' | 'transactions';

interface MobileNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-around items-center h-20 pb-4 z-50">
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Home className={`w-6 h-6 ${activeTab === 'dashboard' ? 'fill-blue-50' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Accueil</span>
      </button>
      <button 
        onClick={() => onTabChange('enveloppes')}
        className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'enveloppes' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Target className={`w-6 h-6 ${activeTab === 'enveloppes' ? 'fill-blue-50' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">Enveloppes</span>
      </button>
      <button 
        onClick={() => onTabChange('transactions')}
        className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'transactions' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <List className="w-6 h-6" />
        <span className="text-[10px] font-black uppercase tracking-widest">Opérations</span>
      </button>
    </nav>
  );
}
