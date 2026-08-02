package com.unihub.repository;

import com.unihub.model.PaymentPeriod;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentPeriodRepository extends JpaRepository<PaymentPeriod, Long> {

    List<PaymentPeriod> findByAcademicYearOrderByPeriodOrderAsc(String academicYear);

    boolean existsByAcademicYearAndPeriodOrder(String academicYear, int periodOrder);
}
