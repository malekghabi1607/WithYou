<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
   
    public function boot(): void
{
    ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
       
        $frontendUrl = "http://localhost:5173"; 
        
        return "{$frontendUrl}/reset-password/{$token}?email={$notifiable->getEmailForPasswordReset()}";
    });
}
}
