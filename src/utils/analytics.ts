// Plausible Analytics Configuration
export const analyticsConfig = {
  domain: import.meta.env.VITE_ANALYTICS_DOMAIN || 'cashumints.space',
  src: import.meta.env.VITE_ANALYTICS_SRC || 'https://analytics.azzamo.net/js/script.js',
  enabled: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false' // enabled by default
};

// Plausible tracking function
export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (!analyticsConfig.enabled) return;
  
  // Check if plausible is available (loaded from the script)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
};

// Track page views (automatic with Plausible script)
export const trackPageView = (url?: string) => {
  if (!analyticsConfig.enabled) return;
  
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('pageview', { u: url });
  }
};

// Custom events for mint page
export const trackMintView = (mintUrl: string) => {
  trackEvent('Mint View', { mint_url: mintUrl });
};

export const trackReviewSubmit = (mintUrl: string, rating: number) => {
  trackEvent('Review Submit', { 
    mint_url: mintUrl, 
    rating: rating 
  });
};

export const trackReviewView = (mintUrl: string) => {
  trackEvent('Reviews View', { mint_url: mintUrl });
};

export const trackMintInfoFetch = (mintUrl: string, success: boolean) => {
  trackEvent('Mint Info Fetch', { 
    mint_url: mintUrl, 
    success: success 
  });
}; 