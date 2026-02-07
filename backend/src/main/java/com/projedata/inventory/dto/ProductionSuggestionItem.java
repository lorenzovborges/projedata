package com.projedata.inventory.dto;

import java.math.BigDecimal;

public record ProductionSuggestionItem(
    Long productId,
    String productCode,
    String productName,
    BigDecimal unitValue,
    Long suggestedQuantity,
    BigDecimal subtotalValue
) {
}
