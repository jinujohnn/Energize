<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnergySummaryController extends Controller
{
    public function show(
        Request $request,
        int $project
    ): JsonResponse {

        // 1. Find the project belonging to the logged-in user
        $project = $request->user()
            ->projects()
            ->find($project);

        if (!$project) {
            return response()->json([
                'message' => 'Project not found',
            ], 404);
        }

        // 2. Get the project's assets with their readings
        $assets = $project->assets()
            ->with('energyReadings')
            ->get();

        // 3. Combine all readings from all assets
        $readings = $assets
            ->pluck('energyReadings')
            ->flatten();

        // 4. Calculate energy statistics
        $totalEnergyProduced = $readings->sum('energy_produced');

        $totalEnergyConsumed = $readings->sum('energy_consumed');

        $averagePowerOutput = $readings->avg('power_output');

        // 5. Return summary
        return response()->json([
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
            ],

            'energy' => [
                'total_energy_produced' => round(
                    $totalEnergyProduced,
                    2
                ),

                'total_energy_consumed' => round(
                    $totalEnergyConsumed,
                    2
                ),

                'average_power_output' => round(
                    $averagePowerOutput ?? 0,
                    2
                ),
            ],

            'assets' => [
                'total' => $assets->count(),

                'operational' => $assets
                    ->where('status', 'operational')
                    ->count(),

                'maintenance' => $assets
                    ->where('status', 'maintenance')
                    ->count(),

                'offline' => $assets
                    ->where('status', 'offline')
                    ->count(),
            ],
        ]);
    }
}
