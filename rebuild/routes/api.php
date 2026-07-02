<?php

use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'UP']);
Route::apiResource('posts', PostController::class)->only(['index', 'store', 'show', 'destroy']);
Route::post('/posts/{post}/likes', [PostController::class, 'toggleLike'])->name('posts.likes.toggle');
