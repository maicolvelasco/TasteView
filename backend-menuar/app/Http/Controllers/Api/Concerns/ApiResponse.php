<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\JsonResponse;

/**
 * Estandariza el formato de respuesta de la API: {status, data?, message?}.
 * Evita repetir response()->json(['status' => true, ...]) en cada método
 * de cada controlador.
 */
trait ApiResponse
{
    protected function ok($data = null, int $code = 200): JsonResponse
    {
        $payload = ['status' => true];
        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $code);
    }

    protected function okMessage(string $message, $data = null, int $code = 200): JsonResponse
    {
        $payload = ['status' => true, 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $code);
    }

    protected function fail(string $message, int $code = 422): JsonResponse
    {
        return response()->json(['status' => false, 'message' => $message], $code);
    }
}