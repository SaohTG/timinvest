import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  subtitle?: string;
}

export default function StatsCard({ title, value, change, changeType = 'neutral', icon: Icon, subtitle }: StatsCardProps) {
  const changeColor = 
    changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
    changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
    'text-gray-600 dark:text-gray-400';
    
  return (
    <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md dark:shadow-gray-700/50 p-6 border border-gray-200/50 dark:border-gray-700/50 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-semibold ${changeColor}`}>
              {change}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/30 rounded-xl p-3 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg shadow-md">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

