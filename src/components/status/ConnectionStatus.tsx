// components/status/ConnectionStatus.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StatusIndicatorProps {
  type: "wordpress" | "bankid";
  status: "checking" | "connected" | "disconnected";
  lastChecked?: Date;
}

function StatusIndicator({ type, status, lastChecked }: StatusIndicatorProps) {
  const title = type === "wordpress" ? "WordPress" : "BankID";

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{
          scale: status === "checking" ? [0.8, 1.1, 0.8] : 1,
          backgroundColor:
            status === "connected"
              ? "rgb(34, 197, 94)"
              : status === "disconnected"
              ? "rgb(239, 68, 68)"
              : "rgb(234, 179, 8)",
        }}
        transition={{
          scale: {
            repeat: status === "checking" ? Infinity : 0,
            duration: 1.5,
          },
        }}
        className="w-2.5 h-2.5 rounded-full"
      />
      <span className="text-sm text-gray-600">{title}</span>
      {lastChecked && (
        <span className="text-xs text-gray-400">
          {new Date(lastChecked).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export default function ConnectionStatus() {
  const [wpStatus, setWpStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [bankIdStatus, setBankIdStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnections = async () => {
    // Check WordPress connection
    try {
      const wpResponse = await fetch("/api/wordpress/status");
      setWpStatus(wpResponse.ok ? "connected" : "disconnected");
    } catch {
      setWpStatus("disconnected");
    }

    // Check BankID connection
    try {
      const bankIdResponse = await fetch("/api/bankid/health");
      setBankIdStatus(bankIdResponse.ok ? "connected" : "disconnected");
    } catch {
      setBankIdStatus("disconnected");
    }

    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-4 py-3 space-y-2"
    >
      <StatusIndicator
        type="wordpress"
        status={wpStatus}
        lastChecked={lastChecked}
      />
      <StatusIndicator
        type="bankid"
        status={bankIdStatus}
        lastChecked={lastChecked}
      />
    </motion.div>
  );
}
