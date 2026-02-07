CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    value NUMERIC(14,2) NOT NULL CHECK (value > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE raw_materials (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    stock_quantity NUMERIC(14,3) NOT NULL CHECK (stock_quantity >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_raw_materials (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    required_quantity NUMERIC(14,3) NOT NULL CHECK (required_quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prm_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_prm_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials (id),
    CONSTRAINT uk_prm_product_material UNIQUE (product_id, raw_material_id)
);

CREATE INDEX idx_prm_product_id ON product_raw_materials (product_id);
CREATE INDEX idx_prm_raw_material_id ON product_raw_materials (raw_material_id);
