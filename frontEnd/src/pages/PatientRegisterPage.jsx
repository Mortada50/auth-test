import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import StepsBar from "../components/StepsBar.jsx";

const STEPS = ["الحساب", "تأكيد الإيميل"];

export default function PatientRegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 2)
      e.fullName = "الاسم يجب أن يكون حرفين على الأقل";
    if (!form.gender) e.gender = "يرجى تحديد الجنس";
    if (!form.email.includes("@")) e.email = "إيميل غير صالح";
    if (form.password.length < 8) e.password = "كلمة المرور 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !isLoaded) return;
    setLoading(true);
    setGlobalError("");

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.update({
        unsafeMetadata: {
          role: "patient",
          fullName: form.fullName,
          gender: form.gender,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(2);
    } catch (err) {
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message;
      if (msg?.includes("email"))
        setGlobalError("هذا البريد الإلكتروني مستخدم بالفعل");
      else setGlobalError(msg || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError("");
    try {
      const code = verCode.join("");
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/pending");
      }
    } catch {
      setGlobalError("الكود غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...verCode];
    next[i] = val.slice(-1);
    setVerCode(next);
    if (val && i < 5) document.getElementById(`otp-p-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !verCode[i] && i > 0)
      document.getElementById(`otp-p-${i - 1}`)?.focus();
  };

  return (
    <AuthLayout
      features={[
        { icon: "📅", text: "احجز موعدك مع أي طبيب بسهولة" },
        { icon: "💊", text: "اطلب أدويتك من أقرب صيدلية" },
        { icon: "📋", text: "سجلك الطبي في مكان واحد" },
      ]}>
      <div style={{ marginBottom: 8 }}>
        <Link
          to="/register"
          className="btn btn-ghost"
          style={{ padding: "6px 0", fontSize: ".85rem" }}>
          ← العودة
        </Link>
      </div>

      <h1 className="form-title">تسجيل مريض جديد 🧑</h1>
      <p className="form-subtitle">سجّل مجاناً وابدأ رحلتك الصحية</p>

      <StepsBar steps={STEPS} current={step} />

      {globalError && <div className="alert alert-error">⚠️ {globalError}</div>}

      {step === 1 && (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                الاسم الكامل <span className="required">*</span>
              </label>
              <input
                className={`form-input ${errors.fullName ? "error" : ""}`}
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="اسمك الكامل"
              />
              {errors.fullName && (
                <div className="form-error">⚠️ {errors.fullName}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                الجنس <span className="required">*</span>
              </label>
              <select
                className={`form-input ${errors.gender ? "error" : ""}`}
                name="gender"
                value={form.gender}
                onChange={onChange}>
                <option value="">-- اختر --</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              {errors.gender && (
                <div className="form-error">⚠️ {errors.gender}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              البريد الإلكتروني <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.email ? "error" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="example@email.com"
              dir="ltr"
            />
            {errors.email && (
              <div className="form-error">⚠️ {errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              كلمة المرور <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                className={`form-input ${errors.password ? "error" : ""}`}
                type={showPass ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="8 أحرف على الأقل"
                style={{ paddingLeft: 44 }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass((p) => !p)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">⚠️ {errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              تأكيد كلمة المرور <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="أعد كتابة كلمة المرور"
            />
            {errors.confirmPassword && (
              <div className="form-error">⚠️ {errors.confirmPassword}</div>
            )}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> جاري التسجيل...
              </>
            ) : (
              "إنشاء الحساب ←"
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div className="alert alert-warning">
            📧 تم إرسال كود التحقق إلى <strong>{form.email}</strong>
          </div>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}>
            أدخل الكود المكوّن من 6 أرقام
          </p>
          <div className="otp-inputs">
            {verCode.map((val, i) => (
              <input
                key={i}
                id={`otp-p-${i}`}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtp(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
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
        </form>
      )}

      <p className="auth-link">
        لديك حساب؟ <Link to="/login">سجّل الدخول</Link>
      </p>
    </AuthLayout>
  );
}
