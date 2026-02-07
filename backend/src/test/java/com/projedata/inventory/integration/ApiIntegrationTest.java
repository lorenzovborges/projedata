package com.projedata.inventory.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projedata.inventory.repository.ProductRawMaterialRepository;
import com.projedata.inventory.repository.ProductRepository;
import com.projedata.inventory.repository.RawMaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @SuppressWarnings("resource") // falso positivo: container is managed by Testcontainers lifecycle
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("projedata")
        .withUsername("projedata")
        .withPassword("projedata");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRawMaterialRepository productRawMaterialRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    @BeforeEach
    void cleanDatabase() {
        productRawMaterialRepository.deleteAll();
        productRepository.deleteAll();
        rawMaterialRepository.deleteAll();
    }

    @Test
    void shouldExecuteCrudAndReturnProductionSuggestions() throws Exception {
        Long steelId = createRawMaterial("RM-STEEL", "Aco", "10.000");

        Long expensiveProductId = createProduct("PRD-HIGH", "Produto Alto", "100.00");
        Long cheapProductId = createProduct("PRD-LOW", "Produto Baixo", "30.00");

        createComposition(expensiveProductId, steelId, "4.000");
        Long cheapCompositionId = createComposition(cheapProductId, steelId, "2.000");

        mockMvc.perform(get("/api/production-plan/suggestions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].productCode").value("PRD-HIGH"))
            .andExpect(jsonPath("$.items[0].suggestedQuantity").value(2))
            .andExpect(jsonPath("$.items[1].productCode").value("PRD-LOW"))
            .andExpect(jsonPath("$.items[1].suggestedQuantity").value(1))
            .andExpect(jsonPath("$.totalProductionValue").value(230.00));

        mockMvc.perform(put("/api/products/{id}", cheapProductId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "code": "PRD-LOW",
                      "name": "Produto Baixo Atualizado",
                      "value": 35.00
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Produto Baixo Atualizado"));

        mockMvc.perform(delete("/api/product-materials/{id}", cheapCompositionId))
            .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/products/{id}", cheapProductId))
            .andExpect(status().isNoContent());
    }

    @Test
    void shouldBlockDeletionWhenAssociationsExist() throws Exception {
        Long steelId = createRawMaterial("RM-DEL", "Materia Prima", "2.000");
        Long productId = createProduct("PRD-DEL", "Produto", "10.00");
        createComposition(productId, steelId, "1.000");

        mockMvc.perform(delete("/api/products/{id}", productId))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Cannot delete product because it has associated raw materials"));

        mockMvc.perform(delete("/api/raw-materials/{id}", steelId))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Cannot delete raw material because it is associated with at least one product"));
    }

    @Test
    void shouldKeepBadRequestStatusForFrameworkValidationErrors() throws Exception {
        mockMvc.perform(get("/api/products/not-a-number"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"));

        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"code\":\"PRD-ERR\""))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    private Long createProduct(String code, String name, String value) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "code": "%s",
                      "name": "%s",
                      "value": %s
                    }
                    """.formatted(code, name, value)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }

    private Long createRawMaterial(String code, String name, String stockQuantity) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/raw-materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "code": "%s",
                      "name": "%s",
                      "stockQuantity": %s
                    }
                    """.formatted(code, name, stockQuantity)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }

    private Long createComposition(Long productId, Long rawMaterialId, String requiredQuantity) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/product-materials")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productId": %d,
                      "rawMaterialId": %d,
                      "requiredQuantity": %s
                    }
                    """.formatted(productId, rawMaterialId, requiredQuantity)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asLong();
    }
}
