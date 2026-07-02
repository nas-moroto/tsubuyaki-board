<?php

namespace App\Services;

use Illuminate\Http\Request;

class ClientHash
{
    public function fromRequest(Request $request): string
    {
        $source = $request->ip().'|'.$request->userAgent();

        return substr(hash('sha256', $source), 0, 8);
    }
}
