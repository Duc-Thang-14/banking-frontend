import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download, DollarSign, MessageSquare, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose }) => {
  const { wallet, username } = useAuthStore();
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !wallet) return null;

  const qrPayload = JSON.stringify({
    walletNumber: wallet.walletNumber,
    name: username || 'Khách hàng',
    amount: amount ? Number(amount) : undefined,
    description: description || undefined,
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=15&data=${encodeURIComponent(
    qrPayload
  )}`;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(wallet.walletNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Mã QR Nhận Tiền <Sparkles className="w-4 h-4 text-purple-400 inline" />
            </h3>
            <p className="text-xs text-slate-400">Quét mã chuyển tiền nhanh • Tự động điền số ví</p>
          </div>
        </div>

        {/* Khung chứa mã QR nổi bật */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 mb-5 shadow-inner">
          <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
            <img
              src={qrImageUrl}
              alt="Mã QR nhận tiền"
              className="h-48 w-48 object-contain rounded-lg"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Chủ tài khoản ví</p>
            <p className="text-base font-extrabold text-white mt-0.5">{username || 'Khách hàng'}</p>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-sm">
              <span className="font-mono text-xs font-bold text-purple-300 tracking-wider">
                {wallet.walletNumber}
              </span>
              <button
                onClick={handleCopyWallet}
                className="text-slate-400 hover:text-purple-300 transition-colors"
                title="Sao chép số ví"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Form tùy chỉnh số tiền và nội dung */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              Số tiền muốn nhận (Tùy chọn)
            </label>
            <input
              type="number"
              placeholder="VD: 100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              Nội dung chuyển khoản (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Tien an trua, Cafe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Nút hành động đồng bộ giao diện */}
        <div className="flex gap-2.5">
          <a
            href={qrImageUrl}
            download={`QR_Wallet_${wallet.walletNumber}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            Lưu ảnh QR
          </a>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
