'use client';

import Link from 'next/link';
import { LayoutDashboard, ReceiptText, Wallet, Settings, Menu, X, Plus, Target, Gauge } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard, disabled: true },
    { name: 'Pilotage', href: '/pilotage', icon: Gauge },
    { name: 'Enveloppes', href: '/envelopes', icon: Target, disabled: true },
    { name: 'Transactions', href: '/transactions', icon: ReceiptText, disabled: true },
    { name: 'Paramètres', href: '/config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop - Compact by default, expands on hover */}
      <aside className="hidden md:flex w-20 hover:w-64 bg-white border-r flex-col transition-all duration-300 ease-in-out group z-50 sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-4 overflow-hidden">
          <div className="min-w-[32px] h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
          <h1 className="text-2xl font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">SuiviCompte</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-4 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              onClick={(e) => item.disabled && e.preventDefault()}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all group/item ${
                item.disabled 
                  ? 'opacity-40 grayscale cursor-not-allowed text-gray-400' 
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-6 h-6 min-w-[24px]" />
              <span className="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t">
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 group-hover:w-full group-hover:justify-start group-hover:gap-3 group-hover:px-2 transition-all overflow-hidden">
              <div className="min-w-[24px] h-6 rounded-full bg-gray-300 flex items-center justify-center">M</div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold text-xs">Mon Compte</span>
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
          <div className="md:hidden bg-white border-b absolute top-16 left-0 w-full z-50 p-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.disabled ? '#' : item.href}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`flex items-center space-x-3 p-3 transition-all ${
                  item.disabled 
                    ? 'opacity-40 grayscale cursor-not-allowed text-gray-400' 
                    : 'text-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <Link 
          href="/mobile/add" 
          className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40"
        >
          <Plus className="w-6 h-6" />
        </Link>

        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
