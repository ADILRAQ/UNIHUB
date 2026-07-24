package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for rejecting an installment proof.
 */
public record RejectRequest(
        @NotBlank String reason
) {}
