import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { PortfolioStats, PortfolioPosition } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Home() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);

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
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Données pour le graphique en camembert
  const pieData = positions.map((pos, index) => ({
    name: pos.stock.symbol,
    value: pos.currentValue,
    percent: pos.weight,
  }));

  // Données fictives pour l'historique (à remplacer par de vraies données)
  const historyData = [
    { date: 'Lun', value: stats ? stats.totalValue * 0.95 : 0 },
    { date: 'Mar', value: stats ? stats.totalValue * 0.97 : 0 },
    { date: 'Mer', value: stats ? stats.totalValue * 0.96 : 0 },
    { date: 'Jeu', value: stats ? stats.totalValue * 0.98 : 0 },
    { date: 'Ven', value: stats ? stats.totalValue : 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - TimInvest</title>
        <meta name="description" content="Gérez votre patrimoine boursier" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Vue d'ensemble de votre portefeuille</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Valeur Totale"
            value={formatCurrency(stats?.totalValue || 0)}
            change={formatPercent(stats?.todayChangePercent || 0)}
            changeType={stats && stats.todayChangePercent >= 0 ? 'positive' : 'negative'}
            icon={Wallet}
            subtitle="Aujourd'hui"
          />
          <StatsCard
            title="Capital Investi"
            value={formatCurrency(stats?.totalInvested || 0)}
            icon={DollarSign}
          />
          <StatsCard
            title="Plus/Moins-Value"
            value={formatCurrency(stats?.totalGain || 0)}
            change={formatPercent(stats?.totalGainPercent || 0)}
            changeType={stats && stats.totalGain >= 0 ? 'positive' : 'negative'}
            icon={TrendingUp}
            subtitle="Total"
          />
          <StatsCard
            title="Dividendes Reçus"
            value={formatCurrency(stats?.totalDividends || 0)}
            icon={Calendar}
            subtitle="Cette année"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance sur 5 jours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation Chart */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition du Portfolio</h2>
            {positions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Aucune position dans le portfolio
              </div>
            )}
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mes Positions</h2>
          </div>
          <div className="overflow-x-auto">
            {positions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix d'Achat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Actuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      +/- Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position.stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {position.stock.symbol}
                            </div>
                            <div className="text-sm text-gray-500">{position.stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.stock.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(position.stock.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(position.stock.currentPrice || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(position.currentValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={position.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                          <div className="font-medium">{formatCurrency(position.gainLoss)}</div>
                          <div className="text-xs">{formatPercent(position.gainLossPercent)}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune position</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par ajouter des actions à votre portfolio.
                </p>
                <div className="mt-6">
                  <a
                    href="/portfolio"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Ajouter une action
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

