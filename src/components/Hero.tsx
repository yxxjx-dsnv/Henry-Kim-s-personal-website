export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="hero-section">
      <div className="text">
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
