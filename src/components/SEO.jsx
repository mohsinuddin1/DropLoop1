import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for dynamic per-page meta tags
 * 
 * Features:
 * - Dynamic title with site name suffix
 * - Open Graph meta tags for social sharing
 * - Twitter Card meta tags
 * - Canonical URL
 * - JSON-LD structured data (optional)
 * - AEO-friendly meta descriptions
 * 
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page meta description (aim for 150-160 chars)
 * @param {string} props.path - Page path for canonical URL (e.g., "/posts")
 * @param {string} props.type - OG type (default: "website")
 * @param {string} props.image - OG image URL
 * @param {object} props.structuredData - Optional JSON-LD structured data
 * @param {boolean} props.noindex - If true, tells search engines not to index this page
 */
export default function SEO({
    title = '',
    description = 'DropLoop connects senders with travelers for fast, affordable peer-to-peer delivery across India and 50+ countries.',
    path = '',
    type = 'website',
    image = 'https://droploop.me/og-image.png',
    structuredData = null,
    noindex = false,
}) {
    const siteName = 'DropLoop';
    const siteUrl = 'https://droploop.me';
    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} – Send Anything, Anywhere`;
    const canonicalUrl = `${siteUrl}${path}`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
}
