package com.unihub.controller;

import com.unihub.dto.ScheduleItemDto;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.ScheduleService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * The personalized "my schedule" feed: {@code GET /api/schedule?from=&to=} returns the caller's
 * sessions and events in range, merged into one chronologically sorted {@link ScheduleItemDto}
 * list. Open to any authenticated caller; scoping is per-role in {@link ScheduleService}.
 */
@Tag(name = "Calendar & Scheduling")
@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<ScheduleItemDto> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return scheduleService.getSchedule(from, to, caller);
    }
}
