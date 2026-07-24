package com.unihub.service;

import com.unihub.dto.CreateUserRequest;
import com.unihub.dto.CreatedUserDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ConflictException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.ClassGroup;
import com.unihub.model.UserRole;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import com.unihub.security.TempPasswordGenerator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

/**
 * Single-account provisioning shared by CSV bulk import and the single-user create endpoint.
 *
 * <p>{@link #provision} is the one place the "make an account" primitive lives — the
 * case-insensitive duplicate guard, temp-password generation, and BCrypt-hashed persistence
 * (via {@link UserImportPersistenceService}). The import loop and {@link #createSingleUser}
 * both call it, so a single create is genuinely a one-row import and never a parallel copy of
 * that logic.
 *
 * <p>The difference between the two callers is only <em>how a problem is reported</em>: the
 * batch import treats a duplicate as per-row error data (it catches {@link ConflictException}
 * and keeps going), whereas the single create lets the typed exceptions propagate to the
 * global handler as HTTP status codes.
 */
@Service
public class UserProvisioningService {

    private final ClassGroupRepository classGroupRepository;
    private final UserRepository userRepository;
    private final UserImportPersistenceService persistenceService;
    private final TempPasswordGenerator tempPasswordGenerator;

    public UserProvisioningService(ClassGroupRepository classGroupRepository,
                                   UserRepository userRepository,
                                   UserImportPersistenceService persistenceService,
                                   TempPasswordGenerator tempPasswordGenerator) {
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
        this.persistenceService = persistenceService;
        this.tempPasswordGenerator = tempPasswordGenerator;
    }

    /**
     * Creates one account and returns its one-time temporary password. Shared primitive: the
     * duplicate check is case-insensitive (matching the {@code users_email_lower_key} index),
     * and a race past that pre-check surfaces as the same {@link ConflictException} rather than
     * a raw DB error. Callers decide how to render that conflict.
     *
     * @param group the class group to enroll into, or {@code null} for no membership
     * @throws ConflictException if the email already exists (case-insensitively)
     */
    public CreatedUserDto provision(String email, String fullName, UserRole role, ClassGroup group) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("A user with email '" + email + "' already exists.");
        }

        String tempPassword = tempPasswordGenerator.generate();
        try {
            persistenceService.createAccount(email, fullName, role, group, tempPassword);
        } catch (DataIntegrityViolationException ex) {
            // Lost a race on the unique-email index after the pre-check — normalize to the
            // same conflict the pre-check would have thrown.
            throw new ConflictException("A user with email '" + email + "' already exists.");
        }

        String groupName = group != null ? group.getName() : null;
        return new CreatedUserDto(email, fullName, role.name(), groupName, tempPassword);
    }

    /**
     * Provisions a single account on behalf of an authenticated ADMIN or TEACHER. Both roles
     * may create STUDENT or TEACHER accounts in any (or no) class group; {@code classGroupId}
     * is optional (a provided one must exist, else 404). Creating an ADMIN account is rejected
     * (400): admin accounts are not self-service provisioned.
     */
    public CreatedUserDto createSingleUser(CreateUserRequest request, AuthenticatedUser caller) {
        UserRole role = request.role();
        if (role == UserRole.ADMIN) {
            throw new BadRequestException("role must be STUDENT or TEACHER.");
        }

        ClassGroup group = null;
        if (request.classGroupId() != null) {
            group = classGroupRepository.findById(request.classGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Class group " + request.classGroupId() + " not found"));
        }

        return provision(request.email(), request.fullName(), role, group);
    }
}
