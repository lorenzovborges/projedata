export interface Product {
  id: number;
  code: string;
  name: string;
  value: number;
}

export interface ProductPayload {
  code: string;
  name: string;
  value: number;
}

export interface RawMaterial {
  id: number;
  code: string;
  name: string;
  stockQuantity: number;
}

export interface RawMaterialPayload {
  code: string;
  name: string;
  stockQuantity: number;
}

export interface ProductMaterial {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  rawMaterialId: number;
  rawMaterialCode: string;
  rawMaterialName: string;
  requiredQuantity: number;
}

export interface ProductMaterialPayload {
  productId: number;
  rawMaterialId: number;
  requiredQuantity: number;
}

export interface ProductionSuggestionItem {
  productId: number;
  productCode: string;
  productName: string;
  unitValue: number;
  suggestedQuantity: number;
  subtotalValue: number;
}

export interface ProductionSuggestionResponse {
  items: ProductionSuggestionItem[];
  totalProductionValue: number;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
