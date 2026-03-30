import React, { useState, useCallback } from 'react';
import Scanner from './components/Scanner';
import Home from './components/Home';
import ProductPage from './components/ProductPage';
import Watchlist from './components/Watchlist';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import { getProductByBarcode, generateRetailerPrices, generatePriceHistory } from './data/mockProducts';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('skanit_watchlist') || '[]'); }
    catch { return []; }
  });
  const [isSearching, setIsSearching] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const buildProductData = (raw, barcode) => {
    const base = raw.lowestPrice || raw.price || 29.99;
    const prices = generateRetailerPrices(base, barcode || raw.id || '000000');
    const history = raw.priceHistory
      ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({ month: m, price: raw.priceHistory[i] || base }))
      : generatePriceHistory(base, barcode || '000000');
    return { ...raw, retailerPrices: prices, priceHistory: history, lowestPrice: prices[0]?.price || base };
  };

  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    showNotification('Searching...', 'info');

    try {
      // First check mock DB
      const mockResult = Object.values(await import('./data/mockProducts.js').then(m => m.mockProducts))
        .find(p => p.name.toLowerCase().includes(query.toLowerCase()));

      if (mockResult) {
        setCurrentProduct(buildProductData(mockResult, mockResult.id));
        setActiveTab('product');
        return;
      }

      // Try UPCItemDB with search
      const res = await fetch(`https://api.upcitemdb.com/prod/trial/search?s=${encodeURIComponent(query)}&type=product`);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const barcode = item.upc || item.ean || '000000000000';
        const raw = {
          id: barcode,
          name: item.title,
          brand: item.brand || 'Unknown',
          category: item.category || 'General',
          image: '📦',
          rating: 4.0 + (parseInt(barcode.slice(-1)) % 10) / 10,
          reviewCount: 100 + parseInt(barcode.slice(-3)),
          description: item.description || '',
          lowestPrice: item.lowest_recorded_price || 19.99,
          originalPrice: item.highest_recorded_price || 29.99,
          tags: [],
        };
        setCurrentProduct(buildProductData(raw, barcode));
        setActiveTab('product');
      } else {
        showNotification('No products found. Try a different search.', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Search failed. Check your connection.', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  const handleScanSuccess = useCallback(async (barcode) => {
    if (isSearching) return;
    setIsSearching(true);
    showNotification('Looking up product...', 'info');

    try {
      let raw = getProductByBarcode(barcode);

      if (!raw) {
        // Try OpenFoodFacts
        try {
          const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
          const offData = await offRes.json();
          if (offData.status === 1 && offData.product) {
            raw = {
              id: barcode,
              name: offData.product.product_name || offData.product.generic_name || 'Food Product',
              brand: offData.product.brands || 'Unknown',
              category: 'Grocery',
              image: '🛒',
              rating: 3.8 + (parseInt(barcode.slice(-1)) % 12) / 10,
              reviewCount: 50 + parseInt(barcode.slice(-3) || '0'),
              description: offData.product.ingredients_text || 'No description available.',
              lowestPrice: null,
              tags: ['food', 'grocery'],
            };
          }
        } catch (e) { console.error(e); }

        // Try UPCItemDB
        if (!raw) {
          try {
            const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
            const upcData = await upcRes.json();
            if (upcData.items && upcData.items.length > 0) {
              const item = upcData.items[0];
              raw = {
                id: barcode,
                name: item.title,
                brand: item.brand || 'Unknown',
                category: item.category || 'General',
                image: '📦',
                rating: 4.0 + (parseInt(barcode.slice(-1)) % 10) / 10,
                reviewCount: 100 + parseInt(barcode.slice(-3)),
                description: item.description || '',
                lowestPrice: item.lowest_recorded_price || null,
                originalPrice: item.highest_recorded_price || null,
                tags: [],
              };
            }
          } catch (e) { console.error(e); }
        }

        // Fallback
        if (!raw) {
          const numPart = parseInt(barcode.replace(/\D/g, '').slice(-4)) || 1234;
          raw = {
            id: barcode,
            name: `Unknown Product`,
            brand: 'Unknown',
            category: 'General',
            image: '❓',
            rating: 3.5,
            reviewCount: 0,
            description: `Barcode: ${barcode}`,
            lowestPrice: (numPart % 2000) / 100 + 4.99,
            tags: [],
          };
        }
      }

      if (!raw.lowestPrice) {
        const numPart = parseInt(barcode.replace(/\D/g, '').slice(-4)) || 1234;
        raw.lowestPrice = (numPart % 5000) / 100 + 9.99;
      }

      setCurrentProduct(buildProductData(raw, barcode));
      setActiveTab('product');
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  const toggleWatchlist = (product) => {
    setWatchlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(p => p.id !== product.id);
        showNotification('Removed from Watchlist', 'info');
      } else {
        updated = [...prev, { ...product, addedAt: Date.now() }];
        showNotification('Added to Watchlist! 🔔', 'success');
      }
      localStorage.setItem('skanit_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWatchlist = (productId) => watchlist.some(p => p.id === productId);

  return (
    <div className="app-root">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast--${notification.type}`}>
          <span className="toast__icon">
            {notification.type === 'success' && <CheckCircle size={17} />}
            {notification.type === 'error' && <AlertCircle size={17} />}
            {notification.type === 'info' && <Info size={17} />}
          </span>
          <span>{notification.message}</span>
          <button className="toast__close" onClick={() => setNotification(null)}><X size={14} /></button>
        </div>
      )}

      <main className="app-main">
        {activeTab === 'home' && (
          <div className="view-slide-up">
            <Home
              onSearch={handleSearch}
              onProductSelect={(product) => {
                setCurrentProduct(buildProductData(product, product.id));
                setActiveTab('product');
              }}
              isSearching={isSearching}
            />
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="view-slide-up">
            <Scanner onScanSuccess={handleScanSuccess} isSearching={isSearching} />
          </div>
        )}

        {activeTab === 'product' && currentProduct && (
          <div className="view-pop-in">
            <ProductPage
              product={currentProduct}
              isInWatchlist={isInWatchlist(currentProduct.id)}
              onToggleWatchlist={() => toggleWatchlist(currentProduct)}
              onBack={() => setActiveTab('home')}
            />
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="view-slide-up">
            <Watchlist
              items={watchlist}
              onRemove={(id) => {
                setWatchlist(prev => {
                  const updated = prev.filter(p => p.id !== id);
                  localStorage.setItem('skanit_watchlist', JSON.stringify(updated));
                  return updated;
                });
                showNotification('Removed from Watchlist', 'info');
              }}
              onProductSelect={(product) => {
                setCurrentProduct(buildProductData(product, product.id));
                setActiveTab('product');
              }}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="view-slide-up">
            <AIChat />
          </div>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'product') setActiveTab(tab);
          else setActiveTab(tab);
        }}
        watchlistCount={watchlist.length}
      />
    </div>
  );
}

export default App;
