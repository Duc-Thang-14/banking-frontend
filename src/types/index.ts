export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  defaultWalletNumber: string;
}

export interface WalletResponse {
  walletNumber: string;
  userId: number;
  username: string;
  walletType: 'MAIN' | 'VOUCHER' | 'SAVINGS';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'LOCKED' | 'CLOSED';
  createdAt: string;
}

export interface TransferRequest {
  sourceWalletNumber: string;
  destinationWalletNumber: string;
  amount: number;
  description: string;
  idempotencyKey: string;
  otp?: string;
}

export interface TransferResponse {
  transactionReference: string;
  sourceWalletNumber: string;
  destinationWalletNumber: string;
  amount: number;
  fee: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: string;
}

export interface TopUpRequest {
  walletNumber: string;
  amount: number;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export interface WithdrawRequest {
  walletNumber: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  otp?: string;
}

export interface TransactionHistoryResponse {
  transactionReference: string;
  sourceWalletNumber?: string | null;
  destinationWalletNumber?: string | null;
  amount: number;
  fee: number;
  currency: string;
  type: 'P2P_TRANSFER' | 'TOP_UP' | 'WITHDRAWAL';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  direction: 'IN' | 'OUT';
  createdAt: string;
}

export interface Beneficiary {
  id: number;
  beneficiaryWalletNumber: string;
  nickname: string;
  createdAt: string;
}

export interface BeneficiaryRequest {
  beneficiaryWalletNumber: string;
  nickname: string;
}

export interface OtpRequest {
  action: 'TRANSFER' | 'WITHDRAW';
  target: string;
}

export interface OtpResponse {
  message: string;
  expiresInSeconds: number;
  debugOtp?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

