<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Models\Post;
use App\Services\ClientHash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->query('q', ''));
        $posts = Post::query()
            ->when($keyword !== '', fn ($query) => $query->bodyContains($keyword))
            ->latestBoard()
            ->get();

        return response()->json([
            'data' => $posts,
            'q' => $keyword,
        ]);
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = Post::create($request->validated())->loadCount('likes');

        return response()->json([
            'data' => $post,
        ], 201);
    }

    public function show(Post $post, Request $request, ClientHash $clientHash): JsonResponse
    {
        $hash = $clientHash->fromRequest($request);
        $post->loadCount('likes');

        return response()->json([
            'data' => $post,
            'liked_by_client' => $post->likes()->where('client_hash', $hash)->exists(),
        ]);
    }

    public function toggleLike(Post $post, Request $request, ClientHash $clientHash): JsonResponse
    {
        $hash = $clientHash->fromRequest($request);
        $liked = $post->likes()->where('client_hash', $hash)->exists();

        if ($liked) {
            $post->likes()->where('client_hash', $hash)->delete();
        } else {
            $post->likes()->create(['client_hash' => $hash]);
        }

        $post->loadCount('likes');

        return response()->json([
            'data' => $post,
            'liked_by_client' => ! $liked,
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json(status: 204);
    }
}
