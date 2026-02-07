package com.projedata.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductMaterialRequest(
    @NotNull(message = "Product id is required")
    Long productId,

    @NotNull(message = "Raw material id is required")
    Long rawMaterialId,

    @NotNull(message = "Required quantity is required")
    @DecimalMin(value = "0.001", message = "Required quantity must be greater than zero")
    BigDecimal requiredQuantity
) {
}
