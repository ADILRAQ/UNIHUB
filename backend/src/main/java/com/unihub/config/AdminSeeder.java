package com.unihub.config;

import com.unihub.model.User;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
@Order(1)
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminEmail;
    private final String adminPassword;
    private final String adminFullName;

    public AdminSeeder(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.admin.email:}") String adminEmail,
                       @Value("${app.admin.password:}") String adminPassword,
                       @Value("${app.admin.full-name:}") String adminFullName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminFullName = adminFullName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(adminEmail)
                || !StringUtils.hasText(adminPassword)
                || !StringUtils.hasText(adminFullName)) {
            log.warn("Admin seed skipped: ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FULL_NAME "
                    + "are not all set. No admin account was created.");
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Admin seed skipped: account already exists for {} (password left untouched).",
                    adminEmail);
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setFullName(adminFullName);
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setMustChangePassword(false);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        userRepository.save(admin);
        log.info("Seeded ADMIN account for {}.", adminEmail);
    }
}
