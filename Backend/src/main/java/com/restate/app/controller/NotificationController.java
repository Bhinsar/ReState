package com.restate.app.controller;

import com.restate.app.dto.notification.NotificationResponse;
import com.restate.app.entity.User;
import com.restate.app.service.NotificationService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>>
    getNotifications(
            Pageable pageable,
            @AuthenticationPrincipal User user) {

        Page<NotificationResponse> page = notificationService
                .getNotifications(user, pageable);

        return ApiResponse.pagedOk(
                "Notifications fetched", page, page.getContent());
    }

    // Get unread count — for bell badge
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal User user) {

        return ApiResponse.ok(
                "Unread count",
                notificationService.getUnreadCount(user));
    }

    // Mark single as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        notificationService.markAsRead(id, user.getEmail());
        return ApiResponse.ok("Marked as read", null);
    }

    // Mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal User user) {

        notificationService.markAllAsRead(user);
        return ApiResponse.ok("All marked as read");
    }
}
