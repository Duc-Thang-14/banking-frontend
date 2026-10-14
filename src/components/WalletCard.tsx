import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, CreditCard, ShieldCheck } from 'lucide-react';
import type { WalletResponse } from '../types';

interface WalletCardProps {
  wallet: WalletResponse | null;
  username: string | null;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, username }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '0';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCopy = () => {
    if (wallet?.walletNumber) {
      navigator.clipboard.writeText(wallet.walletNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-md h-56 rounded-3xl p-6 text-white shadow-2xl overflow-hidden bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-900 border border-indigo-500/20 backdrop-blur-xl">
      {/* Background Decor Circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Brand & Status */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider uppercase text-white/90">Apex Bank</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ví chính ({wallet?.walletType || 'MAIN'})</span>
            </div>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {wallet?.status || 'ACTIVE'}
        </span>
      </div>

      {/* Balance Section */}
      <div className="mt-5 relative z-10">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>Số dư khả dụng</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
          {showBalance ? formatCurrency(wallet?.balance) : '•••••••• VND'}
        </div>
      </div>

      {/* Footer: Account Number & Owner */}
      <div className="mt-6 flex justify-between items-end relative z-10 pt-2 border-t border-white/10">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">Số tài khoản ví</div>
          <div className="flex items-center gap-1.5 font-mono text-sm font-semibold tracking-wider text-indigo-200">
            <span>{wallet?.walletNumber || 'Chưa mở ví'}</span>
            {wallet?.walletNumber && (
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                title="Sao chép số ví"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Chủ tài khoản</div>
          <div className="font-semibold text-sm tracking-wide text-white uppercase">
            {username || 'Khách hàng'}
          </div>
        </div>
      </div>
    </div>
  );
};
