import React from 'react';
import { ShoppingBag, CreditCard, Trash2, Plus, Minus } from 'lucide-react';
import './Cart.css';

const Cart = ({ items, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={48} className="empty-icon" />
        <p>Your cart is empty.</p>
        <span>Scan products to start billing</span>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Current Bill</h2>
        <span className="item-count">{items.length} Items</span>
      </div>

      <div className="cart-items">
        {items.map((item, index) => (
          <div key={item.id + index} className="cart-item">
            <span className="item-icon">{item.image}</span>
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>${item.price.toFixed(2)}</p>
            </div>
            
            <div className="item-actions">
              <div className="quantity-controls">
                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <button className="remove-btn" onClick={() => onRemove(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (8%)</span>
          <span>${(total * 0.08).toFixed(2)}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total To Pay</span>
          <span>${(total * 1.08).toFixed(2)}</span>
        </div>

        <button className="checkout-btn" onClick={onCheckout}>
          <CreditCard size={20} />
          Complete Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
