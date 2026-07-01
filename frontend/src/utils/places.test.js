import { formatPrice, prettyType, photoUrl, CATEGORIES } from './places';

test('formatPrice maps Places API price levels to symbols', () => {
    expect(formatPrice('PRICE_LEVEL_MODERATE')).toBe('$$');
    expect(formatPrice('PRICE_LEVEL_INEXPENSIVE')).toBe('$');
    expect(formatPrice(null)).toBe('');
    expect(formatPrice('UNKNOWN')).toBe('');
});

test('prettyType humanizes the first type token', () => {
    expect(prettyType('hamburger_restaurant,restaurant')).toBe('Hamburger Restaurant');
    expect(prettyType('')).toBe('');
});

test('photoUrl returns null without a reference or API key', () => {
    // REACT_APP_GOOGLE_MAPS_API_KEY is unset in the test env
    expect(photoUrl(null)).toBeNull();
    expect(photoUrl('places/x/photos/y')).toBeNull();
});

test('CATEGORIES includes an "All" reset and known types', () => {
    expect(CATEGORIES[0].key).toBe('');
    expect(CATEGORIES.map((c) => c.key)).toContain('restaurant');
});
