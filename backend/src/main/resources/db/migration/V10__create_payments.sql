CREATE TYPE installment_status AS ENUM ('LOCKED','UNPAID','PROOF_SUBMITTED','PAID','REJECTED');

-- One row per (year, slot 1-3). Admin creates 3 periods per academic year.
CREATE TABLE payment_periods (
    id            BIGSERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    label         VARCHAR(255) NOT NULL,
    amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    due_date      DATE NOT NULL,
    period_order  SMALLINT NOT NULL CHECK (period_order BETWEEN 1 AND 3),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(academic_year, period_order)
);

-- One row per (student, period). Sequential: only current slot is UNPAID.
CREATE TABLE student_installments (
    id                BIGSERIAL PRIMARY KEY,
    student_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_id         BIGINT NOT NULL REFERENCES payment_periods(id) ON DELETE RESTRICT,
    status            installment_status NOT NULL DEFAULT 'LOCKED',
    proof_storage_key VARCHAR(512),
    rejection_reason  TEXT,
    validated_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    validated_at      TIMESTAMPTZ,
    submitted_at      TIMESTAMPTZ,
    UNIQUE(student_id, period_id)
);
CREATE INDEX idx_student_installments_student_id ON student_installments(student_id);
CREATE INDEX idx_student_installments_period_id  ON student_installments(period_id);
CREATE INDEX idx_student_installments_status     ON student_installments(status);
