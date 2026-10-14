import React, { useState } from 'react';
import { X, ArrowDownToLine, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wallet, fetchWallet } = useAuthStore();
  const [amount, setAmount] = useState<number>(200000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.walletNumber) return;

    if (amount < 10000) {
      setError('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/wallets/top-up', {
        walletNumber: wallet.walletNumber,
        amount: amount,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      await fetchWallet();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Nạp tiền vào ví</h3>
            <p className="text-xs text-slate-400">Ví: {wallet?.walletNumber}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Nạp tiền thành công!</h4>
            <p className="text-xs text-slate-400 mt-1">
              +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleTopUp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Chọn số tiền nhanh
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      amount === val
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Hoặc nhập số tiền tùy chọn (VND)
              </label>
              <input
                type="number"
                min="10000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý giao dịch...</span>
                </>
              ) : (
                <span>Xác nhận Nạp tiền</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
