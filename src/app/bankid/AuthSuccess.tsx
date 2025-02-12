// src/components/bankid/AuthSuccess.tsx
import { useEffect } from "react";
import { WordPressUser } from "@/types/bankid";
import { CheckIcon } from "@heroicons/react/24/solid";

interface AuthSuccessProps {
  wpUser: WordPressUser;
  onComplete: () => void;
}

export function AuthSuccess({ wpUser, onComplete }: AuthSuccessProps) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="text-center space-y-4">
      <div className="text-green-500 flex items-center justify-center space-x-2">
        <CheckIcon className="w-6 h-6" />
        <span>Inloggning lyckades!</span>
      </div>

      <p className="text-gray-700">Välkommen, {wpUser.display_name}!</p>

      <div className="mt-4">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">
          Omdirigerar till startsidan...
        </p>
      </div>
    </div>
  );
}
