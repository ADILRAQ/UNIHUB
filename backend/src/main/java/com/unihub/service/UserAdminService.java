package com.unihub.service;

import com.unihub.dto.PagedResponse;
import com.unihub.dto.UserDetailDto;
import com.unihub.dto.UserSummaryDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.AdminMapper;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.repository.spec.UserSpecifications;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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

    public UserAdminService(UserRepository userRepository,
                            UserClassGroupRepository userClassGroupRepository) {
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    /**
     * Lists users matching the optional filters (any {@code null} filter is ignored) with
     * pagination. Returns the self-owned {@link PagedResponse} envelope, never a raw
     * Spring {@code Page}.
     */
    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryDto> listUsers(UserRole role, UserStatus status,
                                                   Long classGroupId, String search,
                                                   Pageable pageable) {
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
     * Sets a user's account status. Guards against an admin deactivating their own account
     * (which would immediately lock them out), rejecting that with a 400.
     *
     * @param callerId the authenticated admin's own user id
     */
    @Transactional
    public UserSummaryDto updateStatus(Long id, UserStatus status, Long callerId) {
        if (id.equals(callerId) && status == UserStatus.INACTIVE) {
            throw new BadRequestException("You cannot deactivate your own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
        user.setStatus(status);
        User saved = userRepository.save(user);
        return AdminMapper.toSummary(saved);
    }
}
