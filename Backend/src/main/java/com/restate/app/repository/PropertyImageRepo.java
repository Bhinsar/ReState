package com.restate.app.repository;

import com.restate.app.entity.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyImageRepo extends JpaRepository<PropertyImage, String> {
}
