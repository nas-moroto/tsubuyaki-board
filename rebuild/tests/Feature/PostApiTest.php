<?php

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_投稿一覧_新着順で最大50件を返す(): void
    {
        Post::factory()->count(55)->sequence(
            fn ($sequence) => ['created_at' => now()->subMinutes($sequence->index)]
        )->create();

        $response = $this->getJson('/api/posts');

        $response->assertOk()
            ->assertJsonCount(50, 'data');
    }

    public function test_投稿作成_空白のみは422を返す(): void
    {
        $response = $this->postJson('/api/posts', [
            'author' => '   ',
            'body' => '   ',
            'avatar_color' => 'blue',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['author', 'body']);
    }

    public function test_投稿作成_正しい入力なら作成する(): void
    {
        $response = $this->postJson('/api/posts', [
            'author' => '山田',
            'body' => 'Laravel と React で再実装しました',
            'avatar_color' => 'green',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.author', '山田');
        $this->assertDatabaseHas('posts', ['author' => '山田']);
    }

    public function test_検索_本文部分一致だけを返す(): void
    {
        Post::factory()->create(['body' => '今日は Laravel の演習です']);
        Post::factory()->create(['body' => 'React の画面を作ります']);

        $response = $this->getJson('/api/posts?q=Laravel');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', '今日は Laravel の演習です');
    }

    public function test_いいね_同じクライアントはトグルする(): void
    {
        $post = Post::factory()->create();

        $this->postJson("/api/posts/{$post->id}/likes")->assertOk()
            ->assertJsonPath('data.likes_count', 1)
            ->assertJsonPath('liked_by_client', true);

        $this->postJson("/api/posts/{$post->id}/likes")->assertOk()
            ->assertJsonPath('data.likes_count', 0)
            ->assertJsonPath('liked_by_client', false);
    }

    public function test_削除_論理削除して一覧から除外する(): void
    {
        $post = Post::factory()->create();

        $this->deleteJson("/api/posts/{$post->id}")->assertNoContent();
        $this->getJson('/api/posts')->assertOk()->assertJsonCount(0, 'data');
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }
}
