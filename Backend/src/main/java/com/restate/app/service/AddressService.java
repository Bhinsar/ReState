package com.restate.app.service;

import com.restate.app.dto.address.AddressRequest;
import com.restate.app.dto.address.AddressResponse;
import com.restate.app.entity.Address;
import com.restate.app.entity.User;
import com.restate.app.exception.address.AddressException;
import com.restate.app.exception.auth.AuthException;
import com.restate.app.repository.AddressRepo;
import com.restate.app.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepo addressRepo;
    private final UserRepo userRepo;

    @Transactional
    public AddressResponse createAddress(AddressRequest request, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> AuthException.noUserFound());

        Address address = Address.builder()
                .user(user)
                .address(request.address())
                .plotNumber(request.plotNumber())
                .floor(request.floor())
                .landmark(request.landmark())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .pinCode(request.pinCode())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .build();

        Address savedAddress = addressRepo.save(address);
        return mapToResponse(savedAddress);
    }

    public AddressResponse getAddressById(String id, String email) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> AddressException.noAddressFound());

        if (!address.getUser().getEmail().equals(email)) {
            throw AddressException.unauthorized();
        }

        return mapToResponse(address);
    }

    public List<AddressResponse> getAllAddresses(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> AuthException.noUserFound());

        return addressRepo.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse updateAddress(String id, AddressRequest request, String email) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> AddressException.noAddressFound());

        if (!address.getUser().getEmail().equals(email)) {
            throw AddressException.unauthorized();
        }

        address.setAddress(request.address());
        address.setPlotNumber(request.plotNumber());
        address.setFloor(request.floor());
        address.setLandmark(request.landmark());
        address.setCity(request.city());
        address.setState(request.state());
        address.setCountry(request.country());
        address.setPinCode(request.pinCode());
        address.setLatitude(request.latitude());
        address.setLongitude(request.longitude());

        Address updatedAddress = addressRepo.save(address);
        return mapToResponse(updatedAddress);
    }

    @Transactional
    public void deleteAddress(String id, String email) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> AddressException.noAddressFound());

        if (!address.getUser().getEmail().equals(email)) {
            throw AddressException.unauthorized();
        }

        addressRepo.delete(address);
    }

    private AddressResponse mapToResponse(Address address) {
        return new AddressResponse(
                address.getAddressId(),
                address.getAddress(),
                address.getPlotNumber(),
                address.getFloor(),
                address.getLandmark(),
                address.getCity(),
                address.getState(),
                address.getCountry(),
                address.getPinCode(),
                address.getLatitude(),
                address.getLongitude(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
