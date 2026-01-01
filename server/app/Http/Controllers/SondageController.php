<?php

namespace App\Http\Controllers;

use App\Models\Sondage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SondageController extends Controller
{
    public function index($salonId)
    {
        $sondages = Sondage::where('id_salon', $salonId)
            ->with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sondages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_salon' => 'required',
            'question' => 'required|string',
            'options'  => 'required|array|min:2'
        ]);

        $formattedOptions = [];
        foreach ($request->options as $opt) {
            $formattedOptions[] = [
                'text'  => $opt,
                'votes' => 0
            ];
        }

        $sondage = Sondage::create([
            'id_salon' => $request->id_salon,
            'id_user'  => Auth::id(),
            'question' => $request->question,
            'options'  => $formattedOptions,
            'is_active'=> true
        ]);

        return response()->json($sondage, 201);
    }

    public function vote(Request $request, $id)
    {
        $request->validate(['optionIndex' => 'required|integer']);
        
        $sondage = Sondage::findOrFail($id);

        if (!$sondage->is_active) {
            return response()->json(['message' => 'Sondage fermé'], 400);
        }

        $options = $sondage->options;

        if (isset($options[$request->optionIndex])) {
            $options[$request->optionIndex]['votes'] += 1;
            $sondage->options = $options;
            $sondage->save();
        }

        return response()->json($sondage);
    }
}