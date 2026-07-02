<?php

use Illuminate\Support\Facades\Route;

Route::get('/actuator/health', fn () => response()->json(['status' => 'UP']));
Route::view('/', 'app');
Route::view('/posts', 'app');
Route::view('/posts/new', 'app');
Route::view('/posts/{post}', 'app')->whereNumber('post');
