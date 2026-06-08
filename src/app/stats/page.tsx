'use client';

import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useAnnualStats } from "@/presentation/hooks/useApi";
import { useMonthNavigation } from "@/presentation/hooks/useMonthNavigation";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Scale } from 'lucide-react';

const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const formatCurrency = (value: number) => {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function StatsPage() {
  const { year: urlYear, setMonthAndYear } = useMonthNavigation();

  const { data: stats, isLoading } = useAnnualStats(urlYear);

  const handlePrevYear = () => {
    setMonthAndYear(1, urlYear - 1);
  };

  const handleNextYear = () => {
    setMonthAndYear(1, urlYear + 1);
  };

  const chartData = stats?.map(stat => ({
    name: monthNames[stat.month - 1],
    Revenus: stat.income,
    Dépenses: stat.expense,
  })) || [];

  const totalIncome = stats?.reduce((acc, curr) => acc + curr.income, 0) || 0;
  const totalExpense = stats?.reduce((acc, curr) => acc + curr.expense, 0) || 0;
  const balance = totalIncome - totalExpense;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Statistiques Annuelles</h2>
          
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-lg border shadow-sm">
            <button 
              onClick={handlePrevYear}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 px-4 text-gray-800 font-semibold">
              <Calendar className="w-4 h-4" />
              <span>{urlYear}</span>
            </div>
            <button 
              onClick={handleNextYear}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenus</p>
                <h3 className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Dépenses</p>
                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bilan</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {balance > 0 ? '+' : ''}{formatCurrency(balance)}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${balance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                <Scale className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Évolution mensuelle</h3>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Chargement des données...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="#f0f0f0" 
                    verticalFill={['#f3f4f6', 'transparent']} 
                    fillOpacity={1}
                  />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    dx={-10}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
