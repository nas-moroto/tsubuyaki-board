import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const colors = [
  { id: 'slate', label: 'Slate', value: '#475569' },
  { id: 'blue', label: 'Blue', value: '#2563eb' },
  { id: 'green', label: 'Green', value: '#15803d' },
  { id: 'amber', label: 'Amber', value: '#b45309' },
  { id: 'rose', label: 'Rose', value: '#be123c' },
  { id: 'violet', label: 'Violet', value: '#7c3aed' },
];

const initialForm = {
  author: '',
  body: '',
  avatar_color: 'blue',
};

function api(path, options = {}) {
  return fetch(path, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
}

function pathState() {
  const path = window.location.pathname;
  const match = path.match(/^\/posts\/(\d+)$/);
  const search = window.location.search;

  if (path === '/' || path === '/posts') {
    return { page: 'list', search };
  }
  if (path === '/posts/new') {
    return { page: 'new', search };
  }
  if (match) {
    return { page: 'detail', id: match[1], search };
  }
  return { page: 'list', search };
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function colorValue(id) {
  return colors.find((color) => color.id === id)?.value ?? colors[1].value;
}

function useRouter() {
  const [route, setRoute] = useState(pathState);

  useEffect(() => {
    const onPopState = () => setRoute(pathState());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setRoute(pathState());
  }, []);

  return [route, navigate];
}

function App() {
  const [route, navigate] = useRouter();

  return (
    <main className="app-shell">
      <Header navigate={navigate} />
      {route.page === 'list' && <PostList key={route.search} navigate={navigate} />}
      {route.page === 'new' && <PostForm navigate={navigate} />}
      {route.page === 'detail' && <PostDetail id={route.id} navigate={navigate} />}
    </main>
  );
}

function Header({ navigate }) {
  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => navigate('/posts')}>
        <span className="brand-mark">つ</span>
        <span>社内つぶやきボード</span>
      </button>
      <button className="primary-button" type="button" onClick={() => navigate('/posts/new')}>
        投稿する
      </button>
    </header>
  );
}

function PostList({ navigate }) {
  const searchParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [appliedQuery, setAppliedQuery] = useState(searchParams.get('q') ?? '');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async (keyword) => {
    setLoading(true);
    setError('');
    const suffix = keyword ? `?q=${encodeURIComponent(keyword)}` : '';
    const response = await api(`/api/posts${suffix}`);
    if (!response.ok) {
      setError('投稿一覧を取得できませんでした。');
      setLoading(false);
      return;
    }
    const payload = await response.json();
    setPosts(payload.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts(appliedQuery);
  }, [appliedQuery, loadPosts]);

  function submitSearch(event) {
    event.preventDefault();
    const normalized = query.trim();
    const to = normalized ? `/posts?q=${encodeURIComponent(normalized)}` : '/posts';
    window.history.pushState({}, '', to);
    setAppliedQuery(normalized);
  }

  return (
    <section className="content">
      <div className="section-head">
        <div>
          <h1>投稿一覧</h1>
          <p>最新 50 件を新着順に表示します。</p>
        </div>
        <form className="search" onSubmit={submitSearch}>
          <input
            aria-label="本文検索"
            placeholder="本文を検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">検索</button>
        </form>
      </div>

      {loading && <p className="notice">読み込み中です。</p>}
      {error && <p className="error">{error}</p>}
      {!loading && posts.length === 0 && (
        <p className="empty">{appliedQuery ? '該当する投稿はありません' : 'まだ投稿はありません'}</p>
      )}
      <div className="post-stack">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

function PostRow({ post, navigate }) {
  return (
    <article className="post-row">
      <Avatar post={post} />
      <button className="post-main" type="button" onClick={() => navigate(`/posts/${post.id}`)}>
        <span className="post-meta">
          <strong>{post.author}</strong>
          <time>{formatDate(post.created_at)}</time>
        </span>
        <span className="post-body">{post.body}</span>
        <span className="post-actions">{post.likes_count ?? 0} likes</span>
      </button>
    </article>
  );
}

function Avatar({ post }) {
  const initial = post.author?.trim().charAt(0) || '?';
  return (
    <span className="avatar" style={{ backgroundColor: colorValue(post.avatar_color) }}>
      {initial}
    </span>
  );
}

function PostForm({ navigate }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    const response = await api('/api/posts', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (response.status === 422) {
      setErrors(payload.errors ?? {});
      return;
    }
    if (!response.ok) {
      setErrors({ form: ['投稿を保存できませんでした。'] });
      return;
    }
    navigate('/posts');
  }

  return (
    <section className="content narrow">
      <div className="section-head">
        <div>
          <h1>新規投稿</h1>
          <p>投稿者名と本文を入力してください。</p>
        </div>
      </div>
      <form className="editor" onSubmit={submit}>
        <FieldError errors={errors.form} />
        <label>
          投稿者名
          <input
            maxLength="30"
            value={form.author}
            onChange={(event) => updateField('author', event.target.value)}
          />
          <FieldError errors={errors.author} />
        </label>
        <label>
          本文
          <textarea
            maxLength="280"
            rows="7"
            value={form.body}
            onChange={(event) => updateField('body', event.target.value)}
          />
          <span className="counter">{form.body.length}/280</span>
          <FieldError errors={errors.body} />
        </label>
        <fieldset>
          <legend>アバター色</legend>
          <div className="swatches">
            {colors.map((color) => (
              <label key={color.id} className="swatch">
                <input
                  type="radio"
                  name="avatar_color"
                  value={color.id}
                  checked={form.avatar_color === color.id}
                  onChange={(event) => updateField('avatar_color', event.target.value)}
                />
                <span style={{ backgroundColor: color.value }} />
                {color.label}
              </label>
            ))}
          </div>
          <FieldError errors={errors.avatar_color} />
        </fieldset>
        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={() => navigate('/posts')}>
            戻る
          </button>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? '保存中' : '投稿する'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PostDetail({ id, navigate }) {
  const [post, setPost] = useState(null);
  const [likedByClient, setLikedByClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await api(`/api/posts/${id}`);
    if (response.status === 404) {
      setError('投稿が見つかりません。');
      setLoading(false);
      return;
    }
    if (!response.ok) {
      setError('投稿詳細を取得できませんでした。');
      setLoading(false);
      return;
    }
    const payload = await response.json();
    setPost(payload.data);
    setLikedByClient(payload.liked_by_client);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function toggleLike() {
    const response = await api(`/api/posts/${id}/likes`, { method: 'POST' });
    if (!response.ok) {
      setError('いいねを更新できませんでした。');
      return;
    }
    const payload = await response.json();
    setPost(payload.data);
    setLikedByClient(payload.liked_by_client);
  }

  async function destroy() {
    const response = await api(`/api/posts/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('投稿を削除できませんでした。');
      return;
    }
    navigate('/posts');
  }

  const likeLabel = useMemo(() => (likedByClient ? 'いいね解除' : 'いいね'), [likedByClient]);

  if (loading) {
    return <section className="content narrow"><p className="notice">読み込み中です。</p></section>;
  }
  if (error && !post) {
    return (
      <section className="content narrow">
        <p className="error">{error}</p>
        <button className="secondary-button" type="button" onClick={() => navigate('/posts')}>一覧へ戻る</button>
      </section>
    );
  }

  return (
    <section className="content narrow">
      <article className="detail">
        <div className="detail-head">
          <Avatar post={post} />
          <div>
            <h1>{post.author}</h1>
            <time>{formatDate(post.created_at)}</time>
          </div>
        </div>
        <p className="detail-body">{post.body}</p>
        {error && <p className="error">{error}</p>}
        <div className="detail-actions">
          <button className={likedByClient ? 'liked-button' : 'primary-button'} type="button" onClick={toggleLike}>
            {likeLabel} ({post.likes_count ?? 0})
          </button>
          <button className="danger-button" type="button" onClick={destroy}>
            削除
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/posts')}>
            一覧へ戻る
          </button>
        </div>
      </article>
    </section>
  );
}

function FieldError({ errors }) {
  if (!errors?.length) {
    return null;
  }
  return <span className="field-error">{errors[0]}</span>;
}

createRoot(document.getElementById('root')).render(<App />);
