<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RestaurantTable;
use App\Models\Reservation;
use Illuminate\Support\Carbon;

$branchId = 1;
$date = '2026-09-03';
$time = '19:00';
$guests = 2;

$base = Carbon::createFromFormat('H:i', $time);
$from = $base->copy()->subHours(2)->format('H:i');
$to = $base->copy()->addHours(2)->format('H:i');
echo "window: $from - $to" . PHP_EOL;

$reservedTableIds = Reservation::where('branch_id', $branchId)
    ->where('reservation_date', $date)
    ->whereIn('status', ['pending', 'confirmed'])
    ->whereTime('reservation_time', '>=', $from)
    ->whereTime('reservation_time', '<=', $to)
    ->pluck('table_id');

echo 'reserved ids: ' . json_encode($reservedTableIds) . PHP_EOL;

$query = RestaurantTable::where('branch_id', $branchId)
    ->where('is_active', true)
    ->where('capacity', '>=', $guests)
    ->whereNotIn('id', $reservedTableIds)
    ->where('status', 'free');

echo $query->toSql() . PHP_EOL;
echo json_encode($query->getBindings()) . PHP_EOL;

$tables = $query->get();
echo 'count: ' . $tables->count() . PHP_EOL;
foreach ($tables as $t) {
    echo json_encode($t->toArray()) . PHP_EOL;
}
