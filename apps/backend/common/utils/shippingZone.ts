const JEJU_POSTAL_CODE_START = 63000;
const JEJU_POSTAL_CODE_END = 63644;

const DEFAULT_SHIPPING_FEE = 3500;
const ISLAND_SHIPPING_FEE = 5000;

export type ShippingZone = 'mainland' | 'island';

export function getShippingZone(postalCode: string): ShippingZone {
  const code = parseInt(postalCode.replace(/\D/g, ''), 10);
  
  if (isNaN(code)) {
    return 'mainland';
  }

  const isJeju = code >= JEJU_POSTAL_CODE_START && code <= JEJU_POSTAL_CODE_END;
  
  return isJeju ? 'island' : 'mainland';
}

export function getShippingFeeByZone(zone: ShippingZone): number {
  return zone === 'island' ? ISLAND_SHIPPING_FEE : DEFAULT_SHIPPING_FEE;
}

export function getShippingFeeByPostalCode(postalCode: string): number {
  const zone = getShippingZone(postalCode);
  return getShippingFeeByZone(zone);
}

export function isIslandArea(postalCode: string): boolean {
  return getShippingZone(postalCode) === 'island';
}
