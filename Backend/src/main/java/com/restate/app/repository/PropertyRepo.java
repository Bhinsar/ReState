package com.restate.app.repository;

import com.restate.app.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PropertyRepo extends JpaRepository<Property, String>, JpaSpecificationExecutor<Property> {
}
