package com.projedata.inventory.service;

import com.projedata.inventory.dto.RawMaterialRequest;
import com.projedata.inventory.dto.RawMaterialResponse;
import com.projedata.inventory.entity.RawMaterial;
import com.projedata.inventory.exception.ConflictException;
import com.projedata.inventory.exception.ResourceNotFoundException;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import com.projedata.inventory.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;

    public List<RawMaterialResponse> findAll() {
        return rawMaterialRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public RawMaterialResponse findById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public RawMaterialResponse create(RawMaterialRequest request) {
        validateCodeUniqueness(request.code(), null);

        RawMaterial rawMaterial = RawMaterial.builder()
            .code(request.code().trim())
            .name(request.name().trim())
            .stockQuantity(request.stockQuantity())
            .build();

        return toResponse(rawMaterialRepository.save(rawMaterial));
    }

    @Transactional
    public RawMaterialResponse update(Long id, RawMaterialRequest request) {
        RawMaterial rawMaterial = getEntityById(id);
        validateCodeUniqueness(request.code(), id);

        rawMaterial.setCode(request.code().trim());
        rawMaterial.setName(request.name().trim());
        rawMaterial.setStockQuantity(request.stockQuantity());

        return toResponse(rawMaterialRepository.save(rawMaterial));
    }

    @Transactional
    public void delete(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Raw material with id %d was not found".formatted(id));
        }

        if (productRawMaterialRepository.existsByRawMaterialId(id)) {
            throw new ConflictException("Cannot delete raw material because it is associated with at least one product");
        }

        rawMaterialRepository.deleteById(id);
    }

    public RawMaterial getEntityById(Long id) {
        return rawMaterialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Raw material with id %d was not found".formatted(id)));
    }

    private void validateCodeUniqueness(String code, Long id) {
        String normalizedCode = code.trim();
        boolean exists = id == null
            ? rawMaterialRepository.existsByCode(normalizedCode)
            : rawMaterialRepository.existsByCodeAndIdNot(normalizedCode, id);

        if (exists) {
            throw new ConflictException("Raw material code '%s' is already in use".formatted(normalizedCode));
        }
    }

    private RawMaterialResponse toResponse(RawMaterial rawMaterial) {
        return new RawMaterialResponse(
            rawMaterial.getId(),
            rawMaterial.getCode(),
            rawMaterial.getName(),
            rawMaterial.getStockQuantity()
        );
    }
}
