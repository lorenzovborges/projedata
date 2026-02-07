package com.projedata.inventory.service;

import com.projedata.inventory.dto.ProductRequest;
import com.projedata.inventory.dto.ProductResponse;
import com.projedata.inventory.entity.Product;
import com.projedata.inventory.exception.ConflictException;
import com.projedata.inventory.exception.ResourceNotFoundException;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import com.projedata.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;

    public List<ProductResponse> findAll() {
        return productRepository.findAllByOrderByValueDescCodeAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    public ProductResponse findById(Long id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        validateCodeUniqueness(request.code(), null);

        Product product = Product.builder()
            .code(request.code().trim())
            .name(request.name().trim())
            .value(request.value())
            .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getEntityById(id);
        validateCodeUniqueness(request.code(), id);

        product.setCode(request.code().trim());
        product.setName(request.name().trim());
        product.setValue(request.value());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product with id %d was not found".formatted(id));
        }

        if (productRawMaterialRepository.existsByProductId(id)) {
            throw new ConflictException("Cannot delete product because it has associated raw materials");
        }

        productRepository.deleteById(id);
    }

    public Product getEntityById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product with id %d was not found".formatted(id)));
    }

    private void validateCodeUniqueness(String code, Long id) {
        String normalizedCode = code.trim();
        boolean exists = id == null
            ? productRepository.existsByCode(normalizedCode)
            : productRepository.existsByCodeAndIdNot(normalizedCode, id);

        if (exists) {
            throw new ConflictException("Product code '%s' is already in use".formatted(normalizedCode));
        }
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getCode(),
            product.getName(),
            product.getValue()
        );
    }
}
