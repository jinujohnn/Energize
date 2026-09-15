<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $request->user()->projects()->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->latest()
            ->get();

        return response()->json([
            'projects' => $projects,
        ]);
    }
    public function show(Request $request, int $project): JsonResponse
    {
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        return response()->json([
            'project' => $project,
        ]);
    }
    public function update(UpdateProjectRequest $request,int $project): JsonResponse {
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $project->update($request->validated());

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->fresh(),
        ]);
    }
    public function destroy(Request $request, int $project): JsonResponse
    {
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}