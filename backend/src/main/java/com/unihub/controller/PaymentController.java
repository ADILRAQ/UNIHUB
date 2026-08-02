package com.unihub.controller;

import com.unihub.dto.CreatePeriodRequest;
import com.unihub.dto.InstallmentDto;
import com.unihub.dto.OverdueStudentDto;
import com.unihub.dto.PaymentPeriodDto;
import com.unihub.dto.ProofQueueItemDto;
import com.unihub.dto.RejectRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.PaymentService;
import com.unihub.service.StorageService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/**
 * Payment periods and student installment endpoints (UNIH-40).
 *
 * <ul>
 *   <li>Student: view own installments, upload proof.</li>
 *   <li>Admin: manage periods, view queue, approve/reject, view overdue, download proofs.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // =========================================================================
    // Student endpoints
    // =========================================================================

    /**
     * Returns the authenticated student's installments, sorted by period order.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public List<InstallmentDto> getMyInstallments(
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return paymentService.getMyInstallments(caller.userId());
    }

    /**
     * Student uploads a payment proof for the given installment.
     * Installment must be in UNPAID or REJECTED status.
     */
    @PostMapping("/{id}/proof")
    @PreAuthorize("hasRole('STUDENT')")
    public InstallmentDto uploadProof(@PathVariable Long id,
                                       @RequestParam("file") MultipartFile file,
                                       @AuthenticationPrincipal AuthenticatedUser caller) {
        return paymentService.uploadProof(id, file, caller.userId());
    }

    // =========================================================================
    // Admin endpoints
    // =========================================================================

    /**
     * Returns all payment periods grouped by academic year.
     */
    @GetMapping("/periods")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, List<PaymentPeriodDto>> getYearPlans() {
        return paymentService.getYearPlans();
    }

    /**
     * Creates a payment plan for an academic year (exactly 3 periods).
     * Also generates installments for all existing active students.
     */
    @PostMapping("/periods")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentPeriodDto> createYearPlan(
            @Valid @RequestBody CreatePeriodRequest request,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return paymentService.createYearPlan(request.academicYear(), request.periods());
    }

    /**
     * Returns the proof review queue: all installments with status PROOF_SUBMITTED,
     * sorted by submission time ascending.
     */
    @GetMapping("/queue")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProofQueueItemDto> getPendingQueue() {
        return paymentService.getPendingQueue();
    }

    /**
     * Streams the proof file for the given installment to the admin.
     */
    @GetMapping("/{id}/proof")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StreamingResponseBody> getProof(@PathVariable Long id) {
        StorageService.StorageObject obj = paymentService.getProofStream(id);

        StreamingResponseBody body = outputStream -> {
            try (var stream = obj.stream()) {
                stream.transferTo(outputStream);
            } catch (IOException e) {
                throw new RuntimeException("Error streaming proof: " + e.getMessage(), e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(obj.size()))
                .contentType(parseMediaType(obj.contentType()))
                .body(body);
    }

    /**
     * Approves the installment proof. Sets status to PAID and unlocks the next installment.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public InstallmentDto approve(@PathVariable Long id,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return paymentService.approveInstallment(id, caller.userId());
    }

    /**
     * Rejects the installment proof with a mandatory reason.
     * The student can re-upload after rejection.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public InstallmentDto reject(@PathVariable Long id,
                                  @Valid @RequestBody RejectRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser caller) {
        return paymentService.rejectInstallment(id, request.reason(), caller.userId());
    }

    /**
     * Returns students with overdue installments (dueDate past, not PAID).
     * Optionally filtered by class group.
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OverdueStudentDto> getOverdue(
            @RequestParam(required = false) Long classGroupId) {
        return paymentService.getOverdueInstallments(classGroupId);
    }

    private MediaType parseMediaType(String contentType) {
        try {
            return MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
