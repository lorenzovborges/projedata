import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage, httpClient } from '../../api/httpClient';
import { RawMaterial, RawMaterialPayload } from '../../types';

interface RawMaterialsState {
  items: RawMaterial[];
  loading: boolean;
  error: string | null;
}

const initialState: RawMaterialsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchRawMaterials = createAsyncThunk<RawMaterial[], void, { rejectValue: string }>(
  'rawMaterials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpClient.get<RawMaterial[]>('/raw-materials');
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createRawMaterial = createAsyncThunk<
  RawMaterial,
  RawMaterialPayload,
  { rejectValue: string }
>('rawMaterials/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await httpClient.post<RawMaterial>('/raw-materials', payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateRawMaterial = createAsyncThunk<
  RawMaterial,
  { id: number; payload: RawMaterialPayload },
  { rejectValue: string }
>('rawMaterials/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await httpClient.put<RawMaterial>(`/raw-materials/${id}`, payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteRawMaterial = createAsyncThunk<number, number, { rejectValue: string }>(
  'rawMaterials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await httpClient.delete(`/raw-materials/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const rawMaterialsSlice = createSlice({
  name: 'rawMaterials',
  initialState,
  reducers: {
    clearRawMaterialsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRawMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRawMaterials.fulfilled, (state, action: PayloadAction<RawMaterial[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRawMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao carregar matérias-primas';
      })
      .addCase(createRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRawMaterial.fulfilled, (state, action: PayloadAction<RawMaterial>) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao criar matéria-prima';
      })
      .addCase(updateRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRawMaterial.fulfilled, (state, action: PayloadAction<RawMaterial>) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao atualizar matéria-prima';
      })
      .addCase(deleteRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRawMaterial.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Falha ao excluir matéria-prima';
      });
  },
});

export const { clearRawMaterialsError } = rawMaterialsSlice.actions;
export default rawMaterialsSlice.reducer;
