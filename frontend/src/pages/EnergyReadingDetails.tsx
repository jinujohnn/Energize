
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface EnergyReading {
    id: number;
    asset_id: number;
    energy_produced: string | number | null;
    energy_consumed: string | number | null;
    power_output: string | number | null;
    recorded_at: string;
    created_at: string;
    updated_at: string;
}

interface ReadingResponse {
    reading: EnergyReading;
}

interface UpdateReadingForm {
    energy_produced: string;
    energy_consumed: string;
    power_output: string;
    recorded_at: string;
}

function EnergyReadingDetails() {
    const { projectId, assetId, readingId } = useParams<{
        projectId: string;
        assetId: string;
        readingId: string;
    }>();

    const navigate = useNavigate();

    const [reading, setReading] = useState<EnergyReading | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [form, setForm] = useState<UpdateReadingForm>({
        energy_produced: "",
        energy_consumed: "",
        power_output: "",
        recorded_at: "",
    });

    useEffect(() => {
        if (!projectId || !assetId || !readingId) {
            setError("Invalid reading information.");
            setLoading(false);
            return;
        }

        fetchReading();
    }, [projectId, assetId, readingId]);

    const fetchReading = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<ReadingResponse>(
                `/projects/${projectId}/assets/${assetId}/readings/${readingId}`
            );

            setReading(response.data.reading);
        } catch (err: any) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to load energy reading."
            );
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        if (!reading) return;

        setForm({
            energy_produced:
                reading.energy_produced !== null
                    ? String(reading.energy_produced)
                    : "",
            energy_consumed:
                reading.energy_consumed !== null
                    ? String(reading.energy_consumed)
                    : "",
            power_output:
                reading.power_output !== null
                    ? String(reading.power_output)
                    : "",
            recorded_at: getDateTimeLocalValue(reading.recorded_at),
        });

        setShowEditModal(true);
    };

    const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!projectId || !assetId || !readingId) return;

        try {
            setUpdating(true);
            setError("");

            const response = await api.patch<ReadingResponse>(
                `/projects/${projectId}/assets/${assetId}/readings/${readingId}`,
                {
                    energy_produced:
                        form.energy_produced === ""
                            ? null
                            : Number(form.energy_produced),

                    energy_consumed:
                        form.energy_consumed === ""
                            ? null
                            : Number(form.energy_consumed),

                    power_output:
                        form.power_output === ""
                            ? null
                            : Number(form.power_output),

                    recorded_at: form.recorded_at,
                }
            );

            setReading(response.data.reading);
            setShowEditModal(false);
        } catch (err: any) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to update energy reading."
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!projectId || !assetId || !readingId) return;

        try {
            setDeleting(true);
            setError("");

            await api.delete(
                `/projects/${projectId}/assets/${assetId}/readings/${readingId}`
            );

            navigate(
                `/projects/${projectId}/assets/${assetId}/readings`
            );
        } catch (err: any) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to delete energy reading."
            );

            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const formatNumber = (
        value: string | number | null | undefined
    ): string => {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        return Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDateTime = (value: string): string => {
        if (!value) return "—";

        return new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getDateTimeLocalValue = (value: string): string => {
        if (!value) return "";

        const date = new Date(value);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    if (loading) {
        return (
            <AppLayout
                title="Energy Reading"
                subtitle="Reading Details"
            >
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                        <span>Loading reading...</span>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!reading) {
        return (
            <AppLayout
                title="Energy Reading"
                subtitle="Reading Details"
            >
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <h2 className="text-lg font-semibold text-red-700">
                        Reading not found
                    </h2>

                    <p className="mt-2 text-sm text-red-600">
                        {error || "The requested energy reading could not be found."}
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Energy Reading"
            subtitle="Reading Details"
        >
            <div className="space-y-6 mx-auto max-w-7xl px-6 py-8 md:px-8 ">

                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Link
                        to="/projects"
                        className="transition hover:text-gray-900"
                    >
                        Projects
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/projects/${projectId}`}
                        className="transition hover:text-gray-900"
                    >
                        Project Details
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/projects/${projectId}/assets`}
                        className="transition hover:text-gray-900"
                    >
                        Assets
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/projects/${projectId}/assets/${assetId}`}
                        className="transition hover:text-gray-900"
                    >
                        Asset Details
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/projects/${projectId}/assets/${assetId}/readings`}
                        className="transition hover:text-gray-900"
                    >
                        Energy Readings
                    </Link>

                    <span>/</span>

                    <span className="font-medium text-gray-900">
                        Reading Details
                    </span>
                </nav>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Energy Reading #{reading.id}
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Recorded on {formatDateTime(reading.recorded_at)}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={openEditModal}
                            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Edit Reading
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Reading Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Energy Produced
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {formatNumber(reading.energy_produced)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            kWh
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Energy Consumed
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {formatNumber(reading.energy_consumed)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            kWh
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Power Output
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {formatNumber(reading.power_output)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            kW
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Recorded At
                        </p>

                        <p className="mt-2 text-base font-semibold text-gray-900">
                            {formatDateTime(reading.recorded_at)}
                        </p>
                    </div>
                </div>

                {/* Reading Information */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Reading Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Details about this energy measurement.
                        </p>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Reading ID
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                #{reading.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Asset ID
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                #{reading.asset_id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Recorded At
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatDateTime(reading.recorded_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Created At
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatDateTime(reading.created_at)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Last Updated
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatDateTime(reading.updated_at)}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Edit Energy Reading
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Update the measurement details.
                            </p>
                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5 p-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Energy Produced
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.energy_produced}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            energy_produced: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                    placeholder="Enter energy produced"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Energy Consumed
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.energy_consumed}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            energy_consumed: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                    placeholder="Enter energy consumed"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Power Output
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.power_output}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            power_output: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                    placeholder="Enter power output"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Recorded At
                                </label>

                                <input
                                    type="datetime-local"
                                    required
                                    value={form.recorded_at}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            recorded_at: event.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={updating}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {updating ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Updating...
                                        </span>
                                    ) : (
                                        "Update Reading"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                        <h2 className="text-xl font-semibold text-gray-900">
                            Delete Energy Reading?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            This action cannot be undone. The energy reading
                            will be permanently deleted.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "DELETE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default EnergyReadingDetails;
