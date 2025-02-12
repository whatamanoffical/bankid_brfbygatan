// src/components/bankid/StatusLog.tsx
import { StatusLogProps } from "@/types/bankid";

export function StatusLog({ logs }: StatusLogProps) {
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-2">Status Log</h3>
      <ul className="list-disc pl-5">
        {logs.map((log, index) => (
          <li key={index} className="text-sm text-gray-700">
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
}
