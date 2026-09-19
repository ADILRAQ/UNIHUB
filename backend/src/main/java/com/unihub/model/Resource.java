package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * A course resource — either a MinIO-backed file upload ({@link ResourceType#FILE}) or an
 * external URL bookmark ({@link ResourceType#LINK}).
 * <p>
 * For FILE resources: {@code storageKey} holds the MinIO object key; {@code url} is null.
 * For LINK resources: {@code url} holds the external URL; {@code storageKey} is null.
 */
@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ResourceType type = ResourceType.FILE;

    /** MIME type for FILE resources; null for LINK resources. */
    @Column(name = "content_type")
    private String contentType;

    /** MinIO object key for FILE resources; null for LINK resources. */
    @Column(name = "storage_key", unique = true, length = 512)
    private String storageKey;

    /** External URL for LINK resources; null for FILE resources. */
    @Column(length = 2048)
    private String url;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
