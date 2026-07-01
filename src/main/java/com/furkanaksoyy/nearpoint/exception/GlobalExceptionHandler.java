package com.furkanaksoyy.nearpoint.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Central error handling. Returns RFC 7807 {@link ProblemDetail} bodies so every
 * error has a consistent, machine-readable shape.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)  // win over Spring's built-in ProblemDetailsExceptionHandler
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** @Valid on a request body / model object. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleBodyValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }
        return validationProblem(errors);
    }

    /** Method-level validation of @RequestParam / model records (Spring 6.1+). */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ProblemDetail handleMethodValidation(HandlerMethodValidationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getAllValidationResults().forEach(result -> {
            String field = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(err ->
                    errors.put(field, err.getDefaultMessage()));
        });
        return validationProblem(errors);
    }

    /** Constraint violations thrown directly by the validator. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v ->
                errors.put(v.getPropertyPath().toString(), v.getMessage()));
        return validationProblem(errors);
    }

    @ExceptionHandler(UpstreamUnavailableException.class)
    public ProblemDetail handleUpstream(UpstreamUnavailableException ex) {
        log.warn("Upstream unavailable: {}", ex.getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage());
        pd.setTitle("Upstream service unavailable");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        pd.setTitle("Internal server error");
        return pd;
    }

    private ProblemDetail validationProblem(Map<String, String> errors) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "One or more fields are invalid");
        pd.setTitle("Validation failed");
        pd.setProperty("errors", errors);
        return pd;
    }
}
