import { Link } from "react-router-dom";
import { Home, Settings, Bot } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">TeamAI</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Projets</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Paramètres</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
