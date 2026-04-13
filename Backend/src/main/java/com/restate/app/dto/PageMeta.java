package com.restate.app.dto;

import org.springframework.data.domain.Page;

public record PageMeta(
        int currentPage,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious,
        boolean isFirst,
        boolean isLast
) {
    public static PageMeta of(Page<?> page) {
        return new PageMeta(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious(),
                page.isFirst(),
                page.isLast()
        );
    }
}

