<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\EnergyReadingController;
use App\Http\Controllers\EnergySummaryController;
use App\Http\Controllers\DashboardController;

// user routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
            return $request->user();
    });
    Route::patch('/user',[AuthController::class,'update']);
    Route::post('/logout',[AuthController::class, 'logout']);

});


// projects routes

Route::middleware('auth:sanctum')->group(function () {
    // projects routes
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::patch('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
// asset routes

    Route::get('/assets', [AssetController::class, 'allAssets']);

    Route::post(
        '/projects/{project}/assets',
        [AssetController::class, 'store']
    );
        Route::get(
        '/projects/{project}/assets',
        [AssetController::class, 'index']
    );
    Route::get(
        '/projects/{project}/assets/{asset}',
        [AssetController::class, 'show']
    );
    Route::patch(
        '/projects/{project}/assets/{asset}',
        [AssetController::class, 'update']
    );
    Route::delete(
        '/projects/{project}/assets/{asset}',
        [AssetController::class, 'destroy']
    );
// task routes
    Route::get('/tasks', [TaskController::class, 'allTasks']);
    Route::post(
        '/projects/{project}/tasks',
        [TaskController::class, 'store']
    );
    Route::get(
        '/projects/{project}/tasks',
        [TaskController::class, 'index']
    );
        Route::get(
        '/projects/{project}/tasks/{task}',
        [TaskController::class, 'show']
    );
    Route::patch(
        '/projects/{project}/tasks/{task}',
        [TaskController::class, 'update']
    );
    Route::delete(
        '/projects/{project}/tasks/{task}',
        [TaskController::class, 'destroy']
    );
// energyreading routes
    Route::post(
        '/projects/{project}/assets/{asset}/readings',
        [EnergyReadingController::class, 'store']
    );
    Route::get(
        '/projects/{project}/assets/{asset}/readings',
        [EnergyReadingController::class, 'index']
    );
    Route::get(
        '/projects/{project}/assets/{asset}/readings/{reading}',
        [EnergyReadingController::class, 'show']
    );
    Route::patch(
        '/projects/{project}/assets/{asset}/readings/{reading}',
        [EnergyReadingController::class, 'update']
    );
    Route::delete(
        '/projects/{project}/assets/{asset}/readings/{reading}',
        [EnergyReadingController::class, 'destroy']
    );
    Route::get(
        '/projects/{project}/energy-summary',
        [EnergySummaryController::class, 'show']
    );
    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    );
});



