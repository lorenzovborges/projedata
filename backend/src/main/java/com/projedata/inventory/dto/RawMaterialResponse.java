package com.projedata.inventory.dto;

import java.math.BigDecimal;

public record RawMaterialResponse(
    Long id,
    String code,
    String name,
    BigDecimal stockQuantity
) {
}
