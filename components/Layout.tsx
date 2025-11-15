import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TrendingUp, Wallet, Calendar, BarChart3, ChevronRight, Settings, Bell, Share2, Download, Plus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = localStorage.getItem('theme') === 'dark' || 
                     localStorage.getItem('darkMode') === 'true' ||
                     document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };
    
    checkDarkMode();
    
    // Écouter les changements de thème
    window.addEventListener('themechange', checkDarkMode);
    
    // Observer les changements de classe sur documentElement
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      window.removeEventListener('themechange', checkDarkMode);
      observer.disconnect();
    };
  }, []);
  
  const navigation = [
    { name: 'Synthèse', href: '/', icon: BarChart3 },
    { name: 'Patrimoine', href: '/portfolio', icon: Wallet, hasArrow: true },
    { name: 'Analyse', href: '/analysis', icon: BarChart3 },
    { name: 'Dividendes', href: '/dividends', icon: Calendar },
  ];
  
  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen transition-colors ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
          <div className="p-6">
            <div className="flex items-center mb-8">
              <TrendingUp className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TimInvest</span>
            </div>
            
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? `${darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-700'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </div>
                    {item.hasArrow && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User section */}
          <div className={`absolute bottom-0 w-64 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Utilisateur</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className={`sticky top-0 z-10 transition-colors ${darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Action requise
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <ThemeToggle />
                  <Link
                    href="/portfolio"
                    className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compléter mon patrimoine
                  </Link>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

