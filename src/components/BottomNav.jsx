import React from 'react';
import { Home, ScanLine, Heart, MessageSquare } from 'lucide-react';
import './BottomNav.css';

const TABS = [
  { id: 'home',      label: 'Home',    Icon: Home },
  { id: 'scan',      label: 'Scan',    Icon: ScanLine },
  { id: 'watchlist', label: 'Saved',   Icon: Heart },
  { id: 'chat',      label: 'AI Chat', Icon: MessageSquare },
];

const BottomNav = ({ activeTab, onTabChange, watchlistCount }) => {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        const showBadge = id === 'watchlist' && watchlistCount > 0;
        return (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <div className="nav-item__icon-wrap">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {showBadge && (
                <span className="nav-item__badge">{watchlistCount > 9 ? '9+' : watchlistCount}</span>
              )}
            </div>
            <span className="nav-item__label">{label}</span>
            {isActive && <span className="nav-item__indicator" />}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
