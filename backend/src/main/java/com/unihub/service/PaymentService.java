package com.unihub.service;

import com.unihub.dto.CreatePeriodRequest;
import com.unihub.dto.InstallmentDto;
import com.unihub.dto.OverdueStudentDto;
import com.unihub.dto.PaymentPeriodDto;
import com.unihub.dto.PendingProofItemDto;
import com.unihub.dto.ProofQueueItemDto;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ConflictException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.InstallmentStatus;
import com.unihub.model.PaymentPeriod;
import com.unihub.model.StudentInstallment;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.model.UserRole;
import com.unihub.repository.PaymentPeriodRepository;
import com.unihub.repository.StudentInstallmentRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Payment period management and student installment lifecycle (UNIH-40).
 *
 * <p>Key rules:
 * <ul>
 *   <li>Admin creates 3 periods per academic year; the service creates UNPAID (order 1) and
 *       LOCKED (orders 2 and 3) installments for every existing active STUDENT.</li>
 *   <li>Students upload a proof when their current installment is UNPAID or REJECTED.</li>
 *   <li>Admin approves or rejects; approval auto-unlocks the next installment.</li>
 *   <li>{@link #generateInstallmentsForNewStudent} is called by the user creation flow for
 *       newly provisioned students.</li>
 * </ul>
 */
@Service
public class PaymentService {

    private final PaymentPeriodRepository periodRepository;
    private final StudentInstallmentRepository installmentRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final StorageService storageService;

    public PaymentService(PaymentPeriodRepository periodRepository,
                          StudentInstallmentRepository installmentRepository,
                          UserRepository userRepository,
                          UserClassGroupRepository userClassGroupRepository,
                          StorageService storageService) {
        this.periodRepository = periodRepository;
        this.installmentRepository = installmentRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.storageService = storageService;
    }

    // =========================================================================
    // Admin: period plan creation
    // =========================================================================

    @Transactional
    public List<PaymentPeriodDto> createYearPlan(String academicYear,
                                                   List<CreatePeriodRequest.PeriodEntry> entries) {
        if (entries == null || entries.size() != 3) {
            throw new BadRequestException("A payment plan must contain exactly 3 period entries.");
        }

        Set<Integer> orders = entries.stream()
                .map(CreatePeriodRequest.PeriodEntry::periodOrder)
                .collect(Collectors.toSet());
        if (!orders.equals(Set.of(1, 2, 3))) {
            throw new BadRequestException("Period orders must be exactly 1, 2, and 3.");
        }

        // Check for conflicts
        for (CreatePeriodRequest.PeriodEntry entry : entries) {
            if (periodRepository.existsByAcademicYearAndPeriodOrder(
                    academicYear, entry.periodOrder())) {
                throw new ConflictException("Period order " + entry.periodOrder()
                        + " already exists for academic year " + academicYear + ".");
            }
        }

        // Save periods
        List<PaymentPeriod> savedPeriods = new ArrayList<>();
        for (CreatePeriodRequest.PeriodEntry entry : entries) {
            PaymentPeriod period = new PaymentPeriod();
            period.setAcademicYear(academicYear);
            period.setLabel(entry.label());
            period.setAmount(entry.amount());
            period.setDueDate(entry.dueDate());
            period.setPeriodOrder(entry.periodOrder());
            savedPeriods.add(periodRepository.save(period));
        }

        // Sort by period order
        savedPeriods.sort((a, b) -> Integer.compare(a.getPeriodOrder(), b.getPeriodOrder()));

        // Create installments for all existing STUDENT users
        List<User> allStudents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .toList();

        for (User student : allStudents) {
            List<StudentInstallment> existing =
                    installmentRepository.findByStudentIdAndPeriodAcademicYear(
                            student.getId(), academicYear);
            if (!existing.isEmpty()) {
                continue; // already has installments for this year
            }
            createInstallmentsForStudentAndPeriods(student, savedPeriods);
        }

        return savedPeriods.stream().map(this::toPeriodDto).toList();
    }

    // =========================================================================
    // Admin: read plans
    // =========================================================================

    @Transactional(readOnly = true)
    public Map<String, List<PaymentPeriodDto>> getYearPlans() {
        List<PaymentPeriod> all = periodRepository.findAll();
        Map<String, List<PaymentPeriodDto>> result = new LinkedHashMap<>();
        all.stream()
                .sorted((a, b) -> {
                    int yearCmp = b.getAcademicYear().compareTo(a.getAcademicYear());
                    return yearCmp != 0 ? yearCmp : Integer.compare(a.getPeriodOrder(), b.getPeriodOrder());
                })
                .forEach(p -> result
                        .computeIfAbsent(p.getAcademicYear(), k -> new ArrayList<>())
                        .add(toPeriodDto(p)));
        return result;
    }

    // =========================================================================
    // Student: view own installments
    // =========================================================================

    @Transactional(readOnly = true)
    public List<InstallmentDto> getMyInstallments(Long studentId) {
        return installmentRepository.findByStudentIdOrderByPeriodPeriodOrderAsc(studentId)
                .stream()
                .map(this::toInstallmentDto)
                .toList();
    }

    // =========================================================================
    // Student: upload proof
    // =========================================================================

    @Transactional
    public InstallmentDto uploadProof(Long installmentId, MultipartFile file, Long studentId) {
        StudentInstallment installment = requireInstallment(installmentId);

        if (!installment.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("This installment does not belong to you.");
        }

        InstallmentStatus status = installment.getStatus();
        if (status != InstallmentStatus.UNPAID && status != InstallmentStatus.REJECTED) {
            throw new BadRequestException(
                    "You can only upload a proof when the installment is UNPAID or REJECTED. "
                            + "Current status: " + status);
        }

        StorageService.assertSize(file, StorageService.MAX_PROOF_BYTES);
        StorageService.assertContentType(file, StorageService.PROOF_TYPES);

        // Delete existing proof if any
        if (installment.getProofStorageKey() != null) {
            storageService.delete(installment.getProofStorageKey());
        }

        String key = storageService.upload(file, "proofs");
        installment.setProofStorageKey(key);
        installment.setStatus(InstallmentStatus.PROOF_SUBMITTED);
        installment.setSubmittedAt(Instant.now());
        installment.setRejectionReason(null);

        return toInstallmentDto(installmentRepository.save(installment));
    }

    // =========================================================================
    // Admin: proof queue
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ProofQueueItemDto> getPendingQueue() {
        return installmentRepository
                .findByStatusOrderBySubmittedAtAsc(InstallmentStatus.PROOF_SUBMITTED)
                .stream()
                .map(this::toQueueItemDto)
                .toList();
    }

    // =========================================================================
    // Admin: pending-proofs (enhanced queue for the admin table view)
    // =========================================================================

    /**
     * Returns all PROOF_SUBMITTED installments with the additional fields needed by the admin
     * pending-proofs table: {@code installmentNumber} (1–3) and {@code proofFileUrl} (the API
     * path the admin can call to stream the file). Sorted by submission time ascending.
     */
    @Transactional(readOnly = true)
    public List<PendingProofItemDto> getPendingProofs() {
        List<StudentInstallment> installments = installmentRepository
                .findByStatusOrderBySubmittedAtAsc(InstallmentStatus.PROOF_SUBMITTED);

        // Bulk-fetch class-group memberships to avoid N+1 queries (one lookup per installment)
        Set<Long> studentIds = installments.stream()
                .map(si -> si.getStudent().getId())
                .collect(Collectors.toSet());
        Map<Long, String> groupNameByStudentId = new HashMap<>();
        if (!studentIds.isEmpty()) {
            userClassGroupRepository.findByUser_IdIn(studentIds)
                    .forEach(ucg -> groupNameByStudentId
                            .putIfAbsent(ucg.getUser().getId(), ucg.getClassGroup().getName()));
        }

        return installments.stream()
                .map(si -> toPendingProofItemDto(si, groupNameByStudentId))
                .toList();
    }

    // =========================================================================
    // Admin: stream proof file
    // =========================================================================

    @Transactional(readOnly = true)
    public StorageService.StorageObject getProofStream(Long installmentId) {
        StudentInstallment installment = requireInstallment(installmentId);

        if (installment.getProofStorageKey() == null) {
            throw new ResourceNotFoundException("No proof file found for installment " + installmentId + ".");
        }

        return storageService.download(installment.getProofStorageKey());
    }

    // =========================================================================
    // Admin: approve
    // =========================================================================

    @Transactional
    public InstallmentDto approveInstallment(Long installmentId, Long adminId) {
        StudentInstallment installment = requireInstallment(installmentId);
        User admin = requireUser(adminId);

        if (installment.getStatus() != InstallmentStatus.PROOF_SUBMITTED) {
            throw new BadRequestException("Can only approve a PROOF_SUBMITTED installment.");
        }

        installment.setStatus(InstallmentStatus.PAID);
        installment.setValidatedBy(admin);
        installment.setValidatedAt(Instant.now());
        installmentRepository.save(installment);

        // Unlock the next installment for this student in the same academic year
        String academicYear = installment.getPeriod().getAcademicYear();
        int nextOrder = installment.getPeriod().getPeriodOrder() + 1;
        if (nextOrder <= 3) {
            Optional<StudentInstallment> nextOpt = installmentRepository
                    .findByStudentIdAndPeriodAcademicYear(
                            installment.getStudent().getId(), academicYear)
                    .stream()
                    .filter(si -> si.getPeriod().getPeriodOrder() == nextOrder)
                    .findFirst();
            nextOpt.ifPresent(next -> {
                if (next.getStatus() == InstallmentStatus.LOCKED) {
                    next.setStatus(InstallmentStatus.UNPAID);
                    installmentRepository.save(next);
                }
            });
        }

        return toInstallmentDto(installment);
    }

    // =========================================================================
    // Admin: reject
    // =========================================================================

    @Transactional
    public InstallmentDto rejectInstallment(Long installmentId, String reason, Long adminId) {
        StudentInstallment installment = requireInstallment(installmentId);
        User admin = requireUser(adminId);

        if (installment.getStatus() != InstallmentStatus.PROOF_SUBMITTED) {
            throw new BadRequestException("Can only reject a PROOF_SUBMITTED installment.");
        }

        installment.setStatus(InstallmentStatus.REJECTED);
        installment.setRejectionReason(reason);
        installment.setValidatedBy(admin);
        installment.setValidatedAt(Instant.now());

        return toInstallmentDto(installmentRepository.save(installment));
    }

    // =========================================================================
    // Admin: overdue report
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OverdueStudentDto> getOverdueInstallments(Long classGroupId) {
        List<StudentInstallment> overdue = installmentRepository.findOverdue();

        // Group by student
        Map<Long, List<StudentInstallment>> byStudent = overdue.stream()
                .collect(Collectors.groupingBy(si -> si.getStudent().getId()));

        List<OverdueStudentDto> result = new ArrayList<>();
        for (Map.Entry<Long, List<StudentInstallment>> entry : byStudent.entrySet()) {
            User student = entry.getValue().get(0).getStudent();

            // Find the student's class group
            List<UserClassGroup> memberships = userClassGroupRepository.findByUser_Id(student.getId());
            UserClassGroup membership = memberships.isEmpty() ? null : memberships.get(0);

            Long studentClassGroupId = membership != null ? membership.getClassGroup().getId() : null;
            String classGroupName = membership != null ? membership.getClassGroup().getName() : null;

            // Filter by classGroupId if specified
            if (classGroupId != null && !classGroupId.equals(studentClassGroupId)) {
                continue;
            }

            List<InstallmentDto> overdueDtos = entry.getValue().stream()
                    .map(this::toInstallmentDto)
                    .toList();

            result.add(new OverdueStudentDto(
                    student.getId(),
                    student.getFullName(),
                    studentClassGroupId,
                    classGroupName,
                    overdueDtos));
        }

        return result;
    }

    // =========================================================================
    // Called from user creation flow
    // =========================================================================

    /**
     * Creates installments for a newly provisioned student for all existing payment periods.
     * For each academic year: period order 1 gets UNPAID, orders 2 and 3 get LOCKED.
     * No-op if the student already has installments for a given year (idempotent).
     */
    @Transactional
    public void generateInstallmentsForNewStudent(Long studentId) {
        User student = requireUser(studentId);

        // Group all periods by academic year
        Map<String, List<PaymentPeriod>> byYear = periodRepository.findAll().stream()
                .collect(Collectors.groupingBy(PaymentPeriod::getAcademicYear));

        for (Map.Entry<String, List<PaymentPeriod>> entry : byYear.entrySet()) {
            String year = entry.getKey();
            List<StudentInstallment> existing =
                    installmentRepository.findByStudentIdAndPeriodAcademicYear(studentId, year);
            if (!existing.isEmpty()) {
                continue; // already provisioned for this year
            }

            List<PaymentPeriod> periods = entry.getValue().stream()
                    .sorted((a, b) -> Integer.compare(a.getPeriodOrder(), b.getPeriodOrder()))
                    .toList();
            createInstallmentsForStudentAndPeriods(student, periods);
        }
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private void createInstallmentsForStudentAndPeriods(User student, List<PaymentPeriod> periods) {
        for (PaymentPeriod period : periods) {
            StudentInstallment installment = new StudentInstallment();
            installment.setStudent(student);
            installment.setPeriod(period);
            installment.setStatus(period.getPeriodOrder() == 1
                    ? InstallmentStatus.UNPAID
                    : InstallmentStatus.LOCKED);
            installmentRepository.save(installment);
        }
    }

    private StudentInstallment requireInstallment(Long id) {
        return installmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Installment " + id + " not found."));
    }

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found."));
    }

    private PaymentPeriodDto toPeriodDto(PaymentPeriod p) {
        return new PaymentPeriodDto(
                p.getId(),
                p.getAcademicYear(),
                p.getLabel(),
                p.getAmount(),
                p.getDueDate(),
                p.getPeriodOrder());
    }

    private InstallmentDto toInstallmentDto(StudentInstallment si) {
        boolean overdue = si.getPeriod().getDueDate().isBefore(LocalDate.now())
                && (si.getStatus() == InstallmentStatus.UNPAID
                        || si.getStatus() == InstallmentStatus.REJECTED);
        return new InstallmentDto(
                si.getId(),
                si.getPeriod().getId(),
                si.getPeriod().getLabel(),
                si.getPeriod().getAmount(),
                si.getPeriod().getDueDate(),
                si.getPeriod().getPeriodOrder(),
                si.getStatus().name(),
                si.getSubmittedAt(),
                si.getRejectionReason(),
                overdue);
    }

    private ProofQueueItemDto toQueueItemDto(StudentInstallment si) {
        User student = si.getStudent();
        List<UserClassGroup> memberships = userClassGroupRepository.findByUser_Id(student.getId());
        String classGroupName = memberships.isEmpty()
                ? null : memberships.get(0).getClassGroup().getName();

        return new ProofQueueItemDto(
                si.getId(),
                student.getId(),
                student.getFullName(),
                classGroupName,
                si.getPeriod().getLabel(),
                si.getPeriod().getAmount(),
                si.getPeriod().getDueDate(),
                si.getSubmittedAt());
    }

    private PendingProofItemDto toPendingProofItemDto(StudentInstallment si,
                                                       Map<Long, String> groupNameByStudentId) {
        User student = si.getStudent();
        String classGroupName = groupNameByStudentId.get(student.getId());

        return new PendingProofItemDto(
                si.getId(),
                student.getFullName(),
                student.getId(),
                classGroupName,
                si.getPeriod().getPeriodOrder(),
                si.getPeriod().getAmount(),
                si.getSubmittedAt(),
                "/api/payments/" + si.getId() + "/proof");
    }
}
