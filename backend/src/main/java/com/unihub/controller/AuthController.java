package com.unihub.controller;

import com.unihub.dto.AuthResponse;
import com.unihub.dto.ChangePasswordRequest;
import com.unihub.dto.LoginRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints. {@code POST /api/auth/login} is public (permitted in
 * {@code SecurityConfig}); {@code POST /api/auth/change-password} requires authentication and
 * is on the must-change-password filter's allow-list so a flagged user can reach it. All
 * business logic lives in {@link AuthService}.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    /**
     * Changes the caller's own password (the target is always the authenticated principal,
     * never a path/body id, so one user can never change another's). Returns a fresh
     * {@link AuthResponse} whose token clears the must-change gate.
     */
    @PostMapping("/change-password")
    public AuthResponse changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                       @AuthenticationPrincipal AuthenticatedUser caller) {
        return authService.changePassword(
                caller.userId(), request.currentPassword(), request.newPassword());
    }
}
