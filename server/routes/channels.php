<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes([
    'middleware' => ['api', 'auth:api'],
]);

Broadcast::channel('salon.{salonId}', function ($user, $salonId) {
    // ✅ Debug local : on autorise tous les utilisateurs authentifiés
    // (ça évite un 403 si la relation/pivot n'est pas encore OK)
    //if (app()->environment('local')) {return true; }

    // ✅ Prod : Vérification que l'utilisateur appartient au salon
    return $user->salons()->where('id_salon', $salonId)->exists();
});