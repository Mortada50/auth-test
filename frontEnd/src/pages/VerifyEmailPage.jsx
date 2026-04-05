import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";

export default function VerifyEmailPage() {
  const { signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...verCode];
    next[i] = val.slice(-1);
    setVerCode(next);
    if (val && i < 5) document.getElementById(`otp-v-${i + 1}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verCode.join(""),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/pending");
      }
    } catch {
      setError("الكود غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="form-title">تحقق من إيميلك 📧</h1>
      <p className="form-subtitle">
        أدخل الكود المكوّن من 6 أرقام الذي أرسلناه لك
      </p>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="otp-inputs">
          {verCode.map((val, i) => (
            <input
              key={i}
              id={`otp-v-${i}`}
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleOtp(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !verCode[i] && i > 0)
                  document.getElementById(`otp-v-${i - 1}`)?.focus();
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading || verCode.join("").length < 6}>
          {loading ? (
            <>
              <span className="spinner" /> جاري التحقق...
            </>
          ) : (
            "تأكيد ✓"
          )}
        </button>
        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: ".85rem",
            color: "var(--text-muted)",
          }}>
          لم يصلك الكود؟{" "}
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontWeight: 700,
            }}
            onClick={() =>
              signUp?.prepareEmailAddressVerification({
                strategy: "email_code",
              })
            }>
            أعد الإرسال
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
