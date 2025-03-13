import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const SearchForm = ({ onSearch }) => {
    const [latitude, setLatitude] = useState('41.0370');
    const [longitude, setLongitude] = useState('28.9851');
    const [radius, setRadius] = useState('1000');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(latitude, longitude, radius);
    };

    return (
        <Container className="mt-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Latitude</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter latitude"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Longitude</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter longitude"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label>Radius (meters)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter radius"
                                value={radius}
                                onChange={(e) => setRadius(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex align-items-end">
                        <Button variant="primary" type="submit" className="mb-3 w-100">
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default SearchForm;