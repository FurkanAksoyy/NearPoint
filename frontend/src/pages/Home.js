import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import SearchForm from '../components/SearchForm';
import SearchHistory from '../components/SearchHistory';
import PlacesList from '../components/PlacesList';
import MapContainer from '../components/MapContainer';

const Home = ({ places, loading, error, searchHistory, handleSearch }) => {
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

            {places.length > 0 && <MapContainer places={places} />}
            <PlacesList places={places} />
        </Container>
    );
};

export default Home;