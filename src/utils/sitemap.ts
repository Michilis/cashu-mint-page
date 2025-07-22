/**
 * Sitemap generation utility for CashuMints.space
 * This helps search engines discover and index all pages
 */

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

const BASE_URL = 'https://cashumints.space';

/**
 * Generate sitemap XML content
 */
export const generateSitemap = (mintDomains: string[] = []): string => {
  const urls: SitemapUrl[] = [
    // Static pages
    {
      loc: BASE_URL,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${BASE_URL}/discover`,
      changefreq: 'daily', 
      priority: '0.9'
    },
    {
      loc: `${BASE_URL}/terms-of-use`,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      loc: `${BASE_URL}/privacy-policy`,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      loc: `${BASE_URL}/disclaimer`,
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];

  // Add mint pages
  mintDomains.forEach(domain => {
    urls.push({
      loc: `${BASE_URL}/${domain}`,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  const xmlUrls = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
};

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Block crawling of API endpoints if any
Disallow: /api/
Disallow: /*.json$

# Allow important crawling
Allow: /discover
Allow: /terms-of-use
Allow: /privacy-policy
Allow: /disclaimer`;
};

/**
 * Get current timestamp in ISO format for lastmod
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Download sitemap as file (useful for development/testing)
 */
export const downloadSitemap = (mintDomains: string[] = []) => {
  const sitemapContent = generateSitemap(mintDomains);
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Download robots.txt as file (useful for development/testing)  
 */
export const downloadRobotsTxt = () => {
  const robotsContent = generateRobotsTxt();
  const blob = new Blob([robotsContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robots.txt';
  a.click();
  URL.revokeObjectURL(url);
}; 