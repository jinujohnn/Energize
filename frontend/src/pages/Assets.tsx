
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

interface AssetsResponse {
    assets: Asset[];
}

interface CreateAssetForm {
    name: string;
    type: Asset["type"];
    status: Asset["status"];
    location: string;
    capacity: string;
    last_maintenance_at: string;
}

const Assets = () => {
    const { projectId } = useParams<{ projectId: string }>();

    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState<CreateAssetForm>({
        name: "",
        type: "solar_panel",
        status: "operational",
        location: "",
        capacity: "",
        last_maintenance_at: "",
    });

    // Fetch assets
    const fetchAssets = async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get<AssetsResponse>(
                `/projects/${projectId}/assets`
            );

            setAssets(response.data.assets);
        } catch (error: any) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Unable to load assets. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [projectId]);

    // Filter assets
    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                asset.name.toLowerCase().includes(searchValue) ||
                asset.location
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                asset.status === statusFilter;

            const matchesType =
                typeFilter === "all" ||
                asset.type === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [assets, search, statusFilter, typeFilter]);

    // Statistics
    const statistics = {
        total: assets.length,

        operational: assets.filter(
            (asset) => asset.status === "operational"
        ).length,

        maintenance: assets.filter(
            (asset) => asset.status === "maintenance"
        ).length,

        offline: assets.filter(
            (asset) => asset.status === "offline"
        ).length,
    };

    const openCreateModal = () => {
        setForm({
            name: "",
            type: "solar_panel",
            status: "operational",
            location: "",
            capacity: "",
            last_maintenance_at: "",
        });

        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (creating) return;

        setShowCreateModal(false);
        setCreateError("");
    };

    // Create asset
    const handleCreateAsset = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId) {
            setCreateError("Project ID is missing.");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const response = await api.post<{ asset: Asset }>(
                `/projects/${projectId}/assets`,
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

            setAssets((currentAssets) => [
                response.data.asset,
                ...currentAssets,
            ]);

            setShowCreateModal(false);

            setForm({
                name: "",
                type: "solar_panel",
                status: "operational",
                location: "",
                capacity: "",
                last_maintenance_at: "",
            });
        } catch (error: any) {
            console.error(error);

            setCreateError(
                error.response?.data?.message ||
                    "Unable to create asset. Please check your input."
            );
        } finally {
            setCreating(false);
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

            case "wind_turbine":
                return "Wind Turbine";

            case "inverter":
                return "Inverter";

            case "battery":
                return "Battery";

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

    return (
        <AppLayout title="Assets" subtitle="Project Assets">
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

                        <span className="font-medium text-slate-700">
                            Assets
                        </span>

                    </div>


                    {/* Page title */}
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                        <div>

                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Project Assets
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Manage Assets
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                Monitor and manage the energy assets connected to this project.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <span className="text-lg leading-none">
                                +
                            </span>

                            Add Asset
                        </button>

                    </div>


                    {/* Statistics */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Total Assets
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {statistics.total}
                            </p>

                        </div>


                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Operational
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {statistics.operational}
                            </p>

                        </div>


                        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Maintenance
                            </p>

                            <p className="mt-2 text-3xl font-bold text-amber-600">
                                {statistics.maintenance}
                            </p>

                        </div>


                        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Offline
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-600">
                                {statistics.offline}
                            </p>

                        </div>

                    </div>


                    {/* Filters */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="grid gap-3 md:grid-cols-3">

                            <div className="relative">

                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search assets..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="all">
                                    All Statuses
                                </option>

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


                            <select
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(e.target.value)
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="all">
                                    All Asset Types
                                </option>

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

                    </div>


                    {/* Error */}
                    {error && (

                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>

                    )}


                    {/* Loading */}
                    {loading ? (

                        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

                            <div className="flex items-center gap-3 text-sm text-slate-500">

                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                                Loading assets...

                            </div>

                        </div>

                    ) : filteredAssets.length === 0 ? (

                        /* Empty */
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                                ◈
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">

                                {assets.length === 0
                                    ? "No assets yet"
                                    : "No matching assets"}

                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">

                                {assets.length === 0
                                    ? "Add your first energy asset to start monitoring this project."
                                    : "Try changing your search or filters."}

                            </p>

                            {assets.length === 0 && (

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Add First Asset
                                </button>

                            )}

                        </div>

                    ) : (

                        /* Asset List */
                        <div className="space-y-4">

                            {filteredAssets.map((asset) => (

                                <div
                                    key={asset.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                        {/* Asset information */}
                                        <div className="flex min-w-0 items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                                                ◈
                                            </div>

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <h3 className="text-lg font-bold text-slate-900">
                                                        {asset.name}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(asset.status)}`}
                                                    >
                                                        {getStatusLabel(asset.status)}
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    {getTypeLabel(asset.type)}
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">

                                                    <div>

                                                        <span className="text-slate-400">
                                                            Location
                                                        </span>

                                                        <span className="ml-2 font-medium text-slate-700">
                                                            {asset.location ||
                                                                "Not specified"}
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <span className="text-slate-400">
                                                            Capacity
                                                        </span>

                                                        <span className="ml-2 font-medium text-slate-700">
                                                            {asset.capacity !== null &&
                                                            asset.capacity !== ""
                                                                ? `${asset.capacity}`
                                                                : "Not specified"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>


                                        {/* Right side */}
                                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">

                                            <div className="text-sm sm:text-right">

                                                <p className="text-xs text-slate-400">
                                                    Last Maintenance
                                                </p>

                                                <p className="mt-1 font-medium text-slate-700">
                                                    {formatDate(
                                                        asset.last_maintenance_at
                                                    )}
                                                </p>

                                            </div>

                                            <Link
                                                to={`/projects/${projectId}/assets/${asset.id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                View Asset
                                                <span>→</span>
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>


            {/* Create Asset Modal */}
            {showCreateModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Add Asset
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Add a new energy asset to this project.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={creating}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    ✕
                                </button>

                            </div>

                        </div>


                        <form
                            onSubmit={handleCreateAsset}
                            className="space-y-5 px-6 py-6"
                        >

                            {createError && (

                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {createError}
                                </div>

                            )}


                            {/* Name */}
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
                                    placeholder="e.g. Solar Panel Array A"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Type */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Asset Type
                                </label>

                                <select
                                    value={form.type}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            type: e.target
                                                .value as Asset["type"],
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


                            {/* Status + Capacity */}
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
                                                status: e.target
                                                    .value as Asset["status"],
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
                                        placeholder="e.g. 250"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* Location */}
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
                                    placeholder="e.g. Building A - Roof"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* Maintenance */}
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


                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    disabled={creating}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {creating && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    )}

                                    {creating
                                        ? "Adding..."
                                        : "Add Asset"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </AppLayout>
    );
};

export default Assets;
