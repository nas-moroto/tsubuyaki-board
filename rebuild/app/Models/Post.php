<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const MAX_LATEST = 50;

    protected $fillable = [
        'author',
        'body',
        'avatar_color',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function scopeLatestBoard(Builder $query): Builder
    {
        return $query->withCount('likes')
            ->latest('created_at')
            ->limit(self::MAX_LATEST);
    }

    public function scopeBodyContains(Builder $query, string $keyword): Builder
    {
        return $query->where('body', 'like', '%'.$keyword.'%');
    }
}
