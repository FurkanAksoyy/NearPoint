import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Home from './pages/Home';
import About from './pages/About';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/custom.css';

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
        <Router>
            <div>
                <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
                    <Container>
                        <Navbar.Brand as={Link} to="/">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            NearPoint
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                            <Nav>
                                <Nav.Link as={Link} to="/">Home</Nav.Link>
                                <Nav.Link as={Link} to="/about">About</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <Routes>
                    <Route path="/" element={
                        <Home
                            places={places}
                            loading={loading}
                            error={error}
                            handleSearch={handleSearch}
                        />
                    } />
                    <Route path="/about" element={<About />} />
                </Routes>

                <footer className="bg-light py-3 mt-5">
                    <Container className="text-center text-muted">
                        <small>&copy; {new Date().getFullYear()} NearPoint. All rights reserved.</small>
                    </Container>
                </footer>
            </div>
        </Router>
    );
}

export default App;