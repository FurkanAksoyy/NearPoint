const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Build a Places API (New) photo media URL from a photo resource name
 * (e.g. "places/XXX/photos/YYY"). Needs the browser Maps key.
 */
export function photoUrl(photoReference, maxWidthPx = 400) {
    if (!photoReference || !MAPS_KEY) return null;
    return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidthPx}&key=${MAPS_KEY}`;
}

const PRICE = {
    PRICE_LEVEL_FREE: 'Free',
    PRICE_LEVEL_INEXPENSIVE: '$',
    PRICE_LEVEL_MODERATE: '$$',
    PRICE_LEVEL_EXPENSIVE: '$$$',
    PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

export function formatPrice(priceLevel) {
    return priceLevel ? PRICE[priceLevel] || '' : '';
}

export function prettyType(types) {
    if (!types) return '';
    const first = types.split(',')[0];
    return first.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Quick-search category chips → Places API (New) includedType
export const CATEGORIES = [
    { key: '', tkey: 'cat.all' },
    { key: 'restaurant', tkey: 'cat.food' },
    { key: 'cafe', tkey: 'cat.cafe' },
    { key: 'bar', tkey: 'cat.bars' },
    { key: 'lodging', tkey: 'cat.hotels' },
    { key: 'store', tkey: 'cat.shops' },
    { key: 'park', tkey: 'cat.parks' },
    { key: 'tourist_attraction', tkey: 'cat.sights' },
];
