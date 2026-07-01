import React from 'react';

/**
 * Per-route SEO tags. Uses React 19's native document-metadata hoisting —
 * <title>/<meta>/<link> rendered here are lifted into <head> and deduped,
 * so no react-helmet dependency is needed. JSON-LD stays inline (valid anywhere).
 */
const SITE_URL = process.env.REACT_APP_SITE_URL
    || (typeof window !== 'undefined' ? window.location.origin : 'https://near-point.vercel.app');

export default function Seo({ title, description, path = '/', image, jsonLd, lang = 'en' }) {
    const canonical = SITE_URL + path;
    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            <meta property="og:site_name" content="NearPoint" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:locale" content={lang === 'tr' ? 'tr_TR' : 'en_US'} />
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            <link rel="alternate" hrefLang="en" href={SITE_URL + path} />
            <link rel="alternate" hrefLang="tr" href={SITE_URL + path} />

            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </>
    );
}
