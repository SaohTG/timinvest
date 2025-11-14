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
    changeType === 'positive' ? 'text-green-600' :
    changeType === 'negative' ? 'text-red-600' :
    'text-gray-600';
    
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-2 text-sm font-medium ${changeColor}`}>
              {change}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="bg-primary-100 rounded-full p-3">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

