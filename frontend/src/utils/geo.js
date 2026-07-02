// Haversine distance between two lat/lng points, in meters.
export function distanceMeters(lat1, lng1, lat2, lng2) {
    if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters) {
    if (meters == null) return '';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

/** Total distance walking through an ordered list of stops (meters). */
export function routeDistance(stops) {
    let total = 0;
    for (let i = 1; i < stops.length; i += 1) {
        const d = distanceMeters(stops[i - 1].latitude, stops[i - 1].longitude, stops[i].latitude, stops[i].longitude);
        if (d != null) total += d;
    }
    return total;
}

/** Rough walking time (~4.5 km/h) for a distance in meters → minutes. */
export function walkMinutes(meters) {
    return Math.max(1, Math.round((meters / 1000 / 4.5) * 60));
}
