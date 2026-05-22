package com.restate.app.repository;

import com.restate.app.dto.property.PropertyMetrics;
import com.restate.app.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyRepo extends JpaRepository<Property, String>, JpaSpecificationExecutor<Property> {
    @Query("""
    SELECT new com.restate.app.dto.property.PropertyMetrics(
        COUNT(p),
        SUM(CASE WHEN p.status = PropertyStatus.AVAILABLE THEN 1 ELSE 0 END),
        SUM(CASE WHEN p.status = PropertyStatus.SOLD  THEN 1 ELSE 0 END),
        SUM(CASE WHEN p.status = PropertyStatus.RENTED THEN 1 ELSE 0 END),
        SUM(CASE WHEN p.status = PropertyStatus.DRAFT THEN 1 ELSE 0 END)
    )
    FROM Property p
    WHERE p.owner.id = :userId
""")
    PropertyMetrics findMetricsByUserId(@Param("userId") String userId);
}
