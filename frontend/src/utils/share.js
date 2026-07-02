import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8070';

function slim(p) {
    return {
        placeId: p.placeId, name: p.name, latitude: p.latitude, longitude: p.longitude,
        rating: p.rating, userRatingsTotal: p.userRatingsTotal, priceLevel: p.priceLevel,
        types: p.types, photoReference: p.photoReference, vicinity: p.vicinity, openNow: p.openNow,
    };
}

export async function createShare(name, kind, places) {
    const { data } = await axios.post(`${API_BASE_URL}/api/share`, {
        name: name || null,
        kind,
        places: places.map(slim),
    });
    return data.slug;
}

export function shareUrl(slug) {
    return `${window.location.origin}/s/${slug}`;
}

/** Create a share link, then use Web Share or copy to clipboard. Returns 'shared' | 'copied'. */
export async function shareList(name, kind, places) {
    const url = shareUrl(await createShare(name, kind, places));
    if (navigator.share) {
        try { await navigator.share({ title: name || 'NearPoint', url }); return 'shared'; }
        catch { return 'copied'; }
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
}
