import {useAuthStore} from "@/store/authStore";
import {Outlet, useNavigate} from "react-router-dom";

export default function AuthLayout() {
  const {user} = useAuthStore();

  const navigate = useNavigate();

  if (user) {
    navigate("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Smart Appointment Reallocation System
          </h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
