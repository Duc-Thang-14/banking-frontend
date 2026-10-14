import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  BookmarkCheck,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { fintechApi } from '../api/fintechApi';
import { useAuthStore } from '../store/useAuthStore';
import { OtpVerificationModal } from './OtpVerificationModal';
import type { TransferResponse, ErrorResponse, Beneficiary } from '../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessTransaction?: (tx: TransferResponse) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccessTransaction,
}) => {
  const { wallet, fetchWallet } = useAuthStore();
  const [destinationWallet, setDestinationWallet] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState('Chuyển tiền');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransferResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tính năng 1: Danh bạ người thụ hưởng
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [nickname, setNickname] = useState('');

  // Tính năng 2: Xác thực 2FA OTP
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  // Tính năng 3: Nhập nhanh từ mã QR
  const [showQrInput, setShowQrInput] = useState(false);
  const [qrRawInput, setQrRawInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
    }
  }, [isOpen]);

  const loadBeneficiaries = async () => {
    try {
      const data = await fintechApi.getBeneficiaries();
      setBeneficiaries(data);
    } catch {
      // Bỏ qua lỗi nếu chưa có danh bạ
    }
  };

  if (!isOpen) return null;

  // Bước 1: Validate thông tin trước khi yêu cầu nhập OTP
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.walletNumber) return;

    if (destinationWallet.trim() === wallet.walletNumber) {
      setError('Ví gửi và ví nhận không được trùng nhau');
      return;
    }

    if (amount < 1000) {
      setError('Số tiền chuyển tối thiểu là 1,000 VND');
      return;
    }

    if (wallet.balance < amount) {
      setError('Số dư ví không đủ để thực hiện giao dịch');
      return;
    }

    setError(null);
    // Bật modal OTP để xác thực giao dịch
    setIsOtpOpen(true);
  };

  // Bước 2: Thực thi chuyển tiền khi đã có mã OTP hợp lệ
  const handleConfirmTransferWithOtp = async (otpCode: string) => {
    if (!wallet?.walletNumber) return;
    setLoading(true);
    setError(null);

    const idempotencyKey = crypto.randomUUID();

    try {
      const response = await apiClient.post<TransferResponse>('/transfers', {
        sourceWalletNumber: wallet.walletNumber,
        destinationWalletNumber: destinationWallet.trim(),
        amount: amount,
        description: description,
        idempotencyKey: idempotencyKey,
        otp: otpCode,
      });

      // Nếu người dùng chọn lưu danh bạ -> tự động lưu
      if (saveBeneficiary && destinationWallet.trim()) {
        try {
          await fintechApi.addBeneficiary({
            beneficiaryWalletNumber: destinationWallet.trim(),
            nickname: nickname.trim() || 'Người nhận ' + destinationWallet.trim().slice(-4),
          });
        } catch {
          // Không chặn luồng nếu lưu danh bạ lỗi
        }
      }

      setIsOtpOpen(false);
      setResult(response.data);
      if (onSuccessTransaction) {
        onSuccessTransaction(response.data);
      }
      await fetchWallet();
    } catch (err: any) {
      setIsOtpOpen(false);
      const errorData = err.response?.data as ErrorResponse | undefined;
      if (errorData?.validationErrors && Object.keys(errorData.validationErrors).length > 0) {
        const errorList = Object.entries(errorData.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(' | ');
        setError(errorList);
      } else if (errorData?.message) {
        setError(errorData.message);
      } else {
        setError('Giao dịch chuyển tiền thất bại. Vui lòng kiểm tra lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleParseQr = () => {
    try {
      const parsed = JSON.parse(qrRawInput.trim());
      if (parsed.walletNumber) {
        setDestinationWallet(parsed.walletNumber);
        if (parsed.amount) setAmount(Number(parsed.amount));
        if (parsed.description) setDescription(parsed.description);
        setShowQrInput(false);
        setQrRawInput('');
      } else {
        setError('Mã QR không đúng định dạng ví Fintech');
      }
    } catch {
      setError('Chuỗi QR không hợp lệ (Phải là định dạng JSON hợp lệ)');
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSaveBeneficiary(false);
    setNickname('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Chuyển tiền P2P</h3>
              <p className="text-xs text-slate-400">Thời gian thực • Khóa Redisson & Xác thực 2FA</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Giao dịch thành công!</h4>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.amount)}
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã giao dịch:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{result.transactionReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Người nhận (Ví):</span>
                  <span className="font-mono text-slate-200">{result.destinationWalletNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nội dung:</span>
                  <span className="text-slate-200">{result.description}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
              >
                Hoàn tất
              </button>
            </div>
          ) : (
            <form onSubmit={handleInitiateTransfer} className="space-y-4">
              {/* Danh bạ người thụ hưởng đã lưu */}
              {beneficiaries.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Người nhận đã lưu:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {beneficiaries.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setDestinationWallet(b.beneficiaryWalletNumber)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 transition ${
                          destinationWallet === b.beneficiaryWalletNumber
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {b.nickname}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút nhập từ QR */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Số ví người nhận
                </label>
                <button
                  type="button"
                  onClick={() => setShowQrInput(!showQrInput)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {showQrInput ? 'Đóng quét QR' : 'Nhập mã QR'}
                </button>
              </div>

              {/* Hộp dán dữ liệu QR nếu người dùng quét/copy */}
              {showQrInput && (
                <div className="p-3 rounded-xl bg-slate-800/90 border border-indigo-500/40 space-y-2">
                  <p className="text-[11px] text-slate-400">Dán chuỗi dữ liệu từ mã QR người nhận:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder='{"walletNumber":"W_...","amount":...}'
                      value={qrRawInput}
                      onChange={(e) => setQrRawInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleParseQr}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}

              <input
                type="text"
                placeholder="Ví dụ: W..."
                value={destinationWallet}
                onChange={(e) => setDestinationWallet(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                required
              />

              {/* Tùy chọn lưu vào danh bạ */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={saveBeneficiary}
                    onChange={(e) => setSaveBeneficiary(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                  />
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lưu người nhận này vào danh bạ thường dùng</span>
                </label>

                {saveBeneficiary && (
                  <input
                    type="text"
                    placeholder="Tên gợi nhớ (VD: Bạn Nam, Tiền nhà...)"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Số tiền chuyển (VND)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nội dung chuyển tiền
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tiếp tục (Xác thực 2FA OTP)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal xác thực OTP */}
      <OtpVerificationModal
        isOpen={isOtpOpen}
        action="TRANSFER"
        target={wallet?.walletNumber || ''}
        actionDescription={`Xác thực chuyển ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount)} tới ví ${destinationWallet}`}
        onClose={() => setIsOtpOpen(false)}
        onSuccess={handleConfirmTransferWithOtp}
      />
    </>
  );
};
