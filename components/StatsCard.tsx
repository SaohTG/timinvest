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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${changeColor}`}>
              {change}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 transition-colors">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

