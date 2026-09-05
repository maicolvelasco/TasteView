<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\RoleLevel;

class CheckRole
{
    /**
     * Mínimo nivel de rol requerido
     */
    public function handle(Request $request, Closure $next, string $minLevel): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        $requiredLevel = RoleLevel::from((int) $minLevel);

        if ($user->role?->level?->value < $requiredLevel->value) {
            return response()->json([
                'status' => false,
                'message' => 'No tienes permisos para acceder a este recurso',
                'required_level' => $requiredLevel->label(),
                'your_level' => $user->role?->level?->label(),
            ], 403);
        }

        return $next($request);
    }
}
