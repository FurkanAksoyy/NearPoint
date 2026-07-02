import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const VisitedContext = createContext(null);
const VISITED_KEY = 'np_visited';

function load() {
    try {
        const raw = JSON.parse(localStorage.getItem(VISITED_KEY) || '[]');
        return Array.isArray(raw) ? raw.filter((p) => p && p.placeId) : [];
    } catch {
        return [];
    }
}

export function VisitedProvider({ children }) {
    const [visited, setVisited] = useState(load);
    const ids = useMemo(() => new Set(visited.map((p) => p.placeId)), [visited]);

    const isVisited = useCallback((placeId) => ids.has(placeId), [ids]);

    const toggle = useCallback((place) => {
        setVisited((prev) => {
            const exists = prev.some((p) => p.placeId === place.placeId);
            const next = exists
                ? prev.filter((p) => p.placeId !== place.placeId)
                : [{ ...place, visitedAt: Date.now() }, ...prev];
            localStorage.setItem(VISITED_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const clear = useCallback(() => { setVisited([]); localStorage.removeItem(VISITED_KEY); }, []);

    return (
        <VisitedContext.Provider value={{ visited, isVisited, toggle, clear }}>
            {children}
        </VisitedContext.Provider>
    );
}

export function useVisited() {
    return useContext(VisitedContext);
}
