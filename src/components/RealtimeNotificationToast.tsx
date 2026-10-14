import React, { useEffect, useState } from 'react';
import { BellRing, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

interface NotificationData {
  id: string;
  message: string;
  isPositive: boolean;
  amount: number;
}

interface RealtimeNotificationToastProps {
  onRefreshData: () => void;
}

export const RealtimeNotificationToast: React.FC<RealtimeNotificationToastProps> = ({ onRefreshData }) => {
  const { wallet } = useAuthStore();
  const [notification, setNotification] = useState<NotificationData | null>(null);

  useEffect(() => {
    if (!wallet?.walletNumber) return;

    // Mở luồng Server-Sent Events (SSE) tới Backend
    const sseUrl = `${API_BASE_URL}/notifications/stream/${wallet.walletNumber}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('BALANCE_UPDATE', (event) => {
      try {
        const payload = JSON.parse(event.data);
        const txEvent = payload.event;
        const isIncoming = txEvent.destinationWalletNumber === wallet.walletNumber;

        setNotification({
          id: String(payload.timestamp || Date.now()),
          message: payload.message || 'Số dư vừa có biến động mới',
          isPositive: isIncoming,
          amount: txEvent.amount,
        });

        // Tự động làm mới số dư ví và lịch sử tức thì!
        onRefreshData();

        // Tự ẩn sau 6 giây
        setTimeout(() => {
          setNotification(null);
        }, 6000);
      } catch (err) {
        console.error('Lỗi phân tích SSE payload:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [wallet?.walletNumber, onRefreshData]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-5 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl text-white backdrop-blur-xl max-w-sm">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            notification.isPositive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {notification.isPositive ? (
            <ArrowDownLeft className="w-5 h-5 animate-bounce" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <BellRing className="w-3.5 h-3.5" />
            <span>Biến Động Số Dư Thời Gian Thực</span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-0.5">{notification.message}</p>
        </div>

        <button
          onClick={() => setNotification(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
