import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import MembershipDashboard from "./pages/MembershipDashboard";
import WorkoutTracker from "./pages/WorkoutTracker";
import MealPlanAdmin from "./pages/MealPlanAdmin";
import MealPlanViewer from "./pages/MealPlanViewer";
import StyledWorkoutTracker from "./pages/StyledWorkoutTracker";
import MyProfile from "./pages/MyProfile";
import MyWorkouts from "./pages/MyWorkouts";
import MyMealPlanner from "./pages/MyMealPlanner";
import MyCheckIn from "./pages/MyCheckIn";
import TopMenuBar from "./pages/TopMenuBar";
import Footer from "./pages/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import MultiStepSignUp from "./pages/MultiStepSignUp";
import MyClients from "./pages/MyClients";
import MealTracker from "./pages/MealTracker";
import TestBarcodeReader from "./pages/TestBarcodeReader";
import DailyMealSummary from "./pages/DailyMealSummary";


/* Admin Layout + Sub-pages */
import FitHub from "./pages/FitHub";   // Layout with sidebar, top bar, <Outlet />
import AdminHome from "./pages/AdminHome"; // Original FitHub content (graphs, stats, etc.)

function App() {
  return (
    <Router>
      <TopMenuBar />
      <Routes>
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/test-barcode" element={<TestBarcodeReader />} />
        
        
        {/* Basic routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/multi-step-signup" element={<MultiStepSignUp />} />

        <Route path="/meal-tracker" element={<MealTracker />} />


        {/* Admin Layout (FitHub) */}
        <Route path="/admin" element={<FitHub />}>
          {/* index => shows AdminHome (graphs, stats) by default */}
          <Route index element={<AdminHome />} />

          {/* /admin/membership => membership search page */}
          <Route path="membership" element={<MembershipDashboard />} />
          {/* You can add more nested routes here: /admin/workouts, /admin/schedule, etc. */}
        </Route>

        {/* Protected user routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<MyProfile />} /> {/* Default page */}
          <Route path="profile" element={<MyProfile />} />
          <Route path="workouts" element={<MyWorkouts />} />
          <Route path="meal-planner" element={<MyMealPlanner />} />
          <Route path="check-in" element={<MyCheckIn />} />
          <Route path="daily-meals" element={<DailyMealSummary />} />
        </Route>

        {/* Other pages */}
        <Route path="/workout-tracker" element={<WorkoutTracker />} />
        <Route path="/meal-plans/admin" element={<MealPlanAdmin />} />
        <Route path="/meal-plans" element={<MealPlanViewer />} />
        <Route path="/styled-workout-tracker" element={<StyledWorkoutTracker />} />
        <Route path="/memberships" element={<MembershipDashboard />} />

        {/* Personal Trainer */}
        <Route path="/personal-trainer/my-clients" element={<MyClients />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
