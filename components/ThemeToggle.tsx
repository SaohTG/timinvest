import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Charger la préférence depuis localStorage
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   localStorage.getItem('darkMode') === 'true' ||
                   (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('darkMode', 'false');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Déclencher un événement pour notifier les autres composants
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors ${
        darkMode 
          ? 'hover:bg-gray-700 text-gray-300' 
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

