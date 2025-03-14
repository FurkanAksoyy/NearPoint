import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Container } from 'react-bootstrap';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const MapContainer = ({ places }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeMarker, setActiveMarker] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    const handleMarkerClick = (place, marker) => {
        setSelectedPlace(place);
        setActiveMarker(marker);
    };

    const handleMapClick = () => {
        setSelectedPlace(null);
        setActiveMarker(null);
    };

    const getMarkerIcon = (types) => {
        if (!types) return null;

        const typesList = types.split(',');

        if (typesList.includes('restaurant') || typesList.includes('food') || typesList.includes('cafe')) {
            return {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            };
        }

        if (typesList.includes('lodging') || typesList.includes('hotel')) {
            return {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            };
        }

        if (typesList.includes('shopping_mall') || typesList.includes('store')) {
            return {
                url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png"
            };
        }

        if (typesList.includes('park') || typesList.includes('natural_feature')) {
            return {
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
            };
        }

        if (typesList.includes('museum') || typesList.includes('art_gallery') || typesList.includes('tourist_attraction')) {
            return {
                url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            };
        }

        return null;
    };

    if (!places || places.length === 0) {
        return (
            <Container className="mt-4 mb-4" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
                <p className="text-center pt-5">No places to display on map. Try a search first.</p>
            </Container>
        );
    }

    // Arama merkezini ve yarıçapını belirle
    const searchCenter = {
        lat: places[0].searchLatitude || places[0].latitude,
        lng: places[0].searchLongitude || places[0].longitude
    };

    const searchRadius = places[0].searchRadius || 1000; // Varsayılan 1000m

    // Harita merkezini arama merkezine ayarla
    const center = searchCenter;

    return isLoaded ? (
        <Container className="mt-4 mb-4">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
            >
                {/* Arama merkezini gösteren özel marker */}
                <Marker
                    position={searchCenter}
                    icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/pink-dot.png"
                    }}
                    zIndex={1000} // Diğer markerların üzerinde görünmesi için
                />

                {/* Arama yarıçapını gösteren daire */}
                <Circle
                    center={searchCenter}
                    radius={searchRadius}
                    options={{
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.1,
                    }}
                />

                {/* Bulunan yerler için markerlar */}
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        position={{ lat: place.latitude, lng: place.longitude }}
                        onClick={(e) => handleMarkerClick(place, e)}
                        icon={getMarkerIcon(place.types)}
                        animation={window.google && window.google.maps ? window.google.maps.Animation.DROP : null}
                    />
                ))}

                {selectedPlace && activeMarker && (
                    <InfoWindow
                        position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
                        onCloseClick={handleMapClick}
                    >
                        <div>
                            <h5>{selectedPlace.name}</h5>
                            {selectedPlace.vicinity && <p>{selectedPlace.vicinity}</p>}
                            {selectedPlace.rating && (
                                <p>
                                    Rating: {selectedPlace.rating}
                                    {selectedPlace.userRatingsTotal && ` (${selectedPlace.userRatingsTotal} reviews)`}
                                </p>
                            )}
                            {selectedPlace.types && (
                                <p>
                                    <small>
                                        {selectedPlace.types.split(',').slice(0, 3).map(type =>
                                            type.replace(/_/g, ' ')
                                        ).join(', ')}
                                    </small>
                                </p>
                            )}
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}&query_place_id=${selectedPlace.placeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary mt-2"
                            >
                                View on Google Maps
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Marker renkleri için açıklama */}
            <div className="mt-3 small">
                <p className="mb-1">Marker colors:</p>
                <ul className="list-inline">
                    <li className="list-inline-item me-3"><span style={{color: "#FF0000"}}>●</span> Restaurants</li>
                    <li className="list-inline-item me-3"><span style={{color: "#0000FF"}}>●</span> Hotels</li>
                    <li className="list-inline-item me-3"><span style={{color: "#800080"}}>●</span> Shopping</li>
                    <li className="list-inline-item me-3"><span style={{color: "#008000"}}>●</span> Parks</li>
                    <li className="list-inline-item me-3"><span style={{color: "#FFFF00"}}>●</span> Museums</li>
                    <li className="list-inline-item"><span style={{color: "#FF00FF"}}>●</span> Search Center</li>
                </ul>
            </div>
        </Container>
    ) : (
        <Container className="mt-4 mb-4" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
            <p className="text-center pt-5">Loading map...</p>
        </Container>
    );
};

export default MapContainer;