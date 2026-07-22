package com.unihub.model;

/**
 * Role assigned to a {@link User}. Drives RBAC across every API endpoint.
 */
public enum UserRole {
    STUDENT,
    TEACHER,
    ADMIN
}
