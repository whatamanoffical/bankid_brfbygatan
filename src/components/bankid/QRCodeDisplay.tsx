// src/components/bankid/QRCodeDisplay.tsx
import { QRCodeDisplayProps } from "@/types/bankid";
import QRCode from "@/components/bankid/QRCode";

export function QRCodeDisplay({
  url,
  refreshKey,
  message,
}: QRCodeDisplayProps) {
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-700">Scan the QR code with the BankID app</p>
      <QRCode url={`${url}?t=${refreshKey}`} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
