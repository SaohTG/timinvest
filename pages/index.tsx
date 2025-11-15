import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import PositionCard from '@/components/PositionCard';
import { PortfolioStats, PortfolioPosition } from '@/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Home() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1J' | '7J' | '1M' | 'YTD' | '1A' | 'TOUT'>('TOUT');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');

  useEffect(() => {
    fetchPortfolioData();
    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio/stats');
      const data = await response.json();
      setStats(data.stats);
      setPositions(data.positions);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Données pour le graphique historique (simulation - à remplacer par vraies données)
  const generateHistoryData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 mois en arrière
    
    let currentValue = stats ? stats.totalValue * 0.8 : 0;
    const increment = stats ? (stats.totalValue * 0.2) / 180 : 0;
    
    for (let i = 0; i < 180; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      currentValue += increment + (Math.random() - 0.5) * increment * 0.1;
      data.push({
        date: format(date, 'dd/MM/yyyy'),
        value: Math.max(currentValue, stats ? stats.totalValue * 0.7 : 0),
      });
    }
    return data;
  };

  const historyData = generateHistoryData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalGain = stats?.totalGain || 0;
  const totalGainPercent = stats?.totalGainPercent || 0;
  const isPositive = totalGain >= 0;

  return (
    <>
      <Head>
        <title>Synthèse - TimInvest</title>
        <meta name="description" content="Gérez votre patrimoine boursier" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-6">
        {/* Top Section: Patrimoine net et Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patrimoine net */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Patrimoine net</h2>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(), 'd MMM yyyy', { locale: fr })}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalValue || 0)}
              </p>
            </div>

            {/* Filtres */}
            <div className="flex items-center justify-between mb-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option>Toutes les catégories</option>
                <option>Actions</option>
                <option>Obligations</option>
                <option>Cryptomonnaies</option>
              </select>
              
              <div className="flex space-x-1">
                {(['1J', '7J', '1M', 'YTD', '1A', 'TOUT'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      timeRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphique */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value.split('/').reverse().join('-'));
                      return format(date, 'dd/MM');
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${(value / 1000).toFixed(1)} k€`;
                      return `${value}€`;
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h2>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Plus-value - Tout</p>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(totalGain)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isPositive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {formatPercent(totalGainPercent)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              La plus-value latente est la différence entre votre prix d'achat unitaire et le prix actuel. 
              Ce montant ne tient pas compte des plus-values réalisées.
            </p>

            <a
              href="#"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
            >
              En savoir plus
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>

        {/* Ma performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ma performance</h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option>Toutes les catégories</option>
                <option>Actions</option>
                <option>Obligations</option>
                <option>Cryptomonnaies</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trier par</span>
                <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Performance</option>
                  <option>Valeur</option>
                  <option>Nom</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Cartes scrollables */}
          {positions.length > 0 ? (
            <div className="overflow-x-auto pb-4 -mx-2 px-2 scroll-cards">
              <div className="flex space-x-4">
                {positions.map((position) => (
                  <PositionCard key={position.stock.id} position={position} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Aucune position dans votre portfolio
              </p>
              <a
                href="/portfolio"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Ajouter une action
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
