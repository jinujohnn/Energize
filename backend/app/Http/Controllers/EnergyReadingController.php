<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnergyReadingRequest;
use App\Models\EnergyReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateEnergyReadingRequest;


class EnergyReadingController extends Controller
{
    public function store(
        StoreEnergyReadingRequest $request,
        int $project,
        int $asset
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->find($asset);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found',
            ], 404);
        }

        $reading = $asset->energyReadings()->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Energy reading created successfully',
            'reading' => $reading,
        ], 201);
    }
    public function index(
    Request $request,
    int $project,
    int $asset
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->find($asset);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found',
            ], 404);
        }

        $readings = $asset->energyReadings()
            ->latest('recorded_at')
            ->get();

        return response()->json([
            'readings' => $readings,
        ]);
    }
    public function show(
    Request $request,
    int $project,
    int $asset,
    int $reading
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->find($asset);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found',
            ], 404);
        }

        $reading = $asset->energyReadings()->find($reading);

        if (!$reading) {
            return response()->json([
                'message' => 'Energy reading not found',
            ], 404);
        }

        return response()->json([
            'reading' => $reading,
        ]);
    }
    public function update(
        UpdateEnergyReadingRequest $request,
        int $project,
        int $asset,
        int $reading
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->find($asset);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found',
            ], 404);
        }

        $reading = $asset->energyReadings()->find($reading);

        if (!$reading) {
            return response()->json([
                'message' => 'Energy reading not found',
            ], 404);
        }

        $reading->update($request->validated());

        return response()->json([
            'message' => 'Energy reading updated successfully',
            'reading' => $reading->fresh(),
        ]);
    }
    public function destroy(
    Request $request,
    int $project,
    int $asset,
    int $reading
    ): JsonResponse {

        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        $asset = $project->assets()->find($asset);

        if (!$asset) {
            return response()->json([
                'message' => 'Asset not found',
            ], 404);
        }

        $reading = $asset->energyReadings()->find($reading);

        if (!$reading) {
            return response()->json([
                'message' => 'Energy reading not found',
            ], 404);
        }

        $reading->delete();

        return response()->json([
            'message' => 'Energy reading deleted successfully',
        ]);
    }
}