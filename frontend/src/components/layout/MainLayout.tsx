import {Outlet, Link} from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            M Smart Appointment Reallocation System
          </Link>
          {/* <nav className="space-x-4">
            <Link
              to="/auth/login"
              className="text-sm font-medium hover:underline"
            >
              Login
            </Link>
            <Link
              to="/auth/signup"
              className="text-sm font-medium hover:underline"
            >
              Sign Up
            </Link>
          </nav> */}
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Motor Vehicle Department. All rights
        reserved.
      </footer>
    </div>
  );
}
