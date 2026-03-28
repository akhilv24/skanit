export const mockProducts = {
  "1234567890128": {
    name: "Premium Roast Coffee",
    price: 15.99,
    category: "Groceries",
    image: "☕",
  },
  "9876543210987": {
    name: "Dark Chocolate Bar",
    price: 4.50,
    category: "Candy",
    image: "🍫",
  },
  "1122334455667": {
    name: "Wireless Earbuds",
    price: 59.99,
    category: "Electronics",
    image: "🎧",
  },
  "5544332211009": {
    name: "Organic Honey 500g",
    price: 8.99,
    category: "Groceries",
    image: "🍯",
  },
  "0000000000000": {
    name: "Test Product",
    price: 1.00,
    category: "Test",
    image: "📦",
  }
};

export const getProductByBarcode = (barcode) => {
  return mockProducts[barcode] || null;
};
