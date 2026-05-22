package com.restate.app.repository;

import com.restate.app.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import com.restate.app.entity.User;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AddressRepo extends JpaRepository<Address, String> {
    List<Address> findByUser(User user);
}
