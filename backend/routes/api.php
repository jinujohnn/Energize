<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\AssetController;
// user routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
            return $request->user();
    });
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
    Route::post(
        '/projects/{project}/assets',
        [AssetController::class, 'store']
    );
        Route::get(
        '/projects/{project}/assets',
        [AssetController::class, 'index']
    );
});


