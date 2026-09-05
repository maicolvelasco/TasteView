<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TestController extends Controller
{
    public function saludo(): JsonResponse
    {
        return response()->json([
            'status' => true,
            'message' => '¡Hola desde Laravel API!',
            'data' => [
                'servidor' => 'Laravel Backend',
                'version' => app()->version(),
                'fecha' => now()->toDateTimeString()
            ]
        ]);
    }
}