
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: "pending" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    due_date: string | null;
    created_at: string;
    updated_at: string;
}

interface TasksResponse {
    tasks: Task[];
}

interface CreateTaskForm {
    title: string;
    description: string;
    status: Task["status"];
    priority: Task["priority"];
    due_date: string;
}

const Tasks = () => {
    const { projectId } = useParams<{ projectId: string }>();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [form, setForm] = useState<CreateTaskForm>({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
    });

    const fetchTasks = async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get<TasksResponse>(
                `/projects/${projectId}/tasks`
            );

            setTasks(response.data.tasks);
        } catch (error: any) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Unable to load tasks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                task.description
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                task.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                task.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const statistics = {
        total: tasks.length,
        pending: tasks.filter(
            (task) => task.status === "pending"
        ).length,
        inProgress: tasks.filter(
            (task) => task.status === "in_progress"
        ).length,
        completed: tasks.filter(
            (task) => task.status === "completed"
        ).length,
    };

    const openCreateModal = () => {
        setForm({
            title: "",
            description: "",
            status: "pending",
            priority: "medium",
            due_date: "",
        });

        setCreateError("");
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (creating) return;

        setShowCreateModal(false);
        setCreateError("");
    };

    const handleCreateTask = async (
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

            const response = await api.post<{ task: Task }>(
                `/projects/${projectId}/tasks`,
                {
                    title: form.title,
                    description: form.description || null,
                    status: form.status,
                    priority: form.priority,
                    due_date: form.due_date || null,
                }
            );

            setTasks((currentTasks) => [
                response.data.task,
                ...currentTasks,
            ]);

            setShowCreateModal(false);

            setForm({
                title: "",
                description: "",
                status: "pending",
                priority: "medium",
                due_date: "",
            });
        } catch (error: any) {
            console.error(error);

            setCreateError(
                error.response?.data?.message ||
                    "Unable to create task. Please check your input."
            );
        } finally {
            setCreating(false);
        }
    };

    const getStatusLabel = (status: Task["status"]) => {
        switch (status) {
            case "in_progress":
                return "In Progress";
            case "completed":
                return "Completed";
            default:
                return "Pending";
        }
    };

    const getStatusClass = (status: Task["status"]) => {
        switch (status) {
            case "completed":
                return "bg-emerald-50 text-emerald-700 ring-emerald-200";
            case "in_progress":
                return "bg-blue-50 text-blue-700 ring-blue-200";
            default:
                return "bg-amber-50 text-amber-700 ring-amber-200";
        }
    };

    const getPriorityClass = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "bg-red-50 text-red-700 ring-red-200";
            case "low":
                return "bg-slate-100 text-slate-600 ring-slate-200";
            default:
                return "bg-indigo-50 text-indigo-700 ring-indigo-200";
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return "No due date";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <AppLayout title="Tasks" subtitle="Project Tasks">

                <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">

                    {/* Breadcrumb */}
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                        <Link
                            to="/projects"
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Projects
                        </Link>

                        <span className="text-slate-300">/</span>

                        <Link
                            to={`/projects/${projectId}`}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Project Details
                        </Link>

                        <span className="text-slate-300">/</span>

                        <span className="font-medium text-slate-700">
                            Tasks
                        </span>
                    </div>

                    {/* Page title */}
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Project Tasks
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Manage Tasks
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                Create, organize and track tasks for this project.
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
                            Create Task
                        </button>

                    </div>

                    {/* Statistics */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total Tasks
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {statistics.total}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Pending
                            </p>
                            <p className="mt-2 text-3xl font-bold text-amber-600">
                                {statistics.pending}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                In Progress
                            </p>
                            <p className="mt-2 text-3xl font-bold text-blue-600">
                                {statistics.inProgress}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Completed
                            </p>
                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {statistics.completed}
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
                                    placeholder="Search tasks..."
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

                            <select
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="all">
                                    All Priorities
                                </option>
                                <option value="high">
                                    High
                                </option>
                                <option value="medium">
                                    Medium
                                </option>
                                <option value="low">
                                    Low
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
                                Loading tasks...
                            </div>
                        </div>
                    ) : filteredTasks.length === 0 ? (

                        /* Empty */
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
                                ✓
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                {tasks.length === 0
                                    ? "No tasks yet"
                                    : "No matching tasks"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                {tasks.length === 0
                                    ? "Create your first task to start managing work for this project."
                                    : "Try changing your search or filters."}
                            </p>

                            {tasks.length === 0 && (
                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Create First Task
                                </button>
                            )}

                        </div>

                    ) : (

                        /* Task list */
                        <div className="space-y-4">
                            {filteredTasks.map((task) => (

                                <div
                                    key={task.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                >

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        {/* Task information */}
                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {task.title}
                                                </h3>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(task.status)}`}
                                                >
                                                    {getStatusLabel(task.status)}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getPriorityClass(task.priority)}`}
                                                >
                                                    {task.priority}
                                                </span>

                                            </div>

                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {task.description ||
                                                    "No description provided."}
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm">

                                                <div>
                                                    <span className="text-slate-400">
                                                        Due
                                                    </span>

                                                    <span className="ml-2 font-medium text-slate-700">
                                                        {formatDate(task.due_date)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-slate-400">
                                                        Created
                                                    </span>

                                                    <span className="ml-2 font-medium text-slate-700">
                                                        {formatDate(task.created_at)}
                                                    </span>
                                                </div>

                                            </div>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex shrink-0 items-center">

                                            <Link
                                                to={`/projects/${projectId}/tasks/${task.id}`}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                View Task
                                                <span>→</span>
                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            ))}
                        </div>

                    )}

                </div>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Create Task
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Add a new task to this project.
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
                            onSubmit={handleCreateTask}
                            className="space-y-5 px-6 py-6"
                        >

                            {createError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {createError}
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
                                    placeholder="Enter task title"
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
                                    placeholder="Describe the task..."
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
                                        ? "Creating..."
                                        : "Create Task"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default Tasks;
