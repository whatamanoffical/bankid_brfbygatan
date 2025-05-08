// src/app/page.tsx
"use client";

import { useState } from "react";
import {
  WordPressProvider,
  useWordPress,
  WordPressUser,
} from "@/context/WordPressContext";
import BankIDFlow from "./bankid/BankIDFlow";
import Header from "@/components/layout/Header";
import StatusPanel from "@/components/status/StatusPanel";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import PersonalNumberStatusList from "@/components/status/PersonalNumberStatusList";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="text-center p-4 bg-red-50 rounded-lg">
      <h2 className="text-red-800 font-medium">Something went wrong:</h2>
      <pre className="text-sm text-red-600 mt-2">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

function MainContent() {
  const [showStatus, setShowStatus] = useState(false);
  const { isLoggedIn, wpUser, login } = useWordPress();

  // Callback that gets called when login is successful.
  // The BankIDFlow should call onLoginSuccess and pass the user info.
  const handleLoginSuccess = (user: WordPressUser) => {
    // Update your global auth state using the login() function from your context.
    login(user);
  };

  // Example predefined list of personal numbers
  const predefinedPersonalNumbers = [
    "199001011234",
    "198502025678",
    "200003039012",
    "197012121212",
  ];

  if (isLoggedIn && wpUser) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome, {wpUser.display_name}!
        </h2>
        <p className="mt-2 text-gray-600">You are successfully logged in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showStatus ? (
        <StatusPanel onBack={() => setShowStatus(false)} />
      ) : (
        <>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <BankIDFlow
              onError={(error: unknown) =>
                console.error("BankID Error:", error)
              }
              onLoginSuccess={handleLoginSuccess} // Pass the callback here
            />
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => setShowStatus(true)}
              className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
            >
              Check System Status
            </button>
          </div>
          <div className="mt-8">
            <PersonalNumberStatusList
              personalNumbers={predefinedPersonalNumbers}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <WordPressProvider>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => window.location.reload()}
            >
              <MainContent />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </WordPressProvider>
  );
}
