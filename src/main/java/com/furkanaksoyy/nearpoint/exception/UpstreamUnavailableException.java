package com.furkanaksoyy.nearpoint.exception;

/**
 * Raised when an upstream dependency (e.g. Google Places) is unavailable and no
 * cached data can satisfy the request. Mapped to HTTP 503 by the global handler.
 */
public class UpstreamUnavailableException extends RuntimeException {

    public UpstreamUnavailableException(String message) {
        super(message);
    }

    public UpstreamUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
