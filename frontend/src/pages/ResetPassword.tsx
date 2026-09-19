import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

interface ResetPasswordResponse {
    message: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
}

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get token and email from:
    // /reset-password?token=xxxxx&email=user@example.com
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // Password Strength
    // =========================

    const getPasswordStrength = () => {
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
    // Handle Password Change
    // =========================

    const handlePasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPassword(e.target.value);

        if (error) {
            setError("");
        }
    };

    // =========================
    // Handle Confirmation Change
    // =========================

    const handleConfirmationChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPasswordConfirmation(e.target.value);

        if (error) {
            setError("");
        }
    };

    // =========================
    // Handle Reset
    // =========================

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Check reset URL
        if (!token || !email) {
            setError(
                "This password reset link is invalid or incomplete. Please request a new reset link."
            );
            return;
        }

        // Password validation
        if (!password) {
            setError("Please enter your new password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        // Confirmation validation
        if (!passwordConfirmation) {
            setError("Please confirm your new password.");
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post<ResetPasswordResponse>(
                "/reset-password",
                {
                    email,
                    token,
                    password,
                    password_confirmation: passwordConfirmation,
                }
            );

            setSuccess(
                response.data.message ||
                    "Password reset successfully."
            );

            // Clear password fields
            setPassword("");
            setPasswordConfirmation("");

            // Give the user a moment to see the success message
            setTimeout(() => {
                navigate("/login");
            }, 1800);
        } catch (err) {
            const apiError = err as ApiError;

            const validationErrors =
                apiError.response?.data?.errors;

            let message =
                apiError.response?.data?.message ||
                "Unable to reset your password. Please try again.";

            // Handle Laravel validation errors
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

                                <span className="h-2 w-2 rounded-full bg-blue-400" />

                                Account security

                            </div>


                            {/* Heading */}

                            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                                Secure your
                                <br />

                                account with a
                                <br />

                                <span className="text-blue-400">
                                    new password.
                                </span>

                            </h2>


                            {/* Description */}

                            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">

                                Choose a strong password to keep your
                                Energize account and workspace protected.

                            </p>


                            {/* Security cards */}

                            <div className="mt-10 grid grid-cols-2 gap-4">

                                {/* Card 1 */}

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
                                                d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="font-semibold text-white">
                                        Stay protected
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Use a unique password for your account.
                                    </p>

                                </div>


                                {/* Card 2 */}

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
                                                d="M9 12l2 2 4-4m5.5 2a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="font-semibold text-white">
                                        You're in control
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Reset your password securely in seconds.
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
                    RIGHT SIDE - RESET PASSWORD
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

                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.8"
                                        d="M15 7a5 5 0 00-7.07 7.07l1.41 1.41m3.54-10.6a5 5 0 017.07 7.07l-5.3 5.3a5 5 0 01-7.07 0"
                                    />
                                </svg>

                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Reset your password
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Create a new password for your Energize
                                account.
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


                        {/* Success */}

                        {success && (

                            <div
                                role="status"
                                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700"
                            >

                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
                                    ✓
                                </div>

                                <div>
                                    <p className="font-medium">
                                        {success}
                                    </p>

                                    <p className="mt-1 text-xs text-emerald-600">
                                        Redirecting you to the login page...
                                    </p>
                                </div>

                            </div>

                        )}


                        {/* Reset Card */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {/* Account email */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Account
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
                                                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-600 outline-none"
                                        />

                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                        This is the account associated with your reset request.
                                    </p>

                                </div>


                                {/* New password */}

                                <div className="mb-5">

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        New password
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
                                                    d="M7 10V8a5 5 0 0110 0v2m-9 0h8a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={handlePasswordChange}
                                            autoComplete="new-password"
                                            placeholder="Enter your new password"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (prev) => !prev
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>


                                    {/* Password strength */}

                                    {password && (

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


                                {/* Confirm password */}

                                <div className="mb-6">

                                    <label
                                        htmlFor="password_confirmation"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Confirm new password
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
                                                    d="M9 12l2 2 4-4m5.5 2a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            id="password_confirmation"
                                            type={
                                                showConfirmation
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordConfirmation}
                                            onChange={
                                                handleConfirmationChange
                                            }
                                            autoComplete="new-password"
                                            placeholder="Confirm your new password"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmation(
                                                    (prev) => !prev
                                                )
                                            }
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
                                        >
                                            {showConfirmation
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>


                                    {/* Password match indicator */}

                                    {passwordConfirmation && (

                                        <div className="mt-2 flex items-center gap-1.5 text-xs">

                                            {password ===
                                            passwordConfirmation ? (
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


                                {/* Reset button */}

                                <button
                                    type="submit"
                                    disabled={loading || !!success}
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
                                                Resetting password...
                                            </span>
                                        </>

                                    ) : (

                                        <>
                                            <span>
                                                Reset password
                                            </span>

                                            <span className="text-lg">
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </form>


                            {/* Back to login */}

                            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed"
                                >

                                    <span>
                                        ←
                                    </span>

                                    Back to login

                                </button>

                            </div>

                        </div>


                        {/* Security message */}

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
                                Your password is securely protected
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ResetPassword;
