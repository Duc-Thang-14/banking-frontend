import React, { useState } from 'react';
import { X, Building2, Loader2, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { OtpVerificationModal } from './OtpVerificationModal';
import type { ErrorResponse } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SUPPORTED_BANKS = [
  'Vietcombank',
  'MB Bank',
  'Techcombank',
  'ACB',
  'VPBank',
  'BIDV',
  'TPBank',
];

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { wallet, fetchWallet } = useAuthStore();
  const [bankName, setBankName] = useState(SUPPORTED_BANKS[0]);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  if (!isOpen) return null;

  const handleWithdrawInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.walletNumber) return;

    if (!bankAccountNumber.trim()) {
      setError('Vui lòng nhập số tài khoản ngân hàng thụ hưởng');
      return;
    }

    if (!bankAccountName.trim()) {
      setError('Vui lòng nhập tên chủ tài khoản ngân hàng');
      return;
    }

    if (amount < 50000) {
      setError('Số tiền rút tối thiểu là 50.000 VND');
      return;
    }

    if (wallet.balance < amount) {
      setError('Số dư ví không đủ để rút số tiền này');
      return;
    }

    setError(null);
    setIsOtpOpen(true);
  };

  const handleConfirmWithdrawWithOtp = async (otpCode: string) => {
    if (!wallet?.walletNumber) return;
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/wallets/withdraw', {
        walletNumber: wallet.walletNumber,
        amount: amount,
        bankName: bankName,
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim().toUpperCase(),
        otp: otpCode,
      });

      setIsOtpOpen(false);
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
      setIsOtpOpen(false);
      const errorData = err.response?.data as ErrorResponse | undefined;
      if (errorData?.validationErrors && Object.keys(errorData.validationErrors).length > 0) {
        setError(Object.values(errorData.validationErrors).join(', '));
      } else if (errorData?.message) {
        setError(errorData.message);
      } else {
        setError('Có lỗi xảy ra khi thực hiện rút tiền');
      }
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
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Rút tiền về Ngân hàng</h3>
            <p className="text-xs text-slate-400">Chuyển tiền nhanh 24/7 về tài khoản liên kết</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="font-bold text-lg text-white">Yêu cầu rút tiền thành công!</h4>
            <p className="text-xs text-slate-400 mt-1">
              Tiền đang được xử lý chuyển về tài khoản {bankName} của bạn.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdrawInitiate} className="space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Ngân hàng thụ hưởng
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Số tài khoản nhận
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0987654321"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-amber-500 transition-colors uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Số tiền muốn rút (VND)
                </label>
                {wallet && (
                  <span className="text-[11px] text-slate-500">
                    Khả dụng:{' '}
                    <strong className="text-slate-300 font-mono">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet.balance)}
                    </strong>
                  </span>
                )}
              </div>
              <input
                type="number"
                min="50000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-base font-bold font-mono focus:outline-none focus:border-amber-500 transition-colors text-amber-300"
                required
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    amount === val
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {val >= 1000000 ? `${val / 1000000}Tr` : `${val / 1000}k`}
                </button>
              ))}
              {wallet && wallet.balance >= 50000 && (
                <button
                  type="button"
                  onClick={() => setAmount(wallet.balance)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                >
                  Tất cả
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Tiếp tục (Xác thực OTP)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <OtpVerificationModal
        isOpen={isOtpOpen}
        action="WITHDRAW"
        target={wallet?.walletNumber || ''}
        actionDescription={`Rút ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount)} về tài khoản ${bankName}`}
        onClose={() => setIsOtpOpen(false)}
        onSuccess={handleConfirmWithdrawWithOtp}
      />
    </div>
  );
};
