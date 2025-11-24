<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Events\PlayerEvent;

use App\Models\User;
use App\Models\Salon;
use App\Http\Controllers\AuthController;

Route::get('/ping', function () {
    return response()->json(['pong' => true]);
});

Route::get('/dbcheck', function () {
    try {
        $ok = DB::select('SELECT 1 as ok')[0]->ok === 1;
        return response()->json(['db' => $ok]);
    } catch (\Throwable $e) {
        return response()->json(['db' => false, 'error' => $e->getMessage()], 500);
    }
});

Route::post('/player/emit', function (Request $request) {
    $payload = $request->validate([
        'type' => 'required|string|in:play,pause,seek',
        'time' => 'nullable|numeric',
    ]);

    event(new PlayerEvent($payload));

    return response()->json(['ok' => true]);
});

// Petit endpoint de test POST
Route::post('/test-register', function (Request $request) {
    return response()->json([
        'path'   => $request->path(),
        'method' => $request->method(),
        'body'   => $request->all(),
    ]);
});

// routes publiques
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// routes protégées
Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
});