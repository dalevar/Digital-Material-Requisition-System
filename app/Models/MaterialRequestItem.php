<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'material_id',
        'description',
        'qty',
        'uom',
        'soh',
        'balance',
        'note',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'soh' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(MaterialRequest::class, 'request_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
