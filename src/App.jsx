import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OrdersLayout from "./components/OrdersLayout";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import BumDetailPage from "./pages/BumDetailPage";
import PickupListPage from "./pages/PickupListPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Orders section — all order routes share the OrderList sidebar */}
        <Route path="orders" element={<OrdersLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path=":orderId" element={<OrderDetailPage />} />
          <Route path=":orderId/bum/:bumId" element={<BumDetailPage />} />
          <Route path=":orderId/pickup" element={<PickupListPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
