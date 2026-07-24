package com.unihub.config;

import com.unihub.model.ClassGroup;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Seeds dev accounts on startup from environment variables.
 *
 * <p>Creates (if absent):
 * <ul>
 *   <li>One ADMIN account (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FULL_NAME)</li>
 *   <li>One TEACHER account (TEACHER_EMAIL / TEACHER_PASSWORD / TEACHER_FULL_NAME),
 *       enrolled in the seed class group</li>
 *   <li>One STUDENT account (STUDENT_EMAIL / STUDENT_PASSWORD / STUDENT_FULL_NAME),
 *       enrolled in the same seed class group</li>
 *   <li>A class group named by SEED_CLASS_GROUP (default: "L3 Info A")</li>
 * </ul>
 *
 * <p>Idempotent: skips any account whose email already exists; never resets passwords.
 * Missing env vars cause a warning log, not a startup failure.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminEmail;
    private final String adminPassword;
    private final String adminFullName;

    private final String teacherEmail;
    private final String teacherPassword;
    private final String teacherFullName;

    private final String studentEmail;
    private final String studentPassword;
    private final String studentFullName;

    private final String seedClassGroupName;

    public AdminSeeder(UserRepository userRepository,
                       ClassGroupRepository classGroupRepository,
                       UserClassGroupRepository userClassGroupRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.admin.email:}") String adminEmail,
                       @Value("${app.admin.password:}") String adminPassword,
                       @Value("${app.admin.full-name:}") String adminFullName,
                       @Value("${app.teacher.email:}") String teacherEmail,
                       @Value("${app.teacher.password:}") String teacherPassword,
                       @Value("${app.teacher.full-name:}") String teacherFullName,
                       @Value("${app.student.email:}") String studentEmail,
                       @Value("${app.student.password:}") String studentPassword,
                       @Value("${app.student.full-name:}") String studentFullName,
                       @Value("${app.seed.class-group:L3 Info A}") String seedClassGroupName) {
        this.userRepository = userRepository;
        this.classGroupRepository = classGroupRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminFullName = adminFullName;
        this.teacherEmail = teacherEmail;
        this.teacherPassword = teacherPassword;
        this.teacherFullName = teacherFullName;
        this.studentEmail = studentEmail;
        this.studentPassword = studentPassword;
        this.studentFullName = studentFullName;
        this.seedClassGroupName = seedClassGroupName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();
        ClassGroup group = ensureClassGroup();
        seedTeacher(group);
        seedStudent(group);
    }

    private void seedAdmin() {
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

    private ClassGroup ensureClassGroup() {
        return classGroupRepository.findByName(seedClassGroupName)
                .orElseGet(() -> {
                    ClassGroup g = new ClassGroup();
                    g.setName(seedClassGroupName);
                    ClassGroup saved = classGroupRepository.save(g);
                    log.info("Seeded class group '{}'.", seedClassGroupName);
                    return saved;
                });
    }

    private void seedTeacher(ClassGroup group) {
        if (!StringUtils.hasText(teacherEmail)
                || !StringUtils.hasText(teacherPassword)
                || !StringUtils.hasText(teacherFullName)) {
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(teacherEmail)) {
            log.info("Teacher seed skipped: account already exists for {}.", teacherEmail);
            return;
        }
        User teacher = new User();
        teacher.setEmail(teacherEmail);
        teacher.setFullName(teacherFullName);
        teacher.setRole(UserRole.TEACHER);
        teacher.setStatus(UserStatus.ACTIVE);
        teacher.setMustChangePassword(false);
        teacher.setPasswordHash(passwordEncoder.encode(teacherPassword));
        teacher = userRepository.save(teacher);

        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(teacher.getId(), group.getId())) {
            userClassGroupRepository.save(new UserClassGroup(teacher, group));
        }
        log.info("Seeded TEACHER account for {} in group '{}'.", teacherEmail, group.getName());
    }

    private void seedStudent(ClassGroup group) {
        if (!StringUtils.hasText(studentEmail)
                || !StringUtils.hasText(studentPassword)
                || !StringUtils.hasText(studentFullName)) {
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(studentEmail)) {
            log.info("Student seed skipped: account already exists for {}.", studentEmail);
            return;
        }
        User student = new User();
        student.setEmail(studentEmail);
        student.setFullName(studentFullName);
        student.setRole(UserRole.STUDENT);
        student.setStatus(UserStatus.ACTIVE);
        student.setMustChangePassword(false);
        student.setPasswordHash(passwordEncoder.encode(studentPassword));
        student = userRepository.save(student);

        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(student.getId(), group.getId())) {
            userClassGroupRepository.save(new UserClassGroup(student, group));
        }
        log.info("Seeded STUDENT account for {} in group '{}'.", studentEmail, group.getName());
    }
}
