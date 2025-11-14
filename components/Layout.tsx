import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TrendingUp, Wallet, Calendar, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Portfolio', href: '/portfolio', icon: Wallet },
    { name: 'Dividendes', href: '/dividends', icon: Calendar },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">TimInvest</span>
            </div>
            <nav className="flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

