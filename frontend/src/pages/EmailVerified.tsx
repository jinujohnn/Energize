
import { useNavigate } from "react-router-dom";

function EmailVerified() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                        className="h-8 w-8 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-slate-900">
                    Email Verified!
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your email address has been successfully verified.
                    You can now log in to your account.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-8 w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Continue to Login
                </button>

            </div>
        </div>
    );
}

export default EmailVerified;
