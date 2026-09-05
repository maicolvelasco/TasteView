<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Un hash bcrypt ocupa 60 caracteres; el PIN en texto plano
            // estaba limitado a 10. Se amplía para poder guardar el hash.
            $table->string('pin_code', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('pin_code', 10)->nullable()->change();
        });
    }
};
