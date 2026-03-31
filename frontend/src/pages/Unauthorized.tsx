import {Button} from "@/components/ui/button";
import {useNavigate} from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        403 - Unauthorized
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        You do not have permission to access this page.
      </p>
      <Button onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );
};

export default Unauthorized;
