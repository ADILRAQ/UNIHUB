package com.unihub.mapper;

import com.unihub.dto.ClassGroupDto;
import com.unihub.dto.ClassGroupRef;
import com.unihub.dto.UserDetailDto;
import com.unihub.dto.UserSummaryDto;
import com.unihub.model.ClassGroup;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import java.util.List;

/**
 * Entity to DTO conversions for the admin management API. Kept as pure static helpers
 * (no MapStruct in this project) so no JPA entity ever leaks into a controller signature
 * or response body.
 */
public final class AdminMapper {

    private AdminMapper() {
    }

    public static UserSummaryDto toSummary(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name());
    }

    /**
     * @param memberships the user's {@link UserClassGroup} rows, used to expose the groups
     *                    the user belongs to as {@link ClassGroupRef}s.
     */
    public static UserDetailDto toDetail(User user, List<UserClassGroup> memberships) {
        List<ClassGroupRef> groups = memberships.stream()
                .map(m -> toClassGroupRef(m.getClassGroup()))
                .toList();
        return new UserDetailDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name(),
                user.isMustChangePassword(),
                user.getTempPasswordExpiresAt(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                groups);
    }

    public static ClassGroupRef toClassGroupRef(ClassGroup group) {
        return new ClassGroupRef(group.getId(), group.getName());
    }

    public static ClassGroupDto toClassGroupDto(ClassGroup group, long memberCount) {
        return new ClassGroupDto(
                group.getId(),
                group.getName(),
                memberCount,
                group.getCreatedAt());
    }
}
