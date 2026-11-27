import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import DoctorsList from "./pages/doctors/DoctorsList";
import AddDoctor from "./pages/doctors/AddDoctor";
import ViewDoctor from "./pages/doctors/ViewDoctor";
import EditDoctor from "./pages/doctors/EditDoctor";
import AppointmentsList from "./pages/appointments/AppointmentsList";
import WalletReports from "./pages/wallet/WalletReports";
import DoctorReviews from "./pages/reviews/DoctorReviews";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/profile/Profile";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("hospital_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctors" element={<DoctorsList />} />
          <Route path="doctors/add" element={<AddDoctor />} />
          <Route path="doctors/view/:id" element={<ViewDoctor />} />
          <Route path="doctors/edit/:id" element={<EditDoctor />} />
          <Route path="appointments" element={<AppointmentsList />} />
          <Route path="wallet-reports" element={<WalletReports />} />
          <Route path="reviews" element={<DoctorReviews />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
