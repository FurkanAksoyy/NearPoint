import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const PlacesList = ({ places }) => {
    if (!places || places.length === 0) {
        return (
            <Card className="mt-4 text-center py-4">
                <Card.Body>
                    <i className="fas fa-info-circle fa-2x mb-3 text-muted"></i>
                    <p className="mb-0">No places found. Try a different search.</p>
                </Card.Body>
            </Card>
        );
    }

    // Helper function to get icon based on place type
    const getIconForType = (types) => {
        if (!types) return "fas fa-map-marker-alt";

        const typesList = types.split(',');
        if (typesList.includes('restaurant') || typesList.includes('food')) return "fas fa-utensils";
        if (typesList.includes('lodging') || typesList.includes('hotel')) return "fas fa-bed";
        if (typesList.includes('shopping_mall') || typesList.includes('store')) return "fas fa-shopping-bag";
        if (typesList.includes('park')) return "fas fa-tree";
        if (typesList.includes('museum')) return "fas fa-landmark";

        return "fas fa-map-marker-alt";
    };

    return (
        <div className="mt-4">
            <h4 className="mb-3">Nearby Places</h4>
            <Row>
                {places.map((place) => (
                    <Col md={4} key={place.id} className="mb-4">
                        <Card className="h-100">
                            <Card.Body>
                                <div className="d-flex mb-2">
                                    <div className="me-3">
                                        <i className={`${getIconForType(place.types)} fa-2x text-primary`}></i>
                                    </div>
                                    <div>
                                        <Card.Title>{place.name}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">{place.vicinity}</Card.Subtitle>
                                    </div>
                                </div>

                                {place.types && (
                                    <div className="mb-2">
                                        {place.types.split(',').slice(0, 3).map((type, index) => (
                                            <Badge bg="light" text="dark" className="me-1 mb-1" key={index}>
                                                {type.replace(/_/g, ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {place.rating && (
                                    <div className="d-flex align-items-center mt-2">
                                        <span className="me-2">
                                            <i className="fas fa-star text-warning"></i> {place.rating}
                                        </span>
                                        <small className="text-muted">({place.userRatingsTotal} reviews)</small>
                                    </div>
                                )}

                                <div className="mt-3">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${place.placeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        <i className="fas fa-map-marker-alt me-1"></i> View on Google Maps
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default PlacesList;