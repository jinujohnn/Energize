<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')
            ->stateless()
            ->user();

        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName()
                    ?? $googleUser->getNickname()
                    ?? 'Google User',

                'email' => $googleUser->getEmail(),

                'password' => Str::random(40),
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return redirect(
            'http://localhost:5173/oauth/callback?token=' . urlencode($token)
        );
    }
}