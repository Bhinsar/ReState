package com.restate.app.service;

import com.google.firebase.messaging.*;
import com.restate.app.dto.userDevice.UserDeviceRequest;
import com.restate.app.entity.Notification;
import com.restate.app.entity.User;
import com.restate.app.entity.UserDevice;
import com.restate.app.repository.UserDeviceRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDeviceService {
    private final UserDeviceRepo deviceRepo;

    public Boolean registerUserDevice(UserDeviceRequest userDevice, User user){
        deviceRepo.findByFcmToken(userDevice.fcmToken())
                .ifPresentOrElse(
                        existing->{
                            if(!existing.getUser().getId().equals(user.getId())){
                                existing.setUser(user);
                            }
                            existing.setActive(true);
                            existing.setLastUsedAt(Instant.now());
                            deviceRepo.save(existing);
                        },
                        ()->{
                            UserDevice device = UserDevice.builder()
                                    .user(user)
                                    .fcmToken(userDevice.fcmToken())
                                    .platform(userDevice.platform())
                                    .deviceName(userDevice.deviceName())
                                    .build();
                            deviceRepo.save(device);
                        }
                );

        log.info("Device {} registered successfully", user.getId());
        return true;
    }

    public Boolean removeUserDevice(UserDeviceRequest userDevice){
        deviceRepo.findByFcmToken(userDevice.fcmToken())
                .ifPresent(device -> {
                    device.setActive(false);
                    device.setLastUsedAt(Instant.now());
                    deviceRepo.save(device);
                });
        return true;
    }

    public void sendToUser(Notification notification) throws FirebaseMessagingException {
        List<UserDevice> devices = deviceRepo.findByUserAndIsActiveTrue(notification.getRecipient()).orElse(null);

        // FIX: Check if the list is either null OR empty
        if (devices == null || devices.isEmpty()) {
            log.info("No active devices found for user: {}",
                    notification.getRecipient().getEmail());
            return;
        }

        List<Message> messages = devices.stream()
                .map(device -> buildMessage(device, notification))
                .toList();

        // Extra safety measure in case map filtering is added later
        if (messages.isEmpty()) {
            log.warn("Message list evaluated to empty for user: {}",
                    notification.getRecipient().getEmail());
            return;
        }

        BatchResponse response = FirebaseMessaging
                .getInstance()
                .sendEach(messages);
    }
    private Message buildMessage(UserDevice device,
                                 Notification notification) {

        // Data payload — for deep linking on tap
        Map<String, String> data = buildData(notification);

        Message.Builder builder = Message.builder()
                .setToken(device.getFcmToken())
                .setNotification(
                        com.google.firebase.messaging.Notification.builder()
                                .setTitle(notification.getTitle())
                                .setBody(notification.getBody())
                                .build())
                .putAllData(data);

        switch (device.getPlatform()) {
            case ANDROID -> builder.setAndroidConfig(
                    AndroidConfig.builder()
                            .setPriority(AndroidConfig.Priority.HIGH)
                            .setNotification(
                                    AndroidNotification.builder()
                                            .setChannelId("restate_notifications")
                                            .setSound("default")
                                            .build())
                            .build());

            case IOS -> builder.setApnsConfig(
                    ApnsConfig.builder()
                            .setAps(Aps.builder()
                                    .setSound("default")
                                    .setBadge(1)
                                    .setContentAvailable(true)
                                    .build())
                            .build());

            case WEB -> builder.setWebpushConfig(
                    WebpushConfig.builder()
                            .setNotification(
                                    WebpushNotification.builder()
                                            .setTitle(notification.getTitle())
                                            .setBody(notification.getBody())
                                            .setIcon("/logo.png")
                                            .build())
                            .build());
        }

        return builder.build();
    }
    private Map<String, String> buildData(Notification notification) {
        Map<String, String> data = new HashMap<>();

        data.put("notificationId", notification.getNotificationId());
        data.put("type",           notification.getType().name());

        // Add property id if present — client uses this to navigate
        if (notification.getProperty() != null) {
            data.put("propertyId",
                    notification.getProperty().getPropertyId());
        }

        return data;
    }
}
