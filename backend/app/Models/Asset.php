<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'type',
        'status',
        'location',
        'capacity',
        'last_maintenance_at',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'decimal:2',
            'last_maintenance_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}