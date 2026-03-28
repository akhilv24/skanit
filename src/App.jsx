import React, { useState } from 'react';
import Scanner from './components/Scanner';
import Cart from './components/Cart';
import { getProductByBarcode } from './data/mockProducts';
import { PackageOpen, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScanSuccess = (barcode) => {
    // Check if the barcode matches any in our mockDB
    const product = getProductByBarcode(barcode);

    if (product) {
      setCartItems((prevItems) => {
        const itemIndex = prevItems.findIndex((item) => item.id === barcode);
        if (itemIndex > -1) {
          // Increase quantity if already in the cart
          const updatedItems = [...prevItems];
          updatedItems[itemIndex].quantity += 1;
          showNotification(`Added another ${product.name} to the bill`);
          return updatedItems;
        } else {
          // Add new item to cart
          showNotification(`${product.name} scanned successfully!`);
          return [...prevItems, { id: barcode, ...product, quantity: 1 }];
        }
      });
    } else {
      showNotification(`Product not found for barcode: ${barcode}`, 'error');
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
    alert("Checkout functionality would be integrated here! Total amount clearly generated.");
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

      <header className="app-header">
        <div className="logo">
          <PackageOpen size={36} color="#00C6FF" />
          <h1>Skanit POS</h1>
        </div>
        <p>Scan your products and checkout instantly.</p>
      </header>

      <main className="main-content">
        <Scanner onScanSuccess={handleScanSuccess} />
        <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
          onCheckout={handleCheckout}
        />
      </main>

      <footer className="test-barcodes">
        <h3>Test Barcodes</h3>
        <p>Use these numbers to generate barcodes on a free online barcode generator and scan them via this app!</p>
        <ul>
          <li><strong>1234567890128</strong> - Premium Roast Coffee</li>
          <li><strong>9876543210987</strong> - Dark Chocolate Bar</li>
          <li><strong>1122334455667</strong> - Wireless Earbuds</li>
          <li><strong>5544332211009</strong> - Organic Honey 500g</li>
        </ul>
      </footer>
    </div>
  );
}

export default App;
