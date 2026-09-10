/* Loading component — full-page spinner OR feed skeleton shapes */
const SkeletonCard = ({ hasImage = false }) => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-meta">
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
        <div className="skeleton skeleton-line" style={{ width: '24%' }} />
      </div>
    </div>
    <div className="skeleton skeleton-line" style={{ width: '90%', marginBottom: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '70%' }} />
    {hasImage && (
      <div className="skeleton skeleton-image" style={{ marginTop: '12px' }} />
    )}
  </div>
);

const Loading = ({ fullPage = false, skeleton = false }) => {
  if (fullPage) {
    return (
      <div className="loading-page">
        <div className="spinner" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (skeleton) {
    return (
      <div className="feed-skeleton" role="status" aria-label="Loading posts">
        <SkeletonCard hasImage />
        <SkeletonCard />
        <SkeletonCard hasImage />
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  );
};

export default Loading;
