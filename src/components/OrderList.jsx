import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import useOrders from "../hooks/useOrders";

const STATUS_LABEL = {
  "1": "Draft",
  "2": "In progress",
  "3": "Complete",
};

const STATUS_DOT = {
  "1": "bg-gray-300",
  "2": "bg-blue-400",
  "3": "bg-green-400",
};

export default function OrderList() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { getOrders, loading } = useOrders();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  const fetchOrders = useCallback(async (requisition_no = "") => {
    try {
      const res = await getOrders({ requisition_no });

      if (res?.success) {
        // console.log(res.data.data.data)
        const innerData = res.data.data;
        setOrders(innerData?.data || []);
        setTotal(innerData?.total || 0);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOrders(val);
    }, 400);
  };

  return (
    <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white">
        <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
          <Search size={13} className="text-gray-500" />
        </button>

        <button className="flex items-center gap-1 px-3 py-1.5 bg-[#2c2c2c] text-white rounded-full text-xs font-medium">
          All <span className="text-gray-300 text-xs ml-0.5">▾</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={() => navigate("/orders/add")}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
        >
          <Plus size={13} className="text-gray-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <SlidersHorizontal size={11} className="text-gray-400" />
        <span className="text-xs text-gray-400">Filters</span>

        {total > 0 && (
          <span className="ml-auto text-xs text-gray-400">{total} total</span>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Requisition number"
          className="w-full text-xs text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-gray-400 text-center py-8">Loading…</p>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">
            No orders found
          </p>
        )}

        {orders.map((order) => {
          const isActive = String(order.id) === String(orderId);

          const totalItems = (order.boms || []).reduce(
            (sum, b) => sum + (b.items?.length || 0),
            0
          );

          const deliveredCount = (order.boms || [])
            .flatMap((b) => b.items || [])
            .filter((i) => i.delivered).length;

          const dotClass = STATUS_DOT[order.status] || "bg-gray-300";

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                isActive
                  ? "bg-[#e8f5f5] border-l-2 border-l-[#017e84]"
                  : "border-l-2 border-l-transparent hover:bg-gray-50"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 border border-gray-200">
                {order.requisition_no?.slice(-4) || "MRN"}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {order.requisition_no}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {order.project_name ? `${order.project_name} · ` : ""}
                  {order.requisition_date}
                </p>

                {deliveredCount > 0 ? (
                  <span className="text-xs text-green-600 font-medium">
                    {deliveredCount} for delivery
                  </span>
                ) : totalItems > 0 ? (
                  <span className="text-xs text-gray-400">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>

              {/* Status Dot */}
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}