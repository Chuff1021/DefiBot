import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-3 pb-4 pt-2">
      <div className="premium-surface rounded-2xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#9eb2e4]">production test surface</p>
            <h2 className="mt-1 text-sm font-semibold text-white">ChatGPT OAuth × Kalshi sandbox</h2>
          </div>
          <ShieldCheck className="h-5 w-5 text-[#85f4d1]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/onboarding" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#d6e3ff]">
            Start onboarding
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#d6e3ff]">
            View dashboard
          </Link>
          <Link href="/connect" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#d6e3ff]">
            Connect accounts
          </Link>
          <Link href="/strategies" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#d6e3ff]">
            Choose strategy
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#a9b6d8]">
          <p>© {currentYear} Kalshi BotOS</p>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#a8bbeb]">
            sandbox only
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <p className="mt-2 text-[10px] text-[#7f8eb8]">
          Operator-reviewed testing only. Market data and credentials can be connected, but this app is intentionally positioned around sandbox validation before live execution.
        </p>
      </div>
    </footer>
  );
}
