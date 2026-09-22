package com.unihub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request body for creating a full academic-year payment plan for one class group
 * (exactly 3 periods).
 */
public record CreatePeriodRequest(
        @NotBlank String academicYear,
        @NotNull Long classGroupId,
        @NotNull @Valid List<PeriodEntry> periods
) {

    public record PeriodEntry(
            @NotBlank String label,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotNull LocalDate dueDate,
            @Min(1) @Max(3) int periodOrder
    ) {}
}
