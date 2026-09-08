# 🍽️ Instalación — Backend MenuAR

API REST en **Laravel 13** para un sistema de gestión gastronómica (menú digital, pedidos, cocina, caja, reservas y realidad aumentada). Este documento explica cómo dejar el backend corriendo en tu máquina desde cero.

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| PHP | 8.3+ | Necesita las extensiones típicas de Laravel (mbstring, pdo, sqlite/mysql, etc.) |
| Composer | 2.x | Gestor de dependencias de PHP |
| Node.js + npm | 18+ | Solo compila los assets del scaffold por defecto de Laravel (Vite); no es el frontend del proyecto |
| Base de datos | SQLite (por defecto) o MySQL 8+ / PostgreSQL 15+ | El proyecto viene preconfigurado para SQLite, cero configuración |

> El **frontend real** (React) de este sistema vive en un repositorio/paquete aparte. Este repo es **solo el backend/API**.

---

## 2. Clonar e instalar dependencias

```bash
composer install
npm install
```

## 3. Configurar el entorno

Copia el archivo de ejemplo y genera la clave de la aplicación:

```bash
cp .env.example .env
php artisan key:generate
```

El proyecto ya viene listo para trabajar con **SQLite** sin tocar nada (`DB_CONNECTION=sqlite`). Si preferís MySQL/PostgreSQL, edita `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=menuar
DB_USERNAME=root
DB_PASSWORD=tu_password
```

Si usás SQLite y el archivo no existe todavía:

```bash
touch database/database.sqlite
```

> Nota: en este repo ya viene un `database/database.sqlite` de ejemplo. Si querés partir de cero, podés borrarlo y volver a crearlo vacío antes de migrar.

## 4. Migrar y sembrar datos de prueba

```bash
php artisan migrate:fresh --seed
```

Esto crea todas las tablas (empresas, sucursales, roles, usuarios, categorías, productos, modificadores, mesas, pedidos, facturas, reservas, logs de actividad, tokens de Sanctum, etc.) y carga datos de ejemplo mediante los seeders (`RoleSeeder`, `BranchSeeder`, `UserSeeder`, `CategorySeeder`, `ProductSeeder`, `ModifierSeeder`, `TableSeeder`).

⚠️ **`UserSeeder` no corre en `APP_ENV=production`** (se salta a propósito) porque crea contraseñas y PINs de ejemplo conocidos. Para producción, cargá usuarios reales manualmente o con un seeder propio.

### Usuarios de prueba creados por el seeder

| Rol | Email | Contraseña | PIN |
|---|---|---|---|
| Super Admin | `superadmin@restaurant.com` | `password123` | — |
| Administrador | `admin@restaurant.com` | `password123` | — |
| Gerente | `gerente@restaurant.com` | `password123` | — |
| Cajero | `cajero@restaurant.com` | `password123` | `1234` |
| Chef | `chef@restaurant.com` | `password123` | `5678` |
| Mesero | `mesero@restaurant.com` | `password123` | `9012` |

## 5. Levantar el servidor

```bash
php artisan serve
```

La API queda disponible en `http://127.0.0.1:8000/api`.

Alternativa: `composer run dev` levanta en paralelo el servidor PHP y el watcher de Vite (usa el script `dev` definido en `composer.json`).

## 6. Probar que funciona

```bash
curl http://127.0.0.1:8000/api/menu/<codigo_de_sucursal>
```

O hacé login con uno de los usuarios de prueba:

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"password123"}'
```

Deberías recibir un `token` de Sanctum en la respuesta, que se usa como `Authorization: Bearer <token>` en el resto de los endpoints protegidos.

## 7. Subida de archivos (imágenes de platos / modelos 3D para AR)

El disco de subida por defecto (`uploads`, ver `config/filesystems.php`) guarda los archivos directo en `public/uploads/`, **sin necesitar** `php artisan storage:link`. Esto está pensado para poder desplegar en hosting compartido (cPanel) sin acceso a la terminal. Asegurate de que esa carpeta tenga permisos de escritura:

```bash
chmod -R 775 public/uploads storage bootstrap/cache
```

## 8. CORS y frontend

Si vas a conectar un frontend en otro puerto/dominio, agregá su origen en `config/cors.php` (`allowed_origins`). Ya vienen habilitados por defecto `localhost:3000`, `127.0.0.1:3000`, `localhost:5173` y `127.0.0.1:5173` (React CRA y Vite).

## 9. Tests

```bash
composer test
```

## 10. Comandos útiles del proyecto

```bash
# Re-hashear PINs que hayan quedado en texto plano (idempotente)
php artisan users:rehash-pins
php artisan users:rehash-pins --dry-run   # solo muestra qué haría, sin guardar
```

## 11. Notas de despliegue a producción

- Poné `APP_ENV=production` y `APP_DEBUG=false`.
- No corras `UserSeeder` en producción (está bloqueado a propósito, pero no confíes solo en eso: usá tus propios usuarios/seeders).
- Configurá `BROADCAST_CONNECTION` a `reverb` o `pusher` si querés que los eventos en tiempo real (`OrderCreated`, `OrderStatusUpdated`) lleguen a los clientes; por defecto está en `log` (no transmite a nadie).
- Agregá tu dominio real en `config/cors.php`.
- Revisá `SANCTUM_STATEFUL_DOMAINS` en `.env` si el frontend consume la API con cookies/sesión en vez de token Bearer.

---

Con esto el backend queda operativo. Para entender **qué hace cada parte** del código, ver `README_CONTENIDO.md`.
