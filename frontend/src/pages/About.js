import React from 'react';
import { Container, Card } from 'react-bootstrap';

const About = () => {
    return (
        <Container className="py-4">
            <h2 className="mb-4">About NearPoint</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>What is NearPoint?</Card.Title>
                    <Card.Text>
                        NearPoint is a full-stack application that helps users find nearby places based on location coordinates.
                        Simply enter a latitude, longitude, and search radius to discover places in the vicinity.
                    </Card.Text>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>How it Works</Card.Title>
                    <Card.Text>
                        <p>NearPoint uses Google Places API to search for places near the specified coordinates. The application consists of:</p>
                        <ul>
                            <li>A Spring Boot backend that handles API requests and caches results in a PostgreSQL database</li>
                            <li>A React frontend that provides a user-friendly interface for searching and viewing results</li>
                            <li>Google Maps integration to visualize the locations of found places</li>
                        </ul>
                    </Card.Text>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Card.Title>Technologies Used</Card.Title>
                    <Card.Text>
                        <ul>
                            <li><strong>Backend:</strong> Java, Spring Boot, JPA, PostgreSQL</li>
                            <li><strong>Frontend:</strong> React, Bootstrap, Google Maps API</li>
                            <li><strong>Development:</strong> Git, GitHub, Maven</li>
                        </ul>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default About;