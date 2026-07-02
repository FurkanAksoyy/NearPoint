import axios from 'axios';

import { API_BASE_URL } from '../api';

export function voterId() {
    let v = localStorage.getItem('np_voter');
    if (!v) {
        v = `v${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        localStorage.setItem('np_voter', v);
    }
    return v;
}

function slim(p) {
    return {
        placeId: p.placeId, name: p.name, latitude: p.latitude, longitude: p.longitude,
        rating: p.rating, userRatingsTotal: p.userRatingsTotal, priceLevel: p.priceLevel,
        types: p.types, photoReference: p.photoReference, vicinity: p.vicinity, openNow: p.openNow,
    };
}

export async function createPoll(name, places) {
    const { data } = await axios.post(`${API_BASE_URL}/api/poll`, { name, places: places.map(slim) });
    return data.slug;
}

export async function getPoll(slug) {
    const { data } = await axios.get(`${API_BASE_URL}/api/poll/${slug}`);
    return data;
}

export async function votePoll(slug, placeId) {
    const { data } = await axios.post(`${API_BASE_URL}/api/poll/${slug}/vote`, { placeId, voter: voterId() });
    return data;
}

export function pollUrl(slug) {
    return `${window.location.origin}/poll/${slug}`;
}
