import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Analysis() {
  const [monthlySavings, setMonthlySavings] = useState(250);
  const [period, setPeriod] = useState<'10 ans' | '20 ans' | '30 ans'>('30 ans');
  const [futureWealth, setFutureWealth] = useState(307691);
  const [totalContribution, setTotalContribution] = useState(90000);
  const [generatedGains, setGeneratedGains] = useState(302767);
  const [annualReturn, setAnnualReturn] = useState(15.39);
  const [dividendStats, setDividendStats] = useState<{
    totalAnnualDividends: number;
    overallYieldOnCost: number;
  } | null>(null);

  useEffect(() => {
    calculateProjection();
    fetchDividendStats();
  }, [monthlySavings, period]);

  const fetchDividendStats = async () => {
    try {
      const response = await fetch('/api/portfolio/dividends');
      const data = await response.json();
      setDividendStats({
        totalAnnualDividends: data.totalAnnualDividends || 0,
        overallYieldOnCost: data.overallYieldOnCost || 0,
      });
    } catch (error) {
      console.error('Error fetching dividend stats:', error);
    }
  };

  const calculateProjection = () => {
    const years = period === '10 ans' ? 10 : period === '20 ans' ? 20 : 30;
    const totalMonths = years * 12;
    const contribution = monthlySavings * totalMonths;
    const returnRate = 0.1539; // 15.39% annual
    
    // Calcul simplifié de la projection
    let futureValue = 0;
    for (let i = 0; i < totalMonths; i++) {
      futureValue = (futureValue + monthlySavings) * (1 + returnRate / 12);
    }
    
    setTotalContribution(contribution);
    setGeneratedGains(Math.max(0, futureValue - contribution));
    setFutureWealth(Math.round(futureValue));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Données pour le graphique de projection
  const generateProjectionData = () => {
    const years = period === '10 ans' ? 10 : period === '20 ans' ? 20 : 30;
    const data = [];
    const currentYear = new Date().getFullYear();
    let currentValue = 0;
    const monthlyReturn = annualReturn / 100 / 12;
    
    for (let year = 0; year <= years; year++) {
      const yearValue = currentYear + year;
      if (year > 0) {
        for (let month = 0; month < 12; month++) {
          currentValue = (currentValue + monthlySavings) * (1 + monthlyReturn);
        }
      }
      data.push({
        year: yearValue.toString(),
        value: Math.round(currentValue),
        contribution: monthlySavings * 12 * year,
      });
    }
    return data;
  };

  const projectionData = generateProjectionData();

  // Données pour les cartes d'analyse
  const feesRate = 2.80;
  const feesAmount = 1;
  const potentialSavings = 48;
  const passiveIncome = dividendStats?.overallYieldOnCost || 0;
  const projectedDividends = dividendStats?.totalAnnualDividends || 0;
  const sectoralDiversification = 3;
  const geographicDiversification = 1;

  // Données pour la diversification sectorielle
  const sectorData = [
    { name: 'Énergie', value: 35, color: '#f59e0b' },
    { name: 'Technologie', value: 25, color: '#3b82f6' },
    { name: 'Finance', value: 20, color: '#10b981' },
    { name: 'Autres', value: 20, color: '#6b7280' },
  ];

  // Données pour la diversification géographique
  const geographicData = [
    { name: 'France', value: 69, color: '#3b82f6' },
    { name: 'États-Unis', value: 12, color: '#10b981' },
    { name: 'Autres', value: 19, color: '#6b7280' },
  ];

  // Investissements populaires (simulation)
  const popularInvestments = [
    {
      rank: 1,
      name: 'BNP Paribas Easy S&P 500 UCITS ETF EUR C',
      description: 'EUR - Détenu par 8,39% utilisateurs',
      logo: 'BNP',
      color: 'bg-green-500',
    },
    {
      rank: 2,
      name: 'iShares MSCI World Swap PEA UCITS ETF',
      description: 'EUR - Détenu par 6,08% utilisateurs',
      logo: 'i',
      color: 'bg-white border-2 border-gray-300',
    },
  ];

  return (
    <>
      <Head>
        <title>Analyse - TimInvest</title>
      </Head>

      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Découvrez vos analyses, Utilisateur
          </h1>
        </div>

        {/* Cartes d'analyse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner de frais */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scanner de frais</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                NOUVEAU
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

          {/* Revenus passifs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenus passifs</h3>
            {dividendStats && dividendStats.totalAnnualDividends > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{passiveIncome.toFixed(2)}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rendement sur coût d'acquisition</p>
                </div>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(projectedDividends)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projeté (12 mois)</p>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ value: 35 }, { value: 38 }, { value: 42 }, { value: 31 }]}>
                      <Bar dataKey="value" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun dividende détecté
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Les revenus passifs seront calculés lorsque des dividendes seront disponibles
                </p>
              </div>
            )}
          </div>

          {/* Scanner de diversification sectorielle */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scanner de diversification sectorielle</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                PLUS
              </span>
            </div>
            <div className="mb-4">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Limitée</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sectoralDiversification}/10</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Votre portefeuille est partiellement diversifié, mais pourrait être amélioré afin de mieux répartir le risque entre différents secteurs
            </p>
            <div className="h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scanner de diversification géographique */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scanner de diversification géographique</h3>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                PLUS
              </span>
            </div>
            <div className="mb-4">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Insuffisante</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{geographicDiversification}/10</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Votre portefeuille est presque entièrement investi dans quelques pays ou régions. Cela vous expose à un risque de concentration élevé.
            </p>
            <div className="h-24 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    dataKey="value"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Simulateur de patrimoine */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Simulateur de patrimoine</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique de projection */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mon patrimoine futur</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(futureWealth)}</p>
              </div>
              
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k €`;
                        return `${value}€`;
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Année: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="contribution"
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

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contribution totale</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(totalContribution)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plus-values générées</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(generatedGains)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contribution totale(%)</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalContribution > 0 ? ((totalContribution / futureWealth) * 100).toFixed(2) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rendement annuel</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    +{annualReturn.toFixed(2)}%/an
                  </p>
                </div>
              </div>
            </div>

            {/* Panneau de modification */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Modifier votre simulation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Épargne mensuelle
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">EUR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Période
                  </label>
                  <div className="flex space-x-2">
                    {(['10 ans', '20 ans', '30 ans'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          period === p
                            ? 'bg-primary-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                  Comprendre ma simulation
                </button>
                
                <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investissements Populaires */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Investissements Populaires</h3>
            
            <div className="flex space-x-2 mb-4">
              {['ETF', 'Actions', 'Crypto', 'SCPI'].map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    tab === 'ETF'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {popularInvestments.map((investment) => (
                <div key={investment.rank} className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${investment.color} rounded-full flex items-center justify-center text-sm font-bold ${
                    investment.color.includes('white') ? 'text-gray-900' : 'text-white'
                  }`}>
                    {investment.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">#{investment.rank}</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {investment.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {investment.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Voir plus
            </button>
          </div>

          {/* Classement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Classement</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs de Finary</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Top 90%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Population française</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Top 90%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Profil de l'investisseur */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Profil de l'investisseur</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Profil de risque</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Offensif</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Matelas de sécurité</p>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">INSUFFISANT</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">0 mois</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ratio d'endettement</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Vous n'avez pas de dettes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

