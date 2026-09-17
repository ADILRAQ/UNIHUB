package com.unihub.config;

import com.unihub.model.Announcement;
import com.unihub.model.AnnouncementComment;
import com.unihub.model.Assignment;
import com.unihub.model.ClassGroup;
import com.unihub.model.Course;
import com.unihub.model.CourseModule;
import com.unihub.model.InstallmentStatus;
import com.unihub.model.PaymentPeriod;
import com.unihub.model.Resource;
import com.unihub.model.ScheduleTemplate;
import com.unihub.model.Session;
import com.unihub.model.StudentInstallment;
import com.unihub.model.Submission;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.repository.AnnouncementCommentRepository;
import com.unihub.repository.AnnouncementRepository;
import com.unihub.repository.AssignmentRepository;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.CourseModuleRepository;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.PaymentPeriodRepository;
import com.unihub.repository.ResourceRepository;
import com.unihub.repository.ScheduleTemplateRepository;
import com.unihub.repository.SessionRepository;
import com.unihub.repository.StudentInstallmentRepository;
import com.unihub.repository.SubmissionRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.service.SessionGenerationService;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds a full, realistic demo dataset when the {@code dev} Spring profile is active.
 *
 * <p>Covers every UniHub feature so a jury or reviewer can exercise all screens without
 * manual data entry. Runs <strong>after</strong> {@link AdminSeeder} (which creates the
 * base admin/teacher/student accounts) thanks to {@code @Order(2)}.
 *
 * <p>Idempotent: exits immediately if any {@link Course} row already exists.
 */
@Component
@Profile("dev")
@Order(2)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private static final String RECORDING_URL = null;
    private static final String ACADEMIC_YEAR  = "2025-2026";

    private final CourseRepository courseRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final ScheduleTemplateRepository scheduleTemplateRepository;
    private final SessionGenerationService sessionGenerationService;
    private final SessionRepository sessionRepository;
    private final AnnouncementRepository announcementRepository;
    private final AnnouncementCommentRepository announcementCommentRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final ResourceRepository resourceRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final PaymentPeriodRepository paymentPeriodRepository;
    private final StudentInstallmentRepository studentInstallmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            CourseRepository courseRepository,
            ClassGroupRepository classGroupRepository,
            UserRepository userRepository,
            UserClassGroupRepository userClassGroupRepository,
            ScheduleTemplateRepository scheduleTemplateRepository,
            SessionGenerationService sessionGenerationService,
            SessionRepository sessionRepository,
            AnnouncementRepository announcementRepository,
            AnnouncementCommentRepository announcementCommentRepository,
            CourseModuleRepository courseModuleRepository,
            ResourceRepository resourceRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            PaymentPeriodRepository paymentPeriodRepository,
            StudentInstallmentRepository studentInstallmentRepository,
            PasswordEncoder passwordEncoder) {
        this.courseRepository = courseRepository;
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.scheduleTemplateRepository = scheduleTemplateRepository;
        this.sessionGenerationService = sessionGenerationService;
        this.sessionRepository = sessionRepository;
        this.announcementRepository = announcementRepository;
        this.announcementCommentRepository = announcementCommentRepository;
        this.courseModuleRepository = courseModuleRepository;
        this.resourceRepository = resourceRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.paymentPeriodRepository = paymentPeriodRepository;
        this.studentInstallmentRepository = studentInstallmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (courseRepository.count() > 0) {
            log.info("Demo data already present — skipping DemoDataSeeder.");
            return;
        }
        log.info("Seeding demo data for jury review...");

        // ------------------------------------------------------------------ //
        // 1. Class groups                                                      //
        // ------------------------------------------------------------------ //
        ClassGroup groupA = ensureClassGroup("L3 Info A");
        ClassGroup groupB = ensureClassGroup("L3 Info B");

        // ------------------------------------------------------------------ //
        // 2. Users                                                             //
        // ------------------------------------------------------------------ //
        User teacher1 = ensureUser("teacher@unihub.local",  "changeme-teacher",  "Alice Martin",  UserRole.TEACHER,  groupA);
        User teacher2 = ensureUser("teacher2@unihub.local", "changeme-teacher2", "Carol Sow",     UserRole.TEACHER,  groupB);
        User student1 = ensureUser("student@unihub.local",  "changeme-student",  "Bob Dupont",    UserRole.STUDENT,  groupA);
        User student2 = ensureUser("student2@unihub.local", "changeme-student2", "David Kim",     UserRole.STUDENT,  groupA);
        User student3 = ensureUser("student3@unihub.local", "changeme-student3", "Emma Touré",    UserRole.STUDENT,  groupA);
        User student4 = ensureUser("student4@unihub.local", "changeme-student4", "Fatima Osei",   UserRole.STUDENT,  groupB);
        User student5 = ensureUser("student5@unihub.local", "changeme-student5", "Hugo Blanc",    UserRole.STUDENT,  groupB);
        User student6 = ensureUser("student6@unihub.local", "changeme-student6", "Inès Bah",      UserRole.STUDENT,  groupB);

        User admin = userRepository.findByEmailIgnoreCase("admin@unihub.local").orElse(null);

        // ------------------------------------------------------------------ //
        // 3. Courses                                                           //
        // ------------------------------------------------------------------ //
        Course algoCourse = createCourse("Algorithms",       teacher1, groupA, "https://meet.google.com/demo-algo-xxx");
        Course dsCourse   = createCourse("Data Structures",  teacher1, groupA, "https://meet.google.com/demo-ds-xxx");
        Course webCourse  = createCourse("Web Development",  teacher2, groupB, "https://meet.google.com/demo-web-xxx");
        Course dbCourse   = createCourse("Databases",        teacher2, groupB, "https://meet.google.com/demo-db-xxx");

        // ------------------------------------------------------------------ //
        // 4. Schedule templates + session generation                          //
        // ------------------------------------------------------------------ //
        LocalDate semesterStart = LocalDate.now().minusWeeks(8);
        LocalDate semesterEnd   = LocalDate.now().plusWeeks(4);

        ScheduleTemplate algoTpl = createTemplate(algoCourse, DayOfWeek.MONDAY,    LocalTime.of(8,  0), LocalTime.of(10, 0), "Room 101", semesterStart, semesterEnd);
        ScheduleTemplate dsTpl   = createTemplate(dsCourse,   DayOfWeek.TUESDAY,   LocalTime.of(10, 0), LocalTime.of(12, 0), "Room 202", semesterStart, semesterEnd);
        ScheduleTemplate webTpl  = createTemplate(webCourse,  DayOfWeek.WEDNESDAY, LocalTime.of(14, 0), LocalTime.of(16, 0), "Lab 1",    semesterStart, semesterEnd);
        ScheduleTemplate dbTpl   = createTemplate(dbCourse,   DayOfWeek.THURSDAY,  LocalTime.of(8,  0), LocalTime.of(10, 0), "Room 303", semesterStart, semesterEnd);

        sessionGenerationService.generateSessions(algoTpl);
        sessionGenerationService.generateSessions(dsTpl);
        sessionGenerationService.generateSessions(webTpl);
        sessionGenerationService.generateSessions(dbTpl);

        // ------------------------------------------------------------------ //
        // 5. Announcements + comments                                         //
        // ------------------------------------------------------------------ //
        Announcement deptWide = createAnnouncement(teacher1, null,
                "Welcome to the New Semester!",
                "<p>Dear students, welcome to <strong>UniHub</strong>. All course materials, "
                + "schedules, and announcements are available here. Have a great semester!</p>",
                true, false);
        Announcement algoReminder = createAnnouncement(teacher1, groupA,
                "Algorithms Mid-Term Reminder",
                "<p>The mid-term exam for <em>Algorithms</em> takes place in <strong>two weeks</strong>. "
                + "Please review chapters 3 and 4 on sorting and graph theory.</p>",
                false, true);
        Announcement guestLecture = createAnnouncement(teacher1, groupA,
                "Guest Lecture on Machine Learning",
                "<p>We have a special guest lecture next week on applied machine learning in industry. "
                + "Attendance is strongly recommended.</p>",
                false, false);
        Announcement webProject = createAnnouncement(teacher2, groupB,
                "Web Development Project Teams Published",
                "<p>Project teams for the semester assignment have been published. Check the "
                + "Resources section for the full team list and brief.</p>",
                true, false);
        Announcement dbExam = createAnnouncement(teacher2, groupB,
                "Databases Final Exam — This Friday",
                "<p><strong>Important:</strong> The Databases final exam is scheduled for "
                + "<em>this Friday at 08:00</em> in Room 303. Please bring your student ID.</p>",
                false, true);

        createComment(deptWide,     student1, "Thank you! Looking forward to this semester.");
        createComment(deptWide,     student4, "Great, can't wait to start the courses.");
        createComment(algoReminder, student2, "Will the exam include dynamic programming?");
        createComment(algoReminder, student1, "I think only chapters 3 and 4 as mentioned.");
        createComment(guestLecture, student3, "Is there a recording for those who can't attend?");
        createComment(webProject,   student4, "Found my team. Thanks for the update!");
        createComment(dbExam,       student5, "Which chapters are in scope for the final?");

        // suppress unused-variable warnings for announcement variables held only for documentation
        noop(deptWide, algoReminder, guestLecture, webProject, dbExam);

        // ------------------------------------------------------------------ //
        // 6. Modules & Resources                                              //
        // ------------------------------------------------------------------ //
        List<Resource> algoResources = seedModulesAndResources(algoCourse, teacher1, "algorithms");
        List<Resource> dsResources   = seedModulesAndResources(dsCourse,   teacher1, "data-structures");
        List<Resource> webResources  = seedModulesAndResources(webCourse,  teacher2, "web-dev");
        List<Resource> dbResources   = seedModulesAndResources(dbCourse,   teacher2, "databases");

        // ------------------------------------------------------------------ //
        // 7. Assignments                                                      //
        // ------------------------------------------------------------------ //
        OffsetDateTime pastDue   = OffsetDateTime.now(ZoneOffset.UTC).minusWeeks(3);
        OffsetDateTime futureDue = OffsetDateTime.now(ZoneOffset.UTC).plusWeeks(2);

        Assignment algoPast   = createAssignment(algoCourse, "Sorting Algorithms Exercise",    "Implement merge sort and quicksort in Java with unit tests.",         pastDue);
        Assignment algoFuture = createAssignment(algoCourse, "Graph Traversal Project",        "Implement BFS and DFS, then visualise the traversal order.",           futureDue);
        Assignment dsPast     = createAssignment(dsCourse,   "Linked List Implementation",     "Implement a doubly linked list supporting insert, delete and search.", pastDue);
        Assignment dsFuture   = createAssignment(dsCourse,   "Binary Search Tree Library",     "Build a full BST library with in-order, pre-order and post-order.",   futureDue);
        Assignment webPast    = createAssignment(webCourse,  "HTML/CSS Portfolio Page",        "Create a responsive personal portfolio page using plain HTML/CSS.",    pastDue);
        Assignment webFuture  = createAssignment(webCourse,  "React Single-Page Application",  "Build a functional SPA with React and TanStack Query.",                futureDue);
        Assignment dbPast     = createAssignment(dbCourse,   "Normalisation Exercise",          "Normalise the provided schema to Third Normal Form (3NF).",            pastDue);
        Assignment dbFuture   = createAssignment(dbCourse,   "Database Design Project",         "Design and implement a relational schema for a given case study.",     futureDue);

        noop(algoFuture, dsFuture, webFuture, dbFuture);

        // ------------------------------------------------------------------ //
        // 8. Submissions (past-due assignments only)                         //
        // ------------------------------------------------------------------ //
        // dbPast intentionally has zero submissions to demo the "0 submitted" state.
        Instant submitted = Instant.now().minus(Duration.ofDays(10));

        createSubmission(algoPast, student1, "demo/submissions/algo-past/student1.pdf", submitted, true);
        createSubmission(algoPast, student2, "demo/submissions/algo-past/student2.pdf", submitted, true);
        createSubmission(dsPast,   student1, "demo/submissions/ds-past/student1.pdf",   submitted, true);
        createSubmission(webPast,  student4, "demo/submissions/web-past/student4.pdf",  submitted, true);

        noop(dbPast);

        // ------------------------------------------------------------------ //
        // 9. Payment periods (3 installments for academic year 2025-2026)    //
        // ------------------------------------------------------------------ //
        LocalDate today = LocalDate.now();
        PaymentPeriod period1 = createPaymentPeriod(ACADEMIC_YEAR, "First Installment",  new BigDecimal("5000.00"), today.minusMonths(2), 1);
        PaymentPeriod period2 = createPaymentPeriod(ACADEMIC_YEAR, "Second Installment", new BigDecimal("5000.00"), today.plusMonths(1),  2);
        PaymentPeriod period3 = createPaymentPeriod(ACADEMIC_YEAR, "Third Installment",  new BigDecimal("5000.00"), today.plusMonths(4),  3);

        // ------------------------------------------------------------------ //
        // 10. Student installments                                            //
        // ------------------------------------------------------------------ //
        List<User> students = List.of(student1, student2, student3, student4, student5, student6);
        Long s1Id = student1.getId();
        Long s2Id = student2.getId();

        for (User student : students) {
            Long sid = student.getId();

            // Period 1: PAID → student1, REJECTED → student2, UNPAID → rest
            StudentInstallment si1 = new StudentInstallment();
            si1.setStudent(student);
            si1.setPeriod(period1);
            if (sid.equals(s1Id)) {
                si1.setStatus(InstallmentStatus.PAID);
                si1.setValidatedAt(Instant.now().minus(Duration.ofDays(20)));
                if (admin != null) {
                    si1.setValidatedBy(admin);
                }
            } else if (sid.equals(s2Id)) {
                si1.setStatus(InstallmentStatus.REJECTED);
                si1.setRejectionReason("Proof image quality too low — please resubmit a clearer copy.");
            } else {
                si1.setStatus(InstallmentStatus.UNPAID);
            }
            studentInstallmentRepository.save(si1);

            // Period 2: PROOF_SUBMITTED → student1, UNPAID → rest
            StudentInstallment si2 = new StudentInstallment();
            si2.setStudent(student);
            si2.setPeriod(period2);
            if (sid.equals(s1Id)) {
                si2.setStatus(InstallmentStatus.PROOF_SUBMITTED);
                si2.setProofStorageKey("demo/proofs/student1/period-2.pdf");
                si2.setSubmittedAt(Instant.now().minus(Duration.ofDays(2)));
            } else {
                si2.setStatus(InstallmentStatus.UNPAID);
            }
            studentInstallmentRepository.save(si2);

            // Period 3: UNPAID for all
            StudentInstallment si3 = new StudentInstallment();
            si3.setStudent(student);
            si3.setPeriod(period3);
            si3.setStatus(InstallmentStatus.UNPAID);
            studentInstallmentRepository.save(si3);
        }

        // ------------------------------------------------------------------ //
        // 11. Session recaps (2 most-recent past sessions per course)        //
        // ------------------------------------------------------------------ //
        seedRecaps(algoCourse, algoResources);
        seedRecaps(dsCourse,   dsResources);
        seedRecaps(webCourse,  webResources);
        seedRecaps(dbCourse,   dbResources);

        log.info("Demo data seeding complete — 4 courses, {} students, 3 payment periods.",
                students.size());
    }

    // ---------------------------------------------------------------------- //
    // Helpers                                                                  //
    // ---------------------------------------------------------------------- //

    private ClassGroup ensureClassGroup(String name) {
        return classGroupRepository.findByName(name).orElseGet(() -> {
            ClassGroup g = new ClassGroup();
            g.setName(name);
            ClassGroup saved = classGroupRepository.save(g);
            log.debug("Seeded class group '{}'.", name);
            return saved;
        });
    }

    /**
     * Finds a user by email; creates them (with the given defaults) if absent.
     * Also ensures the user is enrolled in {@code group}.
     */
    private User ensureUser(String email, String password, String fullName,
                             UserRole role, ClassGroup group) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setFullName(fullName);
            u.setRole(role);
            u.setStatus(UserStatus.ACTIVE);
            u.setMustChangePassword(false);
            u.setPasswordHash(passwordEncoder.encode(password));
            User saved = userRepository.save(u);
            log.debug("Seeded {} account for {}.", role, email);
            return saved;
        });
        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(user.getId(), group.getId())) {
            userClassGroupRepository.save(new UserClassGroup(user, group));
        }
        return user;
    }

    private Course createCourse(String name, User teacher, ClassGroup group, String meetLink) {
        Course c = new Course();
        c.setName(name);
        c.setTeacher(teacher);
        c.setClassGroup(group);
        c.setMeetLink(meetLink);
        return courseRepository.save(c);
    }

    private ScheduleTemplate createTemplate(Course course, DayOfWeek day,
                                             LocalTime start, LocalTime end,
                                             String room,
                                             LocalDate startDate, LocalDate endDate) {
        ScheduleTemplate t = new ScheduleTemplate();
        t.setCourse(course);
        t.setDayOfWeek(day);
        t.setStartTime(start);
        t.setEndTime(end);
        t.setRoom(room);
        t.setStartDate(startDate);
        t.setEndDate(endDate);
        t.setActive(true);
        return scheduleTemplateRepository.save(t);
    }

    private Announcement createAnnouncement(User author, ClassGroup group,
                                             String title, String bodyHtml,
                                             boolean pinned, boolean urgent) {
        Announcement a = new Announcement();
        a.setAuthor(author);
        a.setClassGroup(group);
        a.setTitle(title);
        a.setBodyHtml(bodyHtml);
        a.setPinned(pinned);
        a.setUrgent(urgent);
        return announcementRepository.save(a);
    }

    private void createComment(Announcement announcement, User author, String content) {
        AnnouncementComment c = new AnnouncementComment();
        c.setAnnouncement(announcement);
        c.setAuthor(author);
        c.setContent(content);
        announcementCommentRepository.save(c);
    }

    /**
     * Creates 2 modules for {@code course}, each with 2 resources (one PDF, one link).
     *
     * @return one representative resource per module (used as recap resources).
     */
    private List<Resource> seedModulesAndResources(Course course, User teacher, String courseSlug) {
        List<Resource> firstPerModule = new ArrayList<>();

        for (int m = 1; m <= 2; m++) {
            String moduleTitle = "Week " + ((m - 1) * 4 + 1) + "–8";  // e.g. "Week 1–4"

            CourseModule mod = new CourseModule();
            mod.setCourse(course);
            mod.setTitle(moduleTitle);
            mod.setDisplayOrder(m);
            mod = courseModuleRepository.save(mod);

            // Lecture slides (PDF placeholder)
            Resource slides = new Resource();
            slides.setModule(mod);
            slides.setName("Lecture Slides — " + moduleTitle);
            slides.setContentType("application/pdf");
            slides.setStorageKey("demo/" + courseSlug + "/mod" + m + "/lecture-slides.pdf");
            slides.setSizeBytes(204_800L);
            slides.setUploadedBy(teacher);
            slides = resourceRepository.save(slides);
            firstPerModule.add(slides);

            // Reference link placeholder
            Resource link = new Resource();
            link.setModule(mod);
            link.setName("Reference Link — " + moduleTitle);
            link.setContentType("text/uri-list");
            link.setStorageKey("demo/" + courseSlug + "/mod" + m + "/reference-link.url");
            link.setSizeBytes(128L);
            link.setUploadedBy(teacher);
            resourceRepository.save(link);
        }
        return firstPerModule;
    }

    private Assignment createAssignment(Course course, String title, String description,
                                         OffsetDateTime dueAt) {
        Assignment a = new Assignment();
        a.setCourse(course);
        a.setTitle(title);
        a.setDescription(description);
        a.setDueAt(dueAt);
        return assignmentRepository.save(a);
    }

    private void createSubmission(Assignment assignment, User student,
                                   String storageKey, Instant submittedAt, boolean late) {
        Submission s = new Submission();
        s.setAssignment(assignment);
        s.setStudent(student);
        s.setStorageKey(storageKey);
        s.setContentType("application/pdf");
        s.setOriginalName("submission.pdf");
        s.setSubmittedAt(submittedAt);
        s.setLate(late);
        submissionRepository.save(s);
    }

    private PaymentPeriod createPaymentPeriod(String academicYear, String label,
                                               BigDecimal amount, LocalDate dueDate, int order) {
        PaymentPeriod p = new PaymentPeriod();
        p.setAcademicYear(academicYear);
        p.setLabel(label);
        p.setAmount(amount);
        p.setDueDate(dueDate);
        p.setPeriodOrder(order);
        return paymentPeriodRepository.save(p);
    }

    /**
     * Fills recap fields on the 2 most-recent past sessions of {@code course}.
     * Links the first-module resource as a recap resource for context.
     */
    private void seedRecaps(Course course, List<Resource> moduleResources) {
        List<Session> past = sessionRepository.findPastSessionsByCourseId(
                course.getId(), LocalDate.now())
                .stream()
                .sorted(Comparator.comparing(Session::getSessionDate).reversed())
                .limit(2)
                .toList();
        int chapter = 1;
        for (Session session : past) {
            session.setRecordingUrl(RECORDING_URL);
            session.setNotesHtml(
                    "<p>Session summary: covered key concepts from chapter " + chapter
                    + ". See linked resources for slides and exercises.</p>");
            session.setRecapUpdatedAt(Instant.now());
            if (chapter <= moduleResources.size()) {
                Resource res = moduleResources.get(chapter - 1);
                if (!session.getRecapResources().contains(res)) {
                    session.getRecapResources().add(res);
                }
            }
            sessionRepository.save(session);
            chapter++;
        }
    }

    /** No-op sink to suppress "unused variable" warnings for documentation-only variables. */
    @SafeVarargs
    @SuppressWarnings("varargs")
    private static <T> void noop(T... ignored) {
        // intentionally empty
    }
}
