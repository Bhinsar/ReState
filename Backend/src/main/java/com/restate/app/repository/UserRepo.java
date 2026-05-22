package com.restate.app.repository;

import com.restate.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepo extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
