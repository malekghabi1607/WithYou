<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalonController;
use App\Http\Controllers\Api\VideoSyncController;
use App\Http\Controllers\Test\VideoSyncTestController;
use App\Http\Controllers\Api\VideoVoteController;
use App\Http\Controllers\Api\VideoNoteController;
use App\Http\Controllers\Api\SondageSalonController;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {

    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    /*
    |--------------------------------------------------------------------------
    | SALONS
    |--------------------------------------------------------------------------
    */
    Route::get('/salons', [SalonController::class, 'index']);
    Route::post('/salons', [SalonController::class, 'store']);
    Route::post('/salons/join', [SalonController::class, 'join']);
    Route::get('/salons/{salon}', [SalonController::class, 'show']);

    Route::post('/salons/{salon}/connect',    [SalonController::class, 'connect']);
    Route::post('/salons/{salon}/disconnect', [SalonController::class, 'disconnect']);

    /*
    |--------------------------------------------------------------------------
    | VIDEO SYNCHRONISATION
    |--------------------------------------------------------------------------
    */
    Route::post('/salon/{salon}/video/load',  [VideoSyncController::class, 'loadVideo']);
    Route::post('/salon/{salon}/video/play',  [VideoSyncController::class, 'playVideo']);
    Route::post('/salon/{salon}/video/pause', [VideoSyncController::class, 'pauseVideo']);
    Route::post('/salon/{salon}/video/sync',  [VideoSyncController::class, 'syncVideoTime']);

});

// Debug route
Route::get('/dev/salon/{id}/state', [VideoSyncTestController::class, 'state']);
Route::post('/salon/{id}/video/state', [VideoSyncController::class, 'saveState']);

Route::middleware('auth:api')->group(function () {

    // Sauvegarde de l'état vidéo
    Route::post('/salon/{salon}/video/state', [\App\Http\Controllers\Api\VideoSyncController::class, 'saveState']);

    // Récupération de l'état vidéo
    Route::get('/salon/{salon}/video/state', [\App\Http\Controllers\Api\VideoSyncController::class, 'getState']);
});
Route::middleware('auth:api')->group(function () {

    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/{salonId}/history', [ChatController::class, 'history']);


Route::middleware('auth:api')->group(function () {

    // 🅰️ Voter / modifier vote
    Route::post('/sondages/vote', [SondageSalonController::class, 'voter']);

    // 🅱️ Résultats d’une vidéo
    Route::get('/sondages/{idSalon}/video/{videoId}', [SondageSalonController::class, 'resultatsVideo']);

    // 🅲 Classement du salon
    Route::get('/sondages/{idSalon}/classement', [SondageSalonController::class, 'classement']);

});


});
