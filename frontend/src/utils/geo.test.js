import { distanceMeters, formatDistance } from './geo';

test('distanceMeters returns null when a coordinate is missing', () => {
    expect(distanceMeters(41, 29, null, 29)).toBeNull();
});

test('distanceMeters is ~0 for identical points', () => {
    expect(distanceMeters(41.0, 29.0, 41.0, 29.0)).toBeCloseTo(0, 5);
});

test('distanceMeters matches a known short distance', () => {
    // ~1.11 km per 0.01° of latitude
    const d = distanceMeters(41.0, 29.0, 41.01, 29.0);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1200);
});

test('formatDistance uses meters below 1km and km above', () => {
    expect(formatDistance(250)).toBe('250 m');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(null)).toBe('');
});
