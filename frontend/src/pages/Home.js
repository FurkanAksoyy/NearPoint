import React from 'react';
import { Container } from 'react-bootstrap';
import SearchForm from '../components/SearchForm';
import PlacesList from '../components/PlacesList';
import MapContainer from '../components/MapContainer';

const Home = ({ places, loading, error, handleSearch }) => {
    return (
        <Container>
            <SearchForm onSearch={handleSearch} />

            {loading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger mt-3">
                    <i className="fas fa-exclamation-circle me-2"></i> {error}
                </div>
            )}

            {places.length > 0 && <MapContainer places={places} />}
            <PlacesList places={places} />
        </Container>
    );
};

export default Home;