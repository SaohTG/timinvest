import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { TrendingUp, Wallet, Calendar, BarChart3, ChevronRight, Settings, Bell, Share2, Download, Plus, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Si non connecté et pas sur login/signup, rediriger
          if (router.pathname !== '/login' && router.pathname !== '/signup') {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        if (router.pathname !== '/login' && router.pathname !== '/signup') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Générer les initiales
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Ne pas afficher le layout sur les pages de login/signup
  if (router.pathname === '/login' || router.pathname === '/signup') {
    return <>{children}</>;
  }

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
  
  const navigation = [
    { name: 'Synthèse', href: '/', icon: BarChart3 },
    { name: 'Patrimoine', href: '/portfolio', icon: Wallet, hasArrow: true },
    { name: 'Analyse', href: '/analysis', icon: BarChart3 },
    { name: 'Dividendes', href: '/dividends', icon: Calendar },
  ];
  
  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl' : 'bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-soft'}`}>
          <div className="p-6">
            <div className="flex items-center mb-8 animate-fade-in">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-primary-600 dark:text-primary-400 drop-shadow-lg" />
                <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl pulse-glow"></div>
              </div>
              <span className="ml-2 text-xl font-bold gradient-text">TimInvest</span>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 animate-slide-up ${
                      isActive
                        ? `${darkMode ? 'bg-gradient-to-r from-primary-900/40 to-primary-800/30 text-primary-300 shadow-lg shadow-primary-500/20' : 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-md'}`
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {item.name}
                    </div>
                    {item.hasArrow && (
                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User section */}
          <div className={`absolute bottom-0 w-64 p-4 border-t backdrop-blur-sm ${darkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-200/50 bg-white/50'}`}>
            {user ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-primary-500/30 ring-2 ring-primary-500/20">
                      {getInitials(user.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold shadow-md">
                  ?
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Non connecté</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className={`sticky top-0 z-10 transition-all duration-300 ${darkMode ? 'bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-lg' : 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-soft'}`}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className={`group px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    darkMode ? 'bg-gradient-to-r from-red-900/40 to-red-800/30 text-red-300 border border-red-800/50 hover:shadow-lg hover:shadow-red-500/20' : 'bg-gradient-to-r from-red-50 to-red-100/50 text-red-600 border border-red-200 hover:shadow-md'
                  }`}>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                      Action requise
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-gray-700/50 hover:shadow-md' : 'hover:bg-gray-100 hover:shadow-sm'}`}>
                    <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-gray-700/50 hover:shadow-md' : 'hover:bg-gray-100 hover:shadow-sm'}`}>
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className={`relative p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-gray-700/50 hover:shadow-md' : 'hover:bg-gray-100 hover:shadow-sm'}`}>
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-gray-700/50 hover:shadow-md' : 'hover:bg-gray-100 hover:shadow-sm'}`}>
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <ThemeToggle />
                  <Link
                    href="/portfolio"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compléter mon patrimoine
                  </Link>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

