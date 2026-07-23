package com.unihub.repository;

import com.unihub.model.Event;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByEventDateBetween(LocalDate start, LocalDate end);

    List<Event> findByClassGroup_Id(Long classGroupId);
}
