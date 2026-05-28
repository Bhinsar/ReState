package com.restate.app.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.restate.app.dto.user.ChangePasswordRequest;
import com.restate.app.dto.user.UpdateUserRequest;
import com.restate.app.dto.user.UserResponse;
import com.restate.app.entity.User;
import com.restate.app.exception.user.UserException;
import com.restate.app.repository.UserRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisObjectTemplate;

    /**
     * Evicts the user from the Redis cache so that the next request re-fetches
     * fresh data from the DB. Must be called after any operation that mutates the
     * User entity.
     */
    private void evictUserCache(User user) {
        redisObjectTemplate.delete("user_cache:" + user.getEmail());
    }

    public UserResponse getMe(User user) {
        return UserResponse.from(user);
    }

    public UserResponse updateMe(User user, UpdateUserRequest request) {
        if (request.dateOfBirth() != null) {
            LocalDate dob = request.dateOfBirth()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            long age = ChronoUnit.YEARS.between(dob, LocalDate.now());
            if (age < 18) {
                throw UserException.underage();
            }
        }

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCountryCode(request.countryCode());
        user.setPhoneNumber(request.phoneNumber());
        user.setDateOfBirth(request.dateOfBirth());

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        User savedUser = userRepo.save(user);
        evictUserCache(savedUser); // Invalidate stale cache so next request gets fresh DB data
        return UserResponse.from(savedUser);
    }

    
    public void deleteMe(User user) {
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw UserException.alreadyDeleted();
        }

        user.setIsDeleted(true);
        user.setDeletedAt(Instant.now());
        userRepo.save(user);
        evictUserCache(user);
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (user.getPassword() == null) {
            throw UserException.wrongPassword();
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw UserException.samePassword();
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw UserException.wrongPassword();
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepo.save(user);
        evictUserCache(user); // Invalidate cache on password change
    }
}
