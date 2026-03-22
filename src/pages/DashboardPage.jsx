import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ClipboardList, Package, AlertTriangle, CheckCircle2, TrendingUp, Clock } from "lucide-react";

export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const orders = state.orders;

  const totalItems = orders.flatMap((o) => o.bums.flatMap((b) => b.items)).length;
  const blockedBums = orders.flatMap((o) => o.bums).filter((b) => b.status === "BLOCKED").length;
  const notEnough = orders.flatMap((o) => o.bums.flatMap((b) => b.items)).filter((i) => i.status === "NOT ENOUGH").length;
  const waiting = orders.flatMap((o) => o.bums.flatMap((b) => b.items)).filter((i) => i.status === "WAITING").length;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ClipboardList, color: "bg-violet-100 text-violet-600" },
    { label: "Total Items", value: totalItems, icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Blocked Groups", value: blockedBums, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
    { label: "Not Enough", value: notEnough, icon: AlertTriangle, color: "bg-orange-100 text-orange-600" },
    { label: "Waiting", value: waiting, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { label: "Complete", value: 0, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="h-full overflow-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manufacturing order overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
          <button onClick={() => navigate("/orders")} className="text-xs text-violet-600 hover:text-violet-800">
            View all →
          </button>
        </div>
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => navigate(`/orders/${o.id}`)}
            className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
              {o.productCode}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{o.productName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{o.id} · {o.location} · {o.orderDate}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {o.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
