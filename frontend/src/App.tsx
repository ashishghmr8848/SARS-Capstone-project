import {useEffect} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useAuthStore} from "@/store/authStore";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import BookAppointment from "./pages/dashboard/BookAppointment";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageAppointments from "./pages/admin/ManageAppointments";
import ManageTypes from "./pages/admin/ManageTypes";
import ManageLocations from "./pages/admin/ManageLocations";
import SlotConfiguration from "./pages/admin/SlotConfiguration";
import SpecialDates from "./pages/admin/SpecialDates";
import Waitlist from "./pages/admin/Waitlist";
import BookingAction from "./pages/BookingAction";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import {ProtectedRoute} from "./components/common/ProtectedRoute";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const {checkAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    // <div className="">home page</div>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/booking/action" element={<BookingAction />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
          <Route path="book" element={<BookAppointment />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<ManageAppointments />} />
            <Route path="appointment-types" element={<ManageTypes />} />
            <Route path="locations" element={<ManageLocations />} />
            <Route path="slot-configurations" element={<SlotConfiguration />} />
            <Route path="special-dates" element={<SpecialDates />} />
            <Route path="waitlist" element={<Waitlist />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
