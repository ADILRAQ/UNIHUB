-- Rename the PostgreSQL enum type to match Hibernate's derived name (Java class
-- InstallmentStatus → lowercase → "installmentstatus"), fixing a cast mismatch
-- where Hibernate generated '...'::InstallmentStatus but the type was installment_status.
ALTER TYPE installment_status RENAME TO installmentstatus;
