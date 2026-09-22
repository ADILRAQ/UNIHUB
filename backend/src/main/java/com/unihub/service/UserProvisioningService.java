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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
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

    /**
     * Lazily injected to avoid a potential circular dependency: PaymentService depends on
     * UserRepository, which is also a dependency here. The @Lazy proxy breaks the cycle at
     * startup without changing the runtime behaviour.
     */
    private final PaymentService paymentService;

    public UserProvisioningService(ClassGroupRepository classGroupRepository,
                                   UserRepository userRepository,
                                   UserImportPersistenceService persistenceService,
                                   TempPasswordGenerator tempPasswordGenerator,
                                   @Lazy PaymentService paymentService) {
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
        this.persistenceService = persistenceService;
        this.tempPasswordGenerator = tempPasswordGenerator;
        this.paymentService = paymentService;
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
        Long newUserId;
        try {
            newUserId = persistenceService.createAccount(email, fullName, role, group, tempPassword);
        } catch (DataIntegrityViolationException ex) {
            // Lost a race on the unique-email index after the pre-check — normalize to the
            // same conflict the pre-check would have thrown.
            throw new ConflictException("A user with email '" + email + "' already exists.");
        }

        // Generate payment installments for newly created students.
        // createAccount() committed in REQUIRES_NEW, so the user row is visible here.
        if (role == UserRole.STUDENT) {
            paymentService.generateInstallmentsForNewStudent(newUserId);
        }

        String groupName = group != null ? group.getName() : null;
        return new CreatedUserDto(email, fullName, role.name(), groupName, tempPassword);
    }

    /**
     * Provisions a single account on behalf of an authenticated ADMIN or TEACHER. Enforces the
     * same scoping the CSV import applies per row, expressed here as typed exceptions:
     * <ul>
     *   <li><strong>ADMIN</strong> — may create a STUDENT or TEACHER; {@code classGroupId} is
     *       optional (a provided one must exist, else 404).</li>
     *   <li><strong>TEACHER</strong> — may create only a STUDENT, into any class group (admin
     *       parity); {@code classGroupId} is required (403 without it), unknown id is a 404.</li>
     * </ul>
     * Creating an ADMIN via this endpoint is rejected (400): admin accounts are not
     * self-service provisioned.
     */
    public CreatedUserDto createSingleUser(CreateUserRequest request, AuthenticatedUser caller) {
        UserRole role = request.role();
        if (role == UserRole.ADMIN) {
            throw new BadRequestException("role must be STUDENT or TEACHER.");
        }

        boolean isTeacher = UserRole.TEACHER.name().equals(caller.role());
        if (isTeacher) {
            // Teachers create only students, into any class group — mirrors the import's rules.
            if (role != UserRole.STUDENT) {
                throw new AccessDeniedException("Teachers can only create students.");
            }
            if (request.classGroupId() == null) {
                throw new AccessDeniedException("You must choose a class group for the student.");
            }
        }

        ClassGroup group = null;
        if (request.classGroupId() != null) {
            // A genuinely unknown id is a 404.
            group = classGroupRepository.findById(request.classGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Class group " + request.classGroupId() + " not found"));
        }

        return provision(request.email(), request.fullName(), role, group);
    }
}
