package com.unihub.dto;

import java.util.List;

/**
 * Admin view: a student with one or more overdue installments.
 */
public record OverdueStudentDto(
        Long studentId,
        String studentName,
        Long classGroupId,
        String classGroupName,
        List<InstallmentDto> overdueInstallments
) {}
