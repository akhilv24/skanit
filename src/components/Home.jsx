import React, { useState } from 'react';
import { Search, ScanLine, TrendingDown, Zap, ChevronRight, Star, Flame } from 'lucide-react';
import { mockProducts, generateRetailerPrices } from '../data/mockProducts';
import './Home.css';

const FEATURED_PRODUCTS = Object.values(mockProducts);

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
];

const HOT_DEALS = [
  { id: 'hd1', name: 'Kindle Paperwhite', brand: 'Amazon', image: '📖', lowestPrice: 99.99, originalPrice: 139.99, category: 'Electronics', rating: 4.6, reviewCount: 23100, description: '6.8" display, adjustable warm light, waterproof, weeks of battery life.', tags: ['ereader', 'kindle'], priceHistory: [139,129,119,109,99,109,104,99,109,99,99,99] },
  { id: 'hd2', name: 'Instant Pot Duo 7-in-1', brand: 'Instant Pot', image: '🍲', lowestPrice: 59.99, originalPrice: 99.99, category: 'Home', rating: 4.7, reviewCount: 45200, description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, and warmer all in one.', tags: ['cooking', 'kitchen'], priceHistory: [99,89,79,69,59,69,64,59,69,59,59,59] },
  { id: 'hd3', name: 'Nike Air Max 270', brand: 'Nike', image: '👟', lowestPrice: 89.97, originalPrice: 150.00, category: 'Fashion', rating: 4.5, reviewCount: 8740, description: 'Max Air heel unit delivers incredible cushioning every step of the way.', tags: ['shoes', 'running'], priceHistory: [150,140,130,120,109,99,95,89,99,89,89,89] },
];

const Home = ({ onSearch, onProductSelect, isSearching }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const savings = (low, orig) => Math.round(((orig - low) / orig) * 100);

  return (
    <div className="home">
      {/* Header */}
      <header className="home__header">
        <div className="home__logo">
          <span className="home__logo-icon">⬡</span>
          <span className="home__logo-text">Skanit</span>
        </div>
        <div className="home__tagline">Find the best price, every time.</div>
      </header>

      {/* Search Bar */}
      <form className="home__search" onSubmit={handleSubmit}>
        <div className="search-box">
          <Search size={18} className="search-box__icon" />
          <input
            id="home-search-input"
            type="text"
            placeholder="Search any product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
          <button
            type="submit"
            className="search-box__btn"
            disabled={!query.trim() || isSearching}
            id="home-search-btn"
          >
            {isSearching ? <span className="spinner" /> : 'Search'}
          </button>
        </div>
        <div className="search-hints">
          {['AirPods Pro', 'Sony WH-1000XM5', 'Kindle'].map(hint => (
            <button key={hint} type="button" className="hint-chip" onClick={() => { setQuery(hint); onSearch(hint); }}>
              {hint}
            </button>
          ))}
        </div>
      </form>

      {/* Categories */}
      <section className="home__section">
        <div className="home__section-title">
          <span>Browse Categories</span>
        </div>
        <div className="categories-strip">
          {CATEGORIES.map(cat => (
            <button key={cat.id} className="category-chip" id={`cat-${cat.id}`}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="home__section">
        <div className="home__section-title">
          <Flame size={16} className="title-icon title-icon--hot" />
          <span>Hot Deals</span>
        </div>
        <div className="deals-grid">
          {HOT_DEALS.map(product => (
            <button
              key={product.id}
              className="deal-card"
              id={`deal-${product.id}`}
              onClick={() => onProductSelect(product)}
            >
              <div className="deal-card__badge">-{savings(product.lowestPrice, product.originalPrice)}%</div>
              <div className="deal-card__img">{product.image}</div>
              <div className="deal-card__info">
                <p className="deal-card__brand">{product.brand}</p>
                <h3 className="deal-card__name">{product.name}</h3>
                <div className="deal-card__rating">
                  <Star size={11} fill="currentColor" />
                  <span>{product.rating}</span>
                  <span className="deal-card__reviews">({product.reviewCount.toLocaleString()})</span>
                </div>
                <div className="deal-card__prices">
                  <span className="deal-card__price">${product.lowestPrice.toFixed(2)}</span>
                  <span className="deal-card__original">${product.originalPrice.toFixed(2)}</span>
                </div>
              </div>
              <ChevronRight size={16} className="deal-card__arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Featured Scanned */}
      <section className="home__section">
        <div className="home__section-title">
          <Zap size={16} className="title-icon title-icon--zap" />
          <span>Popular Scans</span>
        </div>
        <div className="popular-grid">
          {FEATURED_PRODUCTS.map(product => {
            const prices = generateRetailerPrices(product.lowestPrice, product.id);
            return (
              <button
                key={product.id}
                className="popular-card"
                id={`popular-${product.id}`}
                onClick={() => onProductSelect(product)}
              >
                <span className="popular-card__img">{product.image}</span>
                <div className="popular-card__info">
                  <p className="popular-card__name">{product.name}</p>
                  <div className="popular-card__bottom">
                    <span className="popular-card__price">from ${prices[0].price.toFixed(2)}</span>
                    <TrendingDown size={13} className="popular-card__trend" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
