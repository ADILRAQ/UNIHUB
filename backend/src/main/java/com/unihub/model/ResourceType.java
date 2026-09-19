package com.unihub.model;

/** Distinguishes MinIO-backed file uploads from external URL bookmarks. */
public enum ResourceType {
    FILE,
    LINK
}
