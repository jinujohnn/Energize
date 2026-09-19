
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface Project {
    id: number;
    name: string;
}

interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: "pending" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    due_date: string | null;
    created_at: string;
    updated_at: string;
}

interface TaskResponse {
    task: Task;
}

interface EditForm {
    title: string;
    description: string;
    status: Task["status"];
    priority: Task["priority"];
    due_date: string;
}

const TaskDetails = () => {

    const { projectId, taskId } = useParams<{
        projectId: string;
        taskId: string;
    }>();

    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);

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
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
    });


    // Fetch task
    useEffect(() => {

        const fetchTask = async () => {

            if (!projectId || !taskId) {
                setError("Task information is missing.");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const response = await api.get<TaskResponse>(
                    `/projects/${projectId}/tasks/${taskId}`
                );

                setTask(response.data.task);

            } catch (error: any) {

                console.error(error);

                setError(
                    error.response?.data?.message ||
                        "Unable to load task."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchTask();

    }, [projectId, taskId]);


    // Open edit modal
    const openEditModal = () => {

        if (!task) return;

        setForm({
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            due_date: task.due_date
                ? task.due_date.substring(0, 10)
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


    // Update task
    const handleUpdateTask = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (!projectId || !taskId) {
            setEditError("Task information is missing.");
            return;
        }

        try {

            setEditing(true);
            setEditError("");

            const response = await api.patch<TaskResponse>(
                `/projects/${projectId}/tasks/${taskId}`,
                {
                    title: form.title,
                    description: form.description || null,
                    status: form.status,
                    priority: form.priority,
                    due_date: form.due_date || null,
                }
            );

            setTask(response.data.task);

            setShowEditModal(false);

        } catch (error: any) {

            console.error(error);

            setEditError(
                error.response?.data?.message ||
                    "Unable to update task."
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


    // Delete task
    const handleDeleteTask = async () => {

        if (!projectId || !taskId) {

            setDeleteError(
                "Task information is missing."
            );

            return;
        }

        // Exact case-sensitive check
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
                `/projects/${projectId}/tasks/${taskId}`
            );

            navigate(
                `/projects/${projectId}/tasks`,
                { replace: true }
            );

        } catch (error: any) {

            console.error(error);

            setDeleteError(
                error.response?.data?.message ||
                    "Unable to delete task."
            );

        } finally {

            setDeleting(false);

        }
    };


    const getStatusLabel = (
        status: Task["status"]
    ) => {

        switch (status) {

            case "in_progress":
                return "In Progress";

            case "completed":
                return "Completed";

            default:
                return "Pending";
        }
    };


    const getStatusClass = (
        status: Task["status"]
    ) => {

        switch (status) {

            case "completed":
                return "bg-emerald-50 text-emerald-700 ring-emerald-200";

            case "in_progress":
                return "bg-blue-50 text-blue-700 ring-blue-200";

            default:
                return "bg-amber-50 text-amber-700 ring-amber-200";
        }
    };


    const getPriorityClass = (
        priority: Task["priority"]
    ) => {

        switch (priority) {

            case "high":
                return "bg-red-50 text-red-700 ring-red-200";

            case "low":
                return "bg-slate-100 text-slate-600 ring-slate-200";

            default:
                return "bg-indigo-50 text-indigo-700 ring-indigo-200";
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

                        Loading task...

                    </div>

                </div>

            </div>
        );
    }


    if (error || !task) {

        return (
            <div className="min-h-screen bg-slate-50">

                <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">

                    <div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

                        <h2 className="text-xl font-bold text-slate-900">
                            Unable to load task
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error || "Task not found."}
                        </p>

                        <Link
                            to={`/projects/${projectId}/tasks`}
                            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Back to Tasks
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    return (
        <AppLayout title="Asset Details" subtitle="Project Tasks">

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
                            to={`/projects/${projectId}/tasks`}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Tasks
                        </Link>

                        <span className="text-slate-300">
                            /
                        </span>

                        <span className="font-medium text-slate-700">
                            Task Details
                        </span>

                    </div>


                    {/* Title */}
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                        <div>

                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Task
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {task.title}
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                View and manage task information.
                            </p>

                        </div>


                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={openEditModal}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                                Edit Task
                            </button>

                            <button
                                type="button"
                                onClick={openDeleteModal}
                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Delete Task
                            </button>

                        </div>

                    </div>


                    {/* Status / Priority */}
                    <div className="mb-6 grid gap-4 md:grid-cols-2">

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Status
                            </p>

                            <div className="mt-3">

                                <span
                                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ring-1 ${getStatusClass(task.status)}`}
                                >
                                    {getStatusLabel(task.status)}
                                </span>

                            </div>

                        </div>


                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <p className="text-sm font-medium text-slate-500">
                                Priority
                            </p>

                            <div className="mt-3">

                                <span
                                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ring-1 ${getPriorityClass(task.priority)}`}
                                >
                                    {task.priority}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* Description */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-slate-900">
                            Description
                        </h2>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                            {task.description ||
                                "No description provided."}
                        </p>

                    </div>


                    {/* Task Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-slate-900">
                            Task Information
                        </h2>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Due Date
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(task.due_date)}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Created
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(task.created_at)}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Last Updated
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    {formatDate(task.updated_at)}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Task ID
                                </p>

                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                    #{task.id}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Danger Zone */}
                    <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-bold text-red-700">
                            Danger Zone
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Deleting this task is permanent and cannot be undone.
                        </p>

                        <button
                            type="button"
                            onClick={openDeleteModal}
                            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                            Delete Task
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
                                        Edit Task
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Update task information.
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
                            onSubmit={handleUpdateTask}
                            className="space-y-5 px-6 py-6"
                        >

                            {editError && (

                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {editError}
                                </div>

                            )}


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

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
                                                status: e.target
                                                    .value as Task["status"],
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="in_progress">
                                            In Progress
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>

                                    </select>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Priority
                                    </label>

                                    <select
                                        value={form.priority}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                priority: e.target
                                                    .value as Task["priority"],
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="low">
                                            Low
                                        </option>

                                        <option value="medium">
                                            Medium
                                        </option>

                                        <option value="high">
                                            High
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            due_date: e.target.value,
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
                            Delete Task?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Are you sure you need to delete this task?
                            This action cannot be undone.
                        </p>


                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Type <span className="text-red-600">DELETE</span> to confirm
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
                                onClick={handleDeleteTask}
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
                                    : "Delete Task"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </AppLayout>
    );
};

export default TaskDetails;
