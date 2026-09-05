<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\RoleLevel;
use App\Http\Controllers\Api\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/users
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = User::with('role', 'branch');

        if (!$user->isSuperAdmin()) {
            $query->where('branch_id', $user->branch_id);
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        return $this->ok($query->orderBy('name')->get());
    }

    /**
     * POST /api/users
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'branch_id' => $validated['branch_id'],
            'role_id' => $validated['role_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'pin_code' => $validated['pin_code'] ?? null,
            'is_active' => true,
        ]);

        return $this->ok($user->load('role'), 201);
    }

    /**
     * PUT /api/users/{id}
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update($request->validated());

        return $this->ok($user->load('role'));
    }

    /**
     * Listar meseros de la sucursal (para que el cajero pueda asignarles pedidos)
     * GET /api/waiters
     */
    public function waiters(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        $waiters = User::whereHas('role', fn($q) => $q->where('level', RoleLevel::WAITER->value))
            ->where('branch_id', $currentUser->branch_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return $this->ok($waiters);
    }
}