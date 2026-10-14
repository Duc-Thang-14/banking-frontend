import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { fintechApi } from '../api/fintechApi';

interface OtpVerificationModalProps {
  isOpen: boolean;
  action: 'TRANSFER' | 'WITHDRAW';
  target: string; // Số ví
  actionDescription: string;
  onClose: () => void;
  onSuccess: (otp: string) => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  action,
  target,
  actionDescription,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(120);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Khởi tạo mã OTP khi mở modal
  useEffect(() => {
    if (isOpen) {
      handleRequestOtp();
    } else {
      setOtp('');
      setError(null);
      setDebugOtp(null);
    }
  }, [isOpen]);

  // Bộ đếm lùi thời gian hết hạn OTP
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleRequestOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fintechApi.generateOtp({ action, target });
      setCountdown(res.expiresInSeconds || 120);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Mã xác thực OTP gồm 6 chữ số');
      return;
    }
    onSuccess(otp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
            Xác Thực Giao Dịch <Sparkles className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-xs text-slate-400 mt-1">{actionDescription}</p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Gợi ý OTP mô phỏng cho môi trường Demo Sandbox */}
        {debugOtp && (
          <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3 text-center">
            <span className="text-[11px] font-semibold text-amber-300 block mb-0.5">
              💡 Mã OTP mô phỏng (Sandbox Demo):
            </span>
            <span className="font-mono text-xl font-black tracking-[0.25em] text-amber-400">
              {debugOtp}
            </span>
          </div>
        )}

        {/* Form nhập OTP */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 text-center">
              Nhập mã xác thực 6 chữ số
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otp}
                autoFocus
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold rounded-2xl bg-slate-950 border border-slate-700 py-3.5 text-emerald-400 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
              />
              <KeyRound className="absolute left-3.5 top-4 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Hết hạn sau: <b className="text-emerald-400 font-mono">{countdown}s</b>
            </span>
            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={handleRequestOtp}
              className={`flex items-center gap-1 font-semibold transition ${
                countdown === 0 && !loading
                  ? 'text-indigo-400 hover:text-indigo-300 underline'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Gửi lại mã
            </button>
          </div>

          <button
            type="submit"
            disabled={otp.length !== 6}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all"
          >
            Xác Nhận & Hoàn Tất
          </button>
        </form>
      </div>
    </div>
  );
};
