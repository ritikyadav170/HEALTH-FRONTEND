import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MdArrowForward, MdLocalHospital, MdPhone, MdEmail, MdLockOutline, MdBadge } from "react-icons/md";
import api from "../../utils/api";
import AddressAutocomplete from "../../components/AddressAutocomplete";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    address: "",
    registrationNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/register", formData);
      if (res.data.success) {
        toast.success(res.data.message || "Registration successful! Pending Admin Approval.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white selection:bg-indigo-500 selection:text-white">
      {/* Left side - Stunning Visual/Branding */}
      <div className="hidden lg:flex w-[45%] relative bg-[#0a0f1c] overflow-hidden justify-center items-center">
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
            Join the Premier <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Healthcare Network</span>
          </h1>
          <p className="text-lg text-indigo-100/80 mb-12 leading-relaxed">
            Partner with Olcure to streamline your hospital or clinic operations. Onboard specialists and manage appointments from one place.
          </p>
        </div>
      </div>

      {/* Right side - Form Container */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white relative overflow-y-auto">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

        <div className="w-full max-w-2xl relative z-10 py-10">
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-4 tracking-wide">
            Hospital & Clinic Panel · Partner Application
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Register your Hospital or Clinic</h2>
            <p className="text-slate-500 text-lg">Apply for a hospital or clinic partner account to manage doctors, appointments, and your care team.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Hospital / Clinic Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MdLocalHospital className="text-xl" />
                  </div>
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="City General Hospital or Clinic"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Registration Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MdBadge className="text-xl" />
                  </div>
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="REG-123456"
                    value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MdEmail className="text-xl" />
                  </div>
                  <input
                    type="email" required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="admin@hospital.com"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Contact Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MdPhone className="text-xl" />
                  </div>
                  <input
                    type="text" required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="+91 98765 43210"
                    value={formData.phoneNo} onChange={(e) => setFormData({...formData, phoneNo: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <MdLockOutline className="text-xl" />
                  </div>
                  <input
                    type="password" required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700">Hospital Address</label>
                <div className="relative">
                  <AddressAutocomplete
                    value={formData.address}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-medium text-slate-900"
                    placeholder="Search building or street name..."
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    onPlaceSelected={(place) => {
                      setFormData({ ...formData, address: place.formatted_address });
                    }}
                  />
                </div>
              </div>

            </div>

            <div className="pt-6">
              <button
                type="submit" disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border-0 text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(68,164,157,0.2)] hover:shadow-[0_8px_30px_rgb(68,164,157,0.3)] disabled:bg-indigo-400 disabled:shadow-none"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative">{loading ? "Submitting..." : "Apply for Registration"}</span>
                {!loading && <MdArrowForward className="relative text-lg group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center sm:text-left">
            <p className="text-slate-500 font-medium">
              Already partnered?{" "}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
