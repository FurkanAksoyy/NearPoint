import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar } from 'react-bootstrap';
import SearchForm from './components/SearchForm';
import PlacesList from './components/PlacesList';
import MapContainer from './components/MapContainer';

function App() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (latitude, longitude, radius) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:8070/api/places/nearby`, {
                params: { latitude, longitude, radius }
            });

            setPlaces(response.data);
        } catch (err) {
            console.error('Error fetching places:', err);
            setError('Error fetching places. Please try again.');
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>NearPoint</Navbar.Brand>
                </Container>
            </Navbar>

            <Container>
                <SearchForm onSearch={handleSearch} />

                {loading && <p className="text-center mt-4">Loading...</p>}
                {error && <p className="text-center mt-4 text-danger">{error}</p>}

                {places.length > 0 && <MapContainer places={places} />}
                <PlacesList places={places} />
            </Container>
        </div>
    );
}

export default App;
