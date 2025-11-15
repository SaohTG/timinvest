import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Plus, Search, X, Edit2, Trash2, ChevronLeft, ChevronDown, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock, PortfolioPosition } from '@/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Portfolio() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [timeRange, setTimeRange] = useState<'1J' | '7J' | '1M' | 'YTD' | '1A' | 'TOUT'>('TOUT');
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [dividendStats, setDividendStats] = useState<{
    totalAnnualDividends: number;
    overallYieldOnCost: number;
    monthlyProjections: Array<{ month: string; monthLabel: string; amount: number }>;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currency: 'EUR',
  });

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchPortfolioData = async () => {
    try {
      // Récupérer les stocks
      const stocksResponse = await fetch('/api/stocks');
      const stocksData = await stocksResponse.json();
      setStocks(stocksData);
      
      // Récupérer les stats avec positions
      const statsResponse = await fetch('/api/portfolio/stats');
      const statsData = await statsResponse.json();
      setPositions(statsData.positions || []);
      setTotalValue(statsData.stats?.totalValue || 0);
      setTotalGain(statsData.stats?.totalGain || 0);
      setTotalGainPercent(statsData.stats?.totalGainPercent || 0);
      
      // Récupérer les dividendes
      const dividendsResponse = await fetch('/api/portfolio/dividends');
      const dividendsData = await dividendsResponse.json();
      setDividendStats({
        totalAnnualDividends: dividendsData.totalAnnualDividends || 0,
        overallYieldOnCost: dividendsData.overallYieldOnCost || 0,
        monthlyProjections: dividendsData.monthlyProjections || [],
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async () => {
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const handleSelectStock = (stock: { symbol: string; name: string }) => {
    setFormData(prev => ({ ...prev, symbol: stock.symbol, name: stock.name }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStock) {
        const response = await fetch('/api/stocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStock.id,
            ...formData,
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
          }),
        });
        
        if (response.ok) {
          await fetchPortfolioData();
          closeModal();
        }
      } else {
        const response = await fetch('/api/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
          }),
        });
        
        if (response.ok) {
          await fetchPortfolioData();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) return;
    
    try {
      const response = await fetch(`/api/stocks?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchPortfolioData();
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity.toString(),
      purchasePrice: stock.purchasePrice.toString(),
      purchaseDate: stock.purchaseDate,
      currency: stock.currency,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingStock(null);
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      currency: 'EUR',
    });
    setSearchQuery('');
    setSearchResults([]);
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

  // Données pour le graphique de performance
  const generateHistoryData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    let currentValue = totalValue * 0.8;
    let investedValue = totalValue * 0.75;
    const increment = (totalValue * 0.2) / 180;
    
    for (let i = 0; i < 180; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      currentValue += increment + (Math.random() - 0.5) * increment * 0.1;
      investedValue += increment * 0.9;
      data.push({
        date: format(date, 'dd/MM/yyyy'),
        value: Math.max(currentValue, totalValue * 0.7),
        invested: Math.max(investedValue, totalValue * 0.65),
      });
    }
    return data;
  };

  const historyData = generateHistoryData();

  // Calculer la diversification géographique (simulation)
  const geographicDiversification = [
    { country: 'France', percentage: 69 },
    { country: 'États-Unis', percentage: 12 },
    { country: 'Autres', percentage: 19 },
  ];

  // Utiliser les dividendes réels ou des valeurs par défaut
  const projectedDividends = dividendStats?.totalAnnualDividends || 0;
  const dividendYield = dividendStats?.overallYieldOnCost || 0;
  const monthlyDividends = dividendStats?.monthlyProjections.map(m => ({
    month: m.monthLabel,
    value: m.amount,
  })) || [];

  // Scanner de frais (simulation)
  const feesRate = 2.80;
  const feesAmount = 1;
  const potentialSavings = 48;

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

  return (
    <>
      <Head>
        <title>Patrimoine - TimInvest</title>
      </Head>

      <div className="space-y-6">
        {/* Navigation hiérarchique */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <button className="flex items-center hover:text-gray-900 dark:hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Patrimoine
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Actions & Fonds</span>
        </div>

        {/* En-tête avec valeur totale */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              &lt; Actions & Fonds
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(), 'd MMM yyyy', { locale: fr })}
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalValue)}
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                • Votre portefeuille
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Comparer +
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une action
          </button>
        </div>

        {/* Graphique de performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h2>
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
                  dataKey="invested"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
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

        {/* Grille de sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner de frais */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scanner de frais</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                PLUS
              </span>
            </div>
            <div className="mb-4">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Trop élevé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{feesRate}%</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>1 €/an</span>
              </div>
              <div className="flex justify-between">
                <span>Économies potentielles</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(potentialSavings)}</span>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{ value: 1 }, { value: 1.2 }, { value: 1.1 }, { value: 1.3 }]}>
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diversification géographique */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">DIVERSIFICATION</h3>
              <select className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Pays</option>
              </select>
            </div>
            <div className="space-y-4">
              {geographicDiversification.map((item) => (
                <div key={item.country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.country}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dividendes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">DIVIDENDES</h3>
            {dividendStats && dividendStats.totalAnnualDividends > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dividendYield.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rendement sur coût d'acquisition</p>
                </div>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(projectedDividends)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projeté (12 mois)</p>
                </div>
                {monthlyDividends.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyDividends}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="value" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucune projection disponible</p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun dividende détecté pour vos actions
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Les dividendes seront calculés automatiquement lorsque disponibles
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h2>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Performance sur la période "{timeRange}" pour Actions & Fonds
          </p>
          <div className="flex items-center space-x-2 mb-4">
            <span className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(totalGain)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              totalGain >= 0
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {formatPercent(totalGainPercent)}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            La plus-value latente est la différence entre votre prix d'achat unitaire et le prix actuel. 
            Ce montant ne tient pas compte des plus-values réalisées.
          </p>
        </div>

        {/* Tableau des actifs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
                  Comptes
                </button>
                <button className="px-4 py-2 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                  Transactions
                </button>
              </div>
              <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Tout</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Actifs</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                    TR
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Trade Republic Portfolio</p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  <span>SYNC. MANUELLE</span>
                </button>
              </div>
            </div>

            {positions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prix revient unitaire
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prix actuel
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Valeur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        +/- value {timeRange}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {positions.map((position) => {
                      const isPositive = position.gainLoss >= 0;
                      return (
                        <tr key={position.stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {position.stock.symbol}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {position.stock.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            {position.stock.quantity}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            {formatCurrency(position.stock.purchasePrice)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            {formatCurrency(position.stock.currentPrice || position.stock.purchasePrice)}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(position.currentValue)}
                          </td>
                          <td className="px-4 py-4">
                            <div className={`text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              <div className="font-medium">{formatCurrency(position.gainLoss)}</div>
                              <div className="text-xs">{formatPercent(position.gainLossPercent)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(position.stock)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(position.stock.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aucune position dans votre portfolio
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter une action
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingStock ? 'Modifier l\'action' : 'Ajouter une action'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingStock && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rechercher une action
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par symbole ou nom..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md max-h-48 overflow-y-auto bg-white dark:bg-gray-800">
                      {searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          type="button"
                          onClick={() => handleSelectStock(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{result.symbol}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{result.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbole *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  required
                  readOnly={!!editingStock}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix d'Achat *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'Achat *
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {editingStock ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
