"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.access_token, data.merchant);
      toast.success('Authentication sequence complete. Welcome back.');
      // Adding a brief pause for UI experience glow
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Access Denied.');
      setLoading(false);
    }
  };

  if (!mounted) return null; // Prevent hydration glitch

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-10 rounded-3xl shadow-2xl shadow-black/50 border border-white/5 relative overflow-hidden group">
          
          {/* Subtle Hover Glow on Card */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="mb-10 relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-6"
            >
              <ShieldCheck className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              APOGEE <span className="text-zinc-500 font-light">Pay</span>
            </h2>
            <p className="mt-2 text-sm text-zinc-400 font-medium">
              Secure Merchant Authentication
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Workspace Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full bg-black/40 border border-zinc-800 text-white rounded-xl px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-sm"
                    placeholder="admin@acmecorp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Access Key</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-black/40 border border-zinc-800 text-white rounded-xl px-4 py-3 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full glow-btn bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-3.5 px-4 font-semibold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-brand-100" />
              ) : (
                <>
                  Initialize Session
                  <ArrowRight className="w-4 h-4 text-brand-200 group-hover/btn:translate-x-1 group-hover/btn:text-white transition-all" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
