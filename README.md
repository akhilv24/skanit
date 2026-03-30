# ⬡ Skanit — Price Comparison App

> **Find the best price, every time.**

Skanit is a mobile-first price comparison and product discovery app. Scan any product barcode or search by name to instantly compare prices across multiple retailers, track price history, and get AI-powered shopping advice.

![Skanit App](https://img.shields.io/badge/Built%20with-React%20%2B%20Vite-6C63FF?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Product Search** | Search any product by name and get instant results |
| 📷 **Barcode Scanner** | Scan EAN/UPC/QR codes with your camera to look up products |
| 🏪 **Price Comparison** | See prices across Amazon, Walmart, Target, Best Buy & more |
| 📈 **Price History Chart** | SVG sparkline chart showing 12-month price fluctuation |
| ❤️ **Watchlist** | Save products and track price drops (localStorage persisted) |
| 🤖 **Skanit AI** | Groq-powered shopping advisor — ask "Is the MacBook Air M4 worth it?" |
| ✨ **AI SmartReview** | AI-generated pros & cons summary for any product |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/skanit.git
cd skanit
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and add your Groq API key:

```bash
cp .env.example .env
```

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [https://localhost:5173](https://localhost:5173) in your browser.

> **Note:** The app uses HTTPS via `@vitejs/plugin-basic-ssl`. Accept the self-signed certificate warning in your browser on first launch.

For mobile access on the same network:
```bash
npm run dev -- --host
```

---

## 🛠️ Tech Stack

- **React 19** + **Vite 8** — Fast development & HMR
- **Groq SDK** — AI chat & SmartReview (llama-3.1-8b-instant)
- **html5-qrcode** — Camera barcode/QR scanning
- **lucide-react** — Icon library
- **Vanilla CSS** — Custom design system with glassmorphism

---

## 📱 App Structure

```
src/
├── components/
│   ├── Home.jsx          # Landing page with search & deals
│   ├── Scanner.jsx       # Barcode camera scanner
│   ├── ProductPage.jsx   # Price comparison + AI SmartReview
│   ├── Watchlist.jsx     # Saved products tracker
│   ├── AIChat.jsx        # Skanit AI shopping advisor
│   └── BottomNav.jsx     # Navigation bar
├── data/
│   └── mockProducts.js   # Product DB + retailer price generator
├── App.jsx               # Root app with routing state
└── index.css             # Global design system
```

---

## 🌐 External APIs Used

| API | Purpose | Tier |
|---|---|---|
| [OpenFoodFacts](https://world.openfoodfacts.org/api) | Food product lookup by barcode | Free |
| [UPCItemDB](https://www.upcitemdb.com/api/explore) | General product lookup by barcode | Free (100/day) |
| [Groq](https://console.groq.com) | AI chat & review summaries | Free tier |

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_GROQ_API_KEY` | Your Groq API key for AI features | Yes |

---

## 📄 License

MIT © Akhil
