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

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Nostr**: NDK (Nostr Development Kit) with relay pool
- **Icons**: Lucide React
- **QR Codes**: qrcode.react
- **HTTP Client**: Axios
- **Analytics**: Plausible Analytics (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Nostr browser extension (Alby, nos2x, or Flamingo) for publishing reviews

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Michilis/cashu-mint-page.git
   cd cashu-mint-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5174`

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Feature Toggles
VITE_ENABLE_CONTACT=true
VITE_ENABLE_MOTD=true
VITE_ENABLE_ICON=true
VITE_ENABLE_TOS=true
VITE_ENABLE_NUT_TABLE=true

# Analytics Configuration
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_DOMAIN=mintpage.azzamo.net
VITE_ANALYTICS_SRC=https://analytics.azzamo.net/js/script.js

# Server Configuration
VITE_PORT=5174
VITE_PREVIEW_PORT=4173

# Proxy Configuration
VITE_BASE_PATH=/
VITE_API_TARGET=http://localhost:3000
```

### Proxy Configuration

The application can be served behind any proxy or reverse proxy setup:

#### Environment Variables

- **`VITE_BASE_PATH`**: Base path for the application (default: `/`)
  - Examples: `/`, `/21mint.me/`, `/cashu/`, `/mint-info/`
- **`VITE_API_TARGET`**: API proxy target for development (optional)
- **`VITE_ALLOWED_HOSTS`**: Comma-separated list of allowed hosts for proxy setups
  - Leave empty to allow all hosts (recommended for most setups)
  - Example: `mintpage.azzamo.net,localhost,127.0.0.1`

#### Common Proxy Issues

**"Host not allowed" Error:**
If you see: `Blocked request. This host ("your-domain") is not allowed.`

**Solution 1 (Recommended)**: Leave `VITE_ALLOWED_HOSTS` empty to allow all hosts:
```env
VITE_ALLOWED_HOSTS=
```

**Solution 2**: Explicitly allow your domain:
```env
VITE_ALLOWED_HOSTS=mintpage.azzamo.net,localhost
```

**Solution 3**: Update your nginx configuration to preserve the original host:
```nginx
location /21mint.me/ {
    proxy_pass http://localhost:5174/;
    proxy_set_header Host localhost:5174;  # Use backend host
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;  # Original host in separate header
}
```

#### Example Configurations

**Root Path (Default)**:
```env
VITE_BASE_PATH=/
```

**Subpath Deployment**:
```env
VITE_BASE_PATH=/21mint.me/
```

**Multiple Mint Setup**:
```env
VITE_BASE_PATH=/mint-directory/
```

#### Nginx Proxy Examples

**Standard Configuration:**
```nginx
location /21mint.me/ {
    proxy_pass http://localhost:5174/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Host Override (for Vite dev server):**
```nginx
location /21mint.me/ {
    proxy_pass http://localhost:5174/;
    proxy_set_header Host localhost:5174;  # Use backend host
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;  # Original host in separate header
}
```

#### Apache Proxy Example

```apache
ProxyPass /21mint.me/ http://localhost:5174/
ProxyPassReverse /21mint.me/ http://localhost:5174/
ProxyPreserveHost On
```

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

### Server Configuration

The application serves static files and requires:
- Port 5174 (configurable via `VITE_PORT`)
- HTTPS for production (recommended)
- Proper CORS headers for API requests

### Systemd Service (Linux)

Example systemd service configuration:

```ini
[Unit]
Description=Cashu Mint Page - Static Web Application
After=network.target

[Service]
Type=simple
User=cashupage
WorkingDirectory=/home/cashupage/cashu-mint-page
ExecStart=/usr/bin/npm run serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🔌 Nostr Integration

### NIP-87 Protocol Implementation

This application implements [NIP-87](https://github.com/nostr-protocol/nips/blob/master/87.md) for Cashu mint reviews:

- **Kind 38000**: Mint recommendation/review events
- **Kind 38172**: Cashu mint announcement events
- **Proper tagging**: `d`, `u`, `k`, `rating` tags
- **Replaceable events**: NIP-33 compliance

### Relay Pool Architecture

The application uses a robust relay pool for better reliability and performance:

- **Shared NDK Instance**: Single connection shared across the app
- **Multiple Relays**: Redundant connections for better data availability
- **Connection Optimization**: Efficient relay pool management
- **Profile Caching**: Improved username fetching and display

### Supported Relays

The application connects to multiple Nostr relays for better reliability:

- `wss://relay.cashumints.space` (Primary)
- `wss://relay.damus.io`
- `wss://nos.lol`
- `wss://relay.snort.social`
- `wss://relay.primal.net`
- `wss://relay.azzamo.net`

### Browser Extension Support

To publish reviews, users need a Nostr browser extension:

- **[Alby](https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe)** (Recommended)
- **[nos2x](https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp)**
- **[Flamingo](https://chrome.google.com/webstore/detail/flamingo/blndijckeohkahjephlcdpbmohmbgjip)**

## 📋 Usage

### Discovering Mints

1. **Homepage**: View popular mints and recent reviews
2. **Discover Page**: Browse all mints with search and filtering
3. **Search**: Find mints by name or URL
4. **Filter**: Sort by popularity, rating, or date

### Viewing Mint Information

1. Navigate to the application
2. Enter a Cashu mint URL or browse from discover page
3. View comprehensive mint details and features
4. Check real-time status and supported protocols
5. See detailed nut information with hover tooltips

### Reading Reviews

- Reviews are automatically fetched from Nostr relays
- Filter by rating, date, or content length
- View reviewer profiles and verification status
- See aggregated ratings and statistics
- Reviews are deduplicated by user pubkey

### Publishing Reviews

1. **Install Browser Extension**: Download and set up a Nostr extension
2. **Connect Wallet**: Grant permission for signing events
3. **Write Review**: Click "Write Review" and fill out the form
4. **Sign & Publish**: Approve the signing request in your extension
5. **Confirmation**: Review appears immediately after publishing

### Review Format

Reviews are published in this format:
```
[5/5] Great mint! Fast transactions and reliable service.
```

## 🎯 Features in Detail

### Navigation & Layout
- **Global Header**: Consistent navigation across all pages
- **Discover Page**: Comprehensive mint directory with search
- **Conditional Footer**: Global footer on main pages, custom footer on mint pages
- **Clean URLs**: Proper routing without protocol prefixes

### Review System
- **Real-time fetching** from multiple Nostr relays
- **Profile caching** for improved performance
- **Spam detection** and content validation
- **Rating aggregation** with proper statistics
- **Pagination and filtering** for large datasets
- **Username display** with profile fetching

### Mint Information
- **API integration** with `/v1/info` endpoint
- **Feature detection** for supported protocols
- **Status monitoring** and health checks
- **Contact information** parsing and display
- **Detailed nut information** with official specs

### Security
- **Signature verification** for all events
- **Content validation** (length, format, spam detection)
- **Rate limiting** and abuse prevention
- **No tracking or analytics**
- **Shared NDK instance** for optimized connections

## 🔗 Links

- **Live Demo**: [https://mintpage.azzamo.net](https://mintpage.azzamo.net)
- **Cashu Protocol**: [https://cashu.space](https://cashu.space)
- **Nostr Protocol**: [https://nostr.com](https://nostr.com)
- **NIP-87 Specification**: [Cashu Mint Discoverability](https://github.com/nostr-protocol/nips/blob/master/87.md)

---

Made with ❤️ by [Azzamo](https://azzamo.net)