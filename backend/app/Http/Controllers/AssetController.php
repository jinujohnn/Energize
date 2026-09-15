<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssetRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function store(
        StoreAssetRequest $request,
        int $project
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Asset created successfully',
            'asset' => $asset,
        ], 201);
    }
    public function index(
        Request $request,
        int $project
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $assets = $project->assets()
            ->latest()
            ->get();

        return response()->json([
            'assets' => $assets,
        ]);
    }
}