# Cashu Mint Page

A modern, responsive web application for discovering and reviewing Cashu mints. Built with React, TypeScript, and Vite, featuring real-time Nostr integration for decentralized reviews using the NIP-87 protocol.

🌐 **Live Demo**: [https://mintpage.azzamo.net](https://mintpage.azzamo.net)

## ✨ Features

### 🏦 Mint Discovery & Information
- **Global mint directory** with search, filtering, and sorting
- **Comprehensive mint details** including name, description, and technical information
- **Real-time mint status** fetched from `/v1/info` endpoint
- **Supported nuts and features** with detailed explanations and hover tooltips
- **Contact information** and terms of service
- **QR code generation** for easy mobile access
- **Popular mints showcase** on homepage

### 📝 Decentralized Reviews System
- **NIP-87 Protocol Implementation** for Cashu mint reviews
- **Real-time review fetching** from multiple Nostr relays using relay pool
- **Browser extension signing** (Alby, nos2x, Flamingo support)
- **User profile integration** with Nostr metadata and username display
- **Rating system** (1-5 stars) with detailed feedback
- **Review filtering and pagination**
- **Review deduplication** by user pubkey

### 🧭 Navigation & UI
- **Global header** with navigation links (Home, Discover, More info, Wallets)
- **Discover page** showing all mints with search and filtering
- **Responsive design** optimized for all devices
- **Dark theme** with purple accent colors
- **Smooth animations** and transitions
- **Loading states** and error handling
- **Accessible components** with proper ARIA labels

### 🔐 Security & Privacy
- **Signature verification** for all reviews
- **Multi-relay architecture** with shared NDK instance for redundancy
- **Content validation** and spam protection
- **Browser extension authentication**
- **No personal data collection**
- **Privacy-focused analytics** (Plausible)


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Nostr browser extension (Alby, nos2x, or Flamingo) for publishing reviews


### Analytics

The application includes privacy-focused analytics using Plausible Analytics:

- **Configurable**: Can be disabled by setting `VITE_ENABLE_ANALYTICS=false`
- **Privacy-focused**: No personal data collection or tracking
- **Custom Events**: Tracks mint views, review submissions, and user interactions
- **Lightweight**: Minimal performance impact
- **Global Integration**: Analytics script loaded in global header

## 📜 Scripts

- `npm run dev` - Start development server on port 5174
- `npm run build` - Build for production (uses environment variables)
- `npm run build:root` - Build for root path deployment (`/`)
- `npm run build:subpath` - Build for subpath deployment (uses `VITE_BASE_PATH`)
- `npm run serve` - Serve production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🌐 Production Deployment

### Build for Production

```bash
npm run build
npm run serve
```

## 🔌 Nostr Integration

### NIP-87 Protocol Implementation

This application implements [NIP-87](https://github.com/nostr-protocol/nips/blob/master/87.md) for Cashu mint reviews:

- **Kind 38000**: Mint recommendation/review events
- **Kind 38172**: Cashu mint announcement events
- **Proper tagging**: `d`, `u`, `k`, `rating` tags
- **Replaceable events**: NIP-33 compliance


### Browser Extension Support

To publish reviews, users need a Nostr browser extension:

- **[Alby](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe)** (Recommended)
- **[nos2x](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)**
- **[Flamingo](https://chrome.google.com/webstore/detail/flamingo/blndijckeohkahjephlcdpbmohmbgjip)**



## 🔗 Links

- **Live Demo**: [https://mintpage.azzamo.net](https://mintpage.azzamo.net)
- **Cashu Protocol**: [https://cashu.space](https://cashu.space)
- **Nostr Protocol**: [https://nostr.com](https://nostr.com)
- **NIP-87 Specification**: [Cashu Mint Discoverability](https://github.com/nostr-protocol/nips/blob/master/87.md)

---

Made with ❤️ by [Azzamo](https://azzamo.net)