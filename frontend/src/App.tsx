import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProductsPage } from './pages/ProductsPage';
import { RawMaterialsPage } from './pages/RawMaterialsPage';
import { ProductionPlanPage } from './pages/ProductionPlanPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="raw-materials" element={<RawMaterialsPage />} />
          <Route path="production-plan" element={<ProductionPlanPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
