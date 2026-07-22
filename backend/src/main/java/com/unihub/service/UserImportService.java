package com.unihub.service;

import com.unihub.dto.CreatedUserDto;
import com.unihub.dto.ImportErrorDto;
import com.unihub.dto.ImportResultResponse;
import com.unihub.exception.BadRequestException;
import com.unihub.model.ClassGroup;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import com.unihub.security.TempPasswordGenerator;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Bulk-creates accounts from an uploaded CSV (header {@code name,email,role,classGroup}).
 *
 * <p><strong>Per-row problems are data, not exceptions.</strong> Structural, permission,
 * unknown-group and duplicate problems are collected into the {@code errors} list and the
 * loop continues; only genuinely unexpected failures propagate (to the 500 handler). Each
 * successful row is persisted in its own transaction via
 * {@link UserImportPersistenceService}, so a bad row never rolls back the good ones.
 *
 * <p><strong>Permission scoping.</strong> An ADMIN may import any role into any existing
 * group. A TEACHER may import only STUDENTs, and only into groups they own (a
 * {@code TEACHER}-role membership row). A whole-request 403 is reserved for a teacher who
 * owns zero groups at all (no possible valid target); a batch that merely mixes valid and
 * out-of-scope rows yields per-row errors for the out-of-scope rows while the valid ones
 * still import.
 */
@Service
public class UserImportService {

    private static final List<String> REQUIRED_HEADERS = List.of("name", "email", "role", "classGroup");

    // Pragmatic RFC-5322-lite check; matches the spirit of jakarta's @Email without being exhaustive.
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final ClassGroupRepository classGroupRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final UserImportPersistenceService persistenceService;
    private final TempPasswordGenerator tempPasswordGenerator;

    public UserImportService(ClassGroupRepository classGroupRepository,
                             UserRepository userRepository,
                             UserClassGroupRepository userClassGroupRepository,
                             UserImportPersistenceService persistenceService,
                             TempPasswordGenerator tempPasswordGenerator) {
        this.classGroupRepository = classGroupRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.persistenceService = persistenceService;
        this.tempPasswordGenerator = tempPasswordGenerator;
    }

    public ImportResultResponse importUsers(MultipartFile file, AuthenticatedUser caller) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("The uploaded CSV file is empty.");
        }

        boolean isTeacher = UserRole.TEACHER.name().equals(caller.role());

        // Whole-request 403: a teacher who owns no groups has no possible valid target row.
        // Scoping keys on class-group IDs (not names): the permission decision is made
        // against the same resolved group that will actually be written, so a case-variant
        // group name (e.g. "math" vs an owned "Math") can never dodge the check.
        Set<Long> teacherOwnedGroupIds = null;
        if (isTeacher) {
            teacherOwnedGroupIds = new HashSet<>(
                    userClassGroupRepository.findOwnedGroupIds(caller.userId(), UserRole.TEACHER));
            if (teacherOwnedGroupIds.isEmpty()) {
                throw new AccessDeniedException(
                        "You are not assigned to any class group and cannot import users.");
            }
        }

        List<CSVRecord> records = parseRecords(file);

        List<CreatedUserDto> created = new ArrayList<>();
        List<ImportErrorDto> errors = new ArrayList<>();
        // In-batch duplicate guard (case-insensitive) so two rows with the same email
        // can't both be created within a single import.
        Set<String> seenEmails = new HashSet<>();

        for (CSVRecord record : records) {
            processRow(record, isTeacher, teacherOwnedGroupIds, seenEmails, created, errors);
        }

        return new ImportResultResponse(created.size(), errors.size(), created, errors);
    }

    private void processRow(CSVRecord record, boolean isTeacher,
                            Set<Long> teacherOwnedGroupIds, Set<String> seenEmails,
                            List<CreatedUserDto> created, List<ImportErrorDto> errors) {
        long line = record.getRecordNumber();
        String name = get(record, "name");
        String email = get(record, "email");
        String roleRaw = get(record, "role");
        String groupName = get(record, "classGroup");

        // 1. Structural validation.
        if (isBlank(name)) {
            errors.add(new ImportErrorDto(line, email, "name is required"));
            return;
        }
        if (isBlank(email)) {
            errors.add(new ImportErrorDto(line, email, "email is required"));
            return;
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add(new ImportErrorDto(line, email, "invalid email format"));
            return;
        }
        if (isBlank(roleRaw)) {
            errors.add(new ImportErrorDto(line, email, "role is required"));
            return;
        }
        UserRole role;
        try {
            role = UserRole.valueOf(roleRaw.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            errors.add(new ImportErrorDto(line, email, "unknown role '" + roleRaw + "'"));
            return;
        }
        if (isBlank(groupName)) {
            errors.add(new ImportErrorDto(line, email, "classGroup is required"));
            return;
        }

        // 2. Teacher role restriction (teachers may only create students). Group-independent,
        //    so it is checked before group resolution.
        if (isTeacher && role != UserRole.STUDENT) {
            errors.add(new ImportErrorDto(line, email, "teachers can only import students"));
            return;
        }

        // 3. Group existence — resolve FIRST, never auto-create (pre-existing groups required).
        Optional<ClassGroup> group = classGroupRepository.findByName(groupName);
        if (group.isEmpty()) {
            errors.add(new ImportErrorDto(line, email, "unknown class group '" + groupName + "'"));
            return;
        }
        ClassGroup resolvedGroup = group.get();

        // 4. Teacher group scoping — checked against the RESOLVED group's id, so the
        //    permission decision and the group actually written are the same group (a
        //    case-variant name cannot resolve to a group the teacher doesn't own).
        if (isTeacher && !teacherOwnedGroupIds.contains(resolvedGroup.getId())) {
            errors.add(new ImportErrorDto(line, email,
                    "not permitted to import into '" + groupName + "'"));
            return;
        }

        // 5. Duplicate check: against this batch and against the database. Both are
        //    case-insensitive because the email unique index is case-sensitive, so a
        //    case variant of an existing address must still be rejected as a duplicate.
        String emailKey = email.toLowerCase(Locale.ROOT);
        if (!seenEmails.add(emailKey)) {
            errors.add(new ImportErrorDto(line, email, "duplicate email"));
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            errors.add(new ImportErrorDto(line, email, "duplicate email"));
            return;
        }

        // 6. Create (own transaction). Temp password appears once, in the response only.
        String tempPassword = tempPasswordGenerator.generate();
        try {
            persistenceService.createAccount(email, name, role, resolvedGroup, tempPassword);
        } catch (DataIntegrityViolationException ex) {
            // Lost a race on the unique-email constraint after the pre-check — report as a
            // per-row duplicate rather than failing the whole import.
            seenEmails.remove(emailKey);
            errors.add(new ImportErrorDto(line, email, "duplicate email"));
            return;
        }

        created.add(new CreatedUserDto(email, name, role.name(), resolvedGroup.getName(), tempPassword));
    }

    private List<CSVRecord> parseRecords(MultipartFile file) {
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = format.parse(reader)) {

            List<String> headers = parser.getHeaderNames();
            for (String required : REQUIRED_HEADERS) {
                boolean present = headers.stream().anyMatch(h -> h.equalsIgnoreCase(required));
                if (!present) {
                    throw new BadRequestException(
                            "CSV header must contain the columns: name,email,role,classGroup");
                }
            }
            return parser.getRecords();
        } catch (IOException | IllegalArgumentException | IllegalStateException ex) {
            throw new BadRequestException("Could not parse the uploaded CSV file.");
        }
    }

    /** Reads a named column defensively — a short/ragged row yields blank, not an exception. */
    private static String get(CSVRecord record, String column) {
        if (!record.isMapped(column)) {
            return null;
        }
        try {
            return record.get(column);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
