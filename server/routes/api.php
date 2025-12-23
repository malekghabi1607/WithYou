<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalonController;
use App\Http\Controllers\VideoSyncController;
use App\Http\Controllers\Test\VideoSyncTestController;
use App\Http\Controllers\Api\SondageSalonController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\NotationController;

// use App\Http\Controllers\Api\ChatController; // décommente si tu as ce controller

/*
|--------------------------------------------------------------------------
| AUTH (public)
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| VIDEO STATE (debug public si tu veux)
|--------------------------------------------------------------------------
*/
Route::get('/dev/salon/{id}/state', [VideoSyncTestController::class, 'state']);
Route::post('/salon/{id}/video/state', [VideoSyncController::class, 'saveState']);

/*
|--------------------------------------------------------------------------
| ROUTES PROTEGEES JWT
|--------------------------------------------------------------------------
*/

    // Auth
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Salons
    Route::get('/salons', [SalonController::class, 'index']);
    Route::post('/salons', [SalonController::class, 'store']);
    Route::post('/salons/join', [SalonController::class, 'join']);
    Route::get('/salons/{salon}', [SalonController::class, 'show']);
    Route::post('/salons/{salon}/connect',    [SalonController::class, 'connect']);
    Route::post('/salons/{salon}/disconnect', [SalonController::class, 'disconnect']);
    Route::get('/salons/{id_salon}/state', [VideoSyncController::class, 'getState']);
    Route::post('/salons/{id_salon}/state', [VideoSyncController::class, 'saveState']);

    // Video sync
    Route::post('/salon/{salon}/video/load',  [VideoSyncController::class, 'loadVideo']);
    Route::post('/salon/{salon}/video/play',  [VideoSyncController::class, 'playVideo']);
    Route::post('/salon/{salon}/video/pause', [VideoSyncController::class, 'pauseVideo']);
    Route::post('/salon/{salon}/video/sync',  [VideoSyncController::class, 'syncVideoTime']);
    Route::post('/salon/{salon}/video/state', [VideoSyncController::class, 'saveState']);
    Route::get('/salon/{salon}/video/state',  [VideoSyncController::class, 'getState']);
Route::post('/salons', [SalonController::class, 'store']);
Route::get('/salons/{salon}', [SalonController::class, 'show']);

Route::get('/salons/{salon}/playlist', [PlaylistController::class, 'index']);
Route::post('/salons/{salon}/playlist', [PlaylistController::class, 'store']);
Route::delete('/salons/{salon}/playlist/{id}', [PlaylistController::class, 'destroy']);


Route::post('/salons/{id_salon}/historique', [HistoriqueController::class, 'store']);
Route::get('/salons/{id_salon}/historique', [HistoriqueController::class, 'index']);
Route::delete('/salons/{id_salon}/historique/{id}', [HistoriqueController::class, 'destroy']);

Route::post('/salons/{id_salon}/notation', [NotationController::class, 'store']);
Route::get('/salons/{id_salon}/notation/{youtube_id}', [NotationController::class, 'show']);
Route::get('/classement/hebdo', [NotationController::class, 'classementHebdo']);
