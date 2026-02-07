package com.projedata.inventory.service;

import com.projedata.inventory.dto.ProductionSuggestionItem;
import com.projedata.inventory.dto.ProductionSuggestionResponse;
import com.projedata.inventory.entity.Product;
import com.projedata.inventory.entity.ProductRawMaterial;
import com.projedata.inventory.entity.RawMaterial;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import com.projedata.inventory.repository.ProductRepository;
import com.projedata.inventory.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionPlanService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;

    public ProductionSuggestionResponse calculateSuggestions() {
        List<Product> products = productRepository.findAllByOrderByValueDescCodeAsc();
        Map<Long, BigDecimal> virtualStock = loadVirtualStock();

        List<Long> productIds = products.stream().map(Product::getId).toList();
        Map<Long, List<ProductRawMaterial>> compositionByProduct = productRawMaterialRepository
            .findByProductIdIn(productIds)
            .stream()
            .collect(Collectors.groupingBy(prm -> prm.getProduct().getId()));

        List<ProductionSuggestionItem> items = new ArrayList<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Product product : products) {
            List<ProductRawMaterial> composition = compositionByProduct.get(product.getId());
            if (composition == null || composition.isEmpty()) {
                continue;
            }

            long suggestedQuantity = maxProducibleQuantity(composition, virtualStock);
            if (suggestedQuantity <= 0) {
                continue;
            }

            BigDecimal subtotal = product.getValue().multiply(BigDecimal.valueOf(suggestedQuantity));
            items.add(new ProductionSuggestionItem(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getValue(),
                suggestedQuantity,
                subtotal
            ));
            totalValue = totalValue.add(subtotal);

            consumeVirtualStock(composition, suggestedQuantity, virtualStock);
        }

        return new ProductionSuggestionResponse(items, totalValue);
    }

    private Map<Long, BigDecimal> loadVirtualStock() {
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();
        return rawMaterials.stream()
            .collect(Collectors.toMap(RawMaterial::getId, RawMaterial::getStockQuantity, (a, b) -> a, HashMap::new));
    }

    private long maxProducibleQuantity(List<ProductRawMaterial> composition, Map<Long, BigDecimal> virtualStock) {
        long maxQuantity = Long.MAX_VALUE;

        for (ProductRawMaterial item : composition) {
            Long rawMaterialId = item.getRawMaterial().getId();
            BigDecimal available = virtualStock.getOrDefault(rawMaterialId, BigDecimal.ZERO);
            BigDecimal required = item.getRequiredQuantity();

            long units = available.divide(required, 0, RoundingMode.DOWN).longValue();
            maxQuantity = Math.min(maxQuantity, units);
        }

        return maxQuantity == Long.MAX_VALUE ? 0 : maxQuantity;
    }

    private void consumeVirtualStock(
        List<ProductRawMaterial> composition,
        long suggestedQuantity,
        Map<Long, BigDecimal> virtualStock
    ) {
        for (ProductRawMaterial item : composition) {
            Long rawMaterialId = item.getRawMaterial().getId();
            BigDecimal current = virtualStock.getOrDefault(rawMaterialId, BigDecimal.ZERO);
            BigDecimal consumed = item.getRequiredQuantity().multiply(BigDecimal.valueOf(suggestedQuantity));
            virtualStock.put(rawMaterialId, current.subtract(consumed));
        }
    }
}
