
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface Project {
    id: number;
    name: string;
    description: string | null;
    location: string | null;
    status: "active" | "completed" | "archived";
    created_at: string;
    updated_at: string;
}

interface ProjectsResponse {
    projects: Project[];
}

interface CreateProjectForm {
    name: string;
    description: string;
    location: string;
    status: "active" | "completed" | "archived";
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "active" | "completed" | "archived"
    >("all");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState<CreateProjectForm>({
        name: "",
        description: "",
        location: "",
        status: "active",
    });

    // =========================
    // Fetch Projects
    // =========================

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<ProjectsResponse>("/projects");

            setProjects(response.data.projects);
        } catch (error: any) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Unable to load projects. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // =========================
    // Filter Projects
    // =========================

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                project.name.toLowerCase().includes(searchValue) ||
                project.description
                    ?.toLowerCase()
                    .includes(searchValue) ||
                project.location
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                project.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, search, statusFilter]);

    // =========================
    // Create Project
    // =========================

    const handleCreateProject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setCreateError("Project name is required.");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");

            const response = await api.post<{ project: Project }>(
                "/projects",
                {
                    name: form.name.trim(),
                    description: form.description.trim() || null,
                    location: form.location.trim() || null,
                    status: form.status,
                }
            );

            setProjects((currentProjects) => [
                response.data.project,
                ...currentProjects,
            ]);

            setForm({
                name: "",
                description: "",
                location: "",
                status: "active",
            });

            setShowCreateModal(false);
        } catch (error: any) {
            console.error(error);

            setCreateError(
                error.response?.data?.message ||
                    "Unable to create project."
            );
        } finally {
            setCreating(false);
        }
    };

    // =========================
    // Helpers
    // =========================

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusStyle = (status: Project["status"]) => {
        switch (status) {
            case "active":
                return {
                    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    dot: "bg-emerald-500",
                    label: "Active",
                };

            case "completed":
                return {
                    badge: "bg-blue-50 text-blue-700 border-blue-200",
                    dot: "bg-blue-500",
                    label: "Completed",
                };

            case "archived":
                return {
                    badge: "bg-slate-100 text-slate-600 border-slate-200",
                    dot: "bg-slate-400",
                    label: "Archived",
                };
        }
    };

    // =========================
    // Loading State
    // =========================

    if (loading) {
        return (
            <AppLayout title="Project Details" subtitle="Project Management">
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />

                        <p className="text-sm text-slate-500">
                            Loading projects...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // =========================
    // Main UI
    // =========================

    return (
        <AppLayout title="Project Details" subtitle="Project Management">


                {/* Content */}

                <div className="p-6 lg:p-8">

                    {/* Page Heading */}

                    <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                        <div>
                            <p className="text-sm font-medium text-blue-600">
                                Project Management
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Your Projects
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Manage your energy projects, monitor their
                                progress and access project resources.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setCreateError("");
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                        >
                            <span className="text-lg leading-none">
                                +
                            </span>

                            New Project
                        </button>

                    </section>


                    {/* Statistics */}

                    <section className="mt-7 grid gap-4 sm:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <p className="text-sm text-slate-500">
                                Total Projects
                            </p>

                            <p className="mt-2 text-3xl font-bold">
                                {projects.length}
                            </p>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <p className="text-sm text-slate-500">
                                Active Projects
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {
                                    projects.filter(
                                        (project) =>
                                            project.status === "active"
                                    ).length
                                }
                            </p>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                            <p className="text-sm text-slate-500">
                                Completed Projects
                            </p>

                            <p className="mt-2 text-3xl font-bold text-blue-600">
                                {
                                    projects.filter(
                                        (project) =>
                                            project.status === "completed"
                                    ).length
                                }
                            </p>

                        </div>

                    </section>


                    {/* Search & Filter */}

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="flex flex-col gap-3 md:flex-row">

                            {/* Search */}

                            <div className="relative flex-1">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search projects..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                />

                            </div>


                            {/* Status Filter */}

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value as
                                            | "all"
                                            | "active"
                                            | "completed"
                                            | "archived"
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                            >
                                <option value="all">
                                    All Statuses
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                                <option value="archived">
                                    Archived
                                </option>
                            </select>

                        </div>

                    </section>


                    {/* Error */}

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    !
                                </div>

                                <div className="flex-1">

                                    <h3 className="font-semibold text-red-900">
                                        Unable to load projects
                                    </h3>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error}
                                    </p>

                                    <button
                                        onClick={fetchProjects}
                                        className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900"
                                    >
                                        Try again →
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* Project List */}

                    {!error && filteredProjects.length === 0 ? (

                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                                ▣
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                {projects.length === 0
                                    ? "No projects yet"
                                    : "No matching projects"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {projects.length === 0
                                    ? "Create your first energy project to start managing assets, tasks and energy readings."
                                    : "Try changing your search or status filter."}
                            </p>

                            {projects.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(true)
                                    }
                                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                                >
                                    Create your first project
                                </button>
                            )}

                        </div>

                    ) : (

                        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {filteredProjects.map((project) => {

                                const status =
                                    getStatusStyle(project.status);

                                return (
                                    <article
                                        key={project.id}
                                        className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                                    >

                                        {/* Card Header */}

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                                                {project.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                />

                                                {status.label}
                                            </span>

                                        </div>


                                        {/* Project Info */}

                                        <div className="mt-5 flex-1">

                                            <h3 className="text-lg font-bold text-slate-900">
                                                {project.name}
                                            </h3>

                                            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                                                {project.description ||
                                                    "No description provided for this project."}
                                            </p>


                                            {/* Location */}

                                            {project.location && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                                    <span className="text-slate-400">
                                                        ●
                                                    </span>

                                                    <span>
                                                        {project.location}
                                                    </span>
                                                </div>
                                            )}

                                        </div>


                                        {/* Footer */}

                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Created
                                                </p>

                                                <p className="mt-1 text-xs font-medium text-slate-600">
                                                    {formatDate(
                                                        project.created_at
                                                    )}
                                                </p>
                                            </div>


                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
                                            >
                                                View Project
                                                <span>
                                                    →
                                                </span>
                                            </Link>

                                        </div>

                                    </article>
                                );
                            })}

                        </section>

                    )}

                </div>




            {/* ================= CREATE PROJECT MODAL ================= */}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Create Project
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Add a new energy management project.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateModal(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                ×
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleCreateProject}
                            className="space-y-5 p-6"
                        >

                            {/* Error */}

                            {createError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {createError}
                                </div>
                            )}


                            {/* Name */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Project Name
                                </label>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value,
                                        })
                                    }
                                    placeholder="e.g. Solar Plant Installation"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    disabled={creating}
                                />
                            </div>


                            {/* Description */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            description:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Describe the project..."
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    disabled={creating}
                                />
                            </div>


                            {/* Location */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            location:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="e.g. Palakkad, Kerala"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    disabled={creating}
                                />
                            </div>


                            {/* Status */}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Status
                                </label>

                                <select
                                    value={form.status}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            status: event.target
                                                .value as CreateProjectForm["status"],
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    disabled={creating}
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="archived">
                                        Archived
                                    </option>
                                </select>
                            </div>


                            {/* Buttons */}

                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateModal(false)
                                    }
                                    disabled={creating}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {creating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Project"
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </AppLayout>
    );
};

export default Projects;
