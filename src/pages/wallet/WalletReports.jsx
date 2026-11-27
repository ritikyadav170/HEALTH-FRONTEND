import React, { useEffect, useState } from "react";
import { MdAccountBalanceWallet, MdTrendingUp, MdHistory } from "react-icons/md";
import api from "../../utils/api";
import HospitalExportButton from "../../components/HospitalExportButton";

export default function WalletReports() {
  const [wallet, setWallet] = useState({
    totalRevenue: 0,
    dueAmount: 0,
    settledAmount: 0
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet");
        if (res.data.success) {
          setWallet(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch wallet", err);
      }
    };
    fetchWallet();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Wallet & Revenue Reports</h1>
          <p className="mt-2 text-slate-500 font-medium">Track your hospital's earnings, payouts, and financial history.</p>
        </div>
        <HospitalExportButton section="wallet" label="Export Summary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MdAccountBalanceWallet className="text-8xl text-indigo-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6">
              <MdAccountBalanceWallet className="text-2xl text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Available Balance</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-slate-900">₹{wallet.dueAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MdTrendingUp className="text-8xl text-emerald-600 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
              <MdTrendingUp className="text-2xl text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Earnings</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-extrabold text-slate-900">₹{wallet.totalRevenue}</p>
              <span className="text-sm font-medium text-slate-400">Lifetime</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <MdHistory className="text-xl text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdAccountBalanceWallet className="text-3xl text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No transactions yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Your earnings and payout history will appear here once you start receiving appointments.
          </p>
        </div>
      </div>
    </div>
  );
}
