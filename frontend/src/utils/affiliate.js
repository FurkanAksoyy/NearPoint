// Non-intrusive monetization: contextual affiliate/booking deep links + owner-configured featured places.
const BOOKING_AID = process.env.REACT_APP_BOOKING_AID; // optional affiliate id
const FEATURED = new Set(
    (process.env.REACT_APP_FEATURED_PLACE_IDS || '')
        .split(',').map((s) => s.trim()).filter(Boolean)
);

const FOOD_TYPES = ['restaurant', 'cafe', 'bar', 'food', 'meal_takeaway', 'meal_delivery', 'bakery'];
const STAY_TYPES = ['lodging', 'hotel', 'motel', 'resort_hotel', 'guest_house'];

/** Returns a contextual action { key, url } for a place, or null. */
export function affiliateAction(place) {
    const types = (place?.types || '').split(',');
    if (types.some((x) => STAY_TYPES.includes(x))) {
        let url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(place.name || '')}`;
        if (BOOKING_AID) url += `&aid=${BOOKING_AID}`;
        return { key: 'action.book', url };
    }
    if (types.some((x) => FOOD_TYPES.includes(x))) {
        const url = `https://www.google.com/search?q=${encodeURIComponent((place.name || '') + ' reservation')}`;
        return { key: 'action.reserve', url };
    }
    return null;
}

export function isFeatured(placeId) {
    return placeId ? FEATURED.has(placeId) : false;
}
