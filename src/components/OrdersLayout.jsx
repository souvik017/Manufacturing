import { Outlet, useParams, useNavigate } from "react-router-dom";
import OrderList from "./OrderList";
import { ClipboardList } from "lucide-react";

export default function OrdersLayout() {
  const { orderId } = useParams();

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: order list panel ── */}
      <OrderList />

      {/* ── Right: page outlet ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {!orderId ? (
          /* Empty state when no order is selected */
          <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ClipboardList size={28} className="text-gray-300" />
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
