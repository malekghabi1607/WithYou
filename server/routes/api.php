<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Events\PlayerEvent;

use App\Models\User;
use App\Models\Salon;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SalonController;

// routes publiques
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// routes protégées (vérification du token JWT)
Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
});

//routes salon protégées
Route::middleware('auth:api')->group(function () 
{
    Route::get('/salons', [SalonController::class, 'index']);
    Route::post('/salons', [SalonController::class, 'store']);
    Route::post('/salons/join', [SalonController::class, 'join']);
    Route::get('/salons/{salon}', [SalonController::class, 'show']);

    Route::post('/salons/{salon}/connect', [SalonController::class, 'connect']);
    Route::post('/salons/{salon}/disconnect', [SalonController::class, 'disconnect']);
});