import { apiClient } from './client';
import type {
  Beneficiary,
  BeneficiaryRequest,
  OtpRequest,
  OtpResponse,
  PageResponse,
  TransactionHistoryResponse,
} from '../types';

export const fintechApi = {
  // 1. Quản lý OTP
  generateOtp: async (request: OtpRequest): Promise<OtpResponse> => {
    const response = await apiClient.post<OtpResponse>('/otp/generate', request);
    return response.data;
  },

  // 2. Danh bạ người thụ hưởng
  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    const response = await apiClient.get<Beneficiary[]>('/beneficiaries');
    return response.data;
  },

  addBeneficiary: async (request: BeneficiaryRequest): Promise<Beneficiary> => {
    const response = await apiClient.post<Beneficiary>('/beneficiaries', request);
    return response.data;
  },

  deleteBeneficiary: async (id: number): Promise<void> => {
    await apiClient.delete(`/beneficiaries/${id}`);
  },

  // 3. Phân trang & Lọc lịch sử giao dịch
  searchTransactions: async (
    walletNumber: string,
    type?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<TransactionHistoryResponse>> => {
    const params: Record<string, any> = { page, size };
    if (type && type !== 'ALL') {
      params.type = type;
    }
    const response = await apiClient.get<PageResponse<TransactionHistoryResponse>>(
      `/wallets/${walletNumber}/transactions/search`,
      { params }
    );
    return response.data;
  },
};
