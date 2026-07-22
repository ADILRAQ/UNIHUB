package com.unihub.dto;

/**
 * A per-row problem encountered during a CSV bulk import. A row-level failure is reported
 * as data (never an exception) so one bad row never rolls back the other good rows in the
 * same request.
 *
 * @param line   the CSV record number of the offending row (header excluded)
 * @param email  the row's email if it was parseable, otherwise {@code null}/blank
 * @param reason a human-readable explanation of why the row was rejected
 */
public record ImportErrorDto(
        long line,
        String email,
        String reason) {
}
