const EmptyState = ({
  icon = '',
  eyebrow = '',
  title = 'Nothing here yet',
  description = '',
  children,
}) => {
  return (
    <div className="empty-state" role="status">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      )}
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
