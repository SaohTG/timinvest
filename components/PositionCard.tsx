import React from 'react';
import { Copy, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioPosition } from '@/types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface PositionCardProps {
  position: PortfolioPosition;
  onCopy?: () => void;
}

// Générer une couleur basée sur le symbole pour le logo
function getColorForSymbol(symbol: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-orange-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'
  ];
  const index = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

// Générer les initiales pour le logo
function getInitials(name: string): string {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function PositionCard({ position, onCopy }: PositionCardProps) {
  const { stock, currentValue, gainLoss, gainLossPercent } = position;
  const isPositive = gainLoss >= 0;
  
  // Données pour le mini graphique (simulation basée sur la performance)
  // Générer des points qui montrent une tendance basée sur la performance
  const generateChartData = React.useMemo(() => {
    const points = 10;
    const data = [];
    const baseValue = currentValue / (1 + gainLossPercent / 100);
    
    // Seed basé sur le symbole pour avoir des données stables
    let seed = stock.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      // Simuler une progression vers la valeur actuelle
      const value = baseValue + (currentValue - baseValue) * progress;
      // Ajouter un peu de variation (déterministe)
      const variation = (random() - 0.5) * (currentValue * 0.02);
      data.push({ value: Math.max(value + variation, baseValue * 0.9) });
    }
    return data;
  }, [currentValue, gainLossPercent, stock.symbol]);
  
  const chartData = generateChartData;

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

  const handleCopy = () => {
    // Copier l'ISIN ou le symbole
    const textToCopy = stock.symbol;
    navigator.clipboard.writeText(textToCopy);
    if (onCopy) onCopy();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 min-w-[280px] border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Logo circulaire */}
          <div className={`${getColorForSymbol(stock.symbol)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
            {getInitials(stock.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {stock.name.length > 20 ? stock.name.substring(0, 20) + '...' : stock.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {stock.symbol}
              </span>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copier le symbole"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Valeur actuelle */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(currentValue)}
        </p>
      </div>

      {/* Plus-value */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="font-semibold text-sm">
            {formatCurrency(gainLoss)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            {formatPercent(gainLossPercent)}
          </span>
        </div>
      </div>

      {/* Mini graphique */}
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

