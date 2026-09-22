package com.unihub.repository;

import com.unihub.model.InstallmentStatus;
import com.unihub.model.StudentInstallment;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentInstallmentRepository extends JpaRepository<StudentInstallment, Long> {

    List<StudentInstallment> findByStudentIdAndPeriodAcademicYearOrderByPeriodPeriodOrderAsc(
            Long studentId, String academicYear);

    List<StudentInstallment> findByStatusOrderBySubmittedAtAsc(InstallmentStatus status);

    Optional<StudentInstallment> findByStudentIdAndPeriodId(Long studentId, Long periodId);

    Optional<StudentInstallment> findByStudentIdAndPeriodPeriodOrder(Long studentId, int order);

    List<StudentInstallment> findByStudentIdAndPeriodAcademicYear(Long studentId, String academicYear);

    /**
     * All installments that are overdue (due date before {@code today}) and not yet PAID.
     * {@code today} is passed in (department timezone) rather than using the DB's CURRENT_DATE,
     * so it matches the per-installment overdue flag computed in {@code PaymentService}.
     */
    @Query("SELECT si FROM StudentInstallment si "
            + "WHERE si.period.dueDate < :today "
            + "AND si.status IN ("
            + "  com.unihub.model.InstallmentStatus.UNPAID,"
            + "  com.unihub.model.InstallmentStatus.REJECTED"
            + ")")
    List<StudentInstallment> findOverdue(@Param("today") LocalDate today);
}
