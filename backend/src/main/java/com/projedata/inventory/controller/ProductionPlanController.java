package com.projedata.inventory.controller;

import com.projedata.inventory.dto.ProductionSuggestionResponse;
import com.projedata.inventory.service.ProductionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/production-plan")
@RequiredArgsConstructor
public class ProductionPlanController {

    private final ProductionPlanService productionPlanService;

    @GetMapping("/suggestions")
    public ProductionSuggestionResponse suggestions() {
        return productionPlanService.calculateSuggestions();
    }
}
