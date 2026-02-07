package com.projedata.inventory.service;

import com.projedata.inventory.dto.ProductionSuggestionResponse;
import com.projedata.inventory.entity.Product;
import com.projedata.inventory.entity.ProductRawMaterial;
import com.projedata.inventory.entity.RawMaterial;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import com.projedata.inventory.repository.ProductRepository;
import com.projedata.inventory.repository.RawMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionPlanServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @Mock
    private ProductRawMaterialRepository productRawMaterialRepository;

    private ProductionPlanService productionPlanService;

    @BeforeEach
    void setUp() {
        productionPlanService = new ProductionPlanService(productRepository, rawMaterialRepository, productRawMaterialRepository);
    }

    @Test
    void shouldPrioritizeHigherValueProductsWhenSharingTheSameRawMaterial() {
        Product highValueProduct = product(1L, "PRD-A", "Produto A", "100.00");
        Product lowValueProduct = product(2L, "PRD-B", "Produto B", "50.00");

        RawMaterial steel = rawMaterial(11L, "RM-STEEL", "Aco", "10.000");

        ProductRawMaterial highValueComposition = composition(101L, highValueProduct, steel, "4.000");
        ProductRawMaterial lowValueComposition = composition(102L, lowValueProduct, steel, "2.000");

        when(productRepository.findAllByOrderByValueDescCodeAsc()).thenReturn(List.of(highValueProduct, lowValueProduct));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(steel));
        when(productRawMaterialRepository.findByProductIdIn(List.of(1L, 2L)))
            .thenReturn(List.of(highValueComposition, lowValueComposition));

        ProductionSuggestionResponse response = productionPlanService.calculateSuggestions();

        assertThat(response.items()).hasSize(2);
        assertThat(response.items().get(0).productCode()).isEqualTo("PRD-A");
        assertThat(response.items().get(0).suggestedQuantity()).isEqualTo(2L);
        assertThat(response.items().get(1).productCode()).isEqualTo("PRD-B");
        assertThat(response.items().get(1).suggestedQuantity()).isEqualTo(1L);
        assertThat(response.totalProductionValue()).isEqualByComparingTo("250.00");
    }

    @Test
    void shouldReturnNoSuggestionsWhenProductsDoNotHaveComposition() {
        Product standaloneProduct = product(1L, "PRD-EMPTY", "Produto sem composicao", "120.00");

        when(productRepository.findAllByOrderByValueDescCodeAsc()).thenReturn(List.of(standaloneProduct));
        when(rawMaterialRepository.findAll()).thenReturn(List.of());
        when(productRawMaterialRepository.findByProductIdIn(List.of(1L))).thenReturn(List.of());

        ProductionSuggestionResponse response = productionPlanService.calculateSuggestions();

        assertThat(response.items()).isEmpty();
        assertThat(response.totalProductionValue()).isEqualByComparingTo("0");
    }

    @Test
    void shouldReturnNoSuggestionsWhenStockIsInsufficient() {
        Product product = product(1L, "PRD-LIMIT", "Produto limite", "99.90");
        RawMaterial resin = rawMaterial(31L, "RM-RESIN", "Resina", "0.500");
        ProductRawMaterial composition = composition(301L, product, resin, "1.000");

        when(productRepository.findAllByOrderByValueDescCodeAsc()).thenReturn(List.of(product));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(resin));
        when(productRawMaterialRepository.findByProductIdIn(List.of(1L))).thenReturn(List.of(composition));

        ProductionSuggestionResponse response = productionPlanService.calculateSuggestions();

        assertThat(response.items()).isEmpty();
        assertThat(response.totalProductionValue()).isEqualByComparingTo("0");
    }

    @Test
    void shouldUseMinimumConstraintAcrossMultipleRawMaterials() {
        Product product = product(1L, "PRD-C", "Produto C", "20.00");
        RawMaterial rubber = rawMaterial(41L, "RM-RUB", "Borracha", "10.000");
        RawMaterial pigment = rawMaterial(42L, "RM-PIG", "Pigmento", "3.000");

        ProductRawMaterial rubberComposition = composition(401L, product, rubber, "2.000");
        ProductRawMaterial pigmentComposition = composition(402L, product, pigment, "1.000");

        when(productRepository.findAllByOrderByValueDescCodeAsc()).thenReturn(List.of(product));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(rubber, pigment));
        when(productRawMaterialRepository.findByProductIdIn(List.of(1L)))
            .thenReturn(List.of(rubberComposition, pigmentComposition));

        ProductionSuggestionResponse response = productionPlanService.calculateSuggestions();

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().suggestedQuantity()).isEqualTo(3L);
        assertThat(response.items().getFirst().subtotalValue()).isEqualByComparingTo("60.00");
    }

    private Product product(Long id, String code, String name, String value) {
        Product product = new Product();
        product.setId(id);
        product.setCode(code);
        product.setName(name);
        product.setValue(new BigDecimal(value));
        return product;
    }

    private RawMaterial rawMaterial(Long id, String code, String name, String stockQuantity) {
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setId(id);
        rawMaterial.setCode(code);
        rawMaterial.setName(name);
        rawMaterial.setStockQuantity(new BigDecimal(stockQuantity));
        return rawMaterial;
    }

    private ProductRawMaterial composition(Long id, Product product, RawMaterial rawMaterial, String requiredQuantity) {
        ProductRawMaterial composition = new ProductRawMaterial();
        composition.setId(id);
        composition.setProduct(product);
        composition.setRawMaterial(rawMaterial);
        composition.setRequiredQuantity(new BigDecimal(requiredQuantity));
        return composition;
    }
}
