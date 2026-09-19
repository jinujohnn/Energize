
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface RegisterResponse {
    message: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
}

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterForm>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // Handle Input Change
    // =========================

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    // =========================
    // Password Strength
    // =========================

    const getPasswordStrength = () => {
        const password = form.password;

        if (!password) {
            return {
                label: "",
                width: "w-0",
            };
        }

        if (password.length < 8) {
            return {
                label: "Too short",
                width: "w-1/4",
            };
        }

        let score = 0;

        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) {
            return {
                label: "Weak",
                width: "w-1/4",
            };
        }

        if (score === 2) {
            return {
                label: "Fair",
                width: "w-2/4",
            };
        }

        if (score === 3) {
            return {
                label: "Good",
                width: "w-3/4",
            };
        }

        return {
            label: "Strong",
            width: "w-full",
        };
    };

    const passwordStrength = getPasswordStrength();

    // =========================
    // Handle Registration
    // =========================

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");

        /*
         * Trim only the fields where whitespace should not
         * be meaningful.
         *
         * Passwords are NOT trimmed because changing a
         * password silently would be incorrect.
         */
        const name = form.name.trim();
        const email = form.email.trim().toLowerCase();

        // =========================
        // Frontend Validation
        // =========================

        if (!name) {
            setError("Please enter your name.");
            return;
        }

        if (name.length > 255) {
            setError("Name must not exceed 255 characters.");
            return;
        }

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (email.length > 255) {
            setError("Email address must not exceed 255 characters.");
            return;
        }

        if (!form.password) {
            setError("Please create a password.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (!form.password_confirmation) {
            setError("Please confirm your password.");
            return;
        }

        if (form.password !== form.password_confirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response =
                await api.post<RegisterResponse>(
                    "/register",
                    {
                        name,
                        email,
                        password: form.password,
                        password_confirmation:
                            form.password_confirmation,
                    }
                );

            /*
             * Registration does NOT log the user in.
             *
             * Your backend requires email verification before
             * login, so the next step will be email verification.
             */
            navigate("/verify-email", {
                state: {
                    email,
                    message:
                        response.data.message ||
                        "Registration successful. Please verify your email.",
                },
            });
        } catch (err) {
            const apiError = err as ApiError;

            const validationErrors =
                apiError.response?.data?.errors;

            let message =
                apiError.response?.data?.message ||
                "Unable to create your account. Please try again.";

            /*
             * Laravel validation response:
             *
             * errors: {
             *   email: ["The email has already been taken."]
             * }
             *
             * Show the first useful validation message.
             */
            if (validationErrors) {
                const firstError = Object.values(
                    validationErrors
                )[0]?.[0];

                if (firstError) {
                    message = firstError;
                }
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Google Registration
    // =========================

    const handleGoogleRegister = () => {
        window.location.href =
            "http://localhost:3000/auth/google";
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="flex min-h-screen">

                {/* ==================================================
                    LEFT SIDE - BRANDING
                ================================================== */}

                <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">

                    {/* Background decorations */}

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

                    <div className="absolute right-20 top-20 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                        {/* Logo */}

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                                E
                            </div>

                            <span className="text-xl font-semibold text-white">
                                Energize
                            </span>

                        </div>


                        {/* Main content */}

                        <div className="max-w-lg">

                            {/* Badge */}

                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">

                                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                Built for modern teams

                            </div>


                            {/* Heading */}

                            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                                Start building
                                <br />

                                better projects
                                <br />

                                <span className="text-blue-400">
                                    together.
                                </span>

                            </h2>


                            {/* Description */}

                            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">

                                Create your Energize account and bring
                                your projects, tasks, and team
                                collaboration into one workspace.

                            </p>


                            {/* Feature cards */}

                            <div className="mt-10 grid grid-cols-2 gap-4">

                                {/* Feature 1 */}

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-400">

                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H3v-2a4 4 0 014-4h4a4 4 0 014 4v2zm-2-10a4 4 0 11-8 0 4 4 0 018 0zm6 2a3 3 0 10-2.83-4"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="font-semibold text-white">
                                        Collaborate
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Work together with your team in real time.
                                    </p>

                                </div>


                                {/* Feature 2 */}

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-lg text-indigo-400">

                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.8"
                                                d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="font-semibold text-white">
                                        Secure access
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Your account is protected from the start.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Footer */}

                        <p className="text-sm text-slate-600">
                            © 2026 Energize. All rights reserved.
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    RIGHT SIDE - REGISTER
                ================================================== */}

                <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">

                    <div className="w-full max-w-md">

                        {/* Mobile Logo */}

                        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                                E
                            </div>

                            <span className="text-xl font-semibold text-slate-900">
                                Energize
                            </span>

                        </div>


                        {/* Header */}

                        <div className="mb-8">

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Create your account
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Join Energize and start managing your
                                projects with your team.
                            </p>

                        </div>


                        {/* Error */}

                        {error && (

                            <div
                                role="alert"
                                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
                            >

                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                                    !
                                </div>

                                <p>
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* Register Card */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {/* =========================
                                    NAME
                                ========================== */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Full name
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M20 21a8 8 0 00-16 0m12-13a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={form.name}
                                            onChange={handleChange}
                                            autoComplete="name"
                                            maxLength={255}
                                            placeholder="John Doe"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                    </div>

                                </div>


                                {/* =========================
                                    EMAIL
                                ========================== */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Email address
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.8"
                                                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2v10a2 2 0 002 2z"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            maxLength={255}
                                            placeholder="you@example.com"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                    </div>

                                </div>


                                {/* =========================
                                    PASSWORD
                                ========================== */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password}
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            placeholder="Create a password"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>


                                    {/* Password strength */}

                                    {form.password && (

                                        <div className="mt-3">

                                            <div className="mb-1.5 flex items-center justify-between">

                                                <span className="text-xs text-slate-400">
                                                    Password strength
                                                </span>

                                                <span className="text-xs font-semibold text-slate-500">
                                                    {passwordStrength.label}
                                                </span>

                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

                                                <div
                                                    className={`h-full rounded-full bg-blue-600 transition-all duration-300 ${passwordStrength.width}`}
                                                />

                                            </div>

                                        </div>

                                    )}

                                </div>


                                {/* =========================
                                    CONFIRM PASSWORD
                                ========================== */}

                                <div className="mb-6">

                                    <label
                                        htmlFor="password_confirmation"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Confirm password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={
                                                showConfirmation
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                form.password_confirmation
                                            }
                                            onChange={handleChange}
                                            autoComplete="new-password"
                                            placeholder="Confirm your password"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmation(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                        >
                                            {showConfirmation
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>


                                    {/* Match indicator */}

                                    {form.password_confirmation && (

                                        <div className="mt-2 flex items-center gap-1.5 text-xs">

                                            {form.password ===
                                            form.password_confirmation ? (
                                                <>
                                                    <span className="font-semibold text-emerald-600">
                                                        ✓
                                                    </span>

                                                    <span className="text-emerald-600">
                                                        Passwords match
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-red-500">
                                                        !
                                                    </span>

                                                    <span className="text-red-500">
                                                        Passwords do not match
                                                    </span>
                                                </>
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =========================
                                    REGISTER BUTTON
                                ========================== */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                >

                                    {loading ? (

                                        <>
                                            <svg
                                                className="h-5 w-5 animate-spin"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />

                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                />
                                            </svg>

                                            <span>
                                                Creating account...
                                            </span>
                                        </>

                                    ) : (

                                        <>
                                            <span>
                                                Create account
                                            </span>

                                            <span className="text-lg">
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </form>


                            {/* Divider */}

                            <div className="my-6 flex items-center gap-4">

                                <div className="h-px flex-1 bg-slate-200" />

                                <span className="text-xs font-medium text-slate-400">
                                    OR
                                </span>

                                <div className="h-px flex-1 bg-slate-200" />

                            </div>


                            {/* Google */}

                            <button
                                type="button"
                                onClick={handleGoogleRegister}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {/* Google logo */}

                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M21.35 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.24a4.48 4.48 0 01-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.19z"
                                    />

                                    <path
                                        fill="#34A853"
                                        d="M12 21.5c2.63 0 4.84-.87 6.46-2.35l-3.14-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0012 21.5z"
                                    />

                                    <path
                                        fill="#FBBC05"
                                        d="M6.53 13.59A5.86 5.86 0 016.22 12c0-.55.1-1.09.31-1.59V7.88H3.28A9.75 9.75 0 002.25 12c0 1.57.38 3.05 1.03 4.12l3.25-2.53z"
                                    />

                                    <path
                                        fill="#EA4335"
                                        d="M12 6.38c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 00-8.72 5.38l3.25 2.53c.77-2.31 2.92-4.03 5.47-4.03z"
                                    />
                                </svg>

                                Continue with Google

                            </button>

                        </div>


                        {/* Login */}

                        <p className="mt-6 text-center text-sm text-slate-500">

                            Already have an account?{" "}

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-semibold text-blue-600 transition hover:text-blue-700"
                            >
                                Sign in
                            </button>

                        </p>


                        {/* Security */}

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"
                                />
                            </svg>

                            <span>
                                Your data is securely protected
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;
