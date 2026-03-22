import { Zap, Plus, DollarSign, Layers, Package, CheckSquare, BarChart2, LayoutGrid, PlusSquare, Settings } from "lucide-react";

const topNav = [
  { icon: Zap },
  { icon: Plus, active: true },
  { icon: DollarSign },
  { icon: Layers },
  { icon: Package },
  { icon: CheckSquare },
  { icon: BarChart2 },
];

const bottomNav = [{ icon: LayoutGrid }, { icon: PlusSquare }, { icon: Settings }];

export default function Sidebar() {
  return (
    <div className="w-12 bg-gray-800 flex flex-col items-center py-3 gap-0.5 flex-shrink-0">
      {topNav.map(({ icon: Icon, active }, i) => (
        <button
          key={i}
          className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors mb-0.5 ${
            active ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
      <div className="flex-1" />
      <div className="w-7 h-7 rounded-md bg-amber-500 mb-2" />
      {bottomNav.map(({ icon: Icon }, i) => (
        <button
          key={i}
          className="w-9 h-9 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors mb-0.5"
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
