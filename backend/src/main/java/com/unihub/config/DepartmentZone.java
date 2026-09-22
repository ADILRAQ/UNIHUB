package com.unihub.config;

import java.time.ZoneId;

/** The department's wall-clock timezone, used for all "today"/"now" business checks. */
public final class DepartmentZone {

    // ponytail: department timezone hardcoded (server containers run in UTC); make it config if
    // the app ever serves another region.
    public static final ZoneId ZONE = ZoneId.of("Africa/Casablanca");

    private DepartmentZone() {
    }
}
