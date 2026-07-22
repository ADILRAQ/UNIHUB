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
}
