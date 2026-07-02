// Gamified explorer levels based on how many places the user has checked in to.
const LEVELS = [
    { min: 0, key: 'level.newcomer' },
    { min: 5, key: 'level.explorer' },
    { min: 15, key: 'level.adventurer' },
    { min: 30, key: 'level.pathfinder' },
    { min: 60, key: 'level.legend' },
];

export function explorerLevel(count) {
    let idx = 0;
    for (let i = 0; i < LEVELS.length; i += 1) {
        if (count >= LEVELS[i].min) idx = i;
    }
    const cur = LEVELS[idx];
    const next = LEVELS[idx + 1] || null;
    const progress = next
        ? Math.min(100, Math.round(((count - cur.min) / (next.min - cur.min)) * 100))
        : 100;
    return {
        level: idx + 1,
        key: cur.key,
        next: next ? { key: next.key, min: next.min, remaining: next.min - count } : null,
        progress,
    };
}
