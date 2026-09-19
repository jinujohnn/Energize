
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface Project {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    project_id: number;
    name: string;
    type: string;
    status: string;
    location: string | null;
    capacity: string | number | null;
    last_maintenance_at: string | null;
    created_at: string;
    updated_at: string;
    project: Project;
}

interface AssetsResponse {
    assets: Asset[];
}

function AssetsDashboard() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<AssetsResponse>("/assets");

            setAssets(response.data.assets);
        } catch (err: any) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to load assets."
            );
        } finally {
            setLoading(false);
        }
    };

    const assetTypes = useMemo(() => {
        return Array.from(
            new Set(
                assets
                    .map((asset) => asset.type)
                    .filter(Boolean)
            )
        );
    }, [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                asset.name.toLowerCase().includes(searchValue) ||
                asset.type.toLowerCase().includes(searchValue) ||
                asset.location
                    ?.toLowerCase()
                    .includes(searchValue) ||
                asset.project?.name
                    .toLowerCase()
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

    const totalAssets = assets.length;

    const activeAssets = assets.filter(
        (asset) => asset.status.toLowerCase() === "active"
    ).length;

    const inactiveAssets = assets.filter(
        (asset) =>
            asset.status.toLowerCase() === "inactive"
    ).length;

    const maintenanceAssets = assets.filter(
        (asset) =>
            asset.status.toLowerCase() === "maintenance"
    ).length;

    const formatCapacity = (
        capacity: string | number | null
    ) => {
        if (
            capacity === null ||
            capacity === undefined ||
            capacity === ""
        ) {
            return "—";
        }

        return Number(capacity).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-700";

            case "inactive":
                return "bg-gray-100 text-gray-700";

            case "maintenance":
                return "bg-yellow-100 text-yellow-700";

            case "offline":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <AppLayout
            title="Assets"
            subtitle="Asset Management"
        >
            <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        All Assets
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage assets across all your projects.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Assets
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {totalAssets}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {activeAssets}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Maintenance
                        </p>

                        <p className="mt-2 text-2xl font-bold text-yellow-600">
                            {maintenanceAssets}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Inactive
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-600">
                            {inactiveAssets}
                        </p>
                    </div>

                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">

                        {/* Search */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search assets or projects..."
                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                            >
                                <option value="all">
                                    All Statuses
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>

                                <option value="maintenance">
                                    Maintenance
                                </option>

                                <option value="offline">
                                    Offline
                                </option>
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Type
                            </label>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                            >
                                <option value="all">
                                    All Types
                                </option>

                                {assetTypes.map((type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* Assets Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-100 px-6 py-5">
                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Assets
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredAssets.length} asset
                                    {filteredAssets.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fetchAssets}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Refresh
                            </button>

                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <div className="flex items-center gap-3 text-gray-500">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />

                                <span>
                                    Loading assets...
                                </span>
                            </div>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                No assets found
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Asset
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Project
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Type
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Capacity
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Maintenance
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAssets.map((asset) => (
                                            <tr
                                                key={asset.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {asset.name}
                                                        </p>

                                                        {asset.location && (
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                {asset.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/projects/${asset.project_id}`}
                                                        className="text-sm font-medium text-gray-700 transition hover:text-gray-900 hover:underline"
                                                    >
                                                        {asset.project?.name ||
                                                            "Unknown Project"}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {asset.type}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            asset.status
                                                        )}`}
                                                    >
                                                        {asset.status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatCapacity(
                                                        asset.capacity
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(
                                                        asset.last_maintenance_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/projects/${asset.project_id}/assets/${asset.id}`}
                                                        className="text-sm font-medium text-gray-900 hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="divide-y divide-gray-100 md:hidden">
                                {filteredAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="space-y-4 p-5"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {asset.name}
                                            </h3>

                                            {asset.location && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {asset.location}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {asset.type}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    asset.status
                                                )}`}
                                            >
                                                {asset.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">
                                                    Project
                                                </span>

                                                <Link
                                                    to={`/projects/${asset.project_id}`}
                                                    className="font-medium text-gray-900 hover:underline"
                                                >
                                                    {asset.project?.name ||
                                                        "Unknown Project"}
                                                </Link>
                                            </div>

                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">
                                                    Capacity
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    {formatCapacity(
                                                        asset.capacity
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">
                                                    Maintenance
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    {formatDate(
                                                        asset.last_maintenance_at
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/projects/${asset.project_id}/assets/${asset.id}`}
                                            className="block rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            View Asset
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}

export default AssetsDashboard;
