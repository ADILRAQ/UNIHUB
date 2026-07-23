package com.unihub.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.DayOfWeek;

/**
 * Maps {@link java.time.DayOfWeek} to the {@code day_of_week SMALLINT} column using the
 * ISO numbering (Mon=1 .. Sun=7), i.e. {@link DayOfWeek#getValue()}.
 *
 * <p>We deliberately reuse {@code java.time.DayOfWeek} rather than defining a new enum,
 * but must NOT rely on JPA's default enum mappings: {@code @Enumerated(ORDINAL)} would
 * store Monday as 0 (breaking the {@code CHECK (day_of_week BETWEEN 1 AND 7)} constraint
 * and the ISO contract), and {@code @Enumerated(STRING)} would need a VARCHAR column.
 * This converter keeps the column a compact SMALLINT holding the ISO value, which is what
 * the migration creates and what {@code ddl-auto: validate} expects.
 */
@Converter(autoApply = false)
public class DayOfWeekConverter implements AttributeConverter<DayOfWeek, Short> {

    @Override
    public Short convertToDatabaseColumn(DayOfWeek attribute) {
        return attribute == null ? null : (short) attribute.getValue();
    }

    @Override
    public DayOfWeek convertToEntityAttribute(Short dbData) {
        return dbData == null ? null : DayOfWeek.of(dbData.intValue());
    }
}
