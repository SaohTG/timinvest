import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Plus, Search, X, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types';

export default function Portfolio() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currency: 'EUR',
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async () => {
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const handleSelectStock = (stock: { symbol: string; name: string }) => {
    setFormData(prev => ({ ...prev, symbol: stock.symbol, name: stock.name }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStock) {
        // Update
        const response = await fetch('/api/stocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStock.id,
            ...formData,
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
          }),
        });
        
        if (response.ok) {
          await fetchStocks();
          closeModal();
        }
      } else {
        // Add new
        const response = await fetch('/api/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
          }),
        });
        
        if (response.ok) {
          await fetchStocks();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) return;
    
    try {
      const response = await fetch(`/api/stocks?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchStocks();
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      quantity: stock.quantity.toString(),
      purchasePrice: stock.purchasePrice.toString(),
      purchaseDate: stock.purchaseDate,
      currency: stock.currency,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingStock(null);
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      currency: 'EUR',
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <>
      <Head>
        <title>Portfolio - TimInvest</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Portfolio</h1>
            <p className="mt-2 text-gray-600">Gérez vos positions boursières</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une action
          </button>
        </div>

        {/* Stocks List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix d'Achat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'Achat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur Investie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stock.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(stock.purchaseDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(stock.quantity * stock.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(stock.id)}
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
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune action</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre première action.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStock ? 'Modifier l\'action' : 'Ajouter une action'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Stock Search */}
              {!editingStock && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rechercher une action
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par symbole ou nom..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          type="button"
                          onClick={() => handleSelectStock(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                        >
                          <span className="font-medium">{result.symbol}</span>
                          <span className="text-sm text-gray-500">{result.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Symbol (read-only when editing) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbole *
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  required
                  readOnly={!!editingStock}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix d'Achat *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'Achat *
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
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
                  {editingStock ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

