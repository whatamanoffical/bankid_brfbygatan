import QRCode from "../bankid/QRCode"; // Adjust the path as necessary

interface StatusDisplayProps {
  status: string;
  message: string;
}

export function StatusDisplay({ status, message }: StatusDisplayProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        {status === "pending" && (
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent" />
        )}
        {status === "success" && (
          <QRCode url="your-qr-url" /> // Replace with the actual URL
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
