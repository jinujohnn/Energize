<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Create a task inside a project.
     */
    public function store(
        StoreTaskRequest $request,
        int $project
    ): JsonResponse {

        // Find the project only if it belongs to
        // the currently authenticated user.
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $task = $project->tasks()->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task,
        ], 201);
    }


    /**
     * Get all tasks belonging to a specific project.
     */
    public function index(
        Request $request,
        int $project
    ): JsonResponse {

        // This also verifies that the project
        // belongs to the authenticated user.
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $tasks = $project->tasks()
            ->latest()
            ->get();

        return response()->json([
            'tasks' => $tasks,
        ]);
    }


    /**
     * Get one task inside a specific project.
     */
    public function show(
        Request $request,
        int $project,
        int $task
    ): JsonResponse {

        // Verify project ownership first.
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        // Search for the task only inside this project.
        $task = $project->tasks()->find($task);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        return response()->json([
            'task' => $task,
        ]);
    }


    /**
     * Update a task inside a project.
     */
    public function update(
        UpdateTaskRequest $request,
        int $project,
        int $task
    ): JsonResponse {

        // Verify project ownership.
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        // Find task only inside the user's project.
        $task = $project->tasks()->find($task);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        $task->update(
            $request->validated()
        );

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->fresh(),
        ]);
    }


    /**
     * Delete a task inside a project.
     */
    public function destroy(
        Request $request,
        int $project,
        int $task
    ): JsonResponse {

        // Verify project ownership.
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        // Find task only inside the user's project.
        $task = $project->tasks()->find($task);

        if (!$task) {
            return response()->json([
                'message' => 'Task not found',
            ], 404);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }


    /**
     * Get all tasks belonging to all projects
     * owned by the authenticated user.
     */
    public function allTasks(
        Request $request
    ): JsonResponse {

        $tasks = Task::whereHas('project', function ($query) use ($request) {

            $query->where(
                'user_id',
                $request->user()->id
            );

        })
        ->with('project:id,name')
        ->latest()
        ->get();

        return response()->json([
            'tasks' => $tasks,
        ]);
    }
}
