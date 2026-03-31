import {Outlet, Link, useNavigate} from "react-router-dom";
import {
  LogOut,
  Calendar,
  Home,
  Users,
  MapPin,
  Settings,
  CalendarX,
} from "lucide-react";
import {useAuthStore} from "@/store/authStore";

export default function AdminLayout() {
  const navigate = useNavigate();
  const {logout} = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-muted/40">
      <aside className="w-64 bg-background border-r hidden md:block">
        <div className="p-6">
          <Link to="/admin/dashboard" className="text-lg font-bold">
            Admin Portal
          </Link>
        </div>
        <nav className="space-y-1 px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Calendar className="h-4 w-4" /> Bookings
          </Link>
          <Link
            to="/admin/appointment-types"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" /> Appointment Types
          </Link>
          <Link
            to="/admin/locations"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <MapPin className="h-4 w-4" /> Locations
          </Link>
          <Link
            to="/admin/slot-configurations"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="h-4 w-4" /> Slot Configs
          </Link>
          <Link
            to="/admin/special-dates"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <CalendarX className="h-4 w-4" /> Special Dates
          </Link>
          <Link
            to="/admin/waitlist"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="h-4 w-4" /> Waitlist
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-background flex items-center justify-between px-6 md:justify-end">
          <div className="md:hidden font-bold">Admin Portal</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
