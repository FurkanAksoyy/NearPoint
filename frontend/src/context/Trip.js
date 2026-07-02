import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { distanceMeters } from '../utils/geo';

const TripContext = createContext(null);
const TRIP_KEY = 'np_trip';

function load() {
    try {
        const raw = JSON.parse(localStorage.getItem(TRIP_KEY) || '[]');
        return Array.isArray(raw) ? raw.filter((p) => p && p.placeId) : [];
    } catch {
        return [];
    }
}

function persist(trip) {
    localStorage.setItem(TRIP_KEY, JSON.stringify(trip));
}

export function TripProvider({ children }) {
    const [trip, setTrip] = useState(load);
    const ids = useMemo(() => new Set(trip.map((p) => p.placeId)), [trip]);

    const inTrip = useCallback((placeId) => ids.has(placeId), [ids]);

    const toggle = useCallback((place) => {
        setTrip((prev) => {
            const exists = prev.some((p) => p.placeId === place.placeId);
            const next = exists ? prev.filter((p) => p.placeId !== place.placeId) : [...prev, place];
            persist(next);
            return next;
        });
    }, []);

    const remove = useCallback((placeId) => {
        setTrip((prev) => { const next = prev.filter((p) => p.placeId !== placeId); persist(next); return next; });
    }, []);

    const move = useCallback((from, to) => {
        setTrip((prev) => {
            if (to < 0 || to >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            persist(next);
            return next;
        });
    }, []);

    // Greedy nearest-neighbour starting from the first stop
    const optimize = useCallback(() => {
        setTrip((prev) => {
            if (prev.length < 3) return prev;
            const remaining = [...prev];
            const route = [remaining.shift()];
            while (remaining.length) {
                const cur = route[route.length - 1];
                let bi = 0;
                let bd = Infinity;
                remaining.forEach((p, i) => {
                    const d = distanceMeters(cur.latitude, cur.longitude, p.latitude, p.longitude) ?? Infinity;
                    if (d < bd) { bd = d; bi = i; }
                });
                route.push(remaining.splice(bi, 1)[0]);
            }
            persist(route);
            return route;
        });
    }, []);

    const clear = useCallback(() => { setTrip([]); persist([]); }, []);

    return (
        <TripContext.Provider value={{ trip, inTrip, toggle, remove, move, optimize, clear }}>
            {children}
        </TripContext.Provider>
    );
}

export function useTrip() {
    return useContext(TripContext);
}
