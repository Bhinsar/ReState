package com.restate.app.controller;

import com.restate.app.dto.media.MediaResponse;
import com.restate.app.service.CloudinaryService;
import com.restate.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        MediaResponse data = cloudinaryService.uploadFile(file);
        return ApiResponse.ok(data);
    }
}
