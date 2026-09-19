import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface ForgotPasswordResponse {
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

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // Handle Email Change
    // =========================

    const handleEmailChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setEmail(e.target.value);

        if (error) {
            setError("");
        }

        if (success) {
            setSuccess("");
        }
    };

    // =========================
    // Handle Forgot Password
    // =========================

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();

        // =========================
        // Frontend Validation
        // =========================

        if (!trimmedEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response =
                await api.post<ForgotPasswordResponse>(
                    "/forgot-password",
                    {
                        email: trimmedEmail,
                    }
                );

            /*
             * The backend intentionally returns the same
             * message whether or not the email exists.
             *
             * This prevents exposing which emails have
             * accounts in the system.
             */

            setSuccess(
                response.data.message ||
                    "If an account exists with this email, a password reset link has been sent."
            );

            setEmail("");
        } catch (err) {
            const apiError = err as ApiError;

            const validationErrors =
                apiError.response?.data?.errors;

            let message =
                apiError.response?.data?.message ||
                "Unable to send the reset link. Please try again.";

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

                                Account recovery

                            </div>


                            {/* Heading */}

                            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                                Get back to your
                                <br />

                                workspace
                                <br />

                                <span className="text-blue-400">
                                    securely.
                                </span>

                            </h2>


                            {/* Description */}

                            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">

                                Forgot your password? No problem.
                                We'll help you securely regain access
                                to your Energize account.

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
                                                d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>

                                    </div>

                                    <h3 className="font-semibold text-white">
                                        Check your email
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        We'll send a secure reset link to your inbox.
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
                                        Stay secure
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Your reset process is protected by a secure token.
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
                    RIGHT SIDE - FORGOT PASSWORD
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
                                Forgot your password?
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Enter your email and we'll send you a
                                secure link to reset your password.
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
                                        Check your email
                                    </p>

                                    <p className="mt-1 leading-5 text-emerald-600">
                                        {success}
                                    </p>
                                </div>

                            </div>

                        )}


                        {/* Forgot Password Card */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                            >

                                {/* Email */}

                                <div className="mb-6">

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Email address
                                    </label>

                                    <div className="relative">

                                        {/* Email icon */}

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
                                            name="email"
                                            type="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            disabled={loading}
                                            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                        />

                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        We'll send a password reset link
                                        to this email address.
                                    </p>

                                </div>


                                {/* Send Reset Link Button */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                                >

                                    {loading ? (

                                        <>
                                            {/* Loading spinner */}

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
                                                Sending reset link...
                                            </span>
                                        </>

                                    ) : (

                                        <>
                                            <span>
                                                Send reset link
                                            </span>

                                            <span className="text-lg">
                                                →
                                            </span>
                                        </>

                                    )}

                                </button>

                            </form>


                            {/* Back to Login */}

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
                                Your data is securely protected
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;
