import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OrdersLayout from "./components/OrdersLayout";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import BumDetailPage from "./pages/BumDetailPage";
import PickupListPage from "./pages/PickupListPage";
import DashboardPage from "./pages/DashboardPage";
import OrderAddPage from "./pages/OrderAddPage";
import ProductList from "./pages/masters/productList";
import ProductForm from "./pages/masters/productAdd";
import ProductCategoryList from "./pages/masters/productCategoryList";
import ProductCategoryForm from "./pages/masters/productCategoryAdd";
import UomCategoryList from "./pages/masters/uomCategory";
import UomCategoryForm from "./pages/masters/uomCategoryAdd";
import ManufacturerList from "./pages/masters/manufacturerList";
import ManufacturerForm from "./pages/masters/manufactureAdd";
import ProjectNumberList from "./pages/masters/projectList";
import ProjectNumberForm from "./pages/masters/projectAdd";
import BomList from "./pages/masters/bomList";
import BomForm from "./pages/masters/bomAdd";
import PartnerList from "./pages/masters/partnerList";
import PartnerForm from "./pages/masters/partnerAdd";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Orders section — all order routes share the OrderList sidebar */}
        <Route path="orders" element={<OrdersLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path="add" element={<OrderAddPage />} />
          <Route path=":orderId" element={<OrderDetailPage />} />
          <Route path=":orderId/bum/:bumId" element={<BumDetailPage />} />
          <Route path=":orderId/pickup" element={<PickupListPage />} />
        </Route>

        <Route path="masters">
              <Route path="products" element={<ProductList />} />
              <Route path="products/add" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="productcategories" element={<ProductCategoryList />} /> 
              <Route path="productcategories/add" element={<ProductCategoryForm />} />
               <Route path="uomcategories" element={<UomCategoryList />} />
              <Route path="uomcategories/add" element={<UomCategoryForm />} />
              <Route path="manufacturers" element={<ManufacturerList />} />
              <Route path="manufacturers/add" element={<ManufacturerForm />} />
               <Route path="project" element={<ProjectNumberList />} />
              <Route path="project/add" element={<ProjectNumberForm />} />
                <Route path="partners" element={<PartnerList />} />
               <Route path="partners/add" element={<PartnerForm />} />
             <Route path="bom" element={<BomList />} />
             <Route path="bom/add" element={<BomForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
