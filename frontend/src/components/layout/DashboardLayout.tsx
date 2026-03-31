import {Outlet, Link} from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex flex-col bg-muted/40 overflow-hidden">
      <header className="border-b bg-background h-16 flex items-center">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Smart Appointment Reallocation System
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
