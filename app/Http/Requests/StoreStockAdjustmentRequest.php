<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'material_id' => ['required', 'exists:materials,id'],
            'adjustment_quantity' => ['nullable', 'numeric'],
            'target_qty' => ['nullable', 'numeric'],
            'transaction_date' => ['nullable', 'date'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $adjQty = $this->input('adjustment_quantity');
            if ($adjQty === null && $this->has('target_qty') && $this->has('material_id')) {
                // Backward compatibility calculation if target_qty is passed
                $materialId = $this->input('material_id');
                $stockBalance = \App\Models\StockBalance::where('material_id', $materialId)->first();
                $currentSoh = $stockBalance ? (float) $stockBalance->quantity : 0;
                $adjQty = (float) $this->input('target_qty') - $currentSoh;
            }

            if ($adjQty === null || ! is_numeric($adjQty) || abs((float) $adjQty) < 0.00001) {
                $validator->errors()->add('adjustment_quantity', 'Adjustment quantity cannot be zero.');
            }
        });
    }

    public function getAdjustmentQuantity(): float
    {
        if ($this->filled('adjustment_quantity')) {
            return (float) $this->input('adjustment_quantity');
        }

        if ($this->has('target_qty') && $this->has('material_id')) {
            $materialId = $this->input('material_id');
            $stockBalance = \App\Models\StockBalance::where('material_id', $materialId)->first();
            $currentSoh = $stockBalance ? (float) $stockBalance->quantity : 0;

            return (float) $this->input('target_qty') - $currentSoh;
        }

        return 0.0;
    }

    public function getTransactionDate(): ?string
    {
        return $this->input('transaction_date');
    }
}
