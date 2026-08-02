package com.unihub.service;

import com.unihub.exception.FileTooLargeException;
import com.unihub.exception.UnsupportedFileTypeException;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Thin adapter over the MinIO S3-compatible API.
 *
 * <p>All file I/O goes through this service — controllers and other services
 * never call MinIO directly. Object keys (not filesystem paths) are what gets
 * persisted in the database.
 */
@Service
public class StorageService {

    /** Allowed content types for payment proof uploads. */
    public static final Set<String> PROOF_TYPES =
            Set.of("image/jpeg", "image/png", "application/pdf");

    /** Maximum size for a course resource or submission file (50 MB). */
    public static final long MAX_RESOURCE_BYTES = 50L * 1024 * 1024;

    /** Maximum size for a payment proof file (10 MB). */
    public static final long MAX_PROOF_BYTES = 10L * 1024 * 1024;

    private final MinioClient minioClient;
    private final String bucket;

    public StorageService(MinioClient minioClient,
                          @Value("${app.minio.bucket}") String bucket) {
        this.minioClient = minioClient;
        this.bucket = bucket;
    }

    /**
     * Ensures the configured bucket exists on startup; creates it if absent.
     * Throws a {@link RuntimeException} on connectivity failure so the Spring
     * context fails fast rather than serving broken upload endpoints.
     */
    @PostConstruct
    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            }
        } catch (Exception e) {
            throw new RuntimeException(
                    "Cannot connect to MinIO / ensure bucket: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a file to MinIO and returns the generated object key.
     *
     * @param file   the multipart file to upload
     * @param prefix logical namespace, e.g. {@code "resources"}, {@code "submissions"},
     *               {@code "proofs"}
     * @return the MinIO object key of the stored file
     */
    public String upload(MultipartFile file, String prefix) {
        try {
            String key = prefix + "/" + UUID.randomUUID() + getExtension(file.getOriginalFilename());
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            return key;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    /**
     * Downloads a file from MinIO.
     *
     * @param key the MinIO object key
     * @return a {@link StorageObject} whose stream the caller is responsible for closing
     */
    public StorageObject download(String key) {
        try {
            GetObjectResponse response = minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(key).build());
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(key).build());
            return new StorageObject(response, stat.contentType(), stat.size());
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes an object. No-op if {@code key} is {@code null} or blank.
     */
    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder().bucket(bucket).object(key).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    /**
     * Validates that a file does not exceed the given size limit.
     *
     * @throws FileTooLargeException if the file size exceeds {@code maxBytes}
     */
    public static void assertSize(MultipartFile file, long maxBytes) {
        if (file.getSize() > maxBytes) {
            throw new FileTooLargeException(
                    "File exceeds the maximum allowed size of " + (maxBytes / (1024 * 1024)) + " MB.");
        }
    }

    /**
     * Validates that a file's content type is in the allowed set.
     *
     * @throws UnsupportedFileTypeException if the content type is not in {@code allowed}
     */
    public static void assertContentType(MultipartFile file, Set<String> allowed) {
        String ct = file.getContentType();
        if (ct == null || !allowed.contains(ct)) {
            throw new UnsupportedFileTypeException(
                    "File type '" + ct + "' is not allowed. Accepted: " + allowed);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Value object returned by {@link #download}. The caller must close the stream.
     */
    public record StorageObject(InputStream stream, String contentType, long size) {}
}
