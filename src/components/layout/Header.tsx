// src/components/layout/Header.tsx
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Image
            src="/logga.jpg"
            alt="Company Logo"
            width={120}
            height={48}
            priority
            className="object-contain"
          />
          <nav className="space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Hjälp
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Kontakta styrelsen
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
