import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import rawMaterialsReducer from './slices/rawMaterialsSlice';
import productMaterialsReducer from './slices/productMaterialsSlice';
import productionPlanReducer from './slices/productionPlanSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    rawMaterials: rawMaterialsReducer,
    productMaterials: productMaterialsReducer,
    productionPlan: productionPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
