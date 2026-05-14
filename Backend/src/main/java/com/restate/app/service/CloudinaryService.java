package com.restate.app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.restate.app.dto.media.MediaResponse;
import com.restate.app.exception.media.MediaException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public MediaResponse uploadFile(MultipartFile file) throws IOException {
        Map<String, String> data = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String url = data.get("secure_url");
        if (url == null) {
            throw MediaException.failed();
        }
        return new MediaResponse(url);
    }
}
