'use client';

import Link from 'next/link';
import { LayoutDashboard, ReceiptText, Settings, Menu, X, Plus, Target, Gauge, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useSearchParams, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const queryString = (month && year) ? `?month=${month}&year=${year}` : '';
  const yearOnlyString = year ? `?year=${year}` : '';

  const navItems = [
    { name: 'Tableau de bord', href: `/${queryString}`, basePath: '/', icon: LayoutDashboard },
    { name: 'Pilotage', href: `/pilotage${queryString}`, basePath: '/pilotage', icon: Gauge },
    { name: 'Transactions', href: `/transactions${queryString}`, basePath: '/transactions', icon: ReceiptText },
    { name: 'Statistiques', href: `/stats${yearOnlyString}`, basePath: '/stats', icon: BarChart2 },
    { name: 'Paramètres', href: '/config', basePath: '/config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop - Compact and fixed */}
      <aside className="hidden md:flex w-20 bg-white border-r flex-col z-50 sticky top-0 h-screen shadow-sm">
        <div className="p-6 flex items-center justify-center relative group/logo">
          <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">S</div>
          <div className="absolute left-full ml-4 px-3 py-2 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 group-hover/logo:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60] font-bold text-blue-600 translate-x-[-10px] group-hover/logo:translate-x-0">
            SuiviCompte
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-white" />
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-4 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.basePath;
            return (
              <div key={item.name} className="relative group/item">
                <Link
                  href={item.href}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <item.icon className="w-6 h-6 min-w-[24px]" />
                </Link>
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60] shadow-xl translate-x-[-10px] group-hover/item:translate-x-0">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900" />
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t flex items-center justify-center relative group/user">
           <UserButton showName={false} appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
           <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-white border border-gray-100 shadow-xl rounded-lg opacity-0 group-hover/user:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60] font-bold text-xs text-gray-600 translate-x-[-10px] group-hover/user:translate-x-0">
             Mon Compte
             <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-white" />
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-xl font-bold text-blue-600">SuiviCompte</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b absolute top-16 left-0 l-0 w-full z-50 p-4 space-y-4 shadow-xl">
            {navItems.map((item) => {
              const isActive = pathname === item.basePath;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
