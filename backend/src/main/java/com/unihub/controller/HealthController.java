package com.unihub.controller;

import com.unihub.dto.HealthResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health")
@RestController
@RequestMapping("/api")
public class HealthController {

    private final String appVersion;

    public HealthController(@Value("${app.version}") String appVersion) {
        this.appVersion = appVersion;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("UP", appVersion);
    }
}
