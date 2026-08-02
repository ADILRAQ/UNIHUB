package com.unihub.dto;

/**
 * Request body for patching a course module. All fields are optional.
 */
public record UpdateModuleRequest(
        String title,
        Integer displayOrder
) {}
