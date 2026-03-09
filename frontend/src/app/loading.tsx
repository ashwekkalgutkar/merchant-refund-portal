import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center relative">
        <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin shadow-[0_0_30px_rgba(14,165,233,0.3)]" />
        <div className="absolute inset-0 bg-brand-500/10 blur-[20px] rounded-full" />
      </div>
      <p className="text-brand-400 font-bold tracking-[0.2em] text-xs uppercase mt-6 animate-pulse">
        Initializing Feed...
      </p>
    </div>
  );
}
