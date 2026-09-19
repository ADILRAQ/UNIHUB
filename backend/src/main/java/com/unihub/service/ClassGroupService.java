package com.unihub.service;

import com.unihub.dto.ClassGroupDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ConflictException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.AdminMapper;
import com.unihub.model.ClassGroup;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserClassGroupId;
import com.unihub.model.UserRole;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Class-group administration: CRUD plus teacher assignment. A {@code TEACHER}-role row in
 * {@code user_class_groups} <em>is</em> that teacher's import-rights grant for the group
 * (read later by UNIH-19's import), so assigning/revoking a teacher here directly controls
 * who may import students into the group.
 */
@Service
public class ClassGroupService {

    private final ClassGroupRepository classGroupRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;

    public ClassGroupService(ClassGroupRepository classGroupRepository,
                             UserRepository userRepository,
                             UserClassGroupRepository userClassGroupRepository) {
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<ClassGroupDto> listGroups(AuthenticatedUser caller) {
        List<ClassGroup> groups;
        if ("ADMIN".equals(caller.role())) {
            groups = classGroupRepository.findAll();
        } else {
            List<Long> groupIds = userClassGroupRepository.findOwnedGroupIds(
                    caller.userId(), UserRole.TEACHER);
            if (groupIds.isEmpty()) {
                return List.of();
            }
            groups = classGroupRepository.findAllById(groupIds);
        }

        List<Long> groupIds = groups.stream().map(ClassGroup::getId).toList();

        // Bulk member counts — one query for all groups.
        Map<Long, Long> countByGroup = userClassGroupRepository
                .findTeachersByGroupIds(groupIds).stream()
                .collect(Collectors.groupingBy(
                        ucg -> ucg.getClassGroup().getId(), Collectors.counting()));

        // Bulk teacher fetch — one query, keyed by group id.
        Map<Long, UserClassGroup> teacherByGroup = userClassGroupRepository
                .findTeachersByGroupIds(groupIds).stream()
                .collect(Collectors.toMap(
                        ucg -> ucg.getClassGroup().getId(),
                        ucg -> ucg,
                        (a, b) -> a)); // keep first if somehow two teachers

        return groups.stream()
                .sorted(Comparator.comparing(ClassGroup::getName, String.CASE_INSENSITIVE_ORDER))
                .map(g -> {
                    long memberCount = userClassGroupRepository.countByClassGroup_Id(g.getId());
                    UserClassGroup teacherUcg = teacherByGroup.get(g.getId());
                    Long teacherId = teacherUcg != null ? teacherUcg.getUser().getId() : null;
                    String teacherName = teacherUcg != null ? teacherUcg.getUser().getFullName() : null;
                    return AdminMapper.toClassGroupDto(g, memberCount, teacherId, teacherName);
                })
                .toList();
    }

    @Transactional
    public ClassGroupDto createGroup(String name) {
        String trimmed = name.trim();
        classGroupRepository.findByName(trimmed).ifPresent(existing -> {
            throw new ConflictException("A class group named '" + trimmed + "' already exists.");
        });

        ClassGroup group = new ClassGroup();
        group.setName(trimmed);
        ClassGroup saved = classGroupRepository.save(group);
        return AdminMapper.toClassGroupDto(saved, 0, null, null);
    }

    @Transactional
    public ClassGroupDto renameGroup(Long id, String name) {
        String trimmed = name.trim();
        ClassGroup group = classGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class group " + id + " not found"));

        // Duplicate guard: another group already owns this name.
        classGroupRepository.findByName(trimmed).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("A class group named '" + trimmed + "' already exists.");
            }
        });

        group.setName(trimmed);
        ClassGroup saved = classGroupRepository.save(group);
        long memberCount = userClassGroupRepository.countByClassGroup_Id(saved.getId());
        List<UserClassGroup> teachers = userClassGroupRepository.findTeachersByGroupIds(List.of(saved.getId()));
        UserClassGroup t = teachers.isEmpty() ? null : teachers.get(0);
        return AdminMapper.toClassGroupDto(saved, memberCount,
                t != null ? t.getUser().getId() : null,
                t != null ? t.getUser().getFullName() : null);
    }

    /**
     * Deletes an <em>empty</em> class group only. The FK has {@code ON DELETE CASCADE}, so
     * deleting a group with members would silently wipe real membership rows — refuse with
     * a 409 instead and require the caller to clear the group first.
     */
    @Transactional
    public void deleteGroup(Long id) {
        ClassGroup group = classGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class group " + id + " not found"));

        long memberCount = userClassGroupRepository.countByClassGroup_Id(id);
        if (memberCount > 0) {
            throw new ConflictException(
                    "Class group '" + group.getName() + "' still has " + memberCount
                            + " member(s). Remove them before deleting the group.");
        }

        classGroupRepository.delete(group);
    }

    /**
     * Grants a teacher import rights for a group by creating the {@code TEACHER}-role
     * membership row. Rejects a non-teacher target (400). Idempotent: re-assigning an
     * already-assigned teacher is a no-op, not an error.
     */
    @Transactional
    public void assignTeacher(Long groupId, Long userId) {
        ClassGroup group = classGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Class group " + groupId + " not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found"));

        if (user.getRole() != UserRole.TEACHER) {
            throw new BadRequestException(
                    "User " + userId + " is not a TEACHER and cannot be assigned as a group teacher.");
        }

        if (userClassGroupRepository.existsByUser_IdAndClassGroup_Id(userId, groupId)) {
            return; // already assigned — idempotent
        }

        userClassGroupRepository.save(new UserClassGroup(user, group));
    }

    /**
     * Revokes a teacher's import rights by removing their membership row. Idempotent: a
     * missing assignment is treated as already-revoked. Only removes {@code TEACHER}-role
     * rows so it can never accidentally drop a student's cohort membership.
     */
    @Transactional
    public void revokeTeacher(Long groupId, Long userId) {
        if (!classGroupRepository.existsById(groupId)) {
            throw new ResourceNotFoundException("Class group " + groupId + " not found");
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != UserRole.TEACHER) {
            return; // nothing to revoke for a non-teacher / unknown user
        }

        UserClassGroupId membershipId = new UserClassGroupId(userId, groupId);
        if (userClassGroupRepository.existsById(membershipId)) {
            userClassGroupRepository.deleteById(membershipId);
        }
    }
}
