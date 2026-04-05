import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import StepsBar from "../components/StepsBar.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { uploadLicense } from "../hooks/useApi.js";

const STEPS = ["الحساب", "بيانات الصيدلية", "تأكيد الإيميل"];

export default function PharmacyRegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    pharmacyName: "",
    city: "",
    licenseFile: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    const e = {};
    if (form.fullName.trim().length < 2)
      e.fullName = "الاسم يجب أن يكون حرفين على الأقل";
    if (!form.email.includes("@")) e.email = "إيميل غير صالح";
    if (form.password.length < 8) e.password = "كلمة المرور 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.pharmacyName.trim()) e.pharmacyName = "يرجى إدخال اسم الصيدلية";
    if (!form.city.trim()) e.city = "يرجى إدخال المدينة";
    if (!form.licenseFile) e.licenseFile = "يرجى رفع ترخيص الصيدلية";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!validateStep2() || !isLoaded) return;
    setLoading(true);
    setGlobalError("");
    try {
      const licenseUrl = await uploadLicense(form.licenseFile, "pharmacy");
      setUploadProgress(100);
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.update({
        unsafeMetadata: {
          role: "pharmacy",
          fullName: form.fullName,
          pharmacyName: form.pharmacyName,
          city: form.city,
          pharmacyLicense: licenseUrl,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep(3);
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
      const result = await signUp.attemptEmailAddressVerification({
        code: verCode.join(""),
      });
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
    if (val && i < 5) document.getElementById(`otp-ph-${i + 1}`)?.focus();
  };

  return (
    <AuthLayout
      features={[
        { icon: "💊", text: "وسّع نطاق خدمات صيدليتك" },
        { icon: "🗺️", text: "اظهر للمرضى القريبين منك" },
        { icon: "📦", text: "إدارة المخزون والطلبات بسهولة" },
      ]}>
      <div style={{ marginBottom: 8 }}>
        <Link
          to="/register"
          className="btn btn-ghost"
          style={{ padding: "6px 0", fontSize: ".85rem" }}>
          ← العودة
        </Link>
      </div>

      <h1 className="form-title">تسجيل صيدلية 💊</h1>
      <p className="form-subtitle">سجّل صيدليتك وابدأ خدمة مرضاك</p>

      <StepsBar steps={STEPS} current={step} />

      {globalError && <div className="alert alert-error">⚠️ {globalError}</div>}

      {step === 1 && (
        <form onSubmit={handleStep1}>
          <div className="form-group">
            <label className="form-label">
              اسم المسؤول <span className="required">*</span>
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
              البريد الإلكتروني <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.email ? "error" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="pharmacy@example.com"
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
            <input
              className={`form-input ${errors.password ? "error" : ""}`}
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="8 أحرف على الأقل"
            />
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
          <button className="btn btn-primary" type="submit">
            التالي ←
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                اسم الصيدلية <span className="required">*</span>
              </label>
              <input
                className={`form-input ${errors.pharmacyName ? "error" : ""}`}
                name="pharmacyName"
                value={form.pharmacyName}
                onChange={onChange}
                placeholder="صيدلية الشفاء"
              />
              {errors.pharmacyName && (
                <div className="form-error">⚠️ {errors.pharmacyName}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                المدينة <span className="required">*</span>
              </label>
              <input
                className={`form-input ${errors.city ? "error" : ""}`}
                name="city"
                value={form.city}
                onChange={onChange}
                placeholder="صنعاء"
              />
              {errors.city && (
                <div className="form-error">⚠️ {errors.city}</div>
              )}
            </div>
          </div>
          <FileUpload
            label="ترخيص الصيدلية"
            hint="JPG، PNG أو PDF — حد أقصى 5MB"
            accept="image/*,.pdf"
            onChange={(file) => setForm((p) => ({ ...p, licenseFile: file }))}
            error={errors.licenseFile}
            uploading={loading}
            progress={uploadProgress}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}>
              → السابق
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ flex: 2 }}>
              {loading ? (
                <>
                  <span className="spinner" /> جاري التسجيل...
                </>
              ) : (
                "إنشاء الحساب ←"
              )}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleVerify}>
          <div className="alert alert-warning">
            📧 تم إرسال كود التحقق إلى <strong>{form.email}</strong>
          </div>
          <div className="otp-inputs">
            {verCode.map((val, i) => (
              <input
                key={i}
                id={`otp-ph-${i}`}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtp(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !verCode[i] && i > 0)
                    document.getElementById(`otp-ph-${i - 1}`)?.focus();
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
        </form>
      )}

      <p className="auth-link">
        لديك حساب؟ <Link to="/login">سجّل الدخول</Link>
      </p>
    </AuthLayout>
  );
}
