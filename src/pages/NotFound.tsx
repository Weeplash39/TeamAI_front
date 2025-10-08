import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "../components/common/Button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button onClick={() => navigate("/")}>
          <Home className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
