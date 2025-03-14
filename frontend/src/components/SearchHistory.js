// src/components/SearchHistory.js
import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';

const SearchHistory = ({ history, onSelect }) => {
    if (!history.length) {
        return null;
    }

    return (
        <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
        <span>
          <i className="fas fa-history me-2"></i> Recent Searches
        </span>
            </Card.Header>
            <ListGroup variant="flush">
                {history.map((item) => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-muted">{item.timestamp}</small>
                            <div>
                                Lat: {item.latitude}, Lng: {item.longitude}, Radius: {item.radius}m
                            </div>
                        </div>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onSelect(item.latitude, item.longitude, item.radius)}
                        >
                            <i className="fas fa-search"></i> Search Again
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Card>
    );
};

export default SearchHistory;