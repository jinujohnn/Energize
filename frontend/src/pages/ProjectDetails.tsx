
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

interface ProjectResponse {
    project: Project;
}

interface EditProjectForm {
    name: string;
    description: string;
    location: string;
    status: "active" | "completed" | "archived";
}

const ProjectDetails = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // Edit State
    // =========================

    const [showEditModal, setShowEditModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState("");

    const [form, setForm] = useState<EditProjectForm>({
        name: "",
        description: "",
        location: "",
        status: "active",
    });

    // =========================
    // Delete State
    // =========================

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // =========================
    // Fetch Project
    // =========================

    const fetchProject = async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get<ProjectResponse>(
                `/projects/${projectId}`
            );

            setProject(response.data.project);
        } catch (error: any) {
            console.error(error);

            if (error.response?.status === 404) {
                setError("Project not found.");
            } else {
                setError(
                    error.response?.data?.message ||
                        "Unable to load project."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    // =========================
    // Edit
    // =========================

    const openEditModal = () => {
        if (!project) {
            return;
        }

        setForm({
            name: project.name,
            description: project.description || "",
            location: project.location || "",
            status: project.status,
        });

        setUpdateError("");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (updating) {
            return;
        }

        setShowEditModal(false);
        setUpdateError("");
    };

    const handleUpdateProject = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!projectId) {
            setUpdateError("Project ID is missing.");
            return;
        }

        if (!form.name.trim()) {
            setUpdateError("Project name is required.");
            return;
        }

        try {
            setUpdating(true);
            setUpdateError("");

            const response = await api.patch<ProjectResponse>(
                `/projects/${projectId}`,
                {
                    name: form.name.trim(),
                    description:
                        form.description.trim() || null,
                    location:
                        form.location.trim() || null,
                    status: form.status,
                }
            );

            setProject(response.data.project);
            setShowEditModal(false);
        } catch (error: any) {
            console.error(error);

            if (error.response?.status === 422) {
                const validationErrors =
                    error.response.data?.errors;

                if (validationErrors) {
                    const firstError = Object.values(
                        validationErrors
                    )[0] as string[];

                    setUpdateError(
                        firstError?.[0] ||
                            "Please check the form fields."
                    );
                } else {
                    setUpdateError(
                        "Please check the form fields."
                    );
                }
            } else {
                setUpdateError(
                    error.response?.data?.message ||
                        "Unable to update project."
                );
            }
        } finally {
            setUpdating(false);
        }
    };

    // =========================
    // Delete
    // =========================

    const openDeleteModal = () => {
        setConfirmationText("");
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) {
            return;
        }

        setShowDeleteModal(false);
        setConfirmationText("");
        setDeleteError("");
    };

    const handleDeleteProject = async () => {
        if (!projectId) {
            setDeleteError("Project ID is missing.");
            return;
        }

        // Strict confirmation check
        if (confirmationText !== "DELETE") {
            setDeleteError(
                'Please type "DELETE" exactly as shown.'
            );
            return;
        }

        try {
            setDeleting(true);
            setDeleteError("");

            await api.delete(`/projects/${projectId}`);

            // Project was successfully deleted.
            navigate("/projects", {
                replace: true,
            });
        } catch (error: any) {
            console.error(error);

            setDeleteError(
                error.response?.data?.message ||
                    "Unable to delete project. Please try again."
            );
        } finally {
            setDeleting(false);
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

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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
    // Loading
    // =========================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />

                    <p className="text-sm text-slate-500">
                        Loading project...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // Error
    // =========================

    if (error || !project) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 text-xl">
                        !
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        {error || "Project not found"}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        The project may have been deleted or you may not have
                        access to it.
                    </p>

                    <Link
                        to="/projects"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                        ← Back to Projects
                    </Link>

                </div>
            </div>
        );
    }

    const status = getStatusStyle(project.status);

    return (
        <AppLayout title="Project Details" subtitle="Project Management">

                {/* Content */}

                <div className="p-6 lg:p-8">

                    {/* Breadcrumb */}

                    <div className="mb-6 flex items-center gap-2 text-sm">

                        <Link
                            to="/projects"
                            className="text-slate-400 hover:text-blue-600 transition"
                        >
                            Projects
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <span className="font-medium text-slate-700">
                            {project.name}
                        </span>

                    </div>


                    {/* Project Hero */}

                    <section className="overflow-hidden rounded-2xl bg-slate-900 text-white shadow-sm">

                        <div className="relative p-6 lg:p-8">

                            <div className="relative z-10">

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    <div className="flex items-start gap-4">

                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
                                            {project.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                                    {project.name}
                                                </h1>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                    />

                                                    {status.label}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm text-slate-400">
                                                Project #{project.id}
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={openEditModal}
                                        className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                    >
                                        Edit Project
                                    </button>

                                </div>


                                <div className="mt-8 max-w-3xl">

                                    <p className="text-sm leading-7 text-slate-300">
                                        {project.description ||
                                            "No description has been added to this project yet."}
                                    </p>

                                </div>


                                <div className="mt-8 flex flex-wrap gap-6">

                                    {project.location && (
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Location
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-200">
                                                {project.location}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-200">
                                            {formatDate(project.created_at)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-200">
                                            {formatDate(project.updated_at)}
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

                            <div className="absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                        </div>

                    </section>


                    {/* ================= RESOURCES ================= */}

                    <section className="mt-6">

                        <div className="mb-4">

                            <h2 className="text-lg font-bold">
                                Project Resources
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage the assets and tasks associated with
                                this project.
                            </p>

                        </div>


                        <div className="grid gap-5 md:grid-cols-2">

                            {/* Assets */}

                            <Link
                                to={`/projects/${project.id}/assets`}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                                        ◈
                                    </div>

                                    <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                                        →
                                    </span>

                                </div>

                                <h3 className="mt-5 text-lg font-bold">
                                    Assets
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    View and manage the energy assets
                                    belonging to this project.
                                </p>

                                <div className="mt-5 text-sm font-semibold text-blue-600">
                                    Manage Assets →
                                </div>

                            </Link>


                            {/* Tasks */}

                            <Link
                                to={`/projects/${project.id}/tasks`}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
                                        ✓
                                    </div>

                                    <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                                        →
                                    </span>

                                </div>

                                <h3 className="mt-5 text-lg font-bold">
                                    Tasks
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Track, manage and update tasks associated
                                    with this project.
                                </p>

                                <div className="mt-5 text-sm font-semibold text-blue-600">
                                    Manage Tasks →
                                </div>

                            </Link>

                        </div>

                    </section>


                    {/* ================= PROJECT INFORMATION ================= */}

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div>

                            <h2 className="text-lg font-bold">
                                Project Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Basic information about this project.
                            </p>

                        </div>


                        <div className="mt-6 divide-y divide-slate-100">

                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Project ID
                                </span>

                                <span className="text-sm font-semibold">
                                    #{project.id}
                                </span>
                            </div>


                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Status
                                </span>

                                <span className="text-sm font-semibold capitalize">
                                    {project.status}
                                </span>
                            </div>


                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Location
                                </span>

                                <span className="text-sm font-semibold">
                                    {project.location || "Not specified"}
                                </span>
                            </div>


                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Created At
                                </span>

                                <span className="text-sm font-semibold">
                                    {formatDateTime(project.created_at)}
                                </span>
                            </div>


                            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-sm text-slate-500">
                                    Last Updated
                                </span>

                                <span className="text-sm font-semibold">
                                    {formatDateTime(project.updated_at)}
                                </span>
                            </div>

                        </div>

                    </section>


                    {/* ================= DANGER ZONE ================= */}

                    <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                        !
                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        Danger Zone
                                    </h2>

                                </div>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    Deleting this project is permanent. Make
                                    sure you no longer need this project before
                                    continuing.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={openDeleteModal}
                                className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                            >
                                Delete Project
                            </button>

                        </div>

                    </section>


                    {/* Back */}

                    <div className="mt-6">

                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
                        >
                            ← Back to all projects
                        </Link>

                    </div>

                </div>




            {/* ================= EDIT MODAL ================= */}

            {showEditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-bold">
                                    Edit Project
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update the details of your project.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={updating}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-50"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleUpdateProject}
                            className="space-y-5 p-6"
                        >

                            {updateError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {updateError}
                                </div>
                            )}


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
                                    disabled={updating}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                />

                            </div>


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
                                    disabled={updating}
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                />

                            </div>


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
                                    disabled={updating}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                                />

                            </div>


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
                                                .value as EditProjectForm["status"],
                                        })
                                    }
                                    disabled={updating}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
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


                            <div className="flex justify-end gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={updating}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="inline-flex min-w-[145px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-70"
                                >
                                    {updating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* ================= DELETE MODAL ================= */}

            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                >

                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Header */}

                        <div className="border-b border-slate-100 px-6 py-5">

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                    !
                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        Delete Project
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        This action cannot be undone.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* Content */}

                        <div className="p-6">

                            <p className="text-sm leading-6 text-slate-600">

                                Are you sure you want to permanently delete{" "}
                                <span className="font-semibold text-slate-900">
                                    "{project.name}"
                                </span>
                                ?

                            </p>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                This will remove the project from your account.
                                Make sure you really want to continue.
                            </p>


                            {/* Confirmation */}

                            <div className="mt-6">

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

                                    Type{" "}
                                    <span className="font-bold text-red-600">
                                        DELETE
                                    </span>{" "}
                                    to confirm

                                </label>

                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(event) =>
                                        setConfirmationText(
                                            event.target.value
                                        )
                                    }
                                    disabled={deleting}
                                    placeholder="DELETE"
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium  tracking-wider outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10 disabled:bg-slate-50"
                                />

                            </div>


                            {/* Error */}

                            {deleteError && (
                                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                    {deleteError}
                                </div>
                            )}


                            {/* Buttons */}

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={deleting}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDeleteProject}
                                    disabled={
                                        deleting ||
                                        confirmationText !== "DELETE"
                                    }
                                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {deleting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Project"
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </AppLayout>
    );
};

export default ProjectDetails;
