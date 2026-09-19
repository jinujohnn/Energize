
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    status: string;
    priority: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    project: Project;
}

interface TasksResponse {
    tasks: Task[];
}

function TasksDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<TasksResponse>("/tasks");

            setTasks(response.data.tasks);
        } catch (err: any) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Failed to load tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                task.title.toLowerCase().includes(searchValue) ||
                task.description?.toLowerCase().includes(searchValue) ||
                task.project?.name.toLowerCase().includes(searchValue);

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

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
        (task) =>
            task.status === "pending" ||
            task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) =>
            task.status === "in_progress" ||
            task.status === "in-progress"
    ).length;

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
            case "completed":
            case "complete":
                return "bg-green-100 text-green-700";

            case "in_progress":
            case "in-progress":
            case "in progress":
                return "bg-blue-100 text-blue-700";

            case "pending":
            case "todo":
            case "to_do":
                return "bg-yellow-100 text-yellow-700";

            case "cancelled":
            case "canceled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high":
                return "bg-red-100 text-red-700";

            case "medium":
                return "bg-yellow-100 text-yellow-700";

            case "low":
                return "bg-green-100 text-green-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <AppLayout
            title="Tasks"
            subtitle="Task Management"
        >
            <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        All Tasks
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View and manage tasks across all your projects.
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
                            Total Tasks
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {totalTasks}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Completed
                        </p>

                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {completedTasks}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            In Progress
                        </p>

                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {inProgressTasks}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-bold text-yellow-600">
                            {pendingTasks}
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
                                placeholder="Search tasks or projects..."
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

                        {/* Priority */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Priority
                            </label>

                            <select
                                value={priorityFilter}
                                onChange={(event) =>
                                    setPriorityFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
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
                </div>

                {/* Tasks Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-100 px-6 py-5">
                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Tasks
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {filteredTasks.length} task
                                    {filteredTasks.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fetchTasks}
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
                                <span>Loading tasks...</span>
                            </div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                No tasks found
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
                                                Task
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Project
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Priority
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Due Date
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredTasks.map((task) => (
                                            <tr
                                                key={task.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {task.title}
                                                        </p>

                                                        {task.description && (
                                                            <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/projects/${task.project_id}`}
                                                        className="text-sm font-medium text-gray-700 transition hover:text-gray-900 hover:underline"
                                                    >
                                                        {task.project?.name ||
                                                            "Unknown Project"}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            task.status
                                                        )}`}
                                                    >
                                                        {task.status.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(
                                                        task.due_date
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/projects/${task.project_id}/tasks/${task.id}`}
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
                                {filteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="space-y-4 p-5"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {task.title}
                                            </h3>

                                            {task.description && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    task.status
                                                )}`}
                                            >
                                                {task.status.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(
                                                    task.priority
                                                )}`}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">
                                                    Project
                                                </span>

                                                <Link
                                                    to={`/projects/${task.project_id}`}
                                                    className="font-medium text-gray-900 hover:underline"
                                                >
                                                    {task.project?.name ||
                                                        "Unknown Project"}
                                                </Link>
                                            </div>

                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">
                                                    Due Date
                                                </span>

                                                <span className="font-medium text-gray-900">
                                                    {formatDate(
                                                        task.due_date
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/projects/${task.project_id}/tasks/${task.id}`}
                                            className="block rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            View Task
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

export default TasksDashboard;
