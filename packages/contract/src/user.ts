export type MembershipGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';
export type Gender = 'male' | 'female';

export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: Gender | null;
  membershipGrade: MembershipGrade;
  pointBalance: number;
  couponCount: number;
  orderCount: number;
  reviewCount: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  profileImage?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: UserProfileDto;
  message?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

export interface ShippingAddressListResponse {
  addresses: import('./order.js').ShippingAddressDto[];
  defaultAddressId: string | null;
}

export interface CreateShippingAddressRequest {
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  isDefault?: boolean;
}

export interface CreateShippingAddressResponse {
  success: boolean;
  addressId: string;
  message?: string;
}

export interface UpdateShippingAddressRequest {
  recipientName?: string;
  phone?: string;
  zipCode?: string;
  address?: string;
  addressDetail?: string;
  isDefault?: boolean;
}

export interface UpdateShippingAddressResponse {
  success: boolean;
  message?: string;
}
