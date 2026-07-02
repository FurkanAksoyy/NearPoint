// Build a lightweight taste profile from the user's own saved + visited places:
// a weight per place type (how often it appears). No external data, no tracking.
export function buildTaste(places) {
    const weights = {};
    (places || []).forEach((p) => {
        (p.types || '').split(',').forEach((tp) => {
            if (tp) weights[tp] = (weights[tp] || 0) + 1;
        });
    });
    return weights;
}

/** How well a place matches the taste profile (sum of matched type weights). */
export function tasteScore(place, taste) {
    return (place.types || '').split(',').reduce((sum, tp) => sum + (taste[tp] || 0), 0);
}
