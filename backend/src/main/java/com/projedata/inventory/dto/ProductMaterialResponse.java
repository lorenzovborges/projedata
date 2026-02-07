package com.projedata.inventory.dto;

import java.math.BigDecimal;

public record ProductMaterialResponse(
    Long id,
    Long productId,
    String productCode,
    String productName,
    Long rawMaterialId,
    String rawMaterialCode,
    String rawMaterialName,
    BigDecimal requiredQuantity
) {
}
