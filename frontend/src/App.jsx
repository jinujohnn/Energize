
import { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// Public pages
const Login = lazy(() => import("./pages/Login"));
const OAuthCallback = lazy(() => import("./pages/oAuthcallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Register = lazy(() => import("./pages/Register"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const EmailVerified = lazy(() => import("./pages/EmailVerified"));

// Protected pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Project"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));

const Tasks = lazy(() => import("./pages/Task"));
const TaskDetails = lazy(() => import("./pages/TaskDetails"));

const Assets = lazy(() => import("./pages/Assets"));
const AssetDetails = lazy(() => import("./pages/AssetDetails"));

const EnergyReadings = lazy(() => import("./pages/EnergyReadings"));
const EnergyReadingDetails = lazy(
    () => import("./pages/EnergyReadingDetails")
);

const TasksDashboard = lazy(
    () => import("./pages/TasksDashboard")
);

const AssetsDashboard = lazy(
    () => import("./pages/AssetsDashboard")
);

const Profile = lazy(() => import("./pages/Profile"));

import ProtectRoute from "./components/ProtectRoute";

const PageLoader = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                <p className="text-sm text-gray-500">
                    Loading...
                </p>
            </div>
        </div>
    );
};

const RootRedirect = () => {
    const token = localStorage.getItem("token");

    return (
        <Navigate
            to={token ? "/dashboard" : "/login"}
            replace
        />
    );
};

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>

                    {/* =========================
                        Public Routes
                    ========================= */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

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

                    <Route element={<ProtectRoute />}>

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
                        Root Route
                    ========================= */}

                    <Route
                        path="/"
                        element={<RootRedirect />}
                    />


                    {/* =========================
                        Unknown Routes
                    ========================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
