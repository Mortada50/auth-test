import { useState } from "react";
import { useSignIn, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // إذا كان مسجّلاً دخوله، وجّهه
  if (isSignedIn) {
    navigate("/pending");
    return null;
  }

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/pending");
      }
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
      if (msg?.includes("password")) setError("كلمة المرور غير صحيحة");
      else if (msg?.includes("identifier") || msg?.includes("email"))
        setError("البريد الإلكتروني غير موجود");
      else setError("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="form-title">مرحباً بعودتك 👋</h1>
      <p className="form-subtitle">سجّل دخولك للوصول إلى حسابك</p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
            autoComplete="email"
            dir="ltr"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">كلمة المرور</label>
          <div className="input-wrapper">
            <input
              className="form-input"
              type={showPass ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ paddingLeft: 44 }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPass((p) => !p)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> جاري الدخول...
            </>
          ) : (
            "تسجيل الدخول"
          )}
        </button>
      </form>

      <p className="auth-link">
        ليس لديك حساب؟ <Link to="/register">سجّل الآن</Link>
      </p>
    </AuthLayout>
  );
}
