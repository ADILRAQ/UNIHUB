package com.unihub.repository;

import com.unihub.model.PaymentPeriod;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PaymentPeriodRepository extends JpaRepository<PaymentPeriod, Long> {

    boolean existsByAcademicYearAndClassGroup_IdAndPeriodOrder(String academicYear,
                                                              Long classGroupId,
                                                              int periodOrder);

    /** All periods of one class group's plans (every academic year). */
    List<PaymentPeriod> findByClassGroup_Id(Long classGroupId);

    /** Every period with its class group fetched in the same query (no N+1 on the lazy group). */
    @Query("select p from PaymentPeriod p join fetch p.classGroup")
    List<PaymentPeriod> findAllWithClassGroup();
}
