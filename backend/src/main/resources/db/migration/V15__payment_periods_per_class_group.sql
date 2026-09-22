-- UNIH-47: payment plans belong to one class group.
-- Existing global plans are dev data only and are wiped (agreed decision).
DELETE FROM student_installments;
DELETE FROM payment_periods;

ALTER TABLE payment_periods
    ADD COLUMN class_group_id BIGINT NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE;

-- V10 declared UNIQUE(academic_year, period_order) inline; Postgres default name below.
ALTER TABLE payment_periods
    DROP CONSTRAINT IF EXISTS payment_periods_academic_year_period_order_key;

ALTER TABLE payment_periods
    ADD CONSTRAINT payment_periods_year_group_order_key
        UNIQUE (academic_year, class_group_id, period_order);

CREATE INDEX idx_payment_periods_class_group_id ON payment_periods(class_group_id);
