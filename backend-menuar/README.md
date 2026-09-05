# 🍽️ FASE 1 — Modelo de Base de Datos
## Sistema de Gestión Gastronómica con AR

### Arquitectura
- **Backend:** Laravel 13 (API pura)
- **Base de Datos:** MySQL 8+ / PostgreSQL 15+
- **Frontend:** React (separado)

---

## 📁 Estructura de archivos entregados

```
restaurant_db_fase1/
├── migrations/           ← 14 archivos de migración
│   ├── 2024_01_01_000001_create_companies_table.php
│   ├── 2024_01_01_000002_create_branches_table.php
│   ├── 2024_01_01_000003_create_roles_table.php
│   ├── 2024_01_01_000004_create_users_table.php
│   ├── 2024_01_01_000005_create_categories_table.php
│   ├── 2024_01_01_000006_create_products_table.php
│   ├── 2024_01_01_000007_create_modifiers_table.php
│   ├── 2024_01_01_000008_create_modifier_options_table.php
│   ├── 2024_01_01_000009_create_product_modifiers_table.php
│   ├── 2024_01_01_000010_create_tables_table.php
│   ├── 2024_01_01_000011_create_orders_table.php
│   ├── 2024_01_01_000012_create_order_items_table.php
│   ├── 2024_01_01_000013_create_order_item_modifiers_table.php
│   └── 2024_01_01_000014_create_invoices_table.php
│
├── models/               ← 14 modelos Eloquent con relaciones
│   ├── Company.php
│   ├── Branch.php
│   ├── Role.php
│   ├── User.php
│   ├── Category.php
│   ├── Product.php
│   ├── Modifier.php
│   ├── ModifierOption.php
│   ├── ProductModifier.php
│   ├── RestaurantTable.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── OrderItemModifier.php
│   └── Invoice.php
│
├── enums/                ← 8 Enums tipados de PHP 8.1
│   ├── OrderStatus.php
│   ├── OrderItemStatus.php
│   ├── OrderType.php
│   ├── PaymentStatus.php
│   ├── PaymentMethod.php
│   ├── TableStatus.php
│   ├── InvoiceStatus.php
│   └── RoleLevel.php
│
└── seeders/              ← 8 seeders con datos de prueba
    ├── DatabaseSeeder.php
    ├── RoleSeeder.php
    ├── BranchSeeder.php
    ├── UserSeeder.php
    ├── CategorySeeder.php
    ├── ProductSeeder.php
    ├── ModifierSeeder.php
    └── TableSeeder.php
```

---

## 🚀 Instalación paso a paso

### 1. Preparar Laravel 11
```bash
composer create-project laravel/laravel backend-laravel
cd backend-laravel
```

### 2. Configurar base de datos en `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant_db
DB_USERNAME=root
DB_PASSWORD=tu_password
```

### 3. Copiar archivos

#### Migraciones
Copia los 14 archivos de `migrations/` a:
```
database/migrations/
```

> ⚠️ **IMPORTANTE:** Elimina la migración original de `users` que crea Laravel (`0001_01_01_000000_create_users_table.php`) y reemplázala por la nuestra.

#### Modelos
Copia los 14 archivos de `models/` a:
```
app/Models/
```

#### Enums
Crea la carpeta y copia:
```bash
mkdir -p app/Enums
cp enums/* app/Enums/
```

#### Seeders
Copia los 8 archivos de `seeders/` a:
```
database/seeders/
```

### 4. Instalar Sanctum (para autenticación API)
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 5. Ejecutar migraciones y seeders
```bash
php artisan migrate:fresh --seed
```

### 6. Verificar
```bash
php artisan serve
```

Prueba en tu navegador:
- `http://127.0.0.1:8000/api/saludo` (si ya tenías la ruta de prueba)

---

## 📊 Resumen del Modelo de Datos

| Entidad | Descripción |
|---------|-------------|
| **companies** | Empresas (multi-tenant futuro) |
| **branches** | Sucursales con configuración propia |
| **roles** | 7 roles jerárquicos con nivel numérico |
| **users** | Usuarios con autenticación + PIN rápido |
| **categories** | Categorías de menú por sucursal |
| **products** | Platos con historia, ingredientes y modelo 3D para AR |
| **modifiers** | Grupos de personalización (término, guarnición, etc.) |
| **modifier_options** | Opciones dentro de cada modificador con ajuste de precio |
| **product_modifiers** | Relación N:M producto-modificador con sobrescritura de reglas |
| **tables** | Mesas con QR único para escaneo del cliente |
| **orders** | Pedidos con número autogenerado, estados y totales |
| **order_items** | Líneas de pedido con notas personalizadas y chef asignado |
| **order_item_modifiers** | Modificadores seleccionados con snapshot de precios |
| **invoices** | Facturas con opción de incluir/excluir IVA |

---

## 🔐 Usuarios de prueba (seeders)

| Rol | Email | Contraseña | PIN |
|-----|-------|------------|-----|
| Super Admin | superadmin@restaurant.com | password123 | — |
| Administrador | admin@restaurant.com | password123 | — |
| Gerente | gerente@restaurant.com | password123 | — |
| Cajero | cajero@restaurant.com | password123 | 1234 |
| Chef | chef@restaurant.com | password123 | 5678 |
| Mesero | mesero@restaurant.com | password123 | 9012 |

---

## 🎯 Características clave del diseño

1. **Multi-sucursal:** Cada tabla tiene `branch_id` para aislamiento de datos
2. **Multi-tenant ready:** Tabla `companies` preparada para escalar
3. **AR Ready:** Campo `model_3d_url` en productos para modelos glTF/USDZ
4. **Snapshots:** Los modificadores en pedidos guardan nombre y precio al momento de la compra
5. **Jerarquía de roles:** Basada en niveles numéricos (RoleLevel enum)
6. **Soft Deletes:** En todas las entidades principales
7. **Índices optimizados:** Para consultas frecuentes (pedidos por sucursal, por mesero, etc.)
8. **Números autogenerados:** `order_number` y `invoice_number` con formato único

---

## 📝 Próxima Fase (FASE 2)

- API RESTful con autenticación Sanctum
- Endpoints para menú digital público
- Integración de visor AR (model-viewer / 8th Wall)
- Panel de administración en React

---

*Arquitectura diseñada por Arquitecto de Software Senior — FASE 1 completada.*
