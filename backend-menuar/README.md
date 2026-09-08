# 📦 Contenido y arquitectura — Backend MenuAR

Este documento explica **qué hay** en el proyecto, **qué es lo más importante** y **cómo funciona** el backend por dentro. Está pensado para alguien que nunca vio el código y necesita orientarse rápido.

---

## 1. Qué es este proyecto

Una **API REST en Laravel 13** para administrar uno o varios restaurantes: menú digital con soporte de realidad aumentada (modelos 3D por plato), toma de pedidos, cocina, caja/facturación, reservas de mesas y reportes — todo con permisos por rol.

No incluye frontend: es puro backend, pensado para ser consumido por una app React (u otra) que hable con estos endpoints vía JSON + tokens Bearer (Laravel Sanctum).

## 2. Stack técnico

- **Laravel 13** (PHP 8.3+)
- **Laravel Sanctum** — autenticación por token para SPA/mobile
- **Eloquent ORM** con Soft Deletes en casi todos los modelos
- **SQLite** por defecto (fácil de levantar), compatible con MySQL/PostgreSQL
- **Eventos broadcast** (`ShouldBroadcast`) preparados para tiempo real vía Reverb/Pusher

## 3. Lo más importante: el modelo de datos

```
Company (empresa)
  └─ Branch (sucursal)          ← casi todo cuelga de una sucursal
       ├─ User (empleado)        ← con Role
       ├─ Category (categoría de menú)
       │    └─ Product (plato)
       │         ├─ model_3d_url  ← AR (glTF/USDZ)
       │         └─ Modifier (N:M vía ProductModifier, con overrides)
       │              └─ ModifierOption
       ├─ RestaurantTable (mesa, con QR)
       ├─ Reservation (reserva de mesa)
       └─ Order (pedido)
            ├─ OrderItem (línea de pedido)
            │    └─ OrderItemModifier (snapshot de precio/nombre al momento de pedir)
            └─ Invoice (factura, 1:1 con el pedido)
```

Puntos clave de este diseño:

- **Multi-sucursal real:** casi cada tabla tiene `branch_id`, así que los datos de una sucursal nunca se mezclan con los de otra.
- **Multi-tenant listo:** `Company` existe para que en el futuro una misma instalación sirva a varias empresas, cada una con sus sucursales.
- **AR integrado en el modelo de datos:** `products.model_3d_url` guarda la URL de un modelo 3D (glTF/USDZ) que el frontend puede mostrar con `<model-viewer>`.
- **Snapshots de precio:** cuando un pedido incluye un modificador (ej. "sin cebolla", "extra queso"), `OrderItemModifier` guarda el nombre y el precio *tal como estaban en ese momento*, para que un cambio de precio futuro no altere pedidos ya hechos.
- **Soft deletes en todo lo importante:** nada se borra de verdad (empresas, sucursales, usuarios, productos, pedidos, etc. se pueden restaurar).
- **Theme configurable:** `companies.theme` es un JSON para personalizar colores/branding por empresa.

## 4. Roles y permisos

Los permisos se manejan con un único enum jerárquico, `App\Enums\RoleLevel`, en vez de una tabla de permisos granular:

| Rol | Nivel numérico | Puede hacer, además de lo del nivel anterior |
|---|---|---|
| Customer | 10 | Ver el menú público |
| Waiter (mesero) | 30 | Tomar y ver pedidos |
| Chef (cocinero) | 40 | Ver y actualizar el estado de los pedidos |
| Cashier (cajero) | 50 | Facturar, ver meseros |
| Manager (gerente) | 70 | Dashboard, reportes, gestionar menú/modificadores/mesas/reservas |
| Admin | 90 | Gestionar sucursales, usuarios, datos de la empresa |
| Super Admin | 100 | Todo |

Cómo se aplica en la práctica:

- El middleware `App\Http\Middleware\CheckRole` (alias `role`) se aplica a grupos de rutas con un **nivel mínimo**: `role:70` significa "gerente o superior".
- Como es jerárquico (no una lista de permisos por rol), un Admin automáticamente puede hacer todo lo que puede un Gerente, y así sucesivamente. Esto está codificado en métodos de `User` como `isManager()`, `isAdmin()`, etc. (comparan `$this->role->level->value >= X`).
- La comprobación real ocurre comparando `RoleLevel` (un enum de PHP), no strings sueltos, así que es difícil pedir un rol que no existe.

## 5. Autenticación — dos formas de login

`POST /api/login` acepta **dos modos** de credenciales en el mismo endpoint (ver `AuthController`):

1. **Email + contraseña** — flujo clásico, para admin/gerente/etc.
2. **PIN de 4 dígitos** — pensado para mesero/cajero/chef que necesitan loguearse rápido en una tablet compartida. El PIN está **hasheado** (igual que la contraseña) y la búsqueda es por comparación (`Hash::check`) contra todos los usuarios activos con PIN, no por `WHERE pin_code = ...` — por eso el PIN debe ser único entre todos los usuarios activos del sistema.

Ambos flujos devuelven un token de Sanctum que el frontend debe mandar como `Authorization: Bearer <token>` en cada request protegido.

Protecciones ya implementadas:

- **Rate limiting** de intentos de login (5 intentos, 1 minuto de bloqueo), agrupado por email+IP o por hash del PIN+IP — nunca se guarda el PIN en texto plano ni siquiera en la caché de rate limiting.
- Un usuario cuya sucursal está inactiva **no puede loguearse**, aunque sus credenciales sean correctas.
- Cambio de contraseña (`PUT /api/me/password`) exige la contraseña actual.
- Comando `php artisan users:rehash-pins` para migrar PINs viejos en texto plano a hash, de forma idempotente.

## 6. Estructura de carpetas relevante

```
app/
├── Enums/                     ← Todo el "vocabulario" de estados del sistema
│   ├── RoleLevel.php          ← Jerarquía de roles (ver sección 4)
│   ├── OrderStatus.php        ← pending → confirmed → in_preparation → ready → served / cancelled
│   ├── OrderItemStatus.php    ← estado por línea de pedido (para la cocina)
│   ├── OrderType.php          ← dine_in / takeout / delivery
│   ├── PaymentStatus.php      ← pending / partial / paid / refunded
│   ├── PaymentMethod.php      ← cash / card / transfer / qr
│   ├── TableStatus.php        ← free / occupied / reserved / cleaning
│   └── InvoiceStatus.php      ← draft / finalized / cancelled
│
├── Models/                    ← 15 modelos Eloquent (ver sección 3)
│
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php        ← login, logout, perfil propio
│   │   ├── MenuController.php        ← menú público (sin login)
│   │   ├── OrderController.php       ← pedidos (todo el personal)
│   │   ├── InvoiceController.php     ← facturación (cajero+)
│   │   ├── TableController.php       ← mesas
│   │   ├── ReservationController.php ← reservas
│   │   ├── ReportController.php      ← reportes de ventas
│   │   ├── TestController.php        ← endpoint de prueba/diagnóstico
│   │   └── Admin/
│   │       ├── DashboardController.php
│   │       ├── MenuController.php    ← CRUD de categorías/productos/modificadores + subida de imágenes/modelos 3D
│   │       ├── ModifierController.php
│   │       ├── BranchController.php  ← CRUD de sucursales (admin+)
│   │       ├── CompanyController.php ← datos/branding de la empresa (admin+)
│   │       └── UserController.php    ← CRUD de usuarios (admin+)
│   │
│   ├── Middleware/CheckRole.php      ← el "portero" de permisos (ver sección 4)
│   ├── Requests/                     ← validación de cada endpoint (uno por acción)
│   └── Resources/                    ← formato de salida JSON (UserResource, ProductResource, etc.)
│
├── Events/
│   ├── OrderCreated.php              ← se dispara al crear un pedido
│   └── OrderStatusUpdated.php        ← se dispara al cambiar el estado de un pedido
│   (ambos implementan ShouldBroadcast: listos para tiempo real, ver sección 8)
│
└── Console/Commands/Rehashpincodes.php  ← comando de mantenimiento de PINs

database/
├── migrations/    ← 16 tablas de negocio + tablas propias de Laravel/Sanctum
└── seeders/       ← datos de ejemplo (roles, sucursal, usuarios, categorías, productos, modificadores, mesas)

routes/api.php     ← TODAS las rutas de la API, agrupadas por nivel de permiso requerido
```

## 7. Recorrido por los endpoints principales

### Público (sin login)
- `GET /api/menu/{branchCode}` — menú completo de una sucursal, para el cliente final.
- `GET /api/products/{id}` — detalle de un plato.
- `POST /api/login` — login (email+password o PIN).

### Cualquier empleado autenticado
- `GET/POST /api/orders`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/status` — ciclo de vida de un pedido.
- `GET /api/tables` — ver mesas.
- `GET/PUT /api/me`, `PUT /api/me/password` — perfil propio.

### Cajero o superior (`role:50`)
- `GET/POST /api/invoices`, `PATCH /api/invoices/{id}/cancel` — facturación (con o sin IVA).
- `GET /api/waiters` — lista de meseros (para asignarles pedidos).

### Gerente o superior (`role:70`)
- `GET /api/dashboard`, `GET /api/reports/*` — estadísticas y reportes.
- CRUD de categorías, productos, modificadores; subida de imágenes y modelos 3D; reordenar/duplicar productos.
- CRUD de mesas y de reservas.

### Admin o superior (`role:90`)
- CRUD de sucursales (incluye papelera/restaurar).
- Datos de la empresa (`/api/company`, nombre + logo + tema).
- CRUD de usuarios.

> El listado exhaustivo de rutas, con verbos y roles exactos, vive en `routes/api.php` — es el archivo más corto y más útil para tener abierto mientras se explora la API.

## 8. Tiempo real (preparado, no forzado)

`OrderCreated` y `OrderStatusUpdated` implementan `ShouldBroadcast`: cuando se crea un pedido o cambia de estado, Laravel intenta emitir un evento a canales como `branch.{id}` u `order.{id}`. Por defecto `BROADCAST_CONNECTION=log` (no se transmite a nadie, solo queda en el log). Para que un panel de cocina reciba estos cambios en vivo, hay que configurar Reverb o Pusher en `.env` (ver `README_INSTALACION.md`, sección 11).

## 9. Realidad aumentada (AR)

No hay lógica de AR "del lado del servidor" más allá de guardar una URL: el campo `products.model_3d_url` apunta a un archivo `.glb`/`.gltf` (o `.usdz` para iOS). El frontend es quien lo renderiza (normalmente con `<model-viewer>` de Google). El backend solo:

- Guarda esa URL como parte del producto.
- Expone `POST /api/uploads/model` (gerente+) para subir el archivo del modelo 3D.
- Expone `scopeWithAR()` en el modelo `Product` para filtrar fácilmente los platos que tienen AR disponible.

## 10. Qué NO incluye este repo

- Frontend (React u otro) — es un proyecto aparte.
- WebSockets configurados de fábrica (Reverb/Pusher están soportados pero no activados).
- Generación de QR de mesas, notificaciones push, reportes avanzados con gráficos — mencionados como "próxima fase" en `README_FASE2.md`, no implementados todavía.

## 11. Archivos heredados dentro del repo

- `README.md` y `README_FASE2.md`: documentos de las entregas originales por fases (útiles como contexto histórico de por qué existe cada pieza, pero **desactualizados** como instructivo de instalación — para eso usar `README_INSTALACION.md`).
- `CLAUDE.md` / `AGENTS.md`: instrucciones genéricas del scaffold de Laravel Boost para agentes de IA, no específicas de este proyecto.
- `package.json`, `vite.config.js`, `resources/js`, `resources/css`: scaffold por defecto de Laravel (Breeze/Vite), sin relación con el frontend real del sistema — no hace falta tocarlos para trabajar con la API.
- `debug_query.php`, `debug_tables.php`: scripts sueltos de depuración en la raíz, no forman parte de la aplicación Laravel (no se cargan por rutas ni comandos artisan).

---

Para dejar esto corriendo en tu máquina, ver `README_INSTALACION.md`.
