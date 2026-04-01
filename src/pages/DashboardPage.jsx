import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";  // ✅ Redux
import { ClipboardList, Package, AlertTriangle, CheckCircle2, Clock, Plus } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

export default function DashboardPage() {
  const navigate = useNavigate();

  // ✅ Redux selector
  const orders = useSelector((s) => s.orders?.orders || []);

  const totalItems = orders.flatMap((o) => (o.boms || []).flatMap((b) => b.items || [])).length;
  const blockedBums = orders.flatMap((o) => o.boms || []).filter((b) => b.status === "BLOCKED").length;
  const notEnough = orders.flatMap((o) => (o.boms || []).flatMap((b) => b.items || [])).filter((i) => i.status === "NOT ENOUGH").length;
  const waiting = orders.flatMap((o) => (o.boms || []).flatMap((b) => b.items || [])).filter((i) => i.status === "WAITING").length;

  const stats = [
    { label: "Manufacturing Orders", value: orders.length, icon: ClipboardList, color: "bg-[#d4edff] text-[#017e84]" },
    { label: "Total Components", value: totalItems, icon: Package, color: "bg-purple-100 text-purple-700" },
    { label: "Blocked Groups", value: blockedBums, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
    { label: "Not Enough Stock", value: notEnough, icon: AlertTriangle, color: "bg-orange-100 text-orange-600" },
    { label: "Waiting", value: waiting, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { label: "Complete", value: 0, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Manufacturing Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Overview of all production orders</p>
          </div>
          <button
            onClick={() => navigate("/orders/add")}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#017e84] text-white rounded text-sm font-medium hover:bg-[#015f64] transition-colors w-full sm:w-auto"
          >
            <Plus size={14} />
            <span>New Requisition</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded border border-gray-200 p-3 sm:p-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded ${s.color} flex items-center justify-center mb-2`}>
                <s.icon size={14} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs text-[#017e84] hover:underline whitespace-nowrap"
            >
              View all →
            </button>
          </div>

          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="flex items-center gap-3 sm:gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
            >
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                {o.requisition_no?.slice(-4) || "MRN"}
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{o.requisition_no}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  <span>{o.id}</span>
                  <span className="hidden sm:inline">
                    {o.project_name ? ` · ${o.project_name}` : ""}
                    {o.requisition_date ? ` · ${o.requisition_date}` : ""}
                  </span>
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}