"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Search, LogOut, ChevronLeft, ChevronRight, Eye, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardContent() {
  const { merchant, token, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Filters directly mapped
  const page = parseInt(searchParams.get('page') || '1');
  const searchId = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const [searchInput, setSearchInput] = useState(searchId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token && mounted) {
      router.push('/login');
      return;
    }
    if (token) fetchTransactions();
  }, [page, searchId, status, dateFrom, dateTo, token, mounted]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions', {
        params: { page, search: searchId, status, dateFrom, dateTo }
      });
      setTransactions(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed fetching data', err);
    } finally {
      // Intentionally slow down skeleton drop slightly for premium feel
      setTimeout(() => setLoading(false), 300);
    }
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    if (key !== 'page') params.set('page', '1');
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const statusMap: Record<string, any> = {
    Successful: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    Failed: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
    Pending: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    Refunded: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-500' },
  };

  if (!mounted || !token) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen flex flex-col relative z-10 selection:bg-brand-500/40">
      
      {/* Sleek App Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                APOGEE <span className="text-zinc-500 font-light">Hub</span>
              </h1>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-400">
                Workspace: {merchant?.name}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
          >
            Terminal Exit <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-8 w-full flex flex-col gap-6">
        
        {/* Dynamic Filters Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-3">
             <Activity className="w-5 h-5 text-brand-400" />
             <h2 className="text-lg font-semibold text-white tracking-wide">Network Activity</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <form onSubmit={(e) => { e.preventDefault(); updateFilters('search', searchInput); }} className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Lookup Session ID" 
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-black/40 border border-zinc-800 text-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none placeholder:text-zinc-600"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            
            <select
              className="bg-black/40 border border-zinc-800 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer hover:bg-zinc-900 transition-colors appearance-none"
              value={status}
              onChange={(e) => updateFilters('status', e.target.value)}
            >
              <option value="">System Status</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            
            <input 
              type="date"
              className="bg-black/40 border border-zinc-800 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              value={dateFrom}
              onChange={(e) => updateFilters('dateFrom', e.target.value)}
            />
            <span className="text-zinc-600">-</span>
            <input 
              type="date"
              className="bg-black/40 border border-zinc-800 text-zinc-300 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              value={dateTo}
              onChange={(e) => updateFilters('dateTo', e.target.value)}
            />
          </div>
        </motion.div>
        
        {/* Main Data Table */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel flex-1 rounded-2xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="overflow-auto flex-1 custom-scrollbar relative">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-zinc-400 font-semibold uppercase tracking-widest bg-[#0f0f13] sticky top-0 border-b border-zinc-800 z-10">
                <tr>
                  <th className="px-6 py-5">Identifier</th>
                  <th className="px-6 py-5">End User</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5">Amount USD</th>
                  <th className="px-6 py-5">Status Log</th>
                  <th className="px-6 py-5 text-right w-16">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <motion.tr 
                        key={i} 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-800 rounded animate-pulse w-24"></div></td>
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-800 rounded animate-pulse w-32"></div></td>
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-800 rounded animate-pulse w-20"></div></td>
                        <td className="px-6 py-5"><div className="h-4 bg-zinc-800 rounded animate-pulse w-16"></div></td>
                        <td className="px-6 py-5"><div className="h-6 bg-zinc-800 rounded-full animate-pulse w-24"></div></td>
                        <td className="px-6 py-5"><div className="h-8 bg-zinc-800 rounded animate-pulse w-8 ml-auto"></div></td>
                      </motion.tr>
                    ))
                  ) : transactions.length > 0 ? (
                    transactions.map((t: any) => {
                      const st = statusMap[t.status] || { bg: 'bg-zinc-800', border: 'border-zinc-700', text: 'text-zinc-300', dot: 'bg-zinc-500' };
                      return (
                        <motion.tr 
                          key={t._id} 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-white/5 transition-all group font-medium"
                        >
                          <td className="px-6 py-5 text-zinc-400 font-mono text-xs">{t._id}</td>
                          <td className="px-6 py-5 text-zinc-200">{t.customerName}</td>
                          <td className="px-6 py-5 text-zinc-500 text-xs tracking-wider">
                            {format(new Date(t.date), 'MMM dd, yyyy · HH:mm')}
                          </td>
                          <td className="px-6 py-5 text-white font-bold tracking-tight text-base">
                            ${t.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-2 w-max ${st.bg} ${st.border} ${st.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot} shadow-[0_0_8px_currentColor]`} />
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link 
                              href={`/transaction/${t._id}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 hover:text-brand-400 hover:bg-brand-500/10 transition-colors focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500 gap-4">
                          <Activity className="w-12 h-12 text-zinc-800" />
                          <p className="text-zinc-400 tracking-wide font-medium">No system records matched the query.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-4 border-t border-zinc-800 flex flex-wrap items-center justify-between bg-[#0f0f13] text-sm shrink-0">
            <span className="text-zinc-500 font-semibold tracking-wide uppercase text-xs">
              <span className="text-white">{total}</span> total sessions indexed
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => updateFilters('page', (page - 1).toString())}
                className="w-9 h-9 flex items-center justify-center bg-black/40 border border-zinc-800 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center font-mono font-bold tracking-widest text-xs px-2 text-zinc-400">
                {page} / {totalPages || 1}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => updateFilters('page', (page + 1).toString())}
                className="w-9 h-9 flex items-center justify-center bg-black/40 border border-zinc-800 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
      <DashboardContent />
    </Suspense>
  )
}
