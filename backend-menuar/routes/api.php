<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\Admin\BranchController;
use App\Http\Controllers\Api\Admin\CompanyController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Api\Admin\ModifierController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Enums\RoleLevel;

/*
|--------------------------------------------------------------------------
| API Routes — Sistema Gastronómico con AR
|--------------------------------------------------------------------------
*/

// ==================== PÚBLICO (sin auth) ====================
Route::get('/menu/{branchCode}', [MenuController::class, 'index']);
Route::get('/products/{id}', [MenuController::class, 'show']);

// ==================== AUTENTICACIÓN ====================
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'changePassword']);

    // ==================== PEDIDOS (todos los empleados) ====================
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // ==================== MESAS (lectura para todos los empleados) ====================
    Route::get('/tables', [TableController::class, 'index']);

    // ==================== FACTURACIÓN (cajero+) ====================
    Route::middleware('role:' . RoleLevel::CASHIER->value)->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
        Route::patch('/invoices/{id}/cancel', [InvoiceController::class, 'cancel']);

        // El cajero también puede tomar pedidos y asignarlos a un mesero
        Route::get('/waiters', [UserController::class, 'waiters']);
    });

    // ==================== ADMINISTRACIÓN (gerente+) ====================
    Route::middleware('role:' . RoleLevel::MANAGER->value)->group(function () {
        // Dashboard y reportes
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/top-products', [ReportController::class, 'topProducts']);
        Route::get('/reports/summary', [ReportController::class, 'summary']);

        // Menú: categorías
        Route::get('/menu', [AdminMenuController::class, 'index']);
        Route::post('/categories', [AdminMenuController::class, 'storeCategory']);
        Route::put('/categories/{id}', [AdminMenuController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminMenuController::class, 'destroyCategory']);
        Route::post('/categories/reorder', [AdminMenuController::class, 'reorderCategories']);

        // Menú: productos
        Route::post('/products', [AdminMenuController::class, 'storeProduct']);
        Route::put('/products/{id}', [AdminMenuController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminMenuController::class, 'destroyProduct']);
        Route::post('/products/reorder', [AdminMenuController::class, 'reorderProducts']);
        Route::post('/products/{id}/duplicate', [AdminMenuController::class, 'duplicateProduct']);
        Route::post('/products/duplicate-to-branch', [AdminMenuController::class, 'duplicateToBranch']);
        Route::post('/uploads/image', [AdminMenuController::class, 'uploadImage']);
        Route::post('/uploads/model', [AdminMenuController::class, 'uploadModel']);

        // Menú: asignación de modificadores a un producto puntual
        Route::post('/products/assign-modifier', [AdminMenuController::class, 'assignModifier']);
        Route::get('/products/{productId}/modifier-settings', [AdminMenuController::class, 'productModifierSettings']);
        Route::put('/products/{productId}/modifiers/{modifierId}', [AdminMenuController::class, 'updateProductModifier']);
        Route::delete('/products/{productId}/modifiers/{modifierId}', [AdminMenuController::class, 'unassignModifier']);
        Route::get('/products/{id}/detail', [AdminMenuController::class, 'showProduct']);

        // Grupos de opciones / modificadores
        Route::get('/modifiers', [ModifierController::class, 'index']);
        Route::post('/modifiers', [ModifierController::class, 'store']);
        Route::put('/modifiers/{id}', [ModifierController::class, 'update']);
        Route::delete('/modifiers/{id}', [ModifierController::class, 'destroy']);
        Route::post('/modifiers/{modifierId}/options', [ModifierController::class, 'storeOption']);
        Route::put('/modifier-options/{id}', [ModifierController::class, 'updateOption']);
        Route::delete('/modifier-options/{id}', [ModifierController::class, 'destroyOption']);

        // Mesas (crear / editar / eliminar)
        Route::post('/tables', [TableController::class, 'store']);
        Route::put('/tables/{id}', [TableController::class, 'update']);
        Route::delete('/tables/{id}', [TableController::class, 'destroy']);

        // Reservas
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::patch('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);
        Route::get('/reservations/available-tables', [ReservationController::class, 'availableTables']);
    });

    // ==================== ADMIN / SUPER ADMIN ====================
    Route::middleware('role:' . RoleLevel::ADMIN->value)->group(function () {
        // Sucursales
        // Nota: /branches/trashed va ANTES de /branches/{id} para que
        // "trashed" no sea interpretado como un ID de sucursal.
        Route::get('/branches/trashed', [BranchController::class, 'trashed']);
        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{id}', [BranchController::class, 'show']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{id}', [BranchController::class, 'update']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
        Route::post('/branches/{id}/restore', [BranchController::class, 'restore']);

        // Ajustes del negocio (nombre + logo) — pestaña "Negocio" en Ajustes
        Route::get('/company', [CompanyController::class, 'show']);
        Route::put('/company', [CompanyController::class, 'update']);

        // Usuarios
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
    });
});