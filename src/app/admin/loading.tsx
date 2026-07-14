export default function AdminLoading() {
  return (
    <section className="admin-shell admin-console" aria-label="Beheer wordt geladen">
      <div className="admin-module-hero admin-skeleton">
        <span />
        <span />
        <span />
      </div>
      <div className="admin-kpi-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="admin-kpi-card static admin-skeleton-card" key={index} />
        ))}
      </div>
      <div className="admin-grid wide">
        <div className="admin-panel admin-skeleton-panel" />
        <div className="admin-panel admin-skeleton-panel" />
      </div>
    </section>
  );
}
