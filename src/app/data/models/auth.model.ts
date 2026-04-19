export enum KycStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface BankDetail {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string; // Useful for Paystack/Flutterwave integrations
  isDefault: boolean;
}

export interface User {
  id: string; // Supabase UID
  email: string;
  firstName: string;
  lastName: string;
  role: 'renter' | 'owner' | 'admin';
  avatarUrl?: string;
  
  // Compliance & Financials
  kycStatus: KycStatus;
  bankDetail?: BankDetail; // Optional until set up
  
  // Metadata
  createdAt: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}