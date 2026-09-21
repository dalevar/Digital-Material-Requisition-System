<?php

namespace App\Models;

use App\Enums\StockTransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'transaction_type',
        'reference_type',
        'reference_id',
        'reference_no',
        'qty_in',
        'qty_out',
        'balance_after',
        'supplier',
        'storage_location',
        'reason',
        'transaction_date',
        'user_id',
        'note',
    ];

    protected $casts = [
        'transaction_type' => StockTransactionType::class,
        'qty_in' => 'decimal:2',
        'qty_out' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
