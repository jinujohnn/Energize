<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnergyReading extends Model
{
    protected $fillable = [
        'asset_id',
        'energy_produced',
        'energy_consumed',
        'power_output',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'energy_produced' => 'decimal:2',
            'energy_consumed' => 'decimal:2',
            'power_output' => 'decimal:2',
            'recorded_at' => 'datetime',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}