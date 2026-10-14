import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { AuthView } from './components/AuthView';
import { WalletCard } from './components/WalletCard';
import { TopUpModal } from './components/TopUpModal';
import { TransferModal } from './components/TransferModal';
import { WithdrawModal } from './components/WithdrawModal';
import { QrModal } from './components/QrModal';
import { RealtimeNotificationToast } from './components/RealtimeNotificationToast';
import { fintechApi } from './api/fintechApi';
import type { TransactionHistoryResponse, PageResponse } from './types';
import {
  ArrowDownToLine,
  Send,
  LogOut,
  Landmark,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
  Building2,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function App() {
  const { token, username, wallet, fetchWallet, logout } = useAuthStore();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  // Quản lý Phân trang & Bộ lọc giao dịch
  const [filterType, setFilterType] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(5);
  const [pageData, setPageData] = useState<PageResponse<TransactionHistoryResponse> | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!wallet?.walletNumber) return;
    setLoadingTx(true);
    try {
      const data = await fintechApi.searchTransactions(
        wallet.walletNumber,
        filterType === 'ALL' ? undefined : filterType,
        page,
        pageSize
      );
      setPageData(data);
    } catch {
      // Bỏ qua lỗi hiển thị
    } finally {
      setLoadingTx(false);
    }
  }, [wallet?.walletNumber, filterType, page, pageSize]);

  useEffect(() => {
    if (token) {
      fetchWallet();
    }
  }, [token, fetchWallet]);

  useEffect(() => {
    if (wallet?.walletNumber) {
      fetchTransactions();
    }
  }, [wallet?.walletNumber, fetchTransactions]);

  if (!token) {
    return <AuthView />;
  }

  const handleRefresh = () => {
    fetchWallet();
    fetchTransactions();
  };

  const handleFilterChange = (newType: string) => {
    setFilterType(newType);
    setPage(0); // Reset về trang 1 khi đổi bộ lọc
  };

  const transactions = pageData?.content || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Landmark className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">APEX BANK</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Core Engine v2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Link đến Swagger API Docs */}
            <a
              href="http://localhost:8080/api/v1/swagger-ui/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition"
              title="Mở tài liệu API Swagger UI"
            >
              <span>Swagger UI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Làm mới số dư và lịch sử"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTx ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Xin chào,</span>
              <span className="font-bold text-white uppercase">{username}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Ví Tài Khoản Số <Sparkles className="w-5 h-5 text-amber-400 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Giao dịch phân tán an toàn • Xác thực 2FA OTP • Chống Deadlock • Ghi sổ kép Double-Entry
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Wallet Card & Quick Actions */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start gap-6">
            <WalletCard wallet={wallet} username={username} />

            {/* Action Buttons: 4 Nút chức năng chính */}
            <div className="w-full max-w-md grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setTopUpOpen(true)}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 transition-all"
              >
                <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                <span>Nạp tiền</span>
              </button>

              <button
                onClick={() => setTransferOpen(true)}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/5 transition-all"
              >
                <Send className="w-4 h-4 text-indigo-400" />
                <span>Chuyển tiền</span>
              </button>

              <button
                onClick={() => setWithdrawOpen(true)}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-amber-500/5 transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Rút tiền</span>
              </button>

              <button
                onClick={() => setQrOpen(true)}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-lg shadow-purple-500/5 transition-all"
              >
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Nhận QR</span>
              </button>
            </div>
          </div>

          {/* Right Column: Transactions Activity with Filters & Pagination */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-sm text-white">Biến động số dư & Hoạt động</h3>
              </div>

              {/* Bộ lọc giao dịch */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'P2P_TRANSFER', label: 'Chuyển P2P' },
                  { key: 'TOP_UP', label: 'Nạp' },
                  { key: 'WITHDRAWAL', label: 'Rút' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleFilterChange(item.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      filterType === item.key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-xs">Chưa có giao dịch phù hợp với bộ lọc hiện tại.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Hãy thử chọn tab khác hoặc thực hiện một giao dịch mới!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {transactions.map((tx) => {
                    const isOut = tx.direction === 'OUT';
                    const isTopUp = tx.type === 'TOP_UP';
                    const isWithdraw = tx.type === 'WITHDRAWAL';

                    return (
                      <div
                        key={tx.transactionReference}
                        className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isWithdraw
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                : isOut
                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {isWithdraw ? (
                              <Building2 className="w-4 h-4" />
                            ) : isOut ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-white">
                              {isTopUp
                                ? 'Nạp tiền vào tài khoản'
                                : isWithdraw
                                ? 'Rút tiền về Ngân hàng'
                                : isOut
                                ? 'Chuyển tiền P2P'
                                : 'Nhận tiền chuyển khoản'}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {isTopUp ? (
                                <span>Nạp từ cổng thanh toán</span>
                              ) : isWithdraw ? (
                                <span>Rút về STK ngân hàng liên kết</span>
                              ) : isOut ? (
                                <span>Đến ví: <strong className="font-mono text-indigo-300">{tx.destinationWalletNumber}</strong></span>
                              ) : (
                                <span>Từ ví: <strong className="font-mono text-emerald-300">{tx.sourceWalletNumber}</strong></span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {tx.transactionReference}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-mono text-sm font-bold ${
                              isWithdraw
                                ? 'text-amber-400'
                                : isOut
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {isOut ? '-' : '+'}
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: tx.currency || 'VND',
                            }).format(tx.amount)}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tx.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phân trang (Pagination Bar) */}
                {pageData && pageData.totalPages > 1 && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      Trang <strong className="text-white">{page + 1}</strong> / {pageData.totalPages} (Tổng {pageData.totalElements} giao dịch)
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 0}
                        onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Trang trước
                      </button>
                      <button
                        disabled={pageData.last}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 flex items-center gap-1 transition"
                      >
                        Trang sau
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <TopUpModal
        isOpen={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={handleRefresh}
      />
      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccessTransaction={handleRefresh}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={handleRefresh}
      />
      <QrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />

      {/* Thông báo biến động số dư thời gian thực (Real-time Ting Ting) */}
      <RealtimeNotificationToast onRefreshData={handleRefresh} />
    </div>
  );
}
