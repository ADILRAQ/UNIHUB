package com.unihub.dto;

import java.util.List;

/**
 * Result of a CSV bulk import (UNIH-19). Deliberately a structured JSON envelope rather
 * than a raw {@code text/csv} download: it carries both the created accounts (with their
 * one-time temporary passwords) <em>and</em> per-row error diagnostics, which a plain CSV
 * response could not cleanly express. The frontend (UNIH-22) builds the downloadable
 * credentials CSV client-side from {@code createdUsers}.
 *
 * <p>The temporary passwords in {@code createdUsers} appear here exactly once and are
 * never persisted in plaintext or retrievable again.
 */
public record ImportResultResponse(
        int successCount,
        int errorCount,
        List<CreatedUserDto> createdUsers,
        List<ImportErrorDto> errors) {
}
