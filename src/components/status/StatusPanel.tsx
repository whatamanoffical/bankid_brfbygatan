// src/components/status/StatusPanel.tsx
//import Status from "./Status";
import WPStatus from "./WPStatus";

interface StatusPanelProps {
  onBack: () => void;
}

export default function StatusPanel({ onBack }: StatusPanelProps) {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">System Status</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        <WPStatus />
      </div>
    </div>
  );
}
