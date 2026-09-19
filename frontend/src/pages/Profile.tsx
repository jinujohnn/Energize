
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface User {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    email_verified_at?: string | null;
    authProvider?: string;
}

interface UpdateProfileResponse {
    message: string;
    user: User;
}

const Profile = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<User>("/user");

            setUser(response.data);
            setName(response.data.name);
        } catch (error) {
            console.error("Profile error:", error);
            setError("User information is unavailable.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (!user) return;

        setName(user.name);
        setUpdateError("");
        setSuccessMessage("");
        setEditing(true);
    };

    const handleCancel = () => {
        if (user) {
            setName(user.name);
        }

        setUpdateError("");
        setEditing(false);
    };

    const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim()) {
            setUpdateError("Name is required.");
            return;
        }

        try {
            setSaving(true);
            setUpdateError("");
            setSuccessMessage("");

            const response = await api.patch<UpdateProfileResponse>(
                "/user",
                {
                    name: name.trim(),
                }
            );

            setUser(response.data.user);
            setName(response.data.user.name);

            setEditing(false);
            setSuccessMessage("Profile updated successfully.");

        } catch (error: any) {
            console.error("Update profile error:", error);

            if (error.response?.data?.errors?.name) {
                setUpdateError(
                    error.response.data.errors.name[0]
                );
            } else {
                setUpdateError(
                    error.response?.data?.message ||
                    "Failed to update profile."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
        }
    };

    if (loading) {
        return (
            <AppLayout
                title="Profile"
                subtitle="Account Settings"
            >
                <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error || !user) {
        return (
            <AppLayout
                title="Profile"
                subtitle="Account Settings"
            >
                <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <h2 className="text-lg font-semibold text-red-700">
                            Unable to load profile
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error || "User information is unavailable."}
                        </p>

                        <button
                            onClick={fetchProfile}
                            className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const initials = user.name
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <AppLayout
            title="Profile"
            subtitle="Account Settings"
        >
            <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">

                {/* Success Message */}
                {successMessage && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                        {successMessage}
                    </div>
                )}

                {/* Profile Header */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
                                {initials}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h2>

                                <p className="mt-1 text-gray-500">
                                    {user.email}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                        Active Account
                                    </span>

                                    {user.email_verified_at && (
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                            Email Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleEdit}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Account Information */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Account Information
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Your personal account details
                        </p>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Full Name
                            </p>

                            <p className="mt-1 text-base font-medium text-gray-900">
                                {user.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Email Address
                            </p>

                            <p className="mt-1 break-all text-base font-medium text-gray-900">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Account ID
                            </p>

                            <p className="mt-1 text-base font-medium text-gray-900">
                                #{user.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Authentication
                            </p>

                            <p className="mt-1 text-base font-medium capitalize text-gray-900">
                                {user.authProvider || "Email"}
                            </p>
                        </div>

                        {user.created_at && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Member Since
                                </p>

                                <p className="mt-1 text-base font-medium text-gray-900">
                                    {new Date(
                                        user.created_at
                                    ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Account Actions */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Account Actions
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="font-medium text-gray-900">
                                Sign out
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Sign out of your Energize account on this device.
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>

            </div>

            {/* Edit Profile Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Edit Profile
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Update your personal information.
                            </p>
                        </div>

                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-5 p-6"
                        >

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    disabled={saving}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500"
                                />

                                <p className="mt-1.5 text-xs text-gray-500">
                                    Email changes require verification.
                                </p>
                            </div>

                            {/* Error */}
                            {updateError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {updateError}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {saving && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
                                    )}

                                    {saving ? "Saving..." : "Save Changes"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </AppLayout>
    );
};

export default Profile;
