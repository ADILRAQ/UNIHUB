-- Epic 4 (Calendar & Scheduling), UNIH-28: data model for courses, weekly schedule
-- templates, generated sessions, and one-off events.
--
-- Timezone note: this is a single-department app, so session/template timing uses
-- naive DATE + TIME (no TIMESTAMPTZ) — a class at 09:00 means 09:00 local, full stop.
-- The audit columns (created_at/updated_at) stay TIMESTAMPTZ to match the rest of the
-- schema (users, class_groups).

-- ---------------------------------------------------------------------------
-- courses: the keystone entity reused by Epics 3/5/6.
-- Exactly one teacher (a TEACHER user) and one class group per course.
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    class_group_id BIGINT NOT NULL REFERENCES class_groups(id) ON DELETE RESTRICT,
    meet_link VARCHAR(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_class_group_id ON courses(class_group_id);

-- ---------------------------------------------------------------------------
-- schedule_templates: weekly recurrence rules that UNIH-29 expands into sessions.
-- day_of_week is stored ISO-style (Mon=1 .. Sun=7) to line up with
-- java.time.DayOfWeek.getValue().
-- ---------------------------------------------------------------------------
CREATE TABLE schedule_templates (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_schedule_templates_time_order CHECK (end_time > start_time),
    CONSTRAINT chk_schedule_templates_date_order CHECK (end_date >= start_date)
);

CREATE INDEX idx_schedule_templates_course_id ON schedule_templates(course_id);
CREATE INDEX idx_schedule_templates_active ON schedule_templates(active);

-- ---------------------------------------------------------------------------
-- sessions: individual dated occurrences. Generated from a template (template_id set)
-- or added manually as a one-off (template_id NULL). meet_link overrides the course
-- link when set. original_date records where a RESCHEDULED session moved from.
-- ---------------------------------------------------------------------------
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES schedule_templates(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(255),
    meet_link VARCHAR(1024),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'CANCELLED', 'RESCHEDULED')),
    original_date DATE,
    change_note TEXT,
    manually_modified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sessions_time_order CHECK (end_time > start_time)
);

-- Idempotent regeneration guard (UNIH-29): a template produces at most one session per
-- date. template_id is nullable, and Postgres treats NULLs as distinct, so manually
-- added one-off sessions (template_id NULL) are intentionally NOT constrained here.
CREATE UNIQUE INDEX uq_sessions_template_date ON sessions(template_id, session_date);

-- Date-range query support (calendar week/month views, "my schedule").
CREATE INDEX idx_sessions_session_date ON sessions(session_date);
CREATE INDEX idx_sessions_course_id_session_date ON sessions(course_id, session_date);

-- ---------------------------------------------------------------------------
-- events: one-off calendar entries (exams, deadlines, generic events).
-- class_group_id NULL means department-wide; course_id is an optional association.
-- ---------------------------------------------------------------------------
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EXAM', 'DEADLINE', 'EVENT')),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    class_group_id BIGINT REFERENCES class_groups(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_class_group_id ON events(class_group_id);
CREATE INDEX idx_events_course_id ON events(course_id);
