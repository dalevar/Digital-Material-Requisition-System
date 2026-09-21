<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_number',
        'description',
        'category_id',
        'uom',
        'minimum_stock',
        'maximum_stock',
        'storage_location',
        'plant_id',
        'qr_code',
        'status',
    ];

    protected $casts = [
        'minimum_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MaterialCategory::class, 'category_id');
    }

    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    public function stockBalance(): HasOne
    {
        return $this->hasOne(StockBalance::class);
    }

    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class);
    }

    public function getSohAttribute(): float
    {
        return (float) ($this->stockBalance?->quantity ?? 0);
    }

    public function getStockStatusAttribute(): string
    {
        $soh = $this->soh;
        if ($soh <= 0) {
            return 'OUT_OF_STOCK';
        }
        if ($soh <= $this->minimum_stock) {
            return 'LOW_STOCK';
        }

        return 'NORMAL';
    }
}
