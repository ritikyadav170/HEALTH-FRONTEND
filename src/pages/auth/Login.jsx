import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MdEmail, MdLockOutline, MdArrowForward } from "react-icons/md";
import api from "../../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const submitInProgress = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitInProgress.current) return;
    submitInProgress.current = true;
    setLoading(true);
    setLoginError(null);
    try {
      const res = await api.post("/login", formData);
      if (res.data.success) {
        localStorage.setItem("hospital_token", res.data.token);
        localStorage.setItem("hospital_info", JSON.stringify(res.data.hospital));
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err) {
      const errData = err.response?.data;
      setLoginError(errData || { message: "Login failed" });
      toast.error(errData?.message || "Login failed", { id: "hospital-login-error" });
    } finally {
      submitInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white selection:bg-indigo-500 selection:text-white">
      {/* Left side - Stunning Visual/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0f1c] overflow-hidden justify-center items-center">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full mix-blend-screen filter blur-[130px] opacity-40"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
        
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 p-16 max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-10">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Scale your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Healthcare Empire</span>
          </h1>
          <p className="text-lg text-indigo-100/80 mb-12 leading-relaxed">
            Manage your hospital or clinic with streamlined operations, intelligent insights, and simple doctor onboarding.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-4">
              {[1,2,3].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0f1c] bg-gradient-to-br from-indigo-400 to-purple-500 shadow-xl flex justify-center items-center font-bold text-white text-sm">
                  D{i}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs font-medium text-white/60 mt-1">Built for hospitals and clinics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        {/* Subtle decorative elements for the form side */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
              Hospital & Clinic Panel
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Sign in</h2>
            <p className="text-slate-500 text-lg">Sign in to manage your hospital or clinic, doctors, and appointments.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <MdEmail className="text-xl" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                  placeholder="name@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <MdLockOutline className="text-xl" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (loginError) setLoginError(null);
                  }}
                />
              </div>
            </div>

            {loginError && (
              <div className="space-y-1.5 pt-0.5">
                <div className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-700 flex items-start gap-2 shadow-sm">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span className="font-semibold leading-relaxed">{loginError.message}</span>
                </div>
                {loginError.attempts != null && loginError.maxAttempts != null && !loginError.isLocked && (
                  <p className="text-[11px] font-semibold text-red-600 pl-1">
                    Failed login attempts: {loginError.attempts} / {loginError.maxAttempts}. {loginError.attemptsRemaining} attempts remaining before lockout.
                  </p>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border-0 text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(68,164,157,0.2)] hover:shadow-[0_8px_30px_rgb(68,164,157,0.3)] disabled:bg-indigo-400 disabled:shadow-none"
              >
                {/* Button highlight effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                
                <span className="relative">{loading ? "Authenticating..." : "Sign In"}</span>
                {!loading && <MdArrowForward className="relative text-lg group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Don't have a partner account?{" "}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
