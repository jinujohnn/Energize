<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->enum('type', [
                'solar_panel',
                'inverter',
                'battery',
                'wind_turbine',
                'other'
            ]);

            $table->enum('status', [
                'operational',
                'maintenance',
                'offline'
            ])->default('operational');

            $table->string('location')->nullable();

            $table->decimal('capacity', 10, 2)->nullable();

            $table->timestamp('last_maintenance_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
