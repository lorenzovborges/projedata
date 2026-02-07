describe('Fluxo principal de cadastro e simulação', () => {
  it('cadastra dados e calcula sugestão de produção', () => {
    const rawMaterials: Array<Record<string, unknown>> = [];
    const products: Array<Record<string, unknown>> = [];
    const compositions: Array<Record<string, unknown>> = [];

    cy.intercept('GET', 'http://localhost:8080/api/raw-materials', (req) => {
      req.reply(rawMaterials);
    });

    cy.intercept('POST', 'http://localhost:8080/api/raw-materials', (req) => {
      const next = {
        id: rawMaterials.length + 1,
        ...req.body,
      };
      rawMaterials.push(next);
      req.reply(201, next);
    });

    cy.intercept('GET', 'http://localhost:8080/api/products', (req) => {
      req.reply(products);
    });

    cy.intercept('POST', 'http://localhost:8080/api/products', (req) => {
      const next = {
        id: products.length + 1,
        ...req.body,
      };
      products.push(next);
      req.reply(201, next);
    });

    cy.intercept('GET', 'http://localhost:8080/api/product-materials*', (req) => {
      const productId = Number(req.query.productId);
      req.reply(
        compositions.filter((item) => Number(item.productId) === productId)
      );
    });

    cy.intercept('POST', 'http://localhost:8080/api/product-materials', (req) => {
      const product = products.find((item) => Number(item.id) === Number(req.body.productId));
      const rawMaterial = rawMaterials.find(
        (item) => Number(item.id) === Number(req.body.rawMaterialId)
      );

      const next = {
        id: compositions.length + 1,
        productId: req.body.productId,
        productCode: product?.code,
        productName: product?.name,
        rawMaterialId: req.body.rawMaterialId,
        rawMaterialCode: rawMaterial?.code,
        rawMaterialName: rawMaterial?.name,
        requiredQuantity: req.body.requiredQuantity,
      };

      compositions.push(next);
      req.reply(201, next);
    });

    cy.intercept('GET', 'http://localhost:8080/api/production-plan/suggestions', {
      statusCode: 200,
      body: {
        items: [
          {
            productId: 1,
            productCode: 'PRD-001',
            productName: 'Produto Premium',
            unitValue: 100,
            suggestedQuantity: 2,
            subtotalValue: 200,
          },
        ],
        totalProductionValue: 200,
      },
    });

    // Raw materials page
    cy.visit('/raw-materials');
    cy.contains('button', 'Nova matéria-prima').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[placeholder="Ex.: RM-001"]').type('RM-001');
      cy.get('input[placeholder="Ex.: Aço"]').type('Aço');
      cy.get('input[placeholder="0.000"]').type('10');
      cy.contains('button', 'Salvar matéria-prima').click();
    });

    // Products page
    cy.visit('/products');
    cy.contains('button', 'Novo produto').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('input[placeholder="Ex.: PRD-001"]').type('PRD-001');
      cy.get('input[placeholder="Ex.: Produto premium"]').type('Produto Premium');
      cy.get('input[placeholder="0.00"]').type('100');
      cy.contains('button', 'Salvar produto').click();
    });
    cy.contains('Produto Premium').should('exist');

    // Open composition dialog
    cy.get('button[title="Composição"]').click();
    cy.get('[role="dialog"]').should('be.visible');

    // Add composition
    cy.get('[role="dialog"]').within(() => {
      cy.get('select').select('RM-001 - Aço');
      cy.get('input[placeholder="0.000"]').type('4');
      cy.contains('button', 'Adicionar à composição').click();
    });

    // Production plan page
    cy.visit('/production-plan');
    cy.contains('button', 'Calcular produção sugerida').click();
    cy.contains('PRD-001').should('exist');
  });
});
