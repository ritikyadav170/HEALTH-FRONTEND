import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { MdDashboard, MdPeople, MdEvent, MdLogout, MdAccountBalanceWallet, MdRateReview, MdAccountCircle } from "react-icons/md";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("hospital_token");
    localStorage.removeItem("hospital_info");
    navigate("/login");
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: <MdDashboard /> },
    { name: "Medical Staff", path: "/doctors", icon: <MdPeople /> },
    { name: "Appointments & Revenue", path: "/appointments", icon: <MdEvent /> },
    { name: "Wallet Reports", path: "/wallet-reports", icon: <MdAccountBalanceWallet /> },
    { name: "Doctor Reviews", path: "/reviews", icon: <MdRateReview /> },
    { name: "Profile & Security", path: "/profile", icon: <MdAccountCircle /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1 shadow-sm shrink-0">
              <img src="/log.png" alt="Olcure" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Olcure Partner
            </span>
          </div>
        </div>
        
        <div className="flex-1 py-8 px-5 flex flex-col gap-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <span className={`text-xl ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-200 font-medium"
          >
            <MdLogout className="text-xl text-slate-400 group-hover:text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 z-10">
          <div>
            {/* Breadcrumb or Greeting could go here */}
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">
                  {JSON.parse(localStorage.getItem("hospital_info") || "{}").name || "Hospital Admin"}
                </p>
                <p className="text-xs font-medium text-indigo-600">Verified Partner</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                {(JSON.parse(localStorage.getItem("hospital_info") || "{}").name || "H")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-10 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-64 bg-indigo-50/50 -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
