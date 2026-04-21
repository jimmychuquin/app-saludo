package com.appsaludo.backendsaludo.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
          .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
          .requestMatchers("/api/**").hasAnyAuthority(
            "ROLE_SALUDO_USER",
            "ROLE_ADMIN",
            "ROLE_ROL.SALUDO.USER",
            "ROLE_ROL.SALUDO.ADMIN")
            .anyRequest().denyAll())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
            .jwtAuthenticationConverter(jwtAuthenticationConverter())));

    return http.build();
  }

  @Bean
  Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter scopesConverter = new JwtGrantedAuthoritiesConverter();
    JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();

    jwtConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
      Collection<GrantedAuthority> authorities = new ArrayList<>(scopesConverter.convert(jwt));

      Map<String, Object> realmAccess = jwt.getClaim("realm_access");
      if (realmAccess != null && realmAccess.get("roles") instanceof Collection<?> roles) {
        for (Object role : roles) {
          if (role instanceof String roleName) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()));
          }
        }
      }

      Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
      if (resourceAccess != null) {
        for (Object clientData : resourceAccess.values()) {
          if (clientData instanceof Map<?, ?> clientMap) {
            Object clientRoles = clientMap.get("roles");
            if (clientRoles instanceof Collection<?> roles) {
              for (Object role : roles) {
                if (role instanceof String roleName) {
                  authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()));
                }
              }
            }
          }
        }
      }

      return authorities;
    });

    return jwtConverter;
  }
}
