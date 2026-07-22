package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating ({@code POST /api/class-groups}) and renaming
 * ({@code PATCH /api/class-groups/{id}}) a class group.
 */
public record ClassGroupRequest(
        @NotBlank @Size(max = 255) String name) {
}
