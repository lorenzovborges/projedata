import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { PropsWithChildren, ReactElement } from 'react';
import productsReducer from '../store/slices/productsSlice';
import rawMaterialsReducer from '../store/slices/rawMaterialsSlice';
import productMaterialsReducer from '../store/slices/productMaterialsSlice';
import productionPlanReducer from '../store/slices/productionPlanSlice';

export type RootState = {
  products: ReturnType<typeof productsReducer>;
  rawMaterials: ReturnType<typeof rawMaterialsReducer>;
  productMaterials: ReturnType<typeof productMaterialsReducer>;
  productionPlan: ReturnType<typeof productionPlanReducer>;
};

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      products: productsReducer,
      rawMaterials: rawMaterialsReducer,
      productMaterials: productMaterialsReducer,
      productionPlan: productionPlanReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

interface RenderWithProvidersOptions {
  preloadedState?: Partial<RootState>;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState }: RenderWithProvidersOptions = {}
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter>
          {children}
          <Toaster />
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}
