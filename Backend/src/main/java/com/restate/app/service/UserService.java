package com.restate.app.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

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
        return UserResponse.from(savedUser);
    }

    
    public void deleteMe(User user) {
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw UserException.alreadyDeleted();
        }

        user.setIsDeleted(true);
        user.setDeletedAt(Instant.now());
        userRepo.save(user);
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
    }
}
