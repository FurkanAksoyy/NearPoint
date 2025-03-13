import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const PlacesList = ({ places }) => {
    if (!places || places.length === 0) {
        return (
            <Container className="mt-4">
                <p>No places found. Try a different search.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Nearby Places</h2>
            <Row>
                {places.map((place) => (
                    <Col md={4} className="mb-4" key={place.id}>
                        <Card>
                            <Card.Body>
                                <Card.Title>{place.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{place.vicinity}</Card.Subtitle>
                                <Card.Text>
                                    {place.types && place.types.split(',').join(', ')}
                                    {place.rating && (
                                        <div>Rating: {place.rating} ({place.userRatingsTotal} reviews)</div>
                                    )}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PlacesList;