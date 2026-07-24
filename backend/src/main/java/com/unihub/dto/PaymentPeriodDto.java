package com.unihub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * API representation of a {@code PaymentPeriod}.
 */
public record PaymentPeriodDto(
        Long id,
        String academicYear,
        String label,
        BigDecimal amount,
        LocalDate dueDate,
        int periodOrder
) {}
