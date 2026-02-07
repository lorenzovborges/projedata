package com.projedata.inventory.dto;

import java.math.BigDecimal;

public record ProductResponse(
    Long id,
    String code,
    String name,
    BigDecimal value
) {
}
