import Image from "next/image";
// components/bankid/QRCode.tsx
interface QRCodeProps {
  url: string;
}

export default function QRCode({ url }: QRCodeProps) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <Image
        src={url}
        alt="BankID QR-kod"
        className="w-full h-full border rounded-lg"
      />
    </div>
  );
}
