package com.restate.app.dto.userDevice;

import com.restate.app.entity.UserDevice;
import jakarta.validation.constraints.NotNull;

public record UserDeviceRequest(
        @NotNull(message = "FCM Token is required")
        String fcmToken,

        @NotNull
        UserDevice.PlatformType platform,

        String deviceName
) {
}
