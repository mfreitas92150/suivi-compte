import { PlusCircle, Target } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'saisie' | 'enveloppes';
  onTabChange: (tab: 'saisie' | 'enveloppes') => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-20 pb-4 z-50">
      <button 
        onClick={() => onTabChange('saisie')}
        className={`flex flex-col items-center space-y-1 ${activeTab === 'saisie' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <PlusCircle className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Saisie</span>
      </button>
      <button 
        onClick={() => onTabChange('enveloppes')}
        className={`flex flex-col items-center space-y-1 ${activeTab === 'enveloppes' ? 'text-blue-600' : 'text-gray-400'}`}
      >
        <Target className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Enveloppes</span>
      </button>
    </nav>
  );
}
