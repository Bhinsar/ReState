package com.restate.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.jspecify.annotations.Nullable;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="users")
@EntityListeners(AuditingEntityListener.class) // Necessary to make @CreatedDate and @LastModifiedDate work
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Generates a unique string-based UUID for security
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, name = "first_name")
    private String firstName;

    @Column(nullable = false, name = "last_name")
    private String lastName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING) // Saves Role as text (e.g., "USER") instead of a number
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(name = "country_code", nullable = false)
    private String countryCode;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "date_of_birth", nullable = false)
    private Date dateOfBirth;

    /**
     * Stores the exact moment of creation in UTC.
     * Maps to PostgreSQL 'TIMESTAMPTZ' for global timezone compatibility.
     */
    @CreatedDate
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdAt = Instant.now();

    /**
     * Automatically updates whenever the record is changed in the database.
     */
    @LastModifiedDate
    @Builder.Default
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE", nullable = false)
    private Instant updatedAt = Instant.now();

    /**
     * Used for Soft Delete tracking. Stores when the user was 'deleted'.
     */
    @Column(name = "deleted_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant deletedAt;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Builder.Default
    @Enumerated(EnumType.STRING) // Ensures enum changes don't break existing DB data
    @Column(name = "register_step", nullable = false)
    private RegisterStep registrationStep = RegisterStep.REGISTERED;

    @Builder.Default
    @Column(name = "is_online", nullable = false)
    private boolean isOnline = false;

    @Column(name = "last_seen",
            columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant lastSeen;

    // --- Spring Security UserDetails Implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Formats the role as "ROLE_USER" or "ROLE_ADMIN" as expected by Spring Security
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // Uses email as the primary login identifier
    }

    /* Standard account status flags */
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        // If the user is soft-deleted, they cannot log in
        return !isDeleted;
    }

    // --- Enums ---

    public enum Role {
        USER,
        ADMIN
    }

    public enum RegisterStep {
        GMAIL,
        REGISTERED,
        EMAIL_VERIFIED
    }
}