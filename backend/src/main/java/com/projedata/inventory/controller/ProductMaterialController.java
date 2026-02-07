package com.projedata.inventory.controller;

import com.projedata.inventory.dto.ProductMaterialRequest;
import com.projedata.inventory.dto.ProductMaterialResponse;
import com.projedata.inventory.service.ProductMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product-materials")
@RequiredArgsConstructor
public class ProductMaterialController {

    private final ProductMaterialService productMaterialService;

    @GetMapping
    public List<ProductMaterialResponse> findByProductId(@RequestParam Long productId) {
        return productMaterialService.findByProductId(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductMaterialResponse create(@Valid @RequestBody ProductMaterialRequest request) {
        return productMaterialService.create(request);
    }

    @PutMapping("/{id}")
    public ProductMaterialResponse update(@PathVariable Long id, @Valid @RequestBody ProductMaterialRequest request) {
        return productMaterialService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productMaterialService.delete(id);
    }
}
