// src/components/FilterControls.js
import React, { useState } from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';

const FilterControls = ({ onFilterChange }) => {
    const [ratingFilter, setRatingFilter] = useState(0);
    const [typeFilter, setTypeFilter] = useState('');

    const handleRatingChange = (e) => {
        const value = parseFloat(e.target.value);
        setRatingFilter(value);
        onFilterChange({ rating: value, type: typeFilter });
    };

    const handleTypeChange = (e) => {
        const value = e.target.value;
        setTypeFilter(value);
        onFilterChange({ rating: ratingFilter, type: value });
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <i className="fas fa-filter me-2"></i> Filter Results
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Minimum Rating</Form.Label>
                            <Form.Select value={ratingFilter} onChange={handleRatingChange}>
                                <option value="0">All Ratings</option>
                                <option value="3">3+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="4.5">4.5+ Stars</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Place Type</Form.Label>
                            <Form.Select value={typeFilter} onChange={handleTypeChange}>
                                <option value="">All Types</option>
                                <option value="restaurant">Restaurants</option>
                                <option value="lodging">Hotels</option>
                                <option value="shopping">Shopping</option>
                                <option value="park">Parks</option>
                                <option value="museum">Museums</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default FilterControls;