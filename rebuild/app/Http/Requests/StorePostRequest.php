<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'author' => ['required', 'string', 'min:1', 'max:30', 'not_regex:/^\s+$/u'],
            'body' => ['required', 'string', 'min:1', 'max:280', 'not_regex:/^\s+$/u'],
            'avatar_color' => ['required', 'string', 'in:slate,blue,green,amber,rose,violet'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'author' => '投稿者名',
            'body' => '本文',
            'avatar_color' => 'アバター色',
        ];
    }
}
