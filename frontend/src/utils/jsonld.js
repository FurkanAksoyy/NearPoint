const SITE_URL = process.env.REACT_APP_SITE_URL
    || (typeof window !== 'undefined' ? window.location.origin : 'https://near-point.vercel.app');

/** WebSite + SearchAction — enables a sitelinks search box in Google. */
export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NearPoint',
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };
}

/** BreadcrumbList for a landing page. items: [{name, url}] */
export function breadcrumbJsonLd(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            item: it.url ? SITE_URL + it.url : undefined,
        })),
    };
}

/** ItemList of places for a results/list page (mark up only what's visibly rendered). */
export function itemListJsonLd(places, { name } = {}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: name || 'Places',
        numberOfItems: places.length,
        itemListElement: places.slice(0, 20).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'LocalBusiness',
                name: p.name,
                address: p.vicinity,
                ...(p.latitude != null && {
                    geo: { '@type': 'GeoCoordinates', latitude: p.latitude, longitude: p.longitude },
                }),
                ...(p.rating != null && {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: p.rating,
                        reviewCount: p.userRatingsTotal || undefined,
                    },
                }),
            },
        })),
    };
}
