<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
use Illuminate\Http\Request;

// Cette route sert juste à générer le lien sans faire planter Laravel
Route::get('/reset-password/{token}', function ($token) {
    return "Voici votre token : " . $token;
})->middleware('guest')->name('password.reset');