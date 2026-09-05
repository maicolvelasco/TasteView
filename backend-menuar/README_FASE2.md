# 🚀 FASE 2 — API RESTful + Frontend React + AR
## Sistema de Gestión Gastronómica

---

## 📦 Contenido del paquete

```
restaurant_fase2/
├── backend/                    ← Código Laravel 11
│   ├── app/
│   │   ├── Enums/              ← 8 Enums tipados
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── MenuController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── InvoiceController.php
│   │   │   │   └── AdminController.php
│   │   │   ├── Middleware/
│   │   │   │   └── CheckRole.php
│   │   │   └── Requests/Auth/
│   │   │       └── LoginRequest.php
│   │   └── Models/             ← 14 Modelos (de Fase 1)
│   ├── bootstrap/app.php       ← Registro de middleware 'role'
│   ├── config/cors.php         ← CORS configurado para React
│   └── routes/api.php          ← Todas las rutas de la API
│
└── frontend/                   ← Aplicación React
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js              ← Router con rutas protegidas
        ├── index.js
        ├── index.css
        ├── context/
        │   └── AuthContext.js  ← Login/logout/permisos
        ├── services/
        │   └── api.js          ← Axios con interceptores
        ├── utils/
        │   └── roles.js        ← Helpers y constantes
        ├── components/
        │   └── DashboardLayout.js
        └── pages/
            ├── LoginPage.js
            ├── Customer/
            │   └── MenuPage.js     ← Menú digital + AR
            ├── Waiter/
            │   └── WaiterPage.js   ← Toma de pedidos
            ├── Kitchen/
            │   └── KitchenPage.js  ← Panel de cocina
            ├── Cashier/
            │   └── CashierPage.js  ─ Caja y facturación
            └── Admin/
                ├── DashboardPage.js
                ├── UsersPage.js
                └── MenuPage.js
```

---

## 🔧 INSTALACIÓN BACKEND (Laravel)

### 1. Copiar archivos al proyecto Laravel existente

Desde tu carpeta `backend-laravel` (creada en Fase 1):

```bash
# Reemplazar bootstrap/app.php
cp restaurant_fase2/backend/bootstrap/app.php bootstrap/app.php

# Reemplazar rutas API
cp restaurant_fase2/backend/routes/api.php routes/api.php

# Reemplazar CORS
cp restaurant_fase2/backend/config/cors.php config/cors.php

# Copiar controladores
mkdir -p app/Http/Controllers/Api
cp restaurant_fase2/backend/app/Http/Controllers/Api/* app/Http/Controllers/Api/

# Copiar middleware
mkdir -p app/Http/Middleware
cp restaurant_fase2/backend/app/Http/Middleware/* app/Http/Middleware/

# Copiar requests
mkdir -p app/Http/Requests/Auth
cp restaurant_fase2/backend/app/Http/Requests/Auth/* app/Http/Requests/Auth/
```

### 2. Asegurar que Sanctum esté instalado
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 3. Verificar que el modelo User use HasApiTokens
En `app/Models/User.php` debe tener:
```php
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;
```

### 4. Ejecutar migraciones y seeders (si no lo hiciste en Fase 1)
```bash
php artisan migrate:fresh --seed
```

### 5. Iniciar servidor
```bash
php artisan serve
```

API disponible en: `http://127.0.0.1:8000/api`

---

## ⚛️ INSTALACIÓN FRONTEND (React)

### 1. Crear proyecto React (fuera de la carpeta Laravel)
```bash
npx create-react-app frontend-react
cd frontend-react
```

### 2. Instalar dependencias
```bash
npm install axios react-router-dom
```

### 3. Copiar archivos del paquete
```bash
# Reemplazar archivos base
cp restaurant_fase2/frontend/package.json package.json
cp restaurant_fase2/frontend/public/index.html public/index.html
cp restaurant_fase2/frontend/src/index.js src/index.js
cp restaurant_fase2/frontend/src/index.css src/index.css
cp restaurant_fase2/frontend/src/App.js src/App.js

# Copiar carpetas
mkdir -p src/context src/services src/utils src/components src/pages

cp -r restaurant_fase2/frontend/src/context/* src/context/
cp -r restaurant_fase2/frontend/src/services/* src/services/
cp -r restaurant_fase2/frontend/src/utils/* src/utils/
cp -r restaurant_fase2/frontend/src/components/* src/components/
cp -r restaurant_fase2/frontend/src/pages/* src/pages/
```

### 4. Iniciar frontend
```bash
npm start
```

App disponible en: `http://localhost:3000`

---

## 🔐 ENDPOINTS DE LA API

### Públicos (sin autenticación)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/menu/{branchCode}` | Menú completo de una sucursal |
| GET | `/api/products/{id}` | Detalle de un producto |
| POST | `/api/login` | Login por email o PIN |

### Protegidos (requieren Bearer token)
| Método | Endpoint | Rol mínimo | Descripción |
|--------|----------|------------|-------------|
| POST | `/api/logout` | Todos | Cerrar sesión |
| GET | `/api/me` | Todos | Perfil del usuario |
| GET | `/api/orders` | Todos | Listar pedidos |
| POST | `/api/orders` | Todos | Crear pedido |
| GET | `/api/orders/{id}` | Todos | Ver pedido |
| PATCH | `/api/orders/{id}/status` | Todos | Actualizar estado |
| GET | `/api/invoices` | Cajero+ | Listar facturas |
| POST | `/api/invoices` | Cajero+ | Emitir factura |
| GET | `/api/invoices/{id}` | Cajero+ | Ver factura/ticket |
| PATCH | `/api/invoices/{id}/cancel` | Cajero+ | Anular factura |
| GET | `/api/dashboard` | Gerente+ | Estadísticas |
| POST | `/api/categories` | Gerente+ | Crear categoría |
| POST | `/api/products` | Gerente+ | Crear producto |
| PUT | `/api/products/{id}` | Gerente+ | Editar producto |
| DELETE | `/api/products/{id}` | Gerente+ | Eliminar producto |
| POST | `/api/modifiers` | Gerente+ | Crear modificador |
| GET | `/api/branches` | Admin+ | Listar sucursales |
| POST | `/api/branches` | Admin+ | Crear sucursal |
| GET | `/api/users` | Admin+ | Listar usuarios |
| POST | `/api/users` | Admin+ | Crear usuario |
| PUT | `/api/users/{id}` | Admin+ | Editar usuario |

---

## 🥽 REALIDAD AUMENTADA (AR)

### Cómo funciona
1. El cliente abre el menú digital: `http://localhost:3000/menu/SUC-001`
2. Toca un plato que tenga el badge **"🥽 AR"**
3. En el modal, toca **"Ver en AR"**
4. Se abre el visor `<model-viewer>` de Google
5. Toca el botón azul **"Ver en tu espacio (AR)"**
6. Apunta la cámara a una superficie plana (mesa)
7. ¡El modelo 3D del plato aparece en la mesa real!

### Para agregar modelos 3D
En el panel de Admin → Gestionar Menú → Crear/Editar Plato:
- Campo **"URL modelo 3D (AR)"**: ingresa la URL de un archivo `.glb` o `.gltf`
- Puedes subir modelos a: GitHub Pages, Google Drive (público), o tu propio CDN
- Formato recomendado: **glTF 2.0 (.glb)**
- Tamaño recomendado: **< 10 MB** para carga rápida en móviles

### Modelos de prueba gratuitos
- [Google Poly (archivo)](https://poly.google.com)
- [Sketchfab](https://sketchfab.com) (descargar en formato glTF)
- [Khronos Group Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)

---

## 🎨 FLUJO DE USUARIOS

### Cliente (Público)
```
/menu/SUC-001 → Explora categorías → Toca plato → Lee historia/ingredientes
→ Toca "Ver en AR" → Cámara AR → Modelo 3D en mesa
```

### Mesero
```
/login → PIN: 9012 → Panel "Toma de Pedidos"
→ Selecciona mesa → Agrega productos al carrito
→ Especifica notas/modificadores → "Enviar Pedido"
→ Tab "Mis Pedidos" para ver historial
```

### Cocinero
```
/login → PIN: 5678 → Panel "Cocina"
→ Ve pedidos entrantes → Toca "Empezar" en cada item
→ Cuando está listo → "Listo"
→ Se actualiza automáticamente para el mesero
```

### Cajero
```
/login → PIN: 1234 → Panel "Caja"
→ Tab "Pedidos por Cobrar" → Selecciona pedido listo
→ Ingresa datos del cliente → Selecciona método de pago
→ Marca "Incluir IVA" según corresponda → "Cobrar e Imprimir"
→ Se abre ventana de impresión con formato ticket térmico
```

### Gerente
```
/login → email: gerente@restaurant.com → Panel "Dashboard"
→ Ver estadísticas en tiempo real
→ Tab "Gestionar Menú" → Crear/editar/eliminar platos
→ Agregar URLs de modelos 3D para AR
```

### Admin
```
/login → email: admin@restaurant.com → Panel "Dashboard"
→ Tab "Usuarios" → Crear/editar usuarios de todos los roles
→ Tab "Gestionar Menú" → Control total del menú
```

---

## 📋 CHECKLIST DE FUNCIONALIDADES FASE 2

| # | Funcionalidad | Estado |
|---|---------------|--------|
| 1 | Login por email/password | ✅ |
| 2 | Login por PIN rápido | ✅ |
| 3 | Middleware de roles jerárquico | ✅ |
| 4 | Menú digital público por sucursal | ✅ |
| 5 | Visualizador AR con model-viewer | ✅ |
| 6 | Toma de pedidos (mesero) | ✅ |
| 7 | Carrito con cantidades y notas | ✅ |
| 8 | Historial de pedidos por mesero | ✅ |
| 9 | Panel de cocina con estados en tiempo real | ✅ |
| 10 | Actualización de estado por item | ✅ |
| 11 | Panel de caja con facturación | ✅ |
| 12 | Factura con/sin IVA | ✅ |
| 13 | Impresión de ticket térmico | ✅ |
| 14 | Dashboard con estadísticas | ✅ |
| 15 | CRUD de usuarios (Admin) | ✅ |
| 16 | CRUD de menú (Gerente) | ✅ |
| 17 | Modelos 3D para AR en productos | ✅ |

---

## 🚀 PRÓXIMA FASE (FASE 3)

- WebSockets para actualizaciones en tiempo real (pedidos, cocina)
- Generador de códigos QR por mesa
- App móvil con PWA
- Reportes avanzados y gráficos
- Sistema de reservas
- Notificaciones push

---

*FASE 2 completada — Backend API + Frontend React + AR integrados.*
