import { distanceMeters, walkMinutes } from './geo';

// Rough time spent at a place, by primary type (minutes)
const DWELL = {
    museum: 60,
    art_gallery: 45,
    tourist_attraction: 35,
    park: 40,
    restaurant: 60,
    meal_takeaway: 20,
    cafe: 30,
    bar: 60,
    night_club: 90,
    shopping_mall: 45,
    store: 20,
    lodging: 0,
};
const DEFAULT_DWELL = 25;

export function dwellFor(types) {
    const list = (types || '').split(',');
    for (const key of Object.keys(DWELL)) {
        if (list.includes(key)) return DWELL[key];
    }
    return DEFAULT_DWELL;
}

/**
 * Plan an ordered route: per-leg walking legs + totals (dwell + walk).
 * Returns { legs: [{ walkMin, walkMeters }], totalDwell, totalWalk, totalMin, totalMeters }.
 */
export function planRoute(stops) {
    const legs = [];
    let totalWalk = 0;
    let totalMeters = 0;
    let totalDwell = 0;

    stops.forEach((s, i) => {
        totalDwell += dwellFor(s.types);
        if (i > 0) {
            const meters = distanceMeters(stops[i - 1].latitude, stops[i - 1].longitude, s.latitude, s.longitude) ?? 0;
            const walk = walkMinutes(meters);
            legs.push({ walkMin: walk, walkMeters: meters });
            totalWalk += walk;
            totalMeters += meters;
        }
    });

    return { legs, totalDwell, totalWalk, totalMin: totalDwell + totalWalk, totalMeters };
}

/** "2h 40m" / "45m" */
export function formatDuration(minutes) {
    if (minutes == null) return '';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}
