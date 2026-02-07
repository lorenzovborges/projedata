package com.projedata.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RawMaterialRequest(
    @NotBlank(message = "Code is required")
    String code,

    @NotBlank(message = "Name is required")
    String name,

    @NotNull(message = "Stock quantity is required")
    @DecimalMin(value = "0.000", message = "Stock quantity must be equal or greater than zero")
    BigDecimal stockQuantity
) {
}
