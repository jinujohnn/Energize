import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

interface LocationState {
    email?: string;
    message?: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
            errors?: Record<string, string[]>;
        };
    };
}

interface VerificationResponse {
    message: string;
    email_verified?: boolean;
}

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as LocationState | null;

    const [email, setEmail] = useState(state?.email || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(
        state?.message ||
            "We've sent a verification link to your email address."
    );

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
    // Resend Verification Email
    // =========================

    const handleResend = async () => {
        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();

        // =========================
        // Validation
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
                await api.post<VerificationResponse>(
                    "/email/verification-notification",
                    {
                        email: trimmedEmail,
                    }
                );

            /*
             * Backend intentionally returns a generic message
             * when an account does not exist.
             *
             * This avoids exposing account existence.
             */

            setSuccess(
                response.data.message ||
                    "Verification email sent. Please check your inbox."
            );
        } catch (err) {
            const apiError = err as ApiError;

            const validationErrors =
                apiError.response?.data?.errors;

            let message =
                apiError.response?.data?.message ||
                "Unable to send the verification email. Please try again.";

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

    // =========================
    // Go To Login
    // =========================

    const handleLogin = () => {
        navigate("/login");
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

                                Almost there

                            </div>


                            {/* Heading */}

                            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">

                                Verify your
                                <br />

                                email and
                                <br />

                                <span className="text-blue-400">
                                    get started.
                                </span>

                            </h2>


                            {/* Description */}

                            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">

                                One quick step helps us keep your account
                                secure and makes sure you can recover
                                access when needed.

                            </p>


                            {/* Feature cards */}

                            <div className="mt-10 grid grid-cols-2 gap-4">

                                {/* Feature 1 */}

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

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
                                        Check your inbox
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Look for the verification email from Energize.
                                    </p>

                                </div>


                                {/* Feature 2 */}

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">

                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">

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
                                        Keep your account secure
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Verification helps protect your account.
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
                    RIGHT SIDE - VERIFICATION
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

                            {/* Email icon */}

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
                                        d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2 0 2 2 0 002 2z"
                                    />
                                </svg>

                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Verify your email
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                We've sent a verification link to your
                                email address. Click the link to activate
                                your account.
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
                                        Email verification
                                    </p>

                                    <p className="mt-1 leading-5 text-emerald-600">
                                        {success}
                                    </p>
                                </div>

                            </div>

                        )}


                        {/* Verification Card */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            {/* Email */}

                            <div className="mb-6">

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
                                        value={email}
                                        readOnly
                                        onChange={handleEmailChange}
                                        autoComplete="email"
                                        maxLength={255}
                                        placeholder="you@example.com"
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    />

                                </div>

                            </div>


                            {/* Instructions */}

                            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">

                                <div className="flex items-start gap-3">

                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                        i
                                    </div>

                                    <div>

                                        <p className="text-sm font-medium text-slate-700">
                                            Didn't receive the email?
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Check your spam or junk folder.
                                            You can also resend the verification
                                            email below.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Resend Button */}

                            <button
                                type="button"
                                onClick={handleResend}
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
                                            Sending verification email...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            Resend verification email
                                        </span>

                                        <span className="text-lg">
                                            →
                                        </span>
                                    </>

                                )}

                            </button>


                            {/* Back to Login */}

                            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

                                <button
                                    type="button"
                                    onClick={handleLogin}
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

export default VerifyEmail;