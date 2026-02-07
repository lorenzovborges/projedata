import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage, httpClient } from '../../api/httpClient';
import { ProductMaterial, ProductMaterialPayload } from '../../types';

interface ProductMaterialsState {
  itemsByProduct: Record<number, ProductMaterial[]>;
  loading: boolean;
  error: string | null;
}

const initialState: ProductMaterialsState = {
  itemsByProduct: {},
  loading: false,
  error: null,
};

export const fetchProductMaterials = createAsyncThunk<
  { productId: number; items: ProductMaterial[] },
  number,
  { rejectValue: string }
>('productMaterials/fetchByProduct', async (productId, { rejectWithValue }) => {
  try {
    const response = await httpClient.get<ProductMaterial[]>('/product-materials', {
      params: { productId },
    });

    return {
      productId,
      items: response.data,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createProductMaterial = createAsyncThunk<
  ProductMaterial,
  ProductMaterialPayload,
  { rejectValue: string }
>('productMaterials/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await httpClient.post<ProductMaterial>('/product-materials', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateProductMaterial = createAsyncThunk<
  ProductMaterial,
  { id: number; payload: ProductMaterialPayload },
  { rejectValue: string }
>('productMaterials/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await httpClient.put<ProductMaterial>(`/product-materials/${id}`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteProductMaterial = createAsyncThunk<
  { id: number; productId: number },
  { id: number; productId: number },
  { rejectValue: string }
>('productMaterials/delete', async ({ id, productId }, { rejectWithValue }) => {
  try {
    await httpClient.delete(`/product-materials/${id}`);
    return { id, productId };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const productMaterialsSlice = createSlice({
  name: 'productMaterials',
  initialState,
  reducers: {
    clearProductMaterialsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductMaterials.fulfilled,
        (state, action: PayloadAction<{ productId: number; items: ProductMaterial[] }>) => {
          state.loading = false;
          state.itemsByProduct[action.payload.productId] = action.payload.items;
        }
      )
      .addCase(fetchProductMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao carregar composição do produto';
      })
      .addCase(createProductMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductMaterial.fulfilled, (state, action: PayloadAction<ProductMaterial>) => {
        state.loading = false;
        const productId = action.payload.productId;
        const current = state.itemsByProduct[productId] ?? [];
        state.itemsByProduct[productId] = [...current, action.payload];
      })
      .addCase(createProductMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao criar composição';
      })
      .addCase(updateProductMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductMaterial.fulfilled, (state, action: PayloadAction<ProductMaterial>) => {
        state.loading = false;
        const productId = action.payload.productId;
        const current = state.itemsByProduct[productId] ?? [];
        state.itemsByProduct[productId] = current.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateProductMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao atualizar composição';
      })
      .addCase(deleteProductMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteProductMaterial.fulfilled,
        (state, action: PayloadAction<{ id: number; productId: number }>) => {
          state.loading = false;
          const current = state.itemsByProduct[action.payload.productId] ?? [];
          state.itemsByProduct[action.payload.productId] = current.filter(
            (item) => item.id !== action.payload.id
          );
        }
      )
      .addCase(deleteProductMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao remover composição';
      });
  },
});

export const { clearProductMaterialsError } = productMaterialsSlice.actions;
export default productMaterialsSlice.reducer;
