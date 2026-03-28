import React, { useState } from 'react';
import Scanner from './components/Scanner';
import Cart from './components/Cart';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import { getProductByBarcode } from './data/mockProducts';
import { PackageOpen, AlertCircle, Clock } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScanSuccess = (barcode) => {
    const product = getProductByBarcode(barcode);

    if (product) {
      setCartItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === barcode);
        if (itemIndex > -1) {
          const updatedItems = [...prevItems];
          updatedItems[itemIndex].quantity += 1;
          showNotification(`Added another ${product.name}`);
          return updatedItems;
        } else {
          showNotification(`${product.name} scanned!`);
          return [...prevItems, { id: barcode, ...product, quantity: 1 }];
        }
      });
    } else {
      showNotification(`Product not found: ${barcode}`, 'error');
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
          {notification.type === 'error' ? <AlertCircle size={20} /> : <PackageOpen size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area based on Tabs */}
      <main className="main-content-area">
        {activeTab === 'scan' && (
          <div className="tab-view slide-in">
            <header className="app-header small-header">
              <h1>Scan Item</h1>
              <p>Align barcode to add to cart</p>
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
