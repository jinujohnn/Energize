<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get user's projects
        $projects = $user->projects()
            ->with([
                'assets.energyReadings',
                'tasks',
            ])
            ->get();

        // Get all assets from user's projects
        $assets = $projects
            ->pluck('assets')
            ->flatten();

        // Get all tasks from user's projects
        $tasks = $projects
            ->pluck('tasks')
            ->flatten();

        // Get all energy readings from user's assets
        $readings = $assets
            ->pluck('energyReadings')
            ->flatten();

        return response()->json([
            'projects' => [
                'total' => $projects->count(),
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

            'tasks' => [
                'total' => $tasks->count(),

                'pending' => $tasks
                    ->where('status', 'pending')
                    ->count(),

                'in_progress' => $tasks
                    ->where('status', 'in_progress')
                    ->count(),

                'completed' => $tasks
                    ->where('status', 'completed')
                    ->count(),
            ],

            'energy' => [
                'total_produced' => round(
                    $readings->sum('energy_produced'),
                    2
                ),

                'total_consumed' => round(
                    $readings->sum('energy_consumed'),
                    2
                ),

                'average_power_output' => round(
                    $readings->avg('power_output') ?? 0,
                    2
                ),
            ],
        ]);
    }
}