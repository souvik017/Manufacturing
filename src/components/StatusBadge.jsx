import { Clock, XCircle, AlertCircle } from "lucide-react";

export default function StatusBadge({ status }) {
  if (!status) return null;
  if (status === "ok")
    return <span className="text-green-600 font-bold text-base leading-none">✓</span>;
  if (status === "BLOCKED")
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">BLOCKED</span>;
  if (status === "START")
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300">START →</span>;
  if (status === "WAITING")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-900 text-white"><Clock size={10} />WAITING</span>;
  if (status === "NOT ENOUGH")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white"><XCircle size={10} />NOT ENOUGH</span>;
  if (status === "In progress")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">In progress</span>;
  if (status === "Complete")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Complete</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-200 text-gray-700">{status}</span>;
}
