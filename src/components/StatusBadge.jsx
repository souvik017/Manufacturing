import { Clock, XCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  if (!status) return null;
  if (status === "ok")
    return <span className="text-gray-400 text-base leading-none">✓</span>;
  if (status === "BLOCKED")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-[#e04c4c] text-white tracking-wide">BLOCKED</span>;
  if (status === "START")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">START →</span>;
  if (status === "WAITING")
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#714b67] text-white"><Clock size={10} />WAITING</span>;
  if (status === "NOT ENOUGH")
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#e04c4c] text-white"><XCircle size={10} />NOT ENOUGH</span>;
  if (status === "In progress")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d4edff] text-[#017e84] border border-[#b8dff0]">In progress</span>;
  if (status === "Complete")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Complete</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>;
}
