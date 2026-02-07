package com.projedata.inventory.service;

import com.projedata.inventory.dto.ProductMaterialRequest;
import com.projedata.inventory.dto.ProductMaterialResponse;
import com.projedata.inventory.entity.Product;
import com.projedata.inventory.entity.ProductRawMaterial;
import com.projedata.inventory.entity.RawMaterial;
import com.projedata.inventory.exception.ConflictException;
import com.projedata.inventory.exception.ResourceNotFoundException;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductMaterialService {

    private final ProductRawMaterialRepository productRawMaterialRepository;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;

    public List<ProductMaterialResponse> findByProductId(Long productId) {
        return productRawMaterialRepository.findByProductIdOrderByIdAsc(productId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public ProductMaterialResponse create(ProductMaterialRequest request) {
        Product product = productService.getEntityById(request.productId());
        RawMaterial rawMaterial = rawMaterialService.getEntityById(request.rawMaterialId());

        validateDuplicateAssociation(request.productId(), request.rawMaterialId(), null);

        ProductRawMaterial productRawMaterial = ProductRawMaterial.builder()
            .product(product)
            .rawMaterial(rawMaterial)
            .requiredQuantity(request.requiredQuantity())
            .build();

        return toResponse(productRawMaterialRepository.save(productRawMaterial));
    }

    @Transactional
    public ProductMaterialResponse update(Long id, ProductMaterialRequest request) {
        ProductRawMaterial existing = getEntityById(id);
        Product product = productService.getEntityById(request.productId());
        RawMaterial rawMaterial = rawMaterialService.getEntityById(request.rawMaterialId());

        validateDuplicateAssociation(request.productId(), request.rawMaterialId(), id);

        existing.setProduct(product);
        existing.setRawMaterial(rawMaterial);
        existing.setRequiredQuantity(request.requiredQuantity());

        return toResponse(productRawMaterialRepository.save(existing));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product material with id %d was not found".formatted(id));
        }
        productRawMaterialRepository.deleteById(id);
    }

    public ProductRawMaterial getEntityById(Long id) {
        return productRawMaterialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product material with id %d was not found".formatted(id)));
    }

    private void validateDuplicateAssociation(Long productId, Long rawMaterialId, Long currentId) {
        productRawMaterialRepository.findByProductIdAndRawMaterialId(productId, rawMaterialId)
            .ifPresent(found -> {
                if (currentId == null || !found.getId().equals(currentId)) {
                    throw new ConflictException("Esta matéria-prima já está associada ao produto selecionado");
                }
            });
    }

    private ProductMaterialResponse toResponse(ProductRawMaterial productRawMaterial) {
        return new ProductMaterialResponse(
            productRawMaterial.getId(),
            productRawMaterial.getProduct().getId(),
            productRawMaterial.getProduct().getCode(),
            productRawMaterial.getProduct().getName(),
            productRawMaterial.getRawMaterial().getId(),
            productRawMaterial.getRawMaterial().getCode(),
            productRawMaterial.getRawMaterial().getName(),
            productRawMaterial.getRequiredQuantity()
        );
    }
}
