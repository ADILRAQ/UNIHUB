-- course_modules: organises resources into weekly/topic folders
CREATE TABLE course_modules (
    id            BIGSERIAL PRIMARY KEY,
    course_id     BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);

-- resources: files/links stored in MinIO
CREATE TABLE resources (
    id            BIGSERIAL PRIMARY KEY,
    module_id     BIGINT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    content_type  VARCHAR(255) NOT NULL,
    storage_key   VARCHAR(512) NOT NULL UNIQUE,
    size_bytes    BIGINT NOT NULL,
    uploaded_by   BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resources_module_id ON resources(module_id);

-- assignments: homework with a due date
CREATE TABLE assignments (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_at      TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assignments_course_id   ON assignments(course_id);
CREATE INDEX idx_assignments_due_at      ON assignments(due_at);

-- submissions: one per student per assignment; resubmission updates the row
CREATE TABLE submissions (
    id            BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_key   VARCHAR(512) NOT NULL,
    content_type  VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    late          BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(assignment_id, student_id)
);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id    ON submissions(student_id);
