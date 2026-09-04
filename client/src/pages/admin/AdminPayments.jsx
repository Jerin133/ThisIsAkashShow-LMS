import React, { useEffect, useState } from "react";
import { getAdminPayments } from "../../services/api";
import {
  CreditCard, CheckCircle2, AlertCircle, Search,
  TrendingUp, IndianRupee, Hash, Clock
} from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await getAdminPayments();
        if (res.success) {
          setPayments(res.data || []);
          setFiltered(res.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      payments.filter(
        (p) =>
          (p.payment_id || "").toLowerCase().includes(q) ||
          (p.order_id || "").toLowerCase().includes(q) ||
          (p.profiles?.full_name || "").toLowerCase().includes(q) ||
          (p.profiles?.email || "").toLowerCase().includes(q) ||
          (p.courses?.title || "").toLowerCase().includes(q)
      )
    );
  }, [search, payments]);

  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const successCount = payments.filter((p) => p.status === "paid" || p.status === "success").length;

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shrink-0`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Financial Records</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Payment & Transaction Audit</h1>
        <p className="mt-1 text-sm text-slate-500">Verified checkout records, transaction IDs, and course access activations.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          color="bg-emerald-50 text-emerald-600"
          subtext="All time"
        />
        <StatCard
          icon={Hash}
          label="Total Transactions"
          value={payments.length}
          color="bg-blue-50 text-blue-600"
          subtext="All orders"
        />
        <StatCard
          icon={CheckCircle2}
          label="Successful Payments"
          value={successCount}
          color="bg-emerald-50 text-emerald-700"
          subtext={payments.length > 0 ? `${Math.round((successCount / payments.length) * 100)}% success rate` : "—"}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Order Value"
          value={payments.length > 0 ? `₹${Math.round(totalRevenue / payments.length).toLocaleString("en-IN")}` : "₹0"}
          color="bg-amber-50 text-amber-600"
          subtext="Per transaction"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 flex-wrap">
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, student, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {filtered.length} of {payments.length} transactions
          </div>
        </div>

        {loading ? (
          <div className="space-y-0 divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-4 w-1/5 rounded bg-gray-200" />
                <div className="h-4 w-1/6 rounded bg-gray-200 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-800">
              {search ? "No transactions match your search" : "No payment transactions recorded yet"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {search ? "Try a different search term." : "Successful course purchases will be logged here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((pay) => {
                  const isSuccess = pay.status === "paid" || pay.status === "success" || pay.status === "captured";
                  return (
                    <tr key={pay.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-semibold text-gray-800 truncate max-w-[140px]">{pay.payment_id}</p>
                        <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate max-w-[140px]">Order: {pay.order_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-white text-xs font-bold shrink-0">
                            {(pay.profiles?.full_name || pay.profiles?.email || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">{pay.profiles?.full_name || "Student"}</p>
                            <p className="text-[10px] text-gray-400">{pay.profiles?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700 text-xs line-clamp-1 max-w-[160px]">{pay.courses?.title || "Course"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-700 text-sm">₹{Number(pay.amount).toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isSuccess ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          {isSuccess ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {pay.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(pay.created_at).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Revenue Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""} shown</span>
              <div className="text-sm font-bold text-gray-900">
                Total Revenue:{" "}
                <span className="text-emerald-600">
                  ₹{filtered.reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
