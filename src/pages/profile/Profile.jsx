import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phoneNo: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      const value = data.data;
      setProfile(value);
      setForm({ name: value.name || "", email: value.email || "", phoneNo: value.phoneNo || "", address: value.address || "" });
    }).catch((error) => toast.error(error.response?.data?.message || "Could not load hospital profile"));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const { data } = await api.patch("/profile", form);
      setProfile(data.data);
      localStorage.setItem("hospital_info", JSON.stringify({ id: data.data._id, name: data.data.name, email: data.data.email, status: data.data.status }));
      toast.success(data.message);
    } catch (error) { toast.error(error.response?.data?.message || "Could not update profile"); }
    finally { setBusy(false); }
  };

  const requestOtp = async () => {
    setBusy(true);
    try { const { data } = await api.post("/password/request-otp"); setOtpSent(true); toast.success(data.message); }
    catch (error) { toast.error(error.response?.data?.message || "Could not send verification code"); }
    finally { setBusy(false); }
  };

  const updatePassword = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const { data } = await api.patch("/password", { otp, newPassword });
      toast.success(`${data.message} Please sign in again.`); setOtpSent(false); setOtp(""); setNewPassword("");
      localStorage.removeItem("hospital_token"); localStorage.removeItem("hospital_info");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) { toast.error(error.response?.data?.message || "Could not update password"); }
    finally { setBusy(false); }
  };

  if (!profile) return <p className="text-slate-500">Loading profile…</p>;
  const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  return <section className="mx-auto max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold text-slate-900">Hospital profile</h1><p className="mt-1 text-sm text-slate-500">Manage contact details and account security.</p></div>
    <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Profile details</h2>
      <label className="block text-sm font-semibold text-slate-700">Hospital name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></label>
      <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} readOnly className={`${inputClass} cursor-not-allowed bg-slate-100`} /><span className="mt-1 block text-xs font-normal text-slate-500">Email is the verified security contact and cannot be changed here.</span></label>
      <label className="block text-sm font-semibold text-slate-700">Phone<input required value={form.phoneNo} onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} className={inputClass} /></label>
      <label className="block text-sm font-semibold text-slate-700">Address<textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} /></label>
      <label className="block text-sm font-semibold text-slate-700">Registration number<input disabled value={profile.registrationNumber || ""} className={`${inputClass} cursor-not-allowed bg-slate-100`} /><span className="mt-1 block text-xs font-normal text-slate-500">This verified registration number can only be changed by an administrator.</span></label>
      <button disabled={busy} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save profile"}</button>
    </form>
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Password security</h2><p className="text-sm text-slate-500">A verification code will be sent to {profile.email}.</p>
      {!otpSent ? <button onClick={requestOtp} disabled={busy} className="rounded-xl border border-indigo-200 px-5 py-3 font-bold text-indigo-700 disabled:opacity-50">Send verification code</button> : <form onSubmit={updatePassword} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">Email verification code<input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-semibold text-slate-700">New password<input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} /></label>
        <button disabled={busy} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Updating..." : "Update password"}</button>
      </form>}
    </div>
  </section>;
}
