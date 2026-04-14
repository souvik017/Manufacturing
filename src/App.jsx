// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OrdersLayout from "./components/OrdersLayout";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import BumDetailPage from "./pages/BumDetailPage";
import PickupListPage from "./pages/PickupListPage";
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
import ProductTypeList from "./pages/masters/ProductTypeList";
import ProductTypeForm from "./pages/masters/ProductTypeForm";
import HsnList from "./pages/masters/HsnList";
import HsnForm from "./pages/masters/HsnForm";
import UserList from "./pages/userListPage";
import AddUser from "./pages/userAddPage";
import UserProfile from "./pages/userProfile";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoute";
import ProtectedRoute from "./components/protectedRoute";


export default function App() {
  return (
    <Routes>
      {/* Public route: login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* All protected routes inside Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/requisitions/add" replace />} />

        <Route path="requisitions" element={<OrdersLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path="add" element={<OrderAddPage />} />
          <Route path=":orderId" element={<OrderDetailPage />} />
          <Route path=":orderId/bom/:bumId" element={<BumDetailPage />} />
          <Route path="pickup" element={<PickupListPage />} />
        </Route>

        <Route path="masters">
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="productcategories" element={<ProductCategoryList />} />
          <Route path="productcategories/add" element={<ProductCategoryForm />} />
          <Route path="productcategories/edit/:id" element={<ProductCategoryForm />} />
          <Route path="producttype" element={<ProductTypeList />} />
          <Route path="producttype/add" element={<ProductTypeForm />} />
          <Route path="producttype/edit/:id" element={<ProductTypeForm />} />
          <Route path="uomcategories" element={<UomCategoryList />} />
          <Route path="uomcategories/add" element={<UomCategoryForm />} />
          <Route path="manufacturers" element={<ManufacturerList />} />
          <Route path="manufacturers/add" element={<ManufacturerForm />} />
          <Route path="manufacturers/edit/:id" element={<ManufacturerForm />} />
          <Route path="project" element={<ProjectNumberList />} />
          <Route path="project/add" element={<ProjectNumberForm />} />
          <Route path="project/edit/:id" element={<ProjectNumberForm />} />
          <Route path="partners" element={<PartnerList />} />
          <Route path="partners/add" element={<PartnerForm />} />
          <Route path="partners/edit/:id" element={<PartnerForm />} />
          <Route path="bom" element={<BomList />} />
          <Route path="bom/add" element={<BomForm />} />
          <Route path="bom/edit/:id" element={<BomForm />} />
          <Route path="hsnlist" element={<HsnList />} />
          <Route path="hsnlist/add" element={<HsnForm />} />
          <Route path="hsnlist/edit/:id" element={<HsnForm />} />
        </Route>

        {/* <Route path="/users" element={<UserList />} /> */}
        {/* <Route path="/users/add" element={<AddUser />} /> */}
        {/* <Route path="/users/edit/:id" element={<AddUser />} /> */}
        <Route path="/profile" element={<UserProfile />} />

        <Route path="*" element={<Navigate to="/requisitions/add" replace />} />
      </Route>
    </Routes>
  );
}