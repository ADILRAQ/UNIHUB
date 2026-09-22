package com.unihub.service;

import com.unihub.dto.CreatedUserDto;
import com.unihub.dto.ImportErrorDto;
import com.unihub.dto.ImportResultResponse;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ConflictException;
import com.unihub.model.ClassGroup;
import com.unihub.model.UserRole;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.security.AuthenticatedUser;
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
 * group. A TEACHER may import only STUDENTs, into any existing group (admin parity);
 * non-student rows from a teacher are per-row errors while the valid ones still import.
 */
@Service
public class UserImportService {

    private static final List<String> REQUIRED_HEADERS = List.of("name", "email", "role", "classGroup");

    // Pragmatic RFC-5322-lite check; matches the spirit of jakarta's @Email without being exhaustive.
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final ClassGroupRepository classGroupRepository;
    private final UserProvisioningService provisioningService;

    public UserImportService(ClassGroupRepository classGroupRepository,
                             UserProvisioningService provisioningService) {
        this.classGroupRepository = classGroupRepository;
        this.provisioningService = provisioningService;
    }

    public ImportResultResponse importUsers(MultipartFile file, AuthenticatedUser caller) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("The uploaded CSV file is empty.");
        }

        boolean isTeacher = UserRole.TEACHER.name().equals(caller.role());

        List<CSVRecord> records = parseRecords(file);

        List<CreatedUserDto> created = new ArrayList<>();
        List<ImportErrorDto> errors = new ArrayList<>();
        // In-batch duplicate guard (case-insensitive) so two rows with the same email
        // can't both be created within a single import.
        Set<String> seenEmails = new HashSet<>();

        for (CSVRecord record : records) {
            processRow(record, isTeacher, seenEmails, created, errors);
        }

        return new ImportResultResponse(created.size(), errors.size(), created, errors);
    }

    private void processRow(CSVRecord record, boolean isTeacher, Set<String> seenEmails,
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

        // 5. In-batch duplicate guard (case-insensitive) so two rows with the same email can't
        //    both be created within a single import. The DB-level duplicate check lives in the
        //    shared provisioning step below (and the users_email_lower_key index (V5) is the
        //    authoritative case-insensitive backstop).
        String emailKey = email.toLowerCase(Locale.ROOT);
        if (!seenEmails.add(emailKey)) {
            errors.add(new ImportErrorDto(line, email, "duplicate email"));
            return;
        }

        // 6. Create via the shared single-user provisioning primitive (own transaction, temp
        //    password appears once, in the response only). A duplicate — whether caught by the
        //    pre-check or a lost race on the unique index — surfaces as a ConflictException,
        //    which we turn into a per-row error so one bad row never fails the whole import.
        try {
            created.add(provisioningService.provision(email, name, role, resolvedGroup));
        } catch (ConflictException ex) {
            seenEmails.remove(emailKey);
            errors.add(new ImportErrorDto(line, email, "duplicate email"));
        }
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
