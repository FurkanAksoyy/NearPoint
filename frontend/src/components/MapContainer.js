import React, { useRef, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, OverlayViewF, OverlayView } from '@react-google-maps/api';
import { Star, ArrowsClockwise } from '@phosphor-icons/react';
import { distanceMeters } from '../utils/geo';
import { useSettings } from '../context/AppSettings';

const containerStyle = { width: '100%', height: '100%' };

// Paper-warm map so Ember markers pop, with parks kept for neighbourhood shape
const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f7f5f1' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f5f1' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e3ebdd' }, { visibility: 'on' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d6e4ec' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#edeee6' }] },
];

const MAP_STYLE_DARK = [
    { elementType: 'geometry', stylers: [{ color: '#0f1626' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8593ab' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1220' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1b2740' }] },
    { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1424' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#12203a' }] },
];

const MapContainer = ({ places, center, hoveredId, selectedId, onHover, onSelect, onSearchArea }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    });

    const { t, theme } = useSettings();
    const mapRef = useRef(null);
    const [movedCenter, setMovedCenter] = useState(null);

    const onIdle = useCallback(() => {
        if (!mapRef.current) return;
        const c = mapRef.current.getCenter();
        if (!c) return;
        const moved = distanceMeters(center.lat, center.lng, c.lat(), c.lng());
        setMovedCenter(moved != null && moved > 400 ? { lat: c.lat(), lng: c.lng() } : null);
    }, [center]);

    if (!isLoaded) {
        return <div className="pane-state"><div className="ic" /> Loading map…</div>;
    }

    return (
        <>
        {movedCenter && onSearchArea && (
            <button className="search-area-btn" onClick={() => { onSearchArea(movedCenter); setMovedCenter(null); }}>
                <ArrowsClockwise size={15} weight="bold" /> {t('map.search_area')}
            </button>
        )}
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={(map) => { mapRef.current = map; }}
            onIdle={onIdle}
            options={{
                styles: theme === 'dark' ? MAP_STYLE_DARK : MAP_STYLE,
                disableDefaultUI: true,
                zoomControl: true,
                clickableIcons: false,
                gestureHandling: 'greedy',
            }}
        >

            {/* Search center — the logo's ripple identity */}
            <OverlayViewF position={center} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                <div className="center-pin" title="Search center">
                    <span className="cp-ring" />
                    <span className="cp-dot" />
                </div>
            </OverlayViewF>

            {places.map((p, i) => (
                p.latitude != null && p.longitude != null && (
                    <OverlayViewF
                        key={p.id}
                        position={{ lat: p.latitude, lng: p.longitude }}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div
                            className={`map-marker ${hoveredId === p.id || selectedId === p.id ? 'active' : ''} ${(p.rating || 0) >= 4.7 ? 'top-pick' : ''}`}
                            style={{ '--i': Math.min(i, 9) }}
                            onMouseEnter={() => onHover(p.id)}
                            onMouseLeave={() => onHover(null)}
                            onClick={() => onSelect(p)}
                        >
                            {p.rating != null ? (
                                <><Star size={11} weight="fill" className="star" />{p.rating}</>
                            ) : (
                                p.name?.slice(0, 12)
                            )}
                        </div>
                    </OverlayViewF>
                )
            ))}
        </GoogleMap>
        </>
    );
};

export default MapContainer;
