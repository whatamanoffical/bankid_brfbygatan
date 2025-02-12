// src/context/WordPressContext.tsx
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export interface WordPressUser {
  display_name: string;
  personal_number: string;
}

interface WordPressContextType {
  isLoggedIn: boolean;
  wpUser: WordPressUser | null;
  setWpUser: Dispatch<SetStateAction<WordPressUser | null>>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  login: (user: WordPressUser) => void;
  logout: () => void;
}

const WordPressContext = createContext<WordPressContextType | undefined>(
  undefined
);

export function WordPressProvider({ children }: { children: React.ReactNode }) {
  const [wpUser, setWpUser] = useState<WordPressUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (user: WordPressUser) => {
    setWpUser(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setWpUser(null);
    setIsLoggedIn(false);
  };

  return (
    <WordPressContext.Provider
      value={{
        isLoggedIn,
        wpUser,
        setWpUser,
        setIsLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </WordPressContext.Provider>
  );
}

export function useWordPress(): WordPressContextType {
  const context = useContext(WordPressContext);
  if (!context) {
    throw new Error("useWordPress must be used within a WordPressProvider");
  }
  return context;
}
