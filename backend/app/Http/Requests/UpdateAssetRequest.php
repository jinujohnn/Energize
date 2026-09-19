<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],

            'type' => [
                'sometimes',
                'in:solar_panel,inverter,battery,wind_turbine,other'
            ],

            'status' => [
                'sometimes',
                'in:operational,maintenance,offline'
            ],

            'location' => ['nullable', 'string', 'max:255'],

            'capacity' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'last_maintenance_at' => [
                'nullable',
                'date'
            ],
        ];
    }
}