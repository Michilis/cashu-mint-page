import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noindex?: boolean;
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://cashumints.space/og-image.png',
  ogType = 'website',
  structuredData,
  noindex = false,
}: SEOProps) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Get or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement;
      
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Update basic meta tags
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', description, true);
      updateMetaTag('twitter:description', description, true);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update robots meta tag
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
    updateMetaTag('robots', robotsContent);

    // Update title meta tags
    if (title) {
      updateMetaTag('title', title);
      updateMetaTag('og:title', title, true);
      updateMetaTag('twitter:title', title, true);
    }

    // Update Open Graph and Twitter meta tags
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true);
      updateMetaTag('twitter:url', canonicalUrl, true);
      
      // Update or create canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonicalUrl;
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage, true);
    }

    if (ogType) {
      updateMetaTag('og:type', ogType, true);
    }

    // Update structured data
    if (structuredData) {
      // Remove existing structured data script if any
      const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      // Reset title to default
      document.title = 'Explore Trusted Cashu Mints - Cashumints.space';
      
      // Reset description to default
      updateMetaTag('description', 'Find and compare trusted Cashu mints. View supported NUTs, user reviews, and wallet compatibility. Discover how to safely use Cashu.');
      updateMetaTag('og:description', 'Find and compare trusted Cashu mints. View supported NUTs, user reviews, and wallet compatibility. Discover how to safely use Cashu.', true);
      updateMetaTag('twitter:description', 'Find and compare trusted Cashu mints. View supported NUTs, user reviews, and wallet compatibility. Discover how to safely use Cashu.', true);
      
      // Reset other meta tags to defaults
      updateMetaTag('og:title', 'Explore Trusted Cashu Mints - Cashumints.space', true);
      updateMetaTag('twitter:title', 'Explore Trusted Cashu Mints - Cashumints.space', true);
      updateMetaTag('og:url', 'https://cashumints.space/', true);
      updateMetaTag('twitter:url', 'https://cashumints.space/', true);
      updateMetaTag('robots', 'index, follow');

      // Remove dynamic structured data
      const dynamicScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
      if (dynamicScript) {
        document.head.removeChild(dynamicScript);
      }

      // Reset canonical URL
      const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonicalLink) {
        canonicalLink.href = 'https://cashumints.space/';
      }
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, structuredData, noindex]);
};

// Utility function to generate mint-specific structured data
export const createMintStructuredData = (mintInfo: any, mintPath: string) => {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "FinancialService"],
    "name": mintInfo.name || mintPath,
    "description": mintInfo.description || `Cashu mint information for ${mintInfo.name || mintPath}`,
    "url": mintInfo.url || `https://${mintPath}`,
    "identifier": mintInfo.pubkey,
    "serviceType": "Cashu Mint",
    "category": "Bitcoin",
    "applicationCategory": "FinanceApplication",
    "offers": {
      "@type": "Offer",
      "description": "Cashu ecash minting service",
      "price": "0",
      "priceCurrency": "BTC"
    },
    "contactPoint": mintInfo.contact ? {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": mintInfo.contact.email,
      "url": mintInfo.contact.website
    } : undefined,
    "sameAs": mintInfo.urls || []
  };
}; 