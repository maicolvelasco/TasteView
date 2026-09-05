<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = App\Models\RestaurantTable::all(['id', 'branch_id', 'status', 'is_active', 'capacity']);
foreach ($tables as $t) {
    echo json_encode($t->toArray()) . PHP_EOL;
}

echo '---reservations---' . PHP_EOL;
$reservations = App\Models\Reservation::all(['id', 'branch_id', 'table_id', 'reservation_date', 'reservation_time', 'status']);
foreach ($reservations as $r) {
    echo json_encode($r->toArray()) . PHP_EOL;
}
