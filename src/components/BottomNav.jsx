import React from 'react';
import { ScanLine, ShoppingBag, MessageSquare, History } from 'lucide-react';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
        onClick={() => onTabChange('scan')}
      >
        <ScanLine size={24} />
        <span>Scan</span>
      </button>
      
      <button 
        className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => onTabChange('cart')}
      >
        <ShoppingBag size={24} />
        <span>Cart</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => onTabChange('chat')}
      >
        <MessageSquare size={24} />
        <span>AI Talk</span>
      </button>

      {/* Adding History as a visual tab, implementation can be later or just a placeholder */}
      <button 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <History size={24} />
        <span>History</span>
      </button>
    </nav>
  );
};

export default BottomNav;
