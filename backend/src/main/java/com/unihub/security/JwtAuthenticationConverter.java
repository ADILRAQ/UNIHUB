package com.unihub.security;

import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Turns a validated {@link Jwt} into a {@link BearerAuthenticationToken}: it maps the
 * {@code role} claim to a single {@code ROLE_<role>} authority (so {@code hasRole(...)}
 * and {@code @PreAuthorize} work) and lifts {@code sub}/{@code email}/
 * {@code mustChangePassword} into an {@link AuthenticatedUser} principal.
 */
@Component
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String role = jwt.getClaimAsString("role");
        Long userId = Long.valueOf(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        Boolean mustChange = jwt.getClaimAsBoolean("mustChangePassword");

        AuthenticatedUser principal = new AuthenticatedUser(
                userId, email, role, Boolean.TRUE.equals(mustChange));

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        return new BearerAuthenticationToken(principal, jwt, authorities);
    }
}
