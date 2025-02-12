// src/components/bankid/QRCode.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface QRCodeProps {
  url: string;
}

export default function QRCode({ url }: QRCodeProps) {
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const getQrCodeWithTimestamp = (baseUrl: string) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}t=${timestamp}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative w-[200px] h-[200px] mx-auto">
        <Image
          src={getQrCodeWithTimestamp(url)}
          alt="BankID QR Code"
          width={200}
          height={200}
          priority
          unoptimized={true}
          className="rounded-lg"
        />
      </div>
      <p className="text-sm text-gray-500 text-center">
        QR-koden uppdateras automatiskt
      </p>
    </div>
  );
}
