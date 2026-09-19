
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface EnergyReading {
    id: number;
    asset_id: number;
    energy_produced: number | string | null;
    energy_consumed: number | string | null;
    power_output: number | string | null;
    recorded_at: string;
    created_at: string;
    updated_at: string;
}

interface ReadingsResponse {
    readings: EnergyReading[];
}

interface ReadingForm {
    energy_produced: string;
    energy_consumed: string;
    power_output: string;
    recorded_at: string;
}

const EnergyReadings = () => {
    const { projectId, assetId } = useParams<{
        projectId: string;
        assetId: string;
    }>();

    const [readings, setReadings] = useState<EnergyReading[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState<ReadingForm>({
        energy_produced: "",
        energy_consumed: "",
        power_output: "",
        recorded_at: "",
    });

    useEffect(() => {
        const fetchReadings = async () => {
            if (!projectId || !assetId) {
                setError(
                    "Project or asset information is missing."
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get<ReadingsResponse>(
                        `/projects/${projectId}/assets/${assetId}/readings`
                    );

                setReadings(response.data.readings);
            } catch (error: any) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Unable to load energy readings. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReadings();
    }, [projectId, assetId]);

    const filteredReadings = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) {
            return readings;
        }

        return readings.filter((reading) => {
            return (
                String(reading.energy_produced ?? "")
                    .toLowerCase()
                    .includes(query) ||
                String(reading.energy_consumed ?? "")
                    .toLowerCase()
                    .includes(query) ||
                String(reading.power_output ?? "")
                    .toLowerCase()
                    .includes(query) ||
                formatDateTime(reading.recorded_at)
                    .toLowerCase()
                    .includes(query)
            );
        });
    }, [readings, search]);

    const totalProduced = readings.reduce(
        (total, reading) =>
            total +
            Number(reading.energy_produced ?? 0),
        0
    );

    const totalConsumed = readings.reduce(
        (total, reading) =>
            total +
            Number(reading.energy_consumed ?? 0),
        0
    );

    const averagePower =
        readings.length > 0
            ? readings.reduce(
                  (total, reading) =>
                      total +
                      Number(
                          reading.power_output ?? 0
                      ),
                  0
              ) / readings.length
            : 0;

    const openCreateModal = () => {
        setForm({
            energy_produced: "",
            energy_consumed: "",
            power_output: "",
            recorded_at: getCurrentDateTime(),
        });

        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (creating) return;

        setShowCreateModal(false);
        setCreateError("");
    };

    const handleCreateReading = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId || !assetId) {
            setCreateError(
                "Project or asset information is missing."
            );
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const response =
                await api.post<{
                    message: string;
                    reading: EnergyReading;
                }>(
                    `/projects/${projectId}/assets/${assetId}/readings`,
                    {
                        energy_produced:
                            form.energy_produced === ""
                                ? null
                                : Number(
                                      form.energy_produced
                                  ),

                        energy_consumed:
                            form.energy_consumed === ""
                                ? null
                                : Number(
                                      form.energy_consumed
                                  ),

                        power_output:
                            form.power_output === ""
                                ? null
                                : Number(
                                      form.power_output
                                  ),

                        recorded_at:
                            form.recorded_at,
                    }
                );

            setReadings((current) => [
                response.data.reading,
                ...current,
            ]);

            setShowCreateModal(false);
        } catch (error: any) {
            console.error(error);

            setCreateError(
                error.response?.data?.message ||
                    "Unable to create energy reading. Please check your input."
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                        Loading energy readings...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
                    <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900">
                            Unable to load readings
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>

                        <Link
                            to={`/projects/${projectId}/assets/${assetId}`}
                            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Back to Asset
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AppLayout title="Energy Readings" subtitle="Asset Monitoring" >

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

                        <Link
                            to={`/projects/${projectId}/assets/${assetId}`}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Asset Details
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <span className="font-medium text-slate-700">
                            Energy Readings
                        </span>

                    </div>

                    {/* Page Heading */}
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Energy Monitoring
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Energy Readings
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Monitor energy production, consumption,
                                and power output for this asset.
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <Link
                                to={`/projects/${projectId}/assets/${assetId}`}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                Back to Asset
                            </Link>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                + Add Reading
                            </button>

                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total Readings
                            </p>

                            <p className="mt-3 text-2xl font-bold text-slate-900">
                                {readings.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Energy Produced
                            </p>

                            <p className="mt-3 text-2xl font-bold text-emerald-600">
                                {totalProduced.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Energy Consumed
                            </p>

                            <p className="mt-3 text-2xl font-bold text-amber-600">
                                {totalConsumed.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Average Power
                            </p>

                            <p className="mt-3 text-2xl font-bold text-blue-600">
                                {averagePower.toFixed(2)}
                            </p>
                        </div>

                    </div>

                    {/* Search */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search readings..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <h2 className="text-lg font-bold text-slate-900">
                                Reading History
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {filteredReadings.length} reading
                                {filteredReadings.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                displayed
                            </p>

                        </div>

                        {filteredReadings.length === 0 ? (

                            <div className="px-6 py-16 text-center">

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                                    ⚡
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-900">
                                    No readings found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                    {search
                                        ? "Try changing your search."
                                        : "Add the first energy reading for this asset."}
                                </p>

                                {!search && (
                                    <button
                                        type="button"
                                        onClick={openCreateModal}
                                        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        + Add Reading
                                    </button>
                                )}

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[850px]">

                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Recorded At
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Produced
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Consumed
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Power Output
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredReadings.map(
                                            (reading) => (
                                                <tr
                                                    key={reading.id}
                                                    className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                                                >

                                                    <td className="px-6 py-5">

                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {formatDateTime(
                                                                reading.recorded_at
                                                            )}
                                                        </p>

                                                    </td>

                                                    <td className="px-6 py-5">

                                                        <span className="font-semibold text-emerald-600">
                                                            {formatNumber(
                                                                reading.energy_produced
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-5">

                                                        <span className="font-semibold text-amber-600">
                                                            {formatNumber(
                                                                reading.energy_consumed
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-5">

                                                        <span className="font-semibold text-blue-600">
                                                            {formatNumber(
                                                                reading.power_output
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-5 text-right">

                                                        <Link
                                                            to={`/projects/${projectId}/assets/${assetId}/readings/${reading.id}`}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            View
                                                            <span>
                                                                →
                                                            </span>
                                                        </Link>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>


            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Add Energy Reading
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Record energy data for this asset.
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
                            onSubmit={handleCreateReading}
                            className="space-y-5 px-6 py-6"
                        >

                            {createError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {createError}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Energy Produced
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.energy_produced}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                energy_produced:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Energy Consumed
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={form.energy_consumed}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                energy_consumed:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Power Output
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={form.power_output}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            power_output:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Recorded At
                                </label>

                                <input
                                    type="datetime-local"
                                    required
                                    value={form.recorded_at}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            recorded_at:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

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
                                        ? "Saving..."
                                        : "Save Reading"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </AppLayout>
    );
};

const formatNumber = (
    value: number | string | null
): string => {
    if (value === null || value === "") {
        return "—";
    }

    return Number(value).toFixed(2);
};

const formatDateTime = (
    value: string
): string => {
    return new Date(value).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

const getCurrentDateTime = (): string => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        now.getDate()
    ).padStart(2, "0");
    const hours = String(
        now.getHours()
    ).padStart(2, "0");
    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default EnergyReadings;
