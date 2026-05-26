package com.restate.app.repository;

import com.restate.app.entity.User;
import com.restate.app.entity.UserDevice;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserDeviceRepo extends JpaRepository<UserDevice, String> {
    Optional<UserDevice> findByFcmToken(String fcmToken);
    Optional<List<UserDevice>> findByUserAndIsActiveTrue(User recipient);;
}
