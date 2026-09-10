import { useState, useEffect, useCallback } from 'react';
import { getPostsApi } from '../services/api';
import { Sidebar, BottomNav, TopBar } from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import '../styles/feed.css';

const LIMIT = 10;

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await getPostsApi(pageNum, LIMIT);
      const { posts: fetched, hasMore: more } = data.data;
      setPosts((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(more);
      setPage(pageNum);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    }
  }, []);

  useEffect(() => {
    setLoadingFeed(true);
    fetchPosts(1, false).finally(() => setLoadingFeed(false));
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchPosts(page + 1, true);
    setLoadingMore(false);
  };

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Tablet top bar */}
      <TopBar />

      {/* Main content */}
      <main className="app-main" id="main-content">
        <div className="feed-column">
          <CreatePost onPostCreated={handlePostCreated} />

          {loadingFeed ? (
            <Loading skeleton />
          ) : error ? (
            <EmptyState
              eyebrow="Error"
              title="COULD NOT LOAD POSTS"
              description={error}
            >
              <button
                className="btn-load-more"
                onClick={() => { setError(''); fetchPosts(1, false); }}
              >
                Try again
              </button>
            </EmptyState>
          ) : posts.length === 0 ? (
            <EmptyState
              eyebrow="No posts yet"
              title="NOTHING HAS BEEN SHARED"
              description="Be the first to publish something worth reading."
            />
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                />
              ))}

              {hasMore && (
                <div className="load-more-wrapper">
                  <button
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    aria-label="Load more posts"
                  >
                    {loadingMore ? (
                      <>
                        <div className="spinner spinner--sm" aria-hidden="true" />
                        Loading…
                      </>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};

export default Feed;
