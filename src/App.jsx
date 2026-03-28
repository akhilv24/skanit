import React, { useState } from 'react';
import Scanner from './components/Scanner';
import Cart from './components/Cart';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import { getProductByBarcode } from './data/mockProducts';
import { PackageOpen, AlertCircle, Clock, Info } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScanSuccess = async (barcode) => {
    if (isSearchingApi) return; // Prevent spam scanning the same item
    setIsSearchingApi(true);

    try {
      let product = getProductByBarcode(barcode); // Check mockDB first

      if (!product) {
        showNotification(`Searching internet databases...`, 'info');
        
        // 1. Try OpenFoodFacts
        try {
          const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
          const offData = await offRes.json();
          if (offData.status === 1 && offData.product) {
            product = {
              name: offData.product.product_name || offData.product.generic_name || "Food Product",
              category: 'Grocery',
              image: "🛒"
            };
          }
        } catch(e) { console.error("OFF API Error", e); }

        // 2. Try UPCItemDB if not found in openfoodfacts
        if (!product) {
          try {
             // Free tier trial endpoint limit 100/day
             const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
             const upcData = await upcRes.json();
             if (upcData.items && upcData.items.length > 0) {
               product = {
                 name: upcData.items[0].title,
                 category: 'General',
                 image: "📦"
               };
             }
          } catch(e) { console.error("UPCItemDB Error", e); }
        }

        // 3. Fallback Unknown Item
        if (!product) {
          product = {
             name: `Unknown Item (Barcode: ${barcode})`,
             category: 'Unknown',
             image: "❓"
          };
        }

        // Generate reliable deterministic price based on the barcode string digits
        const numPart = parseInt(barcode.replace(/\D/g, '').slice(-4)) || 1234;
        product.price = (numPart % 2000) / 100 + 1.99; // Results in $1.99 to $21.99
      }

      setCartItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === barcode);
        if (itemIndex > -1) {
          const updatedItems = [...prevItems];
          updatedItems[itemIndex].quantity += 1;
          showNotification(`Added another to bill!`, 'success');
          return updatedItems;
        } else {
          showNotification(`Added ${product.name}!`, 'success');
          return [...prevItems, { id: barcode, ...product, quantity: 1 }];
        }
      });
      
    } finally {
      setIsSearchingApi(false);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    alert("Checkout functionality would be integrated here!");
    setCartItems([]);
    showNotification("Bill generated successfully!", 'success');
  };

  return (
    <div className="app-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'success' && <PackageOpen size={20} />}
          {notification.type === 'info' && <Info size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area based on Tabs */}
      <main className="main-content-area">
        {activeTab === 'scan' && (
          <div className="tab-view slide-in">
            <header className="app-header small-header">
              <h1>Scan Item</h1>
              <p>Align barcode to add to bill</p>
            </header>
            <Scanner onScanSuccess={handleScanSuccess} />
            <div className="test-barcodes mobile-hidden">
              <h3>Test Barcodes</h3>
              <p>Type in generator: 1234567890128, 9876543210987</p>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="tab-view slide-in">
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onCheckout={handleCheckout}
            />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-view fade-in">
            <AIChat cartItems={cartItems} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-view empty-state fade-in">
            <Clock size={48} color="rgba(255,255,255,0.3)" />
            <h2>No History Yet</h2>
            <p>Your generated bills will appear here.</p>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
