import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PublicMap from "./pages/PublicMap";
import GoogleLogin from "./pages/GoogleLogin";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssue from "./pages/ReportIssue";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Test from "./pages/Test";
import ProfileSetup from "./pages/ProfileSetup";

// --- UPDATED PROTECTED ROUTE LOGIC ---
const ProtectedRoute = ({ children }) => {
  const citizen = JSON.parse(localStorage.getItem("citizen"));

  // 1. If not logged in at all, go to login page
  if (!citizen) {
    return <Navigate to="/login" />;
  }

  // 2. If profile is NOT complete, force them to stay on profile-setup
  // We check the path to avoid "Too many redirects" error
  if (!citizen.isProfileComplete && window.location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" />;
  }

  // 3. If profile IS complete and they try to go to setup, send them to dashboard
  if (citizen.isProfileComplete && window.location.pathname === "/profile-setup") {
    return <Navigate to="/citizen" />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Anyone can see */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<PublicMap />} />
        <Route path="/login" element={<GoogleLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/test" element={<Test />} />

        {/* Profile Setup - Protected so only logged-in users reach it */}
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />

        {/* Private Routes - Only for logged in & profile completed users */}
        <Route 
          path="/citizen" 
          element={
            <ProtectedRoute>
              <CitizenDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/report" 
          element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Dashboard - Separate Logic */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Catch-all: Redirect unknown pages to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}