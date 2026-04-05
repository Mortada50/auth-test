export default function AuthLayout({ children, features }) {
  const defaultFeatures = [
    { icon: "👨‍⚕️", text: "تواصل مع أفضل الأطباء المتخصصين" },
    { icon: "💊", text: "خدمات صيدليات موثوقة على مدار الساعة" },
    { icon: "📋", text: "سجلك الطبي في مكان واحد آمن" },
  ];

  const items = features || defaultFeatures;

  return (
    <div className="auth-layout">
      {/* ── Hero Side ── */}
      <div className="auth-hero">
        <div className="hero-pattern" />
        <div className="hero-content">
          <div className="hero-logo">🏥</div>
          <h1 className="hero-title">طبيبي</h1>
          <p className="hero-subtitle">
            منصتك الصحية الشاملة — احجز، تابع، وابقَ بصحة جيدة
          </p>
          <div className="hero-features">
            {items.map((f, i) => (
              <div className="hero-feature" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <span className="feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div className="auth-form-side">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
