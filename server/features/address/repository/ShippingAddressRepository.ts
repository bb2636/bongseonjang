import { ShippingAddress } from '../../../entity/ShippingAddress';

export interface ShippingAddressRepository {
  findByUserId(userId: string): Promise<ShippingAddress[]>;
  findById(id: string, userId: string): Promise<ShippingAddress | null>;
  findDefaultByUserId(userId: string): Promise<ShippingAddress | null>;
  create(data: CreateShippingAddressData): Promise<ShippingAddress>;
  update(id: string, userId: string, data: UpdateShippingAddressData): Promise<ShippingAddress | null>;
  softDelete(id: string, userId: string): Promise<boolean>;
  setDefault(id: string, userId: string): Promise<boolean>;
}

export interface CreateShippingAddressData {
  userId: string;
  addressName: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address: string;
  addressDetail?: string | null;
  isDefault?: boolean;
}

export interface UpdateShippingAddressData {
  addressName?: string;
  recipientName?: string;
  recipientPhone?: string;
  postalCode?: string;
  address?: string;
  addressDetail?: string | null;
  isDefault?: boolean;
}
