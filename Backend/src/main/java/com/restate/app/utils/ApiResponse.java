package com.restate.app.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.restate.app.dto.PageMeta;
import lombok.Getter;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class ApiResponse<T> {

    private boolean success;
    private int status;
    private String message;
    private T data;
    private PageMeta pagination;
    private Instant timestamp;


    private ApiResponse(boolean success, int status, String message, T data, PageMeta pagination) {
        this.success    = success;
        this.status     = status;
        this.message    = message;
        this.data       = data;
        this.pagination = pagination;
        this.timestamp  = Instant.now();
    }


    private static <T> ResponseEntity<ApiResponse<T>> build(
            HttpStatus httpStatus, boolean success, String message, T data, PageMeta pagination) {

        ApiResponse<T> body = new ApiResponse<>(success, httpStatus.value(), message, data, pagination);
        return ResponseEntity.status(httpStatus).body(body);
    }

    /** 200 OK with data */
    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return build(HttpStatus.OK, true, "Success", data, null);
    }

    /** 200 OK with custom message and data */
    public static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return build(HttpStatus.OK, true, message, data, null);
    }

    /** 200 OK with message only (e.g. delete confirmations) */
    public static <T> ResponseEntity<ApiResponse<T>> ok(String message) {
        return build(HttpStatus.OK, true, message, null, null);
    }

    /** 201 Created */
    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return build(HttpStatus.CREATED, true, "Created successfully", data, null);
    }

    /** 201 Created with custom message */
    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return build(HttpStatus.CREATED, true, message, data, null);
    }
    /**200 OK with pagination metadata */
    public static <T> ResponseEntity<ApiResponse<List<T>>> pagedOk(Page<?> page, List<T> content) {
        PageMeta meta = PageMeta.of(page);
        return build(HttpStatus.OK, true, "Success", content, meta);
    }

    /** 200 OK paginated with custom message */
    public static <T> ResponseEntity<ApiResponse<List<T>>> pagedOk(String message, Page<?> page, List<T> content) {
        PageMeta meta = PageMeta.of(page);
        return build(HttpStatus.OK, true, message, content, meta);
    }

    /** 409 Conflict (e.g. duplicate email) */
    public static <T> ResponseEntity<ApiResponse<T>> conflict(String message) {
        return build(HttpStatus.CONFLICT, false, message, null, null);
    }

    /** 400 Bad Request */
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return build(HttpStatus.BAD_REQUEST, false, message, null, null);
    }

    /** 401 Unauthorized */
    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return build(HttpStatus.UNAUTHORIZED, false, message, null, null);
    }

    /** 403 Forbidden */
    public static <T> ResponseEntity<ApiResponse<T>> forbidden(String message) {
        return build(HttpStatus.FORBIDDEN, false, message, null, null);
    }

    /** 404 Not Found */
    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return build(HttpStatus.NOT_FOUND, false, message, null, null);
    }

    /** 500 Internal Server Error */
    public static <T> ResponseEntity<ApiResponse<T>> internalError(String message) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, false, message, null, null);
    }

    /** global errors */
    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message) {
        return build(status, false, message, null, null);
    }
}
