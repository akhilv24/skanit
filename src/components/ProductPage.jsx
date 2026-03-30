import React, { useState } from 'react';
import {
  ArrowLeft, Star, Heart, HeartOff, ExternalLink, TrendingDown,
  TrendingUp, Minus, CheckCircle, XCircle, Bot, ChevronDown, ChevronUp, ShoppingCart
} from 'lucide-react';
import Groq from 'groq-sdk';
import './ProductPage.css';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'dummy',
  dangerouslyAllowBrowser: true,
});

// SVG Sparkline Price History Chart
const PriceChart = ({ history, lowestPrice }) => {
  if (!history || history.length === 0) return null;
  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 300, H = 80;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 16) - 4;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `${pts[0].split(',')[0]},${H} ${polyline} ${pts[pts.length - 1].split(',')[0]},${H}`;

  const currentPrice = prices[prices.length - 1];
  const trend = currentPrice < prices[0] ? 'down' : currentPrice > prices[0] ? 'up' : 'flat';

  return (
    <div className="price-chart">
      <div className="price-chart__header">
        <span className="price-chart__label">12-Month Price History</span>
        <div className={`price-chart__trend price-chart__trend--${trend}`}>
          {trend === 'down' && <TrendingDown size={14} />}
          {trend === 'up' && <TrendingUp size={14} />}
          {trend === 'flat' && <Minus size={14} />}
          <span>{trend === 'down' ? 'Price dropped' : trend === 'up' ? 'Price rising' : 'Stable'}</span>
        </div>
      </div>
      <div className="price-chart__svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="price-chart__svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#chartGrad)" />
          <polyline points={polyline} fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Current dot */}
          <circle
            cx={parseFloat(pts[pts.length - 1].split(',')[0])}
            cy={parseFloat(pts[pts.length - 1].split(',')[1])}
            r="4"
            fill="#6C63FF"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
        <div className="price-chart__axis">
          {history.filter((_, i) => i % 3 === 0).map(h => (
            <span key={h.month}>{h.month}</span>
          ))}
        </div>
      </div>
      <div className="price-chart__minmax">
        <span className="price-chart__low">Low: ${Math.min(...prices).toFixed(2)}</span>
        <span>All time</span>
        <span className="price-chart__high">High: ${Math.max(...prices).toFixed(2)}</span>
      </div>
    </div>
  );
};

// AI Smart Review Summary
const SmartReview = ({ product }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const generateReview = async () => {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      setSummary({ pros: ['Great build quality', 'Excellent performance', 'Good value for money'], cons: ['Limited color options', 'No carrying case included'] });
      setExpanded(true);
      return;
    }
    setLoading(true);
    try {
      const res = await groq.chat.completions.create({
        messages: [{
          role: 'user',
          content: `You are a product review summarizer for a price comparison app called Skanit.
Summarize the likely customer sentiment for "${product.name}" by ${product.brand || 'the brand'} (${product.category}).
Give exactly 3 pros and 3 cons in JSON format: { "pros": [...], "cons": [...] }
Keep each point under 8 words. Be honest and realistic. Return ONLY the JSON.`
        }],
        model: 'llama-3.1-8b-instant',
      });
      const content = res.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
      setSummary({ pros: parsed.pros || [], cons: parsed.cons || [] });
      setExpanded(true);
    } catch (e) {
      console.error(e);
      setSummary({ pros: ['Good overall quality', 'Competitive pricing', 'Reliable performance'], cons: ['Read reviews for specific concerns', 'Check warranty details', 'Compare alternatives first'] });
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-review">
      <div className="smart-review__header" onClick={() => summary ? setExpanded(e => !e) : generateReview()}>
        <div className="smart-review__title">
          <Bot size={16} className="smart-review__icon" />
          <span>AI SmartReview</span>
          <span className="smart-review__badge">AI</span>
        </div>
        {!summary && !loading && <span className="smart-review__cta">Generate →</span>}
        {loading && <span className="smart-review__loading"><span className="dot-pulse" /></span>}
        {summary && (expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </div>

      {summary && expanded && (
        <div className="smart-review__body">
          <div className="review-col review-col--pros">
            <div className="review-col__label"><CheckCircle size={13} /> Pros</div>
            {summary.pros.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="review-col review-col--cons">
            <div className="review-col__label"><XCircle size={13} /> Cons</div>
            {summary.cons.map((c, i) => <p key={i}>{c}</p>)}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductPage = ({ product, isInWatchlist, onToggleWatchlist, onBack }) => {
  const bestPrice = product.retailerPrices?.[0];
  const savings = product.originalPrice
    ? ((product.originalPrice - (bestPrice?.price || product.lowestPrice)) / product.originalPrice * 100).toFixed(0)
    : null;

  return (
    <div className="product-page">
      {/* Top Bar */}
      <div className="product-page__topbar">
        <button className="topbar__back" onClick={onBack} id="product-back-btn">
          <ArrowLeft size={20} />
        </button>
        <span className="topbar__title">Price Comparison</span>
        <button
          className={`topbar__watchlist ${isInWatchlist ? 'active' : ''}`}
          onClick={onToggleWatchlist}
          id="product-watchlist-btn"
        >
          {isInWatchlist ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
        </button>
      </div>

      {/* Product Hero */}
      <div className="product-hero">
        <div className="product-hero__img">{product.image}</div>
        <div className="product-hero__info">
          <p className="product-hero__brand">{product.brand}</p>
          <h1 className="product-hero__name">{product.name}</h1>
          <div className="product-hero__meta">
            <div className="product-hero__rating">
              <Star size={13} fill="#F7C948" color="#F7C948" />
              <span>{product.rating?.toFixed(1) || '4.0'}</span>
              <span className="product-hero__reviews">({(product.reviewCount || 0).toLocaleString()} reviews)</span>
            </div>
            {product.category && <span className="product-hero__tag">{product.category}</span>}
          </div>
          <div className="product-hero__price-block">
            <span className="product-hero__price">
              ${(bestPrice?.price || product.lowestPrice || 0).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="product-hero__original">${product.originalPrice.toFixed(2)}</span>
            )}
            {savings && parseInt(savings) > 0 && (
              <span className="product-hero__savings">Save {savings}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="product-desc">{product.description}</div>
      )}

      {/* Price Comparison */}
      {product.retailerPrices && product.retailerPrices.length > 0 && (
        <section className="product-section">
          <h2 className="product-section__title">Compare Prices</h2>
          <div className="retailer-list">
            {product.retailerPrices.map((r, i) => (
              <div key={r.id} className={`retailer-row ${i === 0 ? 'retailer-row--best' : ''}`}>
                <div className="retailer-row__left">
                  <span className="retailer-row__logo">{r.logo}</span>
                  <div>
                    <p className="retailer-row__name">{r.name}</p>
                    <p className="retailer-row__ship">{r.inStock ? `Shipping: ${r.shipping}` : 'Out of stock'}</p>
                  </div>
                </div>
                <div className="retailer-row__right">
                  {i === 0 && <span className="best-badge">Best</span>}
                  <span className={`retailer-row__price ${!r.inStock ? 'retailer-row__price--oos' : ''}`}>
                    {r.inStock ? `$${r.price.toFixed(2)}` : '—'}
                  </span>
                  {r.inStock && (
                    <button className="retailer-row__go" id={`buy-${r.id}`}>
                      <ExternalLink size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Price History Chart */}
      {product.priceHistory && (
        <section className="product-section">
          <PriceChart history={product.priceHistory} lowestPrice={product.lowestPrice} />
        </section>
      )}

      {/* AI SmartReview */}
      <section className="product-section">
        <SmartReview product={product} />
      </section>

      {/* Watchlist CTA */}
      <div className="product-cta">
        <button
          className={`cta-btn ${isInWatchlist ? 'cta-btn--active' : ''}`}
          onClick={onToggleWatchlist}
          id="product-watchlist-cta"
        >
          {isInWatchlist ? (
            <><HeartOff size={18} /> Remove from Watchlist</>
          ) : (
            <><Heart size={18} /> Track Price Drop</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductPage;
