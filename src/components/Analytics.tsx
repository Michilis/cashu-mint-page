import { useEffect } from 'react';
import { analyticsConfig } from '../utils/analytics';

const Analytics: React.FC = () => {
  useEffect(() => {
    // Only load analytics if enabled
    if (!analyticsConfig.enabled) {
      console.log('📊 Analytics disabled via environment configuration');
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${analyticsConfig.src}"]`);
    if (existingScript) {
      console.log('📊 Analytics script already loaded');
      return;
    }

    // Create and load the analytics script
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', analyticsConfig.domain);
    script.src = analyticsConfig.src;
    script.onload = () => {
      console.log('📊 Plausible Analytics loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Plausible Analytics');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(`script[src="${analyticsConfig.src}"]`);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics; 