import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CompareContext = createContext(null);
const MAX = 3;

export function CompareProvider({ children }) {
    const [compare, setCompare] = useState([]);
    const ids = useMemo(() => new Set(compare.map((p) => p.placeId)), [compare]);

    const inCompare = useCallback((placeId) => ids.has(placeId), [ids]);

    const toggle = useCallback((place) => {
        setCompare((prev) => {
            if (prev.some((p) => p.placeId === place.placeId)) {
                return prev.filter((p) => p.placeId !== place.placeId);
            }
            if (prev.length >= MAX) return prev; // cap at 3
            return [...prev, place];
        });
    }, []);

    const remove = useCallback((placeId) => {
        setCompare((prev) => prev.filter((p) => p.placeId !== placeId));
    }, []);

    const clear = useCallback(() => setCompare([]), []);

    return (
        <CompareContext.Provider value={{ compare, inCompare, toggle, remove, clear, max: MAX }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    return useContext(CompareContext);
}
