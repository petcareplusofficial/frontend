import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Auth from "./pages/Auth/Auth";
import Layout from "./Layout";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard/Dashboard";
import DiteandSuppliment from "./pages/DiteAndSupplimets/DiteAndSupplimets";
import DitePlan from "./pages/DiteAndSupplimets/DitePlan/DitePlan";
import TodaysPlan from "./pages/DiteAndSupplimets/TodaysPlan/Todaysplan";
import CompletionHistory from "./pages/DiteAndSupplimets/CompletionHistory/CompletionHistory";
import BreedSpec from "./pages/DiteAndSupplimets/BreedSpec/BreedSpec";
import Reports from "./pages/Reports/Reports";
import Appointments from "./pages/Appointments/Appointments";
import Booking from "./pages/Booking/Booking";
import CurrentAppointments from "./pages/Booking/CurrentAppointments";
import Calendar from "./components/Calendar/calendar";
import Reminders from "./pages/HealthRecords/Reminders/Reminders";
import HealthRecords from "./pages/HealthRecords/HealthRecords";
import UserProfile from "./components/petsprofile/UserProfile";
import AddPet from './components/petsprofile/AddPet';
import PetProfiles from "./components/petsprofile/PetProfiles";
import { TodayPlanProvider } from "./Context/DiteDetails/DiteDetails";
import { PetProvider } from "./Context/Petsprofile/petDetails";
import AiChatboat from "./components/aiChatboat/aiChatboat";
import { usePetContext } from "./hooks/usePetContext";
import { useEffect } from "react";
import AddHealthRecord from "./pages/HealthRecords/AddHealthRecord";

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail");
  console.log("🔍 Auth check:", { hasToken: !!token, hasEmail: !!email });
  return !!(token && email);
};

export function DietWrapper({ children }) {
  const { selectedPet } = usePetContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedPet) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (selectedPet.hasDiet) {
      navigate("/diteandsupplements/todaysplan", { replace: true });
    } else {
      navigate("/diteandsupplements/diteplan", { replace: true });
    }
  }, [selectedPet, navigate]);

  return children;
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  console.log("🔒 ProtectedRoute check:", authenticated);

  if (!authenticated) {
    console.log("❌ Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Public Route - Redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  console.log("🌍 PublicRoute check:", authenticated);

  if (authenticated) {
    console.log("✅ Already authenticated, redirecting to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <PetProvider>
      <TodayPlanProvider>
        <Router>
          <Routes>
            {/* Public Routes - No Layout/Sidebar */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Root route - redirect based on auth status */}
            <Route
              path="/"
              element={
                isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Protected Routes - With Layout/Sidebar */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Profile Routes */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/user" element={<UserProfile />} />
              <Route path="/profile/pet" element={<PetProfiles />} />
              {/* <Route path="/profile/pet/new" element={<PetProfiles />} /> */}
              <Route path="/profile/pet/new" element={<AddPet />} />
              <Route path="/profile/pet/:petId" element={<PetProfiles />} />
              <Route path="/petprofiles" element={<PetProfiles />} />

              {/* Diet and Supplements Routes */}
              <Route path="/diteandsupplements" element={<DietWrapper />} />
              <Route
                path="/diteandsupplements/diteplan"
                element={<DitePlan />}
              />
              <Route
                path="/diteandsupplements/todaysplan"
                element={<TodaysPlan />}
              />
              <Route
                path="/diteandsupplements/completionhistory"
                element={<CompletionHistory />}
              />
              <Route
                path="/diteandsupplements/breedspec"
                element={<BreedSpec />}
              />

              {/* Reports */}
              <Route path="/reports" element={<Reports />} />

              <Route
                path="/healthreports"
                element={<Navigate to="/healthreports/healthrecords" replace />}
              />
              <Route
                path="/healthreports/healthrecords"
                element={<HealthRecords />}
              />
              <Route path="/healthreports/healthrecords/add" element={<AddHealthRecord />} />
              <Route path="/healthreports/reminders" element={<Reminders />} />

              {/* Appointments Routes */}
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/booking" element={<Appointments />} />
              <Route
                path="/appointments/booking/:vetId"
                element={<Booking />}
              />
              <Route
                path="/appointments/current"
                element={<CurrentAppointments />}
              />

              {/* Calendar */}
              <Route path="/calendar" element={<Calendar />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>

          {/* AI Chatbot */}
          <AiChatboat />
        </Router>
      </TodayPlanProvider>
    </PetProvider>
  );
}
