package com.unihub.dto;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/**
 * Stable, self-owned pagination envelope returned at the API boundary.
 *
 * <p>Spring Data's {@code PageImpl} is deliberately <em>not</em> serialized directly: its
 * JSON shape is not a documented, stable contract (and it would leak the entity type).
 * Controllers map a {@link Page} of entities into this record instead.
 *
 * @param content       the items on this page, already mapped to DTOs
 * @param page          zero-based page index
 * @param size          requested page size
 * @param totalElements total matching rows across all pages
 * @param totalPages    total number of pages
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    /**
     * Builds a {@code PagedResponse} from a {@link Page} of source objects, mapping each
     * element to the exposed DTO type with {@code mapper}.
     */
    public static <X, T> PagedResponse<T> from(Page<X> page, Function<X, T> mapper) {
        return new PagedResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
