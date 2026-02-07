import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage, httpClient } from '../../api/httpClient';
import { ProductionSuggestionItem, ProductionSuggestionResponse } from '../../types';

interface ProductionPlanState {
  items: ProductionSuggestionItem[];
  totalProductionValue: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductionPlanState = {
  items: [],
  totalProductionValue: 0,
  loading: false,
  error: null,
};

export const fetchProductionPlan = createAsyncThunk<
  ProductionSuggestionResponse,
  void,
  { rejectValue: string }
>('productionPlan/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await httpClient.get<ProductionSuggestionResponse>('/production-plan/suggestions');
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const productionPlanSlice = createSlice({
  name: 'productionPlan',
  initialState,
  reducers: {
    clearProductionPlanError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProductionPlan.fulfilled,
        (state, action: PayloadAction<ProductionSuggestionResponse>) => {
          state.loading = false;
          state.items = action.payload.items;
          state.totalProductionValue = action.payload.totalProductionValue;
        }
      )
      .addCase(fetchProductionPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao calcular produção sugerida';
      });
  },
});

export const { clearProductionPlanError } = productionPlanSlice.actions;
export default productionPlanSlice.reducer;
