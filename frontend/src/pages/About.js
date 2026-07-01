import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { useSettings } from '../context/AppSettings';

const About = () => {
    const { t } = useSettings();
    return (
        <Container className="py-4" style={{ maxWidth: 760 }}>
            <h2 className="mb-4">{t('about.title')}</h2>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>{t('about.what_t')}</Card.Title>
                    <Card.Text>{t('about.what_b')}</Card.Text>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>{t('about.how_t')}</Card.Title>
                    <ul className="mb-0">
                        <li>A Spring Boot backend queries the Google Places API (New) and caches results in PostgreSQL + an in-memory Caffeine cache.</li>
                        <li>Resilience4j (retry + circuit breaker), rate limiting and optional Cloudflare Turnstile keep it robust and abuse-resistant.</li>
                        <li>A React frontend renders a split map + list experience; favorites are saved on your device.</li>
                    </ul>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Card.Title>{t('about.tech_t')}</Card.Title>
                    <ul className="mb-0">
                        <li><strong>Backend:</strong> Java 21, Spring Boot 3.5, JPA/Hibernate, PostgreSQL, Flyway, Caffeine, Resilience4j</li>
                        <li><strong>Frontend:</strong> React, Bootstrap, Google Maps, Geist type</li>
                        <li><strong>Quality:</strong> JUnit 5, Testcontainers, WireMock, OpenAPI/Swagger, JaCoCo</li>
                        <li><strong>Delivery:</strong> Docker, GitHub Actions, Jenkins, SonarCloud</li>
                    </ul>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default About;
