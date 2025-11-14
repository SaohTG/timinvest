import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Plus, Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';
import { Dividend } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dividends() {
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState({
    stockSymbol: '',
    stockName: '',
    amount: '',
    exDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    frequency: 'Trimestriel',
    currency: 'EUR',
  });

  useEffect(() => {
    fetchDividends();
  }, []);

  const fetchDividends = async () => {
    try {
      const response = await fetch('/api/dividends');
      const data = await response.json();
      setDividends(data);
    } catch (error) {
      console.error('Error fetching dividends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/dividends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });
      
      if (response.ok) {
        await fetchDividends();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving dividend:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dividende ?')) return;
    
    try {
      const response = await fetch(`/api/dividends?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchDividends();
      }
    } catch (error) {
      console.error('Error deleting dividend:', error);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormData({
      stockSymbol: '',
      stockName: '',
      amount: '',
      exDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      frequency: 'Trimestriel',
      currency: 'EUR',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  // Calcul du total des dividendes
  const totalDividends = dividends.reduce((sum, div) => sum + div.amount, 0);
  
  // Dividendes du mois en cours
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDividends = dividends.filter(div => {
    const paymentDate = new Date(div.paymentDate);
    return paymentDate >= monthStart && paymentDate <= monthEnd;
  });
  
  // Calendrier
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfMonth = monthStart.getDay();
  
  const getDividendsForDay = (day: Date) => {
    return dividends.filter(div => isSameDay(new Date(div.paymentDate), day));
  };

  return (
    <>
      <Head>
        <title>Dividendes - TimInvest</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendrier des Dividendes</h1>
            <p className="mt-2 text-gray-600">Suivez vos revenus de dividendes</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un dividende
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total des Dividendes</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{formatCurrency(totalDividends)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Ce Mois-ci</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCurrency(monthDividends.reduce((sum, div) => sum + div.amount, 0))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Nombre de Paiements</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{dividends.length}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {/* Day headers */}
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="bg-gray-50 px-2 py-3 text-center text-xs font-semibold text-gray-700">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white h-24" />
            ))}
            
            {/* Calendar days */}
            {monthDays.map(day => {
              const dayDividends = getDividendsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toString()}
                  className={`bg-white h-24 p-2 ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {format(day, 'd')}
                  </div>
                  {dayDividends.length > 0 && (
                    <div className="space-y-1">
                      {dayDividends.slice(0, 2).map(div => (
                        <div
                          key={div.id}
                          className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                          title={`${div.stockSymbol}: ${formatCurrency(div.amount)}`}
                        >
                          {div.stockSymbol} {formatCurrency(div.amount)}
                        </div>
                      ))}
                      {dayDividends.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayDividends.length - 2} de plus
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dividends List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Dividendes</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : dividends.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Ex-Dividende
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fréquence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dividends.map((dividend) => (
                    <tr key={dividend.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dividend.stockSymbol}</div>
                          <div className="text-sm text-gray-500">{dividend.stockName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(dividend.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(dividend.exDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(dividend.paymentDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dividend.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(dividend.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun dividende</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter vos dividendes reçus.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ajouter un dividende</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbole *
                </label>
                <input
                  type="text"
                  value={formData.stockSymbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockSymbol: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'Action
                </label>
                <input
                  type="text"
                  value={formData.stockName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Ex-Dividende *
                </label>
                <input
                  type="date"
                  value={formData.exDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de Paiement *
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option>Mensuel</option>
                  <option>Trimestriel</option>
                  <option>Semestriel</option>
                  <option>Annuel</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

