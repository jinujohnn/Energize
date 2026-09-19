<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnergyReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'energy_produced' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'energy_consumed' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'power_output' => ['sometimes', 'nullable', 'numeric', 'min:0'],

            'recorded_at' => ['sometimes', 'date'],
        ];
    }
}
