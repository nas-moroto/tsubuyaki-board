# 社内つぶやきボード rebuild

Laravel + React で実装した社内つぶやきボードです。

## 実装済み

- 投稿一覧: `GET /posts`、新着順最大 50 件、0 件表示
- 投稿作成: `GET /posts/new`、`POST /api/posts`
- バリデーション: 投稿者 1..30 文字、本文 1..280 文字、空白のみ不可
- 投稿詳細: `GET /posts/{id}`
- ヘルスチェック: `/actuator/health` と `/api/health`
- いいね: `POST /api/posts/{id}/likes`、IP + UA の SHA-256 先頭 8 文字でトグル
- キーワード検索: `GET /posts?q=xxx`、本文部分一致
- 投稿者名 + アバター色
- 投稿削除: `DELETE /api/posts/{id}`、論理削除

## 起動

```bash
cd rebuild
composer install
cp dotenv.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
npm install
npm run build
php artisan serve
```

開発時は別ターミナルで `npm run dev` を起動します。

## テスト

```bash
cd rebuild
php artisan test
```
