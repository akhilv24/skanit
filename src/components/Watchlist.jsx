import React from 'react';
import { Heart, ChevronRight, Bell, Package, TrendingDown } from 'lucide-react';
import { generateRetailerPrices } from '../data/mockProducts';
import './Watchlist.css';

const Watchlist = ({ items, onRemove, onProductSelect }) => {
  if (items.length === 0) {
    return (
      <div className="watchlist">
        <header className="watchlist__header">
          <h1 className="watchlist__title">Watchlist</h1>
          <p className="watchlist__subtitle">Track prices and get notified of drops</p>
        </header>
        <div className="watchlist-empty">
          <div className="watchlist-empty__icon">
            <Heart size={40} />
          </div>
          <h2>No items tracked</h2>
          <p>Tap the heart on any product to start tracking its price.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <header className="watchlist__header">
        <h1 className="watchlist__title">Watchlist</h1>
        <p className="watchlist__subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} tracked</p>
      </header>

      <div className="watchlist__notice">
        <Bell size={13} />
        <span>You'll be notified when prices drop on tracked items.</span>
      </div>

      <div className="watchlist-list">
        {items.map(product => {
          const prices = generateRetailerPrices(product.lowestPrice || 29.99, product.id || '000000');
          const bestPrice = prices[0]?.price || product.lowestPrice || 29.99;
          const hasDrop = product.originalPrice && bestPrice < product.originalPrice;
          const dropPct = hasDrop ? Math.round((product.originalPrice - bestPrice) / product.originalPrice * 100) : 0;

          return (
            <button
              key={product.id}
              className="watch-card"
              id={`watch-${product.id}`}
              onClick={() => onProductSelect(product)}
            >
              <div className="watch-card__img">{product.image}</div>
              <div className="watch-card__info">
                <p className="watch-card__brand">{product.brand}</p>
                <h3 className="watch-card__name">{product.name}</h3>
                <div className="watch-card__price-row">
                  <span className="watch-card__price">${bestPrice.toFixed(2)}</span>
                  {hasDrop && dropPct > 0 && (
                    <span className="watch-card__drop">
                      <TrendingDown size={11} /> -{dropPct}%
                    </span>
                  )}
                </div>
                <p className="watch-card__stores">{prices.filter(p => p.inStock).length} stores available</p>
              </div>
              <div className="watch-card__actions" onClick={e => e.stopPropagation()}>
                <button
                  className="watch-card__remove"
                  onClick={(e) => { e.stopPropagation(); onRemove(product.id); }}
                  id={`remove-watch-${product.id}`}
                >
                  <Heart size={16} fill="currentColor" className="watch-card__heart" />
                </button>
                <ChevronRight size={16} className="watch-card__arrow" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
