package com.projedata.inventory.exception;

import com.projedata.inventory.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.TypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class})
    public ResponseEntity<ErrorResponse> handleConflict(Exception ex, HttpServletRequest request) {
        String message = ex instanceof DataIntegrityViolationException
            ? "Operation violates data integrity constraints"
            : ex.getMessage();
        return buildResponse(HttpStatus.CONFLICT, message, request.getRequestURI());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(this::formatFieldError)
            .collect(Collectors.joining("; "));
        return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        if (isFrameworkBadRequest(ex)) {
            return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage() != null ? ex.getMessage() : "Request could not be processed",
                request.getRequestURI()
            );
        }

        if (ex instanceof org.springframework.web.ErrorResponse errorResponse) {
            HttpStatus frameworkStatus = HttpStatus.resolve(errorResponse.getStatusCode().value());
            if (frameworkStatus != null && frameworkStatus.is4xxClientError()) {
                return buildResponse(
                    frameworkStatus,
                    resolveFrameworkErrorMessage(errorResponse, ex),
                    request.getRequestURI()
                );
            }
        }

        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected internal error", request.getRequestURI());
    }

    private boolean isFrameworkBadRequest(Exception ex) {
        return ex instanceof MethodArgumentTypeMismatchException
            || ex instanceof TypeMismatchException
            || ex instanceof HttpMessageNotReadableException;
    }

    private String formatFieldError(FieldError fieldError) {
        return "%s: %s".formatted(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private String resolveFrameworkErrorMessage(org.springframework.web.ErrorResponse errorResponse, Exception ex) {
        if (errorResponse.getBody() != null && errorResponse.getBody().getDetail() != null) {
            return errorResponse.getBody().getDetail();
        }
        return ex.getMessage() != null ? ex.getMessage() : "Request could not be processed";
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String path) {
        return ResponseEntity.status(status).body(
            new ErrorResponse(OffsetDateTime.now(), status.value(), status.getReasonPhrase(), message, path)
        );
    }
}
