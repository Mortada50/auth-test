import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DoctorRegisterPage from "./pages/DoctorRegisterPage.jsx";
import PatientRegisterPage from "./pages/PatientRegisterPage.jsx";
import PharmacyRegisterPage from "./pages/PharmacyRegisterPage.jsx";
import PendingApprovalPage from "./pages/PendingApprovalPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Register Forms ── */}
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />
        <Route path="/register/patient" element={<PatientRegisterPage />} />
        <Route path="/register/pharmacy" element={<PharmacyRegisterPage />} />

        {/* ── Verify Email ── */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* ── Pending ── */}
        <Route
          path="/pending"
          element={
            <ProtectedRoute>
              <PendingApprovalPage />
            </ProtectedRoute>
          }
        />

        {/* ── Default ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
