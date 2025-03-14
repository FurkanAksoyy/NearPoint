import React, { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import SearchForm from '../components/SearchForm';
import SearchHistory from '../components/SearchHistory';
import FilterControls from '../components/FilterControls';
import PlacesList from '../components/PlacesList';
import MapContainer from '../components/MapContainer';

const Home = ({ places, loading, error, searchHistory, handleSearch }) => {
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [filters, setFilters] = useState({ rating: 0, type: '' });


    useEffect(() => {
        let result = [...places];

        // Rating filtresi
        if (filters.rating > 0) {
            result = result.filter(place => place.rating >= filters.rating);
        }

        // Type filter
        if (filters.type) {
            result = result.filter(place =>
                place.types && place.types.toLowerCase().includes(filters.type.toLowerCase())
            );
        }

        setFilteredPlaces(result);
    }, [places, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <Container>
            <SearchForm onSearch={handleSearch} />

            {searchHistory && searchHistory.length > 0 && (
                <SearchHistory
                    history={searchHistory}
                    onSelect={(lat, lng, radius) => handleSearch(lat, lng, radius)}
                />
            )}

            {loading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="mt-3">
                    <i className="fas fa-exclamation-circle me-2"></i> {error}
                </Alert>
            )}

            {places.length > 0 && (
                <FilterControls onFilterChange={handleFilterChange} />
            )}

            {filteredPlaces.length > 0 && <MapContainer places={filteredPlaces} />}

            {filteredPlaces.length > 0 ? (
                <PlacesList places={filteredPlaces} />
            ) : (
                places.length > 0 && (
                    <Alert variant="info" className="mt-3">
                        <i className="fas fa-info-circle me-2"></i> No places match your filters.
                    </Alert>
                )
            )}

            {!loading && places.length === 0 && !error && (
                <div className="text-center mt-5 mb-5">
                    <p className="text-muted">Enter coordinates and radius to find nearby places.</p>
                </div>
            )}
        </Container>
    );
};

export default Home;