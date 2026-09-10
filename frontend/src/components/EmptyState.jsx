/* Typography-led empty state — no large illustrations */
const EmptyState = ({
  eyebrow = '',
  title = 'NOTHING HERE',
  description = '',
  children,
}) => {
  return (
    <div className="empty-state" role="status">
      {eyebrow && (
        <p className="empty-state-eyebrow">{eyebrow}</p>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-desc">{description}</p>
      )}
      {children && (
        <div className="empty-state-actions">{children}</div>
      )}
    </div>
  );
};

export default EmptyState;
