<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProposalQuickPitchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in the controller via policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'quickpitch' => [
                'required',
                'string',
                'url',
                'max:500',
                function ($attribute, $value, $fail) {
                    $youtubeRegex = '/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/';
                    $vimeoRegex = '/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/';

                    if (! preg_match($youtubeRegex, $value) && ! preg_match($vimeoRegex, $value)) {
                        $fail('The quickpitch must be a valid YouTube or Vimeo URL.');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom error messages for validator.
     */
    public function messages(): array
    {
        return [
            'quickpitch.required' => 'A quick pitch URL is required.',
            'quickpitch.url' => 'The quick pitch must be a valid URL.',
            'quickpitch.max' => 'The quick pitch URL may not be greater than 500 characters.',
        ];
    }
}
