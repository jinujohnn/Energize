<?php

use App\Http\Controllers\GoogleAuthController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Google Authentication
|--------------------------------------------------------------------------
*/

Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])
    ->name('google.redirect');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
    ->name('google.callback');

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {

    // Check that the verification URL has a valid signature
    if (!URL::hasValidSignature($request)) {
        return response()->json([
            'message' => 'Invalid or expired verification link.',
        ], 403);
    }

    // Find the user
    $user = User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 'User not found.',
        ], 404);
    }

    // Check that the hash belongs to this user's email
    if (!hash_equals(
        sha1($user->getEmailForVerification()),
        $hash
    )) {
        return response()->json([
            'message' => 'Invalid verification link.',
        ], 403);
    }

    // Mark email as verified
    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    // Redirect to React
    return redirect()->away(
        config('app.frontend_url') . '/email-verified'
    );

})->name('verification.verify');

