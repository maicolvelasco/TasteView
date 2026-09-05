<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Hashea los PIN codes que todavía estén en texto plano.
 *
 * Uso:
 *   php artisan users:rehash-pins
 *   php artisan users:rehash-pins --dry-run   (solo muestra qué haría)
 *
 * Es idempotente y seguro de correr varias veces: si un pin_code ya
 * es un hash bcrypt válido, se deja tal cual.
 */
class RehashPinCodes extends Command
{
    protected $signature = 'users:rehash-pins {--dry-run : Solo muestra qué se haría, sin guardar cambios}';

    protected $description = 'Hashea los pin_code de usuarios que aún estén en texto plano';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        // Se lee con query builder crudo (no el modelo) para evitar que el
        // cast 'hashed' de User intercepte la lectura/escritura mientras
        // decidimos manualmente qué valores ya son hashes.
        $users = DB::table('users')
            ->whereNotNull('pin_code')
            ->select('id', 'pin_code')
            ->get();

        $toRehash = $users->filter(fn ($user) => !$this->looksLikeBcryptHash($user->pin_code));

        if ($toRehash->isEmpty()) {
            $this->info('No hay pin_code en texto plano. Nada que hacer.');

            return self::SUCCESS;
        }

        $this->info("Se encontraron {$toRehash->count()} pin_code en texto plano.");

        if ($dryRun) {
            $this->table(['id'], $toRehash->map(fn ($u) => [$u->id])->toArray());
            $this->comment('Dry-run: no se guardó ningún cambio.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($toRehash) {
            foreach ($toRehash as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['pin_code' => Hash::make($user->pin_code)]);
            }
        });

        $this->info("Listo: {$toRehash->count()} pin_code hasheados correctamente.");

        return self::SUCCESS;
    }

    private function looksLikeBcryptHash(string $value): bool
    {
        return (bool) preg_match('/^\$2[aby]\$\d{2}\$.{53}$/', $value);
    }
}