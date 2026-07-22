package com.unihub.security;

import java.util.Collection;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Authentication produced by {@link JwtAuthenticationConverter} once a Bearer token has
 * been validated by the resource-server filter. Its principal is an
 * {@link AuthenticatedUser} (not the raw {@link Jwt}) so controllers and SpEL expressions
 * get clean, typed access to the caller's id/role/flags; the raw {@link Jwt} is retained
 * as the credentials for any downstream that needs the original claims.
 */
public class BearerAuthenticationToken extends AbstractAuthenticationToken {

    private final AuthenticatedUser principal;
    private final transient Jwt token;

    public BearerAuthenticationToken(AuthenticatedUser principal, Jwt token,
                                     Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.token = token;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }

    @Override
    public String getName() {
        return principal.email();
    }
}
