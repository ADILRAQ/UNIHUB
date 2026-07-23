package com.unihub.repository;

import com.unihub.model.UserClassGroup;
import com.unihub.model.UserClassGroupId;
import com.unihub.model.UserRole;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserClassGroupRepository extends JpaRepository<UserClassGroup, UserClassGroupId> {

    List<UserClassGroup> findByUser_Id(Long userId);

    List<UserClassGroup> findByUser_IdAndUser_Role(Long userId, UserRole role);

    boolean existsByUser_IdAndClassGroup_Id(Long userId, Long classGroupId);

    long countByClassGroup_Id(Long classGroupId);

    /**
     * The ids of every class group a user belongs to — the student's group scope for the
     * schedule/course reads. A projection query so it can be called without navigating the
     * lazy {@code classGroup} association off each membership entity.
     */
    @Query("select ucg.classGroup.id from UserClassGroup ucg where ucg.user.id = :userId")
    List<Long> findGroupIdsByUserId(@Param("userId") Long userId);

    /**
     * The ids of the class groups a teacher owns (their {@code TEACHER}-role membership
     * rows) — that teacher's import-rights grant, used by CSV import to scope which groups
     * they may import into. A projection query is used deliberately: the caller runs outside
     * an open persistence session, so navigating the lazy {@code classGroup} association off
     * the entity would fail; selecting the id directly sidesteps lazy loading. Ids (not
     * names) are returned so scoping keys on group identity, immune to case-variant names.
     */
    @Query("select ucg.classGroup.id from UserClassGroup ucg "
            + "where ucg.user.id = :teacherId and ucg.user.role = :role")
    List<Long> findOwnedGroupIds(@Param("teacherId") Long teacherId,
                                 @Param("role") UserRole role);

    /**
     * Whether the given teacher owns a class group that the given user is a
     * {@code STUDENT} member of — the "does this teacher manage this student" check behind
     * the teacher-scoped password-reset {@code @PreAuthorize}. The role conditions are baked
     * into the query so it answers a teacher↔student relationship specifically: a co-teacher
     * or admin sharing the same group is not a match, and only a {@code TEACHER}-role owning
     * membership counts as ownership.
     */
    @Query("select count(sm) > 0 from UserClassGroup tm, UserClassGroup sm "
            + "where tm.user.id = :teacherId and tm.user.role = com.unihub.model.UserRole.TEACHER "
            + "and sm.user.id = :studentId and sm.user.role = com.unihub.model.UserRole.STUDENT "
            + "and tm.classGroup.id = sm.classGroup.id")
    boolean teacherSharesGroupWithStudent(@Param("teacherId") Long teacherId,
                                          @Param("studentId") Long studentId);
}
