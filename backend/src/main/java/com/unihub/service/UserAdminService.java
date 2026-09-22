package com.unihub.service;

import com.unihub.dto.PagedResponse;
import com.unihub.dto.TempPasswordResponse;
import com.unihub.dto.UserDetailDto;
import com.unihub.dto.UserSummaryDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.AdminMapper;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import org.springframework.security.access.AccessDeniedException;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.repository.spec.UserSpecifications;
import com.unihub.security.AuthenticatedUser;
import com.unihub.security.TempPasswordGenerator;
import com.unihub.security.TempPasswordPolicy;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin-facing user administration use cases: paginated/filtered listing, detail lookup,
 * and account (de)activation. Authorization (admin-only) is enforced at the controller;
 * this layer owns the business rules (e.g. an admin may not deactivate themselves).
 */
@Service
public class UserAdminService {

    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final TempPasswordGenerator tempPasswordGenerator;
    private final PasswordEncoder passwordEncoder;

    public UserAdminService(UserRepository userRepository,
                            UserClassGroupRepository userClassGroupRepository,
                            TempPasswordGenerator tempPasswordGenerator,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.tempPasswordGenerator = tempPasswordGenerator;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Lists users matching the optional filters (any {@code null} filter is ignored) with
     * pagination. Returns the self-owned {@link PagedResponse} envelope, never a raw
     * Spring {@code Page}.
     *
     * <p>When {@code caller} is a TEACHER, the {@code role} filter is always forced to STUDENT.
     * With {@code all=true} (admin console, admin parity) every student is visible and the
     * {@code status}/{@code classGroupId} filters apply as-is; otherwise (teacher dashboard) the
     * result is scoped to the teacher's own groups and {@code classGroupId} is honoured only if
     * the caller owns that group.
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryDto> listUsers(UserRole role, UserStatus status,
                                                   Long classGroupId, String search,
                                                   boolean all, Pageable pageable,
                                                   AuthenticatedUser caller) {
        if ("TEACHER".equals(caller.role()) && all) {
            Specification<User> spec = Specification.allOf(
                    UserSpecifications.hasRole(UserRole.STUDENT),
                    UserSpecifications.hasStatus(status),
                    UserSpecifications.inClassGroup(classGroupId),
                    UserSpecifications.matchesSearch(search));
            return PagedResponse.from(userRepository.findAll(spec, pageable), AdminMapper::toSummary);
        }
        if ("TEACHER".equals(caller.role())) {
            List<Long> ownedGroupIds = userClassGroupRepository.findOwnedGroupIds(
                    caller.userId(), UserRole.TEACHER);
            if (ownedGroupIds.isEmpty()) {
                return PagedResponse.from(
                        org.springframework.data.domain.Page.empty(pageable),
                        AdminMapper::toSummary);
            }
            Specification<User> spec;
            if (classGroupId != null && ownedGroupIds.contains(classGroupId)) {
                spec = Specification.allOf(
                        UserSpecifications.hasRole(UserRole.STUDENT),
                        UserSpecifications.inClassGroup(classGroupId),
                        UserSpecifications.matchesSearch(search));
            } else {
                spec = Specification.allOf(
                        UserSpecifications.hasRole(UserRole.STUDENT),
                        UserSpecifications.inAnyClassGroup(ownedGroupIds),
                        UserSpecifications.matchesSearch(search));
            }
            Page<User> page = userRepository.findAll(spec, pageable);
            return PagedResponse.from(page, AdminMapper::toSummary);
        }

        // ADMIN path — all filters honoured as-is
        Specification<User> spec = Specification.allOf(
                UserSpecifications.hasRole(role),
                UserSpecifications.hasStatus(status),
                UserSpecifications.inClassGroup(classGroupId),
                UserSpecifications.matchesSearch(search));

        Page<User> page = userRepository.findAll(spec, pageable);
        return PagedResponse.from(page, AdminMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public UserDetailDto getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
        List<UserClassGroup> memberships = userClassGroupRepository.findByUser_Id(id);
        return AdminMapper.toDetail(user, memberships);
    }

    /**
     * Sets a user's account status. Guards:
     * <ul>
     *   <li>No caller may deactivate their own account.</li>
     *   <li>A TEACHER caller may not change the status of an ADMIN account.</li>
     * </ul>
     *
     * @param callerId   the authenticated caller's own user id
     * @param callerRole the authenticated caller's role string (e.g. "ADMIN" or "TEACHER")
     */
    @Transactional
    public UserSummaryDto updateStatus(Long id, UserStatus status, Long callerId, String callerRole) {
        if (id.equals(callerId) && status == UserStatus.INACTIVE) {
            throw new BadRequestException("You cannot deactivate your own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));

        if ("TEACHER".equals(callerRole) && user.getRole() == UserRole.ADMIN) {
            throw new AccessDeniedException("Teachers cannot modify the status of admin accounts.");
        }

        user.setStatus(status);
        User saved = userRepository.save(user);
        return AdminMapper.toSummary(saved);
    }

    /**
     * Regenerates a fresh temporary password for the target user, re-arming the forced-change
     * gate and a new {@value TempPasswordPolicy#VALIDITY_DAYS}-day expiry window. Authorization
     * (admin, or a teacher who manages the target student) is enforced at the controller via
     * {@code @PreAuthorize}. The plaintext password is returned once for the admin to hand off
     * and is never logged or persisted in the clear — only its BCrypt hash is stored.
     */
    @Transactional
    public TempPasswordResponse resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));

        String tempPassword = tempPasswordGenerator.generate();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        user.setTempPasswordExpiresAt(TempPasswordPolicy.expiryFromNow());
        userRepository.save(user);

        return new TempPasswordResponse(user.getEmail(), tempPassword);
    }
}
