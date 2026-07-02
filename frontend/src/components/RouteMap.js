import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { useSettings } from '../context/AppSettings';

const STYLE_LIGHT = [
    { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe3ee' }] },
];
const STYLE_DARK = [
    { elementType: 'geometry', stylers: [{ color: '#0f1626' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8593ab' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1b2740' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1424' }] },
];

/** Mini map that plots ordered stops with numbered markers + a connecting route line. */
const RouteMap = ({ stops = [], height = 260, connect = true, onSelect }) => {
    const { theme } = useSettings();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    });

    const valid = stops.filter((s) => s.latitude != null && s.longitude != null);
    const path = valid.map((s) => ({ lat: s.latitude, lng: s.longitude }));

    const onLoad = useCallback((map) => {
        if (!path.length) return;
        if (path.length === 1) { map.setCenter(path[0]); map.setZoom(15); return; }
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 56);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valid.length]);

    if (!isLoaded || !path.length) {
        return <div className="route-map" style={{ height, background: 'var(--line-soft)' }} />;
    }

    return (
        <div className="route-map" style={{ height }}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                onLoad={onLoad}
                options={{
                    styles: theme === 'dark' ? STYLE_DARK : STYLE_LIGHT,
                    disableDefaultUI: true,
                    gestureHandling: 'cooperative',
                    clickableIcons: false,
                }}
            >
                {connect && path.length > 1 && (
                    <PolylineF path={path} options={{ strokeColor: '#E8552B', strokeOpacity: 0.9, strokeWeight: 4 }} />
                )}
                {valid.map((s, i) => (
                    <MarkerF
                        key={s.placeId || i}
                        position={path[i]}
                        onClick={onSelect ? () => onSelect(s) : undefined}
                        label={{ text: String(i + 1), color: '#fff', fontWeight: '700', fontSize: '12px' }}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            fillColor: '#C2431F', fillOpacity: 1,
                            strokeColor: '#fff', strokeWeight: 2, scale: 13,
                        }}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default RouteMap;
