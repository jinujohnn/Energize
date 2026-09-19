
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface DashboardData {
    projects: {
        total: number;
    };

    assets: {
        total: number;
        operational: number;
        maintenance: number;
        offline: number;
    };

    tasks: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
    };

    energy: {
        total_produced: number;
        total_consumed: number;
        average_power_output: number;
    };
}

const Dashboard = () => {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);

                const response = await api.get<DashboardData>("/dashboard");

                setDashboard(response.data);
            } catch (error: any) {
                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <AppLayout title="Dashboard" subtitle="Overview">
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />

                        <p className="text-sm text-slate-500">
                            Loading dashboard...
                        </p>
                    </div>
                </div>
            </AppLayout>
            
        );
    }

    if (error) {
        return (
            <AppLayout title="Dashboard" subtitle="Overview">
                <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                    <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            !
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900">
                            Unable to load dashboard
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </AppLayout>
            
        );
    }

    if (!dashboard) {
        return null;
    }

    const completionPercentage =
        dashboard.tasks.total > 0
            ? Math.round(
                  (dashboard.tasks.completed / dashboard.tasks.total) * 100
              )
            : 0;

    return (
        <AppLayout title="Dashboard" subtitle="Overview">

            {/* ================= SIDEBAR ================= */}
            

            {/* ================= MAIN ================= */}

                


                {/* Content */}
                <div className="p-6 lg:p-8">

                    {/* Welcome Banner */}
                    <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm lg:p-8">

                        <div className="relative z-10 max-w-2xl">

                            <p className="text-sm font-medium text-blue-300">
                                Energy Management Platform
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">
                                Welcome back 👋
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-300 lg:text-base">
                                Monitor your projects, manage assets, track
                                tasks and analyze energy performance from one
                                place.
                            </p>

                        </div>

                        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
                        <div className="absolute -bottom-20 right-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />

                    </section>


                    {/* KPI Cards */}
                    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* Projects */}
                        <Link
                            to="/projects"
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Projects
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {dashboard.projects.total}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    ▣
                                </div>

                            </div>

                            <p className="mt-4 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">
                                View projects →
                            </p>
                        </Link>


                        {/* Assets */}
                        <Link
                            to="/assets"
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Assets
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {dashboard.assets.total}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    ◈
                                </div>

                            </div>

                            <p className="mt-4 text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                                View assets →
                            </p>
                        </Link>


                        {/* Tasks */}
                        <Link
                            to="/tasks"
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition"
                        >
                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Tasks
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {dashboard.tasks.total}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    ✓
                                </div>

                            </div>

                            <p className="mt-4 text-xs text-amber-600 opacity-0 group-hover:opacity-100 transition">
                                View tasks →
                            </p>
                        </Link>


                        {/* Average Power */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="flex items-start justify-between">

                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Avg. Power
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-900">
                                        {dashboard.energy.average_power_output}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    ⚡
                                </div>

                            </div>

                            <p className="mt-4 text-xs text-slate-400">
                                Power output
                            </p>

                        </div>

                    </section>


                    {/* Energy Overview */}
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Energy Overview
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Overall energy production and consumption
                                </p>
                            </div>

                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">

                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Total Produced
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {dashboard.energy.total_produced}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Energy units
                                </p>
                            </div>


                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Total Consumed
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {dashboard.energy.total_consumed}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Energy units
                                </p>
                            </div>


                            <div className="rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Average Power Output
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {dashboard.energy.average_power_output}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Average reading
                                </p>
                            </div>

                        </div>

                    </section>


                    {/* Bottom Grid */}
                    <section className="mt-6 grid gap-6 lg:grid-cols-2">

                        {/* Asset Health */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Asset Health
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Current operational status
                                </p>
                            </div>

                            <div className="mt-6 space-y-5">

                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">
                                            Operational
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {dashboard.assets.operational}
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{
                                                width:
                                                    dashboard.assets.total > 0
                                                        ? `${
                                                              (dashboard.assets.operational /
                                                                  dashboard.assets.total) *
                                                              100
                                                          }%`
                                                        : "0%",
                                            }}
                                        />
                                    </div>
                                </div>


                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">
                                            Maintenance
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {dashboard.assets.maintenance}
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-amber-500"
                                            style={{
                                                width:
                                                    dashboard.assets.total > 0
                                                        ? `${
                                                              (dashboard.assets.maintenance /
                                                                  dashboard.assets.total) *
                                                              100
                                                          }%`
                                                        : "0%",
                                            }}
                                        />
                                    </div>
                                </div>


                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">
                                            Offline
                                        </span>

                                        <span className="font-semibold text-slate-900">
                                            {dashboard.assets.offline}
                                        </span>
                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-red-500"
                                            style={{
                                                width:
                                                    dashboard.assets.total > 0
                                                        ? `${
                                                              (dashboard.assets.offline /
                                                                  dashboard.assets.total) *
                                                              100
                                                          }%`
                                                        : "0%",
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>


                        {/* Task Progress */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Task Progress
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Current task completion
                                </p>
                            </div>

                            <div className="mt-6">

                                <div className="flex items-end justify-between">

                                    <div>
                                        <p className="text-4xl font-bold text-slate-900">
                                            {completionPercentage}%
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Tasks completed
                                        </p>
                                    </div>

                                    <div className="text-right text-sm text-slate-500">
                                        <p>
                                            {dashboard.tasks.completed} of{" "}
                                            {dashboard.tasks.total}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${completionPercentage}%`,
                                        }}
                                    />
                                </div>

                            </div>


                            <div className="mt-7 grid grid-cols-3 gap-3">

                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">
                                        Pending
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {dashboard.tasks.pending}
                                    </p>
                                </div>


                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">
                                        In Progress
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {dashboard.tasks.in_progress}
                                    </p>
                                </div>


                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">
                                        Completed
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {dashboard.tasks.completed}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </section>

                </div>


        </AppLayout>
    );
};

export default Dashboard;
