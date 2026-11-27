import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { MdPeople, MdEvent, MdAttachMoney, MdArrowForward, MdTrendingUp } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    doctors: 0,
    appointments: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Practice Overview</h1>
        <p className="mt-2 text-slate-500 font-medium">Monitor your hospital's performance and manage your medical staff.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Doctors Card */}
        <div onClick={() => navigate('/doctors')} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MdPeople className="text-8xl text-indigo-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
              <MdPeople className="text-2xl text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Doctors</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-slate-900">{stats.doctors}</p>
              <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full"><MdTrendingUp className="mr-1"/> Active</span>
            </div>
          </div>
        </div>

        {/* Appointments Card */}
        <div onClick={() => navigate('/appointments')} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MdEvent className="text-8xl text-emerald-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
              <MdEvent className="text-2xl text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Appointments</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-slate-900">{stats.appointments}</p>
              <span className="text-sm font-medium text-slate-400">This month</span>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div onClick={() => navigate('/wallet-reports')} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MdAttachMoney className="text-8xl text-purple-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6">
              <MdAttachMoney className="text-2xl text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-slate-900">₹{stats.revenue}</p>
              <span className="text-sm font-medium text-slate-400">Generated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Quick Onboarding</h2>
            <p className="text-indigo-100 mb-8 max-w-md leading-relaxed">
              Expand your medical team in seconds. Doctors onboarded through this panel are automatically approved and instantly available to patients.
            </p>
            <Link to="/doctors/add" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
              Onboard New Doctor
              <MdArrowForward />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
