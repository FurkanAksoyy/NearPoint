import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
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

    if (!places || places.length === 0) {
        return (
            <Container className="mt-4 mb-4" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
                <p className="text-center pt-5">No places to display on map. Try a search first.</p>
            </Container>
        );
    }

    const center = {
        lat: places[0].latitude,
        lng: places[0].longitude
    };

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
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        position={{ lat: place.latitude, lng: place.longitude }}
                        onClick={(e) => handleMarkerClick(place, e)}
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
                                <p>Rating: {selectedPlace.rating} ({selectedPlace.userRatingsTotal} reviews)</p>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </Container>
    ) : (
        <Container className="mt-4 mb-4" style={{ height: '400px', backgroundColor: '#f8f9fa' }}>
            <p className="text-center pt-5">Loading map...</p>
        </Container>
    );
};

export default MapContainer;