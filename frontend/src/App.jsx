
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import OAuthCallback from "./pages/oAuthcallback";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import EmailVerified from "./pages/EmailVerified";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Project";
import ProjectDetails from "./pages/ProjectDetails";

import Tasks from "./pages/Task";
import TaskDetails from "./pages/TaskDetails";

import Assets from "./pages/Assets";
import AssetDetails from "./pages/AssetDetails";

import EnergyReadings from "./pages/EnergyReadings";
import EnergyReadingDetails from "./pages/EnergyReadingDetails";

import TasksDashboard from "./pages/TasksDashboard";
import AssetsDashboard from "./pages/AssetsDashboard";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    Public Routes
                ========================= */}

                <Route path="/login" element={<Login />} />

                <Route
                    path="/oauth/callback"
                    element={<OAuthCallback />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify-email"
                    element={<VerifyEmail />}
                />

                <Route
                    path="/email-verified"
                    element={<EmailVerified />}
                />


                {/* =========================
                    Protected Routes
                ========================= */}

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    <Route
                        path="/projects/:projectId"
                        element={<ProjectDetails />}
                    />

                    <Route
                        path="/projects/:projectId/tasks"
                        element={<Tasks />}
                    />

                    <Route
                        path="/projects/:projectId/tasks/:taskId"
                        element={<TaskDetails />}
                    />

                    <Route
                        path="/projects/:projectId/assets"
                        element={<Assets />}
                    />

                    <Route
                        path="/projects/:projectId/assets/:assetId"
                        element={<AssetDetails />}
                    />

                    <Route
                        path="/projects/:projectId/assets/:assetId/readings"
                        element={<EnergyReadings />}
                    />

                    <Route
                        path="/projects/:projectId/assets/:assetId/readings/:readingId"
                        element={<EnergyReadingDetails />}
                    />

                    <Route
                        path="/tasks"
                        element={<TasksDashboard />}
                    />

                    <Route
                        path="/assets"
                        element={<AssetsDashboard />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                </Route>


                {/* =========================
                    Default Route
                ========================= */}

                <Route
                    path="/"
                    element={<RootRedirect />}
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

const RootRedirect = () => {
    const token = localStorage.getItem("token");

    return (
        <Navigate
            to={token ? "/dashboard" : "/login"}
            replace
        />
    );
};

export default App;
