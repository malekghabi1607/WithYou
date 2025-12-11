<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Events\PlayerEvent;

use App\Models\User;
use App\Models\Salon;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalonController;
use App\Http\Controllers\VideoSyncController; // ⬅️ AJOUT IMPORTANT
use App\Http\Controllers\Test\VideoSyncTestController;


/* ============================
   ROUTES PUBLIQUES (AUTH)
   ============================ */
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);


/* ============================
   ROUTES PROTÉGÉES (TOKEN JWT)
   ============================ */
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

});


/* ============================
   SALONS (PROTÉGÉS)
   ============================ */
Route::middleware('auth:api')->group(function () 
{
    Route::get('/salons',                [SalonController::class, 'index']);
    Route::post('/salons',               [SalonController::class, 'store']);
    Route::post('/salons/join',          [SalonController::class, 'join']);
    Route::get('/salons/{salon}',        [SalonController::class, 'show']);

    Route::post('/salons/{salon}/connect',    [SalonController::class, 'connect']);
    Route::post('/salons/{salon}/disconnect', [SalonController::class, 'disconnect']);
});


/* ============================
   VIDEO SYNCHRONISATION (NEW)
   ============================ */
Route::middleware('auth:api')->group(function () 
{
     Route::post('/salon/{salon}/video/load',  [VideoSyncController::class, 'loadVideo']);
    Route::post('/salon/{salon}/video/play',  [VideoSyncController::class, 'playVideo']);
    Route::post('/salon/{salon}/video/pause', [VideoSyncController::class, 'pauseVideo']);
    Route::post('/salon/{salon}/video/sync',  [VideoSyncController::class, 'syncVideoTime']);

});

     Route::get('/dev/salon/{id}/state', [VideoSyncTestController::class, 'state']);
  // des routes de test pour pouvoir voir le status de la video actuelle en cours 