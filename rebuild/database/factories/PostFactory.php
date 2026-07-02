<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    /**
     * @return array<string, string>
     */
    public function definition(): array
    {
        return [
            'author' => fake()->name(),
            'body' => fake()->realText(120),
            'avatar_color' => fake()->randomElement(['slate', 'blue', 'green', 'amber', 'rose', 'violet']),
        ];
    }
}
