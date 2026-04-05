import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import StepsBar from "../components/StepsBar.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { uploadLicense } from "../hooks/useApi.js";

const SPECIALITIES = [
  "طب عام",
  "طب الأطفال",
  "طب الأسنان",
  "طب النساء والتوليد",
  "طب القلب",
  "طب العيون",
  "طب العظام",
  "طب الجلدية",
  "طب الأعصاب",
  "طب الكلى",
  "الطب النفسي",
  "جراحة عامة",
  "طب الطوارئ",
  "طب الغدد الصماء",
  "طب الأورام",
];

const STEPS = ["الحساب", "المعلومات المهنية", "تأكيد الإيميل"];

const INITIAL = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  gender: "",
  speciality: "",
  qualifications: "",
  clinicName: "",
  clinicCity: "",
  licenseFile: null,
};

export default function DoctorRegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verCode, setVerCode] = useState(["", "", "", "", "", ""]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const onChange = (e) => set(e.target.name, e.target.value);

  // ── تحقق الخطوة 1 ──
  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.length < 3)
      e.fullName = "الاسم يجب أن يكون 3 أحرف على الأقل";
    if (!form.gender) e.gender = "يرجى تحديد الجنس";
    if (!form.email.includes("@")) e.email = "إيميل غير صالح";
    if (form.password.length < 8) e.password = "كلمة المرور 8 أحرف على الأقل";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── تحقق الخطوة 2 ──
  const validateStep2 = () => {
    const e = {};
    if (!form.speciality) e.speciality = "يرجى اختيار التخصص";
    if (!form.qualifications.trim()) e.qualifications = "يرجى إدخال المؤهلات";
    if (!form.clinicName.trim()) e.clinicName = "يرجى إدخال اسم العيادة";
    if (!form.clinicCity.trim()) e.clinicCity = "يرجى إدخال المدينة";
    if (!form.licenseFile) e.licenseFile = "يرجى رفع صورة الترخيص";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── الخطوة 1 → 2 ──
  const handleStep1 = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  // ── الخطوة 2: رفع الترخيص + إنشاء حساب Clerk ──
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!validateStep2() || !isLoaded) return;
    setLoading(true);
    setGlobalError("");

    try {
      // 1. ارفع الترخيص لـ Cloudinary
      const licenseUrl = await uploadLicense(form.licenseFile, "doctor");
      setUploadProgress(100);

      // 2. أنشئ حساب في Clerk
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      // 3. احفظ البيانات المؤقتة في unsafeMetadata
      await signUp.update({
        unsafeMetadata: {
          role: "doctor",
          fullName: form.fullName,
          gender: form.gender,
          speciality: form.speciality,
          qualifications: form.qualifications,
          clinicName: form.clinicName,
          clinicCity: form.clinicCity,
          medicalLicense: licenseUrl,
        },
      });

      // 4. أرسل كود التحقق للإيميل
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setStep(3);
    } catch (err) {
      const msg =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message;
      if (msg?.includes("email"))
        setGlobalError("هذا البريد الإلكتروني مستخدم بالفعل");
      else setGlobalError(msg || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  // ── الخطوة 3: التحقق من الإيميل ──
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setGlobalError("");

    try {
      const code = verCode.join("");
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/pending");
      }
    } catch (err) {
      setGlobalError("الكود غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handler ──
  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...verCode];
    next[i] = val.slice(-1);
    setVerCode(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !verCode[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  // ── قوة كلمة المرور ──
  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthClass =
    strength <= 1
      ? "filled-weak"
      : strength <= 2
        ? "filled-medium"
        : "filled-strong";

  return (
    <AuthLayout
      features={[
        { icon: "🏥", text: "سجّل عيادتك واستقبل المرضى" },
        { icon: "📅", text: "إدارة مواعيدك بكل سهولة" },
        { icon: "🔒", text: "بياناتك محمية ومشفرة" },
      ]}>
      <div style={{ marginBottom: 8 }}>
        <Link
          to="/register"
          className="btn btn-ghost"
          style={{ padding: "6px 0", fontSize: ".85rem" }}>
          ← العودة
        </Link>
      </div>

      <h1 className="form-title">تسجيل طبيب جديد 👨‍⚕️</h1>
      <p className="form-subtitle">أكمل بياناتك للحصول على موافقة الإدارة</p>

      <StepsBar steps={STEPS} current={step} />

      {globalError && <div className="alert alert-error">⚠️ {globalError}</div>}

      {/* ══ الخطوة 1: بيانات الحساب ══ */}
      {step === 1 && (
        <form onSubmit={handleStep1}>
          <div className="form-group">
            <label className="form-label">
              الاسم الكامل <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.fullName ? "error" : ""}`}
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="د. أحمد محمد علي"
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
              placeholder="doctor@example.com"
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
            {form.password && (
              <div className="password-strength">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`strength-bar ${i <= strength ? strengthClass : ""}`}
                  />
                ))}
              </div>
            )}
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

      {/* ══ الخطوة 2: المعلومات المهنية ══ */}
      {step === 2 && (
        <form onSubmit={handleStep2}>
          <div className="form-group">
            <label className="form-label">
              التخصص الطبي <span className="required">*</span>
            </label>
            <select
              className={`form-input ${errors.speciality ? "error" : ""}`}
              name="speciality"
              value={form.speciality}
              onChange={onChange}>
              <option value="">-- اختر تخصصك --</option>
              {SPECIALITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.speciality && (
              <div className="form-error">⚠️ {errors.speciality}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              المؤهلات العلمية <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.qualifications ? "error" : ""}`}
              type="text"
              name="qualifications"
              value={form.qualifications}
              onChange={onChange}
              placeholder="بكالوريوس طب وجراحة — جامعة صنعاء"
            />
            {errors.qualifications && (
              <div className="form-error">⚠️ {errors.qualifications}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                اسم العيادة <span className="required">*</span>
              </label>
              <input
                className={`form-input ${errors.clinicName ? "error" : ""}`}
                type="text"
                name="clinicName"
                value={form.clinicName}
                onChange={onChange}
                placeholder="عيادة النور"
              />
              {errors.clinicName && (
                <div className="form-error">⚠️ {errors.clinicName}</div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                المدينة <span className="required">*</span>
              </label>
              <input
                className={`form-input ${errors.clinicCity ? "error" : ""}`}
                type="text"
                name="clinicCity"
                value={form.clinicCity}
                onChange={onChange}
                placeholder="صنعاء"
              />
              {errors.clinicCity && (
                <div className="form-error">⚠️ {errors.clinicCity}</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <FileUpload
              label="صورة الترخيص الطبي"
              hint="JPG، PNG أو PDF — حد أقصى 5MB"
              accept="image/*,.pdf"
              onChange={(file) => set("licenseFile", file)}
              error={errors.licenseFile}
              uploading={loading}
              progress={uploadProgress}
            />
          </div>

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

      {/* ══ الخطوة 3: التحقق من الإيميل ══ */}
      {step === 3 && (
        <form onSubmit={handleVerify}>
          <div className="alert alert-warning">
            📧 تم إرسال كود التحقق إلى <strong>{form.email}</strong>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginBottom: 8,
              fontFamily: "var(--font-alt)",
            }}>
            أدخل الكود المكوّن من 6 أرقام
          </p>

          <div className="otp-inputs">
            {verCode.map((val, i) => (
              <input
                key={i}
                id={`otp-${i}`}
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
              "تأكيد وإنشاء الحساب ✓"
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
                signUp.prepareEmailAddressVerification({
                  strategy: "email_code",
                })
              }>
              أعد الإرسال
            </button>
          </p>
        </form>
      )}

      <p className="auth-link">
        لديك حساب؟ <Link to="/login">سجّل الدخول</Link>
      </p>
    </AuthLayout>
  );
}
