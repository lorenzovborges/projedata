package com.projedata.inventory.repository;

import com.projedata.inventory.entity.ProductRawMaterial;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductRawMaterialRepository extends JpaRepository<ProductRawMaterial, Long> {

    @EntityGraph(attributePaths = {"product", "rawMaterial"})
    List<ProductRawMaterial> findByProductIdOrderByIdAsc(Long productId);

    @EntityGraph(attributePaths = {"product", "rawMaterial"})
    List<ProductRawMaterial> findByProductIdIn(Collection<Long> productIds);

    boolean existsByProductId(Long productId);

    boolean existsByRawMaterialId(Long rawMaterialId);

    Optional<ProductRawMaterial> findByProductIdAndRawMaterialId(Long productId, Long rawMaterialId);
}
