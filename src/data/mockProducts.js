// Rich product mock database with retailer prices and price history
export const mockProducts = {
  '1234567890128': {
    id: '1234567890128',
    name: 'Apple AirPods Pro (2nd Gen)',
    brand: 'Apple',
    category: 'Electronics',
    image: '🎧',
    rating: 4.8,
    reviewCount: 12483,
    description: 'Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio with dynamic head tracking.',
    tags: ['wireless', 'noise cancelling', 'earbuds'],
    lowestPrice: 189.99,
    originalPrice: 249.00,
    priceHistory: [249, 229, 219, 239, 209, 199, 198, 189, 195, 189, 179, 189],
  },
  '9876543210987': {
    id: '9876543210987',
    name: 'Sony WH-1000XM5 Headphones',
    brand: 'Sony',
    category: 'Electronics',
    image: '🎵',
    rating: 4.7,
    reviewCount: 8921,
    description: 'Industry-leading noise canceling headphones with Auto NC Optimizer and 30-hr battery life.',
    tags: ['wireless', 'noise cancelling', 'over-ear'],
    lowestPrice: 279.99,
    originalPrice: 349.99,
    priceHistory: [349, 329, 319, 299, 289, 279, 299, 279, 269, 279, 289, 279],
  },
  '0123456789012': {
    id: '0123456789012',
    name: 'Samsung 65" QLED 4K TV',
    brand: 'Samsung',
    category: 'Electronics',
    image: '📺',
    rating: 4.6,
    reviewCount: 5234,
    description: 'Quantum Dot technology with 100% Color Volume (DCI-P3), Neo QLED, and Tizen Smart OS.',
    tags: ['tv', '4K', 'QLED', 'smart'],
    lowestPrice: 897.99,
    originalPrice: 1299.99,
    priceHistory: [1299, 1199, 999, 1099, 949, 897, 929, 897, 879, 897, 919, 897],
  },
};

export const getProductByBarcode = (barcode) => {
  return mockProducts[barcode] || null;
};

// Generate deterministic multi-retailer prices from a base price
export const generateRetailerPrices = (basePrice, barcode) => {
  const seed = parseInt(barcode.replace(/\D/g, '').slice(-6)) || 123456;
  const variation = (n) => {
    const x = Math.sin(seed * n) * 10000;
    return x - Math.floor(x);
  };

  const retailers = [
    { id: 'amazon', name: 'Amazon', logo: '📦', color: '#FF9900', prime: true },
    { id: 'walmart', name: 'Walmart', logo: '🏪', color: '#0071CE', prime: false },
    { id: 'target', name: 'Target', logo: '🎯', color: '#CC0000', prime: false },
    { id: 'bestbuy', name: 'Best Buy', logo: '💻', color: '#003087', prime: false },
    { id: 'costco', name: 'Costco', logo: '🏢', color: '#E31837', prime: true },
  ];

  return retailers.map((r, i) => {
    const multiplier = 0.92 + variation(i + 1) * 0.3;
    const price = Math.round(basePrice * multiplier * 100) / 100;
    const inStock = variation(i + 7) > 0.15;
    return { ...r, price, inStock, shipping: i === 0 ? 'Free' : variation(i + 3) > 0.5 ? 'Free' : `$${(3.99 + Math.round(variation(i + 9) * 5)).toFixed(2)}` };
  }).sort((a, b) => a.price - b.price);
};

// Generate mock price history (12 months)
export const generatePriceHistory = (basePrice, barcode) => {
  const seed = parseInt(barcode.replace(/\D/g, '').slice(-4)) || 5678;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let price = basePrice * 1.2;
  return months.map((month, i) => {
    const x = Math.sin(seed * (i + 1) * 0.7) * 0.12;
    price = Math.max(basePrice * 0.75, price * (1 + x));
    return { month, price: Math.round(price * 100) / 100 };
  });
};
