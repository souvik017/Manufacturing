import { Outlet, useParams, useLocation } from "react-router-dom";
import OrderList from "./OrderList";
import { ClipboardList } from "lucide-react";

export default function OrdersLayout() {
  const { orderId, id } = useParams(); // ✅ capture both param names
  const location = useLocation();

  const isAddPage = location.pathname.endsWith("/add");
  const isPickupPage = location.pathname.endsWith("/pickup");

  // Show Outlet if we have any ID (orderId or id), or on add/pickup pages
  const showOutlet = orderId || id || isAddPage || isPickupPage;

  return (
    <div className="flex h-full overflow-hidden">
      <OrderList />
      <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-white">
        {!showOutlet ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ClipboardList size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Select an order</p>
            <p className="text-xs text-gray-400 mt-1">Choose an order from the list to view details</p>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}