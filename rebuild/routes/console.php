<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:tsubuyaki', function (): void {
    $this->info('社内つぶやきボード Laravel + React rebuild');
});
