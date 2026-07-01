import React from 'react';

/**
 * NearPoint mark: an Ember map-pin whose hole is a target dot — "a precise point, nearby".
 * Uses currentColor for the wordmark so it adapts to light/dark; the pin stays brand Ember.
 */
const Logo = ({ size = 26, withWordmark = false }) => {
    const mark = (
        <svg width={size} height={size * 1.25} viewBox="0 0 32 40" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id="np-ember" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F2683C" />
                    <stop offset="1" stopColor="#C2431F" />
                </linearGradient>
            </defs>
            {/* pin body */}
            <path
                d="M16 1.5C8.54 1.5 2.5 7.54 2.5 15c0 4.2 2.6 8.7 5.7 12.4 3.06 3.66 6.3 6.3 6.3 6.3a2.34 2.34 0 0 0 3 0s3.24-2.64 6.3-6.3c3.1-3.7 5.7-8.2 5.7-12.4C29.5 7.54 23.46 1.5 16 1.5Z"
                fill="url(#np-ember)"
            />
            {/* nearby ripple */}
            <circle cx="16" cy="15" r="8.5" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" />
            {/* target hole */}
            <circle cx="16" cy="15" r="5.4" fill="#fff" />
            <circle cx="16" cy="15" r="2.4" fill="#C2431F" />
        </svg>
    );

    if (!withWordmark) return mark;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {mark}
            <span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Near<span style={{ color: '#E8552B' }}>Point</span>
            </span>
        </span>
    );
};

export default Logo;
