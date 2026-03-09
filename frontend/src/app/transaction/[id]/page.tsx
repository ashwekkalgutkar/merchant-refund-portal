"use client";

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Clock, RotateCcw, ShieldCheck, ShieldAlert, CheckCircle2, ChevronRight, Hash, User, CalendarDays, Receipt } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { token, logout } = useAuthStore();
  const router = useRouter();

  const [transaction, setTransaction] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token && mounted) {
      router.push('/login');
      return;
    }
    if (token) fetchTransaction();
  }, [id, token, mounted]);

  const fetchTransaction = async () => {
    try {
      const { data } = await api.get(`/transactions/${id}`);
      setTransaction(data.transaction);
      setEvents(data.events);
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error('Record untraceable.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRefunding(true);
    try {
      await api.post('/refunds', {
        transactionId: id,
        reason: refundReason
      });
      toast.success('Funds reversed successfully.');
      setShowRefundModal(false);
      fetchTransaction();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Refund protocol failed.');
    } finally {
      setIsRefunding(false);
    }
  };

  if (!mounted || !token) return <div className="min-h-screen bg-[#09090b]" />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
         <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin glow-btn" />
         <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-semibold mt-6 ml-2 animate-pulse">Establishing Secure Uplink</p>
      </div>
    );
  }

  if (!transaction) return null;

  const isEligibleForRefund = 
    transaction.status === 'Successful' && 
    differenceInDays(new Date(), new Date(transaction.date)) <= 30;

  const statusConfig: any = {
    Successful: { icon: CheckCircle2, ring: 'ring-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', color: 'text-emerald-400' },
    Failed: { icon: ShieldAlert, ring: 'ring-red-500/30', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', color: 'text-red-400' },
    Pending: { icon: Clock, ring: 'ring-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', color: 'text-amber-400' },
    Refunded: { icon: RotateCcw, ring: 'ring-indigo-500/30', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]', color: 'text-indigo-400' },
  };

  const StIcon = statusConfig[transaction.status]?.icon || Clock;
  const cfg = statusConfig[transaction.status] || statusConfig.Pending;

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-brand-500/40">
      <div className="max-w-[1200px] mx-auto px-6 py-12 relative z-10 w-full">
        
        <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand-400 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Terminal Hub
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Header Action Area */}
          <div className="px-8 md:px-12 py-12 border-b border-white/5 relative bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="flex gap-6 items-center">
                <div className={`w-20 h-20 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center shrink-0 ring-4 ${cfg.ring} ${cfg.glow}`}>
                  <StIcon className={`w-10 h-10 ${cfg.color}`} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3">
                    <span className="text-zinc-500 font-light mr-1">$</span>{transaction.amount.toFixed(2)}
                  </h1>
                  <div className="flex items-center gap-3 text-sm font-mono text-zinc-400 tracking-wider">
                    <Hash className="w-4 h-4 text-brand-500" />
                    {transaction._id}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start lg:items-end gap-5">
                <div className={`text-sm uppercase tracking-widest font-black ${cfg.color}`}>
                  Status: {transaction.status}
                </div>
                
                {isEligibleForRefund && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRefundModal(true)}
                    className="glow-btn inline-flex items-center bg-brand-600 hover:bg-brand-500 text-white font-bold tracking-wide uppercase text-xs px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-brand-500/20 w-fit"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Authorize Reversal
                  </motion.button>
                )}
                {!isEligibleForRefund && transaction.status === 'Successful' && (
                  <div className="text-xs uppercase font-bold tracking-wider text-red-400 bg-red-900/10 px-4 py-2 rounded-lg border border-red-900/30 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> 30-Day Window Lapsed
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-px bg-white/5">
            {/* Left Data Pane */}
            <div className="lg:col-span-7 bg-[#131316] p-8 md:p-12 relative overflow-hidden">
               <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-600 mb-8 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-500" /> Manifest Data
              </h3>
              
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-black/30 p-6 rounded-2xl border border-white/[0.02]">
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex flex-col gap-2">
                    <User className="w-4 h-4 text-zinc-600" /> Recipient Name
                  </dt>
                  <dd className="font-medium text-lg text-zinc-200 mt-3">{transaction.customerName}</dd>
                </div>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/[0.02]">
                  <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex flex-col gap-2">
                    <CalendarDays className="w-4 h-4 text-zinc-600" /> Initiation Timestamp
                  </dt>
                  <dd className="font-mono text-sm tracking-wide text-zinc-300 mt-3">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}<br />
                    <span className="text-zinc-500 font-bold">{format(new Date(transaction.date), 'HH:mm:ss')}</span>
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Right Timeline Pane */}
            <div className="lg:col-span-5 bg-[#0e0e11] p-8 md:p-12">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-600 mb-8 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" /> Event Chronology
              </h3>
              
              <div className="space-y-6">
                {events.length > 0 ? (
                  events.map((evt: any, i: number) => {
                    const isLast = i === events.length - 1;
                    return (
                      <motion.div 
                        key={evt._id} 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex gap-4 relative"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${isLast ? 'bg-brand-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-zinc-700'}`} />
                          {!isLast && <div className="w-[1px] h-full bg-gradient-to-b from-zinc-800 to-transparent mt-2" />}
                        </div>
                        <div className="pb-6">
                          <p className={`font-semibold tracking-wide ${isLast ? 'text-zinc-100' : 'text-zinc-500'}`}>{evt.status}</p>
                          <p className="text-xs font-mono text-zinc-600 mt-1">{format(new Date(evt.timestamp), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <p className="text-sm text-zinc-500 italic">Chronicle is empty.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showRefundModal && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/80"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-brand-500/20 shadow-2xl shadow-black/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <RotateCcw className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Funds Reversal</h3>
                </div>
                
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed font-medium">
                  Authorizing a reversal of <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">${transaction.amount.toFixed(2)}</span> routing to <span className="text-white font-bold">{transaction.customerName}</span>. State the procedural reason below to commit changes to the ledger.
                </p>
                
                <form onSubmit={handleRefund} className="mt-8 relative">
                  <div className="space-y-4">
                     <textarea
                        required
                        rows={4}
                        className="w-full bg-black/40 border border-zinc-800 text-white rounded-xl px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-sm resize-none"
                        placeholder="Log reversal notes here..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      />
                  </div>
                  
                  <div className="mt-8 flex justify-end gap-3 flex-wrap">
                    <button 
                      type="button" 
                      onClick={() => setShowRefundModal(false)}
                      className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors focus:ring-2 focus:ring-zinc-700 outline-none"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit" 
                      disabled={isRefunding}
                      className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-red-600/90 hover:bg-red-500 rounded-xl transition-all disabled:opacity-50 flex items-center shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                      {isRefunding ? (
                        <>Processing <Clock className="w-4 h-4 ml-2 animate-spin" /></>
                      ) : (
                        <>Execute Reversal <ChevronRight className="w-4 h-4 ml-2" /></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
