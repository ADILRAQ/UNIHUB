-- Add resource type to distinguish FILE uploads from LINK resources.
-- For LINK resources: storage_key and content_type are unused, url holds the external URL.
-- storage_key stays UNIQUE on non-null values (PostgreSQL UNIQUE ignores NULLs).

ALTER TABLE resources
    ADD COLUMN type         VARCHAR(10)   NOT NULL DEFAULT 'FILE',
    ADD COLUMN url          VARCHAR(2048),
    ALTER COLUMN storage_key DROP NOT NULL,
    ALTER COLUMN content_type DROP NOT NULL;

-- Validate: a FILE must have a storage_key; a LINK must have a url.
ALTER TABLE resources
    ADD CONSTRAINT chk_resource_type_fields CHECK (
        (type = 'FILE'  AND storage_key IS NOT NULL) OR
        (type = 'LINK'  AND url IS NOT NULL)
    );
