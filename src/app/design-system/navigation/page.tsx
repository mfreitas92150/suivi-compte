'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ChevronDown, 
  History,
  Layout
} from 'lucide-react';

const months = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// --- 1. OPTION : RUBAN TEMPOREL (SWIPE/SCROLL) ---
const TimeRibbon = () => {
  const [selected, setSelected] = useState(5); // Juin
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeItem = scrollRef.current?.children[selected] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [selected]);

  const selectMonth = (idx: number) => {
    setSelected(idx);
  };

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">1. Ruban Temporel (Mobile-First)</h3>
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto space-x-8 no-scrollbar py-2 px-4 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {months.map((m, i) => (
          <button
            key={m}
            onClick={() => selectMonth(i)}
            className={`snap-center flex-shrink-0 transition-all duration-300 ${
              selected === i 
                ? "text-blue-600 font-bold scale-110" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center text-xs text-gray-500 italic">
        Swipez horizontalement pour changer de mois
      </div>
    </div>
  );
};

// --- 2. OPTION : SÉLECTEUR MODAL (MODERNE) ---
interface SelectorProps {
  onSelect: (month: number, year: number) => void;
  currentMonth: number;
  currentYear: number;
}

const ModalSelector = ({ onSelect, currentMonth, currentYear }: SelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">2. Sélecteur de Période (Compact)</h3>
      <div className="relative inline-block">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          <span>{months[currentMonth]} {currentYear}</span>
          <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <button onClick={() => onSelect(currentMonth, currentYear - 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
              <span className="font-bold">{currentYear}</span>
              <button onClick={() => onSelect(currentMonth, currentYear + 1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4"/></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((m, i) => (
                <button
                  key={m}
                  onClick={() => {
                    onSelect(i, currentYear);
                    setIsOpen(false);
                  }}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    currentMonth === i 
                      ? "bg-blue-600 text-white font-medium" 
                      : "hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  {m.substring(0, 4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">Cliquez sur le titre pour changer rapidement de date.</p>
    </div>
  );
};

// --- 3. OPTION : TIMELINE LATÉRALE (DÉTAILLÉE) ---
const SidebarTimeline = ({ onSelect, currentMonth, currentYear }: SelectorProps) => {
  const years = [2030, 2029, 2028, 2027, 2026, 2025, 2024];
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected year into view
    const activeYearEl = yearScrollRef.current?.querySelector('.active-year') as HTMLElement;
    if (activeYearEl) {
      activeYearEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentYear]);

  useEffect(() => {
    // Scroll selected month into view
    const activeMonthEl = monthScrollRef.current?.querySelector('.active-month') as HTMLElement;
    if (activeMonthEl) {
      activeMonthEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentMonth]);

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">3. Timeline Latérale (Historique)</h3>
      <div className="flex h-64 border rounded-lg overflow-hidden">
        <div ref={yearScrollRef} className="w-1/3 bg-gray-50 border-r overflow-y-auto">
          {years.map(year => (
            <div 
              key={year} 
              onClick={() => onSelect(currentMonth, year)} 
              className={`p-3 border-b hover:bg-white cursor-pointer group ${currentYear === year ? 'bg-white active-year' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold ${currentYear === year ? 'text-blue-600' : 'text-gray-700'}`}>{year}</span>
                <ChevronRight className={`w-4 h-4 ${currentYear === year ? 'text-blue-600' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`} />
              </div>
            </div>
          ))}
        </div>
        <div ref={monthScrollRef} className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => onSelect(i, currentYear)}
                className={`p-2 text-xs text-left rounded border transition-all ${
                  currentMonth === i
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-bold active-month"
                    : "border-gray-100 hover:border-blue-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500">Navigation type "explorateur" pour un accès rapide aux archives.</p>
    </div>
  );
};

// --- COMPOSANT DE PRÉVISUALISATION DES DONNÉES ---
const DataPreview = ({ month, year }: { month: string, year: number }) => {
  const dummyData = [
    { cat: "Alimentation", budget: 600, spent: 450 },
    { cat: "Loisirs", budget: 200, spent: 215 },
    { cat: "Loyer", budget: 1200, spent: 1200 },
  ];

  return (
    <div className="mt-6 border-t pt-6 animate-in slide-in-from-top-2 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Aperçu des données</p>
          <h4 className="text-xl font-bold text-gray-800">{month} {year}</h4>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase">Solde restant</p>
          <p className="text-lg font-bold text-green-600">+135 €</p>
        </div>
      </div>
      <div className="space-y-3">
        {dummyData.map(d => (
          <div key={d.cat} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{d.cat}</span>
              <span className={d.spent > d.budget ? "text-red-600 font-bold" : "text-gray-600"}>
                {d.spent} / {d.budget} €
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${d.spent > d.budget ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min((d.spent / d.budget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DesignComparisonPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        <div className="space-y-2 border-b pb-6">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Comparatif de Navigation</h2>
          <p className="text-lg text-gray-500">Choisis l'interface qui te semble la plus naturelle au quotidien.</p>
        </div>

        <div className="grid gap-10">
          {/* OPTION 2 AVEC APERÇU */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-blue-600 mb-6 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                Option : Sélecteur Modal (Compact & Focus)
              </h3>
              <ModalSelector 
                onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                currentMonth={selectedMonth}
                currentYear={selectedYear}
              />
              <DataPreview month={months[selectedMonth]} year={selectedYear} />
            </div>
          </div>

          {/* OPTION 3 AVEC APERÇU */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                Option : Timeline Latérale (Vue Archive)
              </h3>
              <SidebarTimeline 
                onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                currentMonth={selectedMonth}
                currentYear={selectedYear}
              />
              <DataPreview month={months[selectedMonth]} year={selectedYear} />
            </div>
          </div>
        </div>
...
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Conseil d'expert
          </h4>
          <p className="text-amber-700 text-sm leading-relaxed">
            Pour un remplacement d'Excel, l'option <strong>2 (Sélecteur de Période)</strong> est souvent la plus satisfaisante car elle offre la précision du clic direct tout en restant extrêmement propre visuellement. L'option <strong>1</strong> est excellente si vous utilisez souvent l'app sur votre téléphone.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
