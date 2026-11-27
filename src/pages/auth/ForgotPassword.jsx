import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      if (step === 1) {
        const result = await api.post("/forgot-password", { email });
        toast.success(result.data.message);
        setStep(2);
      } else {
        const result = await api.post("/reset-password", { email, otp, newPassword });
        toast.success(result.data.message);
        navigate("/login");
      }
    } catch (error) { toast.error(error.response?.data?.message || "Could not complete password reset"); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-5">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-xl">
      <div><p className="text-sm font-semibold text-indigo-600">Hospital & Clinic Panel</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Reset password</h1><p className="mt-1 text-sm text-slate-500">We’ll email a verification code to your registered account.</p></div>
      <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={step === 2} className="mt-1 w-full rounded-lg border border-slate-300 p-3 disabled:bg-slate-100" /></label>
      {step === 2 && <>
        <label className="block text-sm font-semibold text-slate-700">Email verification code<input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
        <label className="block text-sm font-semibold text-slate-700">New password<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-3" /></label>
      </>}
      <button disabled={busy} className="w-full rounded-xl bg-indigo-600 p-3 font-bold text-white disabled:opacity-50">{busy ? "Please wait..." : step === 1 ? "Send verification code" : "Reset password"}</button>
      <Link to="/login" className="block text-center text-sm font-semibold text-indigo-700">Back to sign in</Link>
    </form>
  </div>;
}
