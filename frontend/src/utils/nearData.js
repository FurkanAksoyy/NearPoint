// Curated cities (slug + coords) and categories for SEO landing pages /near/:city/:category.

export const CITIES = [
    { slug: 'istanbul', name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
    { slug: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { slug: 'izmir', name: 'Izmir', lat: 38.4237, lng: 27.1428 },
    { slug: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { slug: 'bursa', name: 'Bursa', lat: 40.1826, lng: 29.0665 },
    { slug: 'adana', name: 'Adana', lat: 37.0000, lng: 35.3213 },
    { slug: 'london', name: 'London', lat: 51.5074, lng: -0.1278 },
    { slug: 'berlin', name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { slug: 'new-york', name: 'New York', lat: 40.7128, lng: -74.0060 },
];

// query => Places Text Search; category => includedType
export const NEAR_CATEGORIES = [
    { slug: 'burgers', query: 'hamburger', en: 'burgers', tr: 'hamburgerciler' },
    { slug: 'pizza', query: 'pizza', en: 'pizza', tr: 'pizzacılar' },
    { slug: 'coffee', category: 'cafe', en: 'coffee shops', tr: 'kahveciler' },
    { slug: 'restaurants', category: 'restaurant', en: 'restaurants', tr: 'restoranlar' },
    { slug: 'bars', category: 'bar', en: 'bars', tr: 'barlar' },
    { slug: 'hotels', category: 'lodging', en: 'hotels', tr: 'oteller' },
    { slug: 'attractions', category: 'tourist_attraction', en: 'attractions', tr: 'gezilecek yerler' },
];

export const findCity = (slug) => CITIES.find((c) => c.slug === slug);
export const findNearCategory = (slug) => NEAR_CATEGORIES.find((c) => c.slug === slug);
