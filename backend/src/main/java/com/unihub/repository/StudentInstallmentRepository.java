package com.unihub.repository;

import com.unihub.model.InstallmentStatus;
import com.unihub.model.StudentInstallment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentInstallmentRepository extends JpaRepository<StudentInstallment, Long> {

    List<StudentInstallment> findByStudentIdOrderByPeriodPeriodOrderAsc(Long studentId);

    List<StudentInstallment> findByStatusOrderBySubmittedAtAsc(InstallmentStatus status);

    Optional<StudentInstallment> findByStudentIdAndPeriodId(Long studentId, Long periodId);

    Optional<StudentInstallment> findByStudentIdAndPeriodPeriodOrder(Long studentId, int order);

    List<StudentInstallment> findByStudentIdAndPeriodAcademicYear(Long studentId, String academicYear);

    /**
     * All installments that are overdue (due date is in the past) and not yet PAID.
     */
    @Query("SELECT si FROM StudentInstallment si "
            + "WHERE si.period.dueDate < CURRENT_DATE "
            + "AND si.status <> com.unihub.model.InstallmentStatus.PAID")
    List<StudentInstallment> findOverdue();
}
