
import { FormEvent, useEffect, useState } from "react";
import { Link, Links, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface Asset {
    id: number;
    project_id: number;
    name: string;
    type:
        | "solar_panel"
        | "inverter"
        | "battery"
        | "wind_turbine"
        | "other";
    status: "operational" | "maintenance" | "offline";
    location: string | null;
    capacity: number | string | null;
    last_maintenance_at: string | null;
    created_at: string;
    updated_at: string;
}

interface AssetResponse {
    asset: Asset;
}

interface EditForm {
    name: string;
    type: Asset["type"];
    status: Asset["status"];
    location: string;
    capacity: string;
    last_maintenance_at: string;
}

const AssetDetails = () => {
    const { projectId, assetId } = useParams<{
        projectId: string;
        assetId: string;
    }>();

    const navigate = useNavigate();

    const [asset, setAsset] = useState<Asset | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [form, setForm] = useState<EditForm>({
        name: "",
        type: "solar_panel",
        status: "operational",
        location: "",
        capacity: "",
        last_maintenance_at: "",
    });

    // Fetch asset
    useEffect(() => {
        const fetchAsset = async () => {
            if (!projectId || !assetId) {
                setError("Asset information is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await api.get<AssetResponse>(
                    `/projects/${projectId}/assets/${assetId}`
                );

                setAsset(response.data.asset);
            } catch (error: any) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Unable to load asset. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [projectId, assetId]);

    // Open edit modal
    const openEditModal = () => {
        if (!asset) return;

        setForm({
            name: asset.name,
            type: asset.type,
            status: asset.status,
            location: asset.location || "",
            capacity:
                asset.capacity === null ||
                asset.capacity === ""
                    ? ""
                    : String(asset.capacity),
            last_maintenance_at: asset.last_maintenance_at
                ? asset.last_maintenance_at.substring(0, 10)
                : "",
        });

        setEditError("");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (editing) return;

        setShowEditModal(false);
        setEditError("");
    };

    // Update asset
    const handleUpdateAsset = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId || !assetId) {
            setEditError("Asset information is missing.");
            return;
        }

        try {
            setEditing(true);
            setEditError("");

            const response = await api.patch<AssetResponse>(
                `/projects/${projectId}/assets/${assetId}`,
                {
                    name: form.name,
                    type: form.type,
                    status: form.status,
                    location: form.location || null,
                    capacity:
                        form.capacity === ""
                            ? null
                            : Number(form.capacity),
                    last_maintenance_at:
                        form.last_maintenance_at || null,
                }
            );

            setAsset(response.data.asset);
            setShowEditModal(false);
        } catch (error: any) {
            console.error(error);

            setEditError(
                error.response?.data?.message ||
                    "Unable to update asset. Please check your input."
            );
        } finally {
            setEditing(false);
        }
    };

    // Open delete modal
    const openDeleteModal = () => {
        setConfirmationText("");
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setShowDeleteModal(false);
        setConfirmationText("");
        setDeleteError("");
    };

    // Delete asset
    const handleDeleteAsset = async () => {
        if (!projectId || !assetId) {
            setDeleteError("Asset information is missing.");
            return;
        }

        // Exact case-sensitive confirmation
        if (confirmationText !== "DELETE") {
            setDeleteError(
                'Please type "DELETE" exactly as shown.'
            );
            return;
        }

        try {
            setDeleting(true);
            setDeleteError("");

            await api.delete(
                `/projects/${projectId}/assets/${assetId}`
            );

            navigate(
                `/projects/${projectId}/assets`,
                { replace: true }
            );
        } catch (error: any) {
            console.error(error);

            setDeleteError(
                error.response?.data?.message ||
                    "Unable to delete asset. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    const getStatusClass = (
        status: Asset["status"]
    ) => {
        switch (status) {
            case "operational":
                return "bg-emerald-50 text-emerald-700 ring-emerald-200";

            case "maintenance":
                return "bg-amber-50 text-amber-700 ring-amber-200";

            default:
                return "bg-red-50 text-red-700 ring-red-200";
        }
    };

    const getStatusLabel = (
        status: Asset["status"]
    ) => {
        switch (status) {
            case "operational":
                return "Operational";

            case "maintenance":
                return "Maintenance";

            default:
                return "Offline";
        }
    };

    const getTypeLabel = (
        type: Asset["type"]
    ) => {
        switch (type) {
            case "solar_panel":
                return "Solar Panel";

            case "inverter":
                return "Inverter";

            case "battery":
                return "Battery";

            case "wind_turbine":
                return "Wind Turbine";

            default:
                return "Other";
        }
    };

    const formatDate = (
        date: string | null
    ) => {
        if (!date) {
            return "Not specified";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                        Loading asset...
                    </div>
                </div>
            </div>
        );
    }

    if (error || !asset) {
        return (
            
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
                    <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">
                            Unable to load asset
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error || "Asset not found."}
                        </p>

                        <Link
                            to={`/projects/${projectId}/assets`}
                            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Back to Assets
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AppLayout title="Asset Details" subtitle="Project Asset" >
            <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">

                    {/* Breadcrumb */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">

                        <Link
                            to="/projects"
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Projects
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <Link
                            to={`/projects/${projectId}`}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Project Details
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <Link
                            to={`/projects/${projectId}/assets`}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Assets
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <span className="font-medium text-slate-700">
                            Asset Details
                        </span>

                    </div>


                    {/* Title */}
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Energy Asset
                            </p>

                            <div className="flex flex-wrap items-center gap-3">

                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                    {asset.name}
                                </h1>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(asset.status)}`}
                                >
                                    {getStatusLabel(asset.status)}
                                </span>

                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                                {getTypeLabel(asset.type)}
                            </p>
                        </div>


                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={openEditModal}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                Edit Asset
                            </button>

                            <button
                                type="button"
                                onClick={openDeleteModal}
                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Delete Asset
                            </button>

                        </div>

                    </div>


                    {/* Overview cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Asset Type
                            </p>

                            <p className="mt-3 text-lg font-bold text-slate-900">
                                {getTypeLabel(asset.type)}
                            </p>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Status
                            </p>

                            <div className="mt-3">
                                <span
                                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClass(asset.status)}`}
                                >
                                    {getStatusLabel(asset.status)}
                                </span>
                            </div>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Capacity
                            </p>

                            <p className="mt-3 text-lg font-bold text-slate-900">
                                {asset.capacity !== null &&
                                asset.capacity !== ""
                                    ? asset.capacity
                                    : "Not specified"}
                            </p>

                        </div>

                    </div>


                    {/* Asset Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-slate-900">
                            Asset Information
                        </h2>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Location
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {asset.location ||
                                        "Not specified"}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Last Maintenance
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        asset.last_maintenance_at
                                    )}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Created
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        asset.created_at
                                    )}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Last Updated
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(
                                        asset.updated_at
                                    )}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Asset ID
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    #{asset.id}
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* Energy Readings placeholder */}
                    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                    Energy Monitoring
                                </p>

                                <h2 className="mt-1 text-lg font-bold text-slate-900">
                                    Energy Readings
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    View and manage energy production, consumption, and power output readings for this asset.
                                </p>

                            </div>

                            <Link to={`/projects/${projectId}/assets/${assetId}/readings`} className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700" > View Readings </Link>

                        </div>

                    </div>


                    {/* Danger Zone */}
                    <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-red-700">
                            Danger Zone
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Deleting this asset is permanent and cannot be undone.
                        </p>

                        <button
                            type="button"
                            onClick={openDeleteModal}
                            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                            Delete Asset
                        </button>

                    </div>

            </div>
            {/* Edit Modal */}
            {showEditModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Edit Asset
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Update asset information.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editing}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    ✕
                                </button>

                            </div>

                        </div>


                        <form
                            onSubmit={handleUpdateAsset}
                            className="space-y-5 px-6 py-6"
                        >

                            {editError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {editError}
                                </div>
                            )}


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Asset Name
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Asset Type
                                </label>

                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            type: e.target.value as Asset["type"],
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >

                                    <option value="solar_panel">
                                        Solar Panel
                                    </option>

                                    <option value="inverter">
                                        Inverter
                                    </option>

                                    <option value="battery">
                                        Battery
                                    </option>

                                    <option value="wind_turbine">
                                        Wind Turbine
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value as Asset["status"],
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="operational">
                                            Operational
                                        </option>

                                        <option value="maintenance">
                                            Maintenance
                                        </option>

                                        <option value="offline">
                                            Offline
                                        </option>

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Capacity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.capacity}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                capacity: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            location: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Last Maintenance Date
                                </label>

                                <input
                                    type="date"
                                    value={form.last_maintenance_at}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            last_maintenance_at:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={editing}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={editing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {editing && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    )}

                                    {editing
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* Delete Modal */}
            {showDeleteModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl text-red-600">
                            !
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Delete Asset?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Are you sure you need to delete this asset?
                            This action cannot be undone.
                        </p>


                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Type{" "}
                                <span className="text-red-600">
                                    DELETE
                                </span>{" "}
                                to confirm
                            </label>

                            <input
                                type="text"
                                value={confirmationText}
                                onChange={(e) =>
                                    setConfirmationText(
                                        e.target.value
                                    )
                                }
                                placeholder="DELETE"
                                disabled={deleting}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />

                        </div>


                        {deleteError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {deleteError}
                            </div>
                        )}


                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteAsset}
                                disabled={
                                    deleting ||
                                    confirmationText !== "DELETE"
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {deleting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                )}

                                {deleting
                                    ? "Deleting..."
                                    : "Delete Asset"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </AppLayout>
    );
};

export default AssetDetails;
