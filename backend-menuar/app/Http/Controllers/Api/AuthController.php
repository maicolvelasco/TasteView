<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Intentos fallidos permitidos antes de bloquear temporalmente el acceso.
     */
    private const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Minutos de bloqueo tras exceder los intentos permitidos.
     */
    private const LOCKOUT_MINUTES = 1;

    /**
     * Máximo de usuarios activos con PIN que se comparan por intento de
     * login. Es una salvaguarda de rendimiento/DoS, no una limitación real
     * para el tamaño de personal de un restaurante.
     */
    private const MAX_PIN_CANDIDATES = 300;

    /**
     * Login con email/password o PIN (meseros/cajeros).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $throttleKey = $this->throttleKey($request, $credentials);

        $this->ensureIsNotRateLimited($throttleKey);

        $user = $this->resolveAuthenticatedUser($credentials);

        if (!$user) {
            RateLimiter::hit($throttleKey, self::LOCKOUT_MINUTES * 60);

            Log::warning('Intento de login fallido', [
                'ip' => $request->ip(),
                'method' => isset($credentials['pin_code']) ? 'pin' : 'password',
            ]);

            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken(
            'auth_token',
            [$user->role?->slug ?? 'customer']
        )->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout — revoca únicamente el token de la sesión actual.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'status' => true,
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    /**
     * Revoca todos los tokens del usuario (cierra sesión en todos los dispositivos).
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()?->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Todas las sesiones fueron cerradas',
        ]);
    }

    /**
     * Perfil del usuario autenticado, incluyendo sus permisos.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role', 'branch.company');

        return response()->json([
            'status' => true,
            'data' => new UserResource($user, includePermissions: true),
        ]);
    }

    /**
     * Actualiza los datos de perfil del propio usuario logueado (nombre,
     * teléfono). A propósito NO permite tocar email, rol, sucursal ni PIN
     * desde acá — esos son cambios administrativos y ya los cubre
     * Admin\UserController; esta ruta es solo "mis propios datos".
     * PUT /api/me
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json([
            'status' => true,
            'data' => new UserResource($user->fresh()->load('role', 'branch.company'), includePermissions: true),
        ]);
    }

    /**
     * Cambia la contraseña del propio usuario logueado. Exige la
     * contraseña actual: sin esto, cualquiera que encuentre una sesión
     * abierta sin cerrar podría tomar la cuenta con solo poner una
     * contraseña nueva.
     * PUT /api/me/password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        // El cast 'hashed' del modelo User hashea esto automáticamente al
        // guardar (ver User::$casts) — nunca se guarda en texto plano.
        $user->password = $validated['new_password'];
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    /**
     * Despacha al flujo de autenticación correcto según la credencial recibida.
     */
    private function resolveAuthenticatedUser(array $credentials): ?User
    {
        return isset($credentials['pin_code'])
            ? $this->attemptPinLogin($credentials)
            : $this->attemptPasswordLogin($credentials);
    }

    /**
     * Login por PIN: el PIN está hasheado, así que no se puede filtrar por
     * SQL ni pedir la sucursal de antemano (eso le quitaría el sentido a
     * la rapidez del PIN). Se comparan todos los usuarios activos con PIN
     * usando Hash::check() hasta encontrar coincidencia; el usuario (y con
     * él, su sucursal) queda determinado por el PIN mismo.
     *
     * IMPORTANTE: para que esto sea seguro, el PIN debe ser único entre
     * todos los usuarios activos del sistema (no solo dentro de una
     * sucursal) — si dos personas comparten PIN, el sistema autenticaría
     * a la que aparezca primero. Esa unicidad se debe validar al crear o
     * editar un usuario (ver nota en UserController).
     */
    private function attemptPinLogin(array $credentials): ?User
    {
        $candidates = User::query()
            ->where('is_active', true)
            ->whereNotNull('pin_code')
            ->with('role', 'branch.company')
            ->limit(self::MAX_PIN_CANDIDATES)
            ->get();

        foreach ($candidates as $candidate) {
            if (Hash::check($credentials['pin_code'], $candidate->pin_code)) {
                return $this->branchIsUsable($candidate) ? $candidate : null;
            }
        }

        return null;
    }

    /**
     * Login por email/password tradicional.
     */
    private function attemptPasswordLogin(array $credentials): ?User
    {
        $user = User::query()
            ->where('email', $credentials['email'])
            ->where('is_active', true)
            ->with('role', 'branch.company')
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return null;
        }

        return $this->branchIsUsable($user) ? $user : null;
    }

    /**
     * Un usuario asignado a una sucursal inactiva no puede iniciar sesión,
     * aunque sus credenciales sean correctas.
     */
    private function branchIsUsable(User $user): bool
    {
        return !$user->branch || $user->branch->is_active;
    }

    /**
     * Genera la clave de rate limiting.
     * - Login por PIN: se agrupa por hash del PIN + IP (nunca se guarda el
     *   PIN en texto plano ni siquiera en la cache de rate limiting).
     * - Login por password: se agrupa por email + IP.
     */
    private function throttleKey(Request $request, array $credentials): string
    {
        $identifier = isset($credentials['pin_code'])
            ? 'pin:' . hash('sha256', $credentials['pin_code'])
            : Str::lower($credentials['email']);

        return $identifier . '|' . $request->ip();
    }

    /**
     * Corta el flujo si se superaron los intentos de login permitidos.
     */
    private function ensureIsNotRateLimited(string $key): void
    {
        if (!RateLimiter::tooManyAttempts($key, self::MAX_LOGIN_ATTEMPTS)) {
            return;
        }

        $seconds = RateLimiter::availableIn($key);

        throw ValidationException::withMessages([
            'email' => ["Demasiados intentos. Intenta nuevamente en {$seconds} segundos."],
        ]);
    }
}