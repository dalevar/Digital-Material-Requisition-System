<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'material_id' => ['required', 'exists:materials,id'],
            'quantity' => ['nullable', 'numeric', 'gt:0'],
            'qty' => ['nullable', 'numeric', 'gt:0'],
            'transaction_date' => ['nullable', 'date'],
            'reference' => ['nullable', 'string', 'max:100'],
            'reference_no' => ['nullable', 'string', 'max:100'],
            'supplier' => ['nullable', 'string', 'max:100'],
            'storage_location' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $qty = $this->input('quantity') ?? $this->input('qty');
            if ($qty === null || ! is_numeric($qty) || (float) $qty <= 0) {
                $validator->errors()->add('quantity', 'Quantity must be a numeric value greater than zero.');
            }
        });
    }

    public function getQuantity(): float
    {
        return (float) ($this->input('quantity') ?? $this->input('qty'));
    }

    public function getReferenceNo(): ?string
    {
        return $this->input('reference') ?? $this->input('reference_no');
    }

    public function getTransactionDate(): ?string
    {
        return $this->input('transaction_date');
    }
}
