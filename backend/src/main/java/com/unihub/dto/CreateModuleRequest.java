package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for creating a new course module.
 */
public record CreateModuleRequest(
        @NotBlank String title,
        int displayOrder
) {
    public CreateModuleRequest {
        // default displayOrder to 0 if not provided (handled by default value)
    }
}
