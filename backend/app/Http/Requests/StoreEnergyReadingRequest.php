<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnergyReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'energy_produced' => ['nullable', 'numeric', 'min:0'],
            'energy_consumed' => ['nullable', 'numeric', 'min:0'],
            'power_output' => ['nullable', 'numeric', 'min:0'],
            'recorded_at' => ['required', 'date'],
        ];
    }
}