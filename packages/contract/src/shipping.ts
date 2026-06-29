import { ShippingRegion, ShippingSurchargeDto } from './product.js';

export type DeliveryRegion = 'MAINLAND' | 'JEJU' | 'ISLAND';

export const JEJU_POSTAL_PREFIXES = ['63'];

export const ISLAND_POSTAL_PREFIXES = [
  '402',
  '223',
  '230',
  '231',
  '525',
  '530',
  '531',
  '588',
  '589',
  '590',
  '591',
  '597',
  '598',
  '546',
  '547',
  '568',
  '339',
  '326',
  '336',
  '540',
  '544',
  '579',
  '580',
  '582',
  '169',
  '549',
  '559',
];

function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/-/g, '').trim();
}

export function detectDeliveryRegion(postalCode: string | null | undefined): DeliveryRegion {
  if (!postalCode) return 'MAINLAND';

  const code = normalizePostalCode(postalCode);
  if (JEJU_POSTAL_PREFIXES.some(prefix => code.startsWith(prefix))) return 'JEJU';
  if (ISLAND_POSTAL_PREFIXES.some(prefix => code.startsWith(prefix))) return 'ISLAND';

  return 'MAINLAND';
}

function isApplicableSurcharge(surchargeRegion: ShippingRegion, deliveryRegion: DeliveryRegion): boolean {
  if (deliveryRegion === 'JEJU') return surchargeRegion === 'JEJU' || surchargeRegion === 'JEJU_ISLAND';
  if (deliveryRegion === 'ISLAND') return surchargeRegion === 'ISLAND' || surchargeRegion === 'JEJU_ISLAND';

  return false;
}

export function resolveProductSurcharge(
  surcharges: ShippingSurchargeDto[] | null | undefined,
  deliveryRegion: DeliveryRegion,
): number {
  if (!surcharges || deliveryRegion === 'MAINLAND') return 0;

  const applicableAmounts = surcharges
    .filter(surcharge => isApplicableSurcharge(surcharge.region, deliveryRegion))
    .map(surcharge => surcharge.amount)
    .filter(amount => Number.isFinite(amount) && amount > 0);

  if (applicableAmounts.length === 0) return 0;

  return Math.max(...applicableAmounts);
}

export function resolveOrderSurcharge(
  productSurchargesList: Array<ShippingSurchargeDto[] | null | undefined>,
  deliveryRegion: DeliveryRegion,
): number {
  if (deliveryRegion === 'MAINLAND' || productSurchargesList.length === 0) return 0;

  const productAmounts = productSurchargesList.map(surcharges =>
    resolveProductSurcharge(surcharges, deliveryRegion),
  );

  return Math.max(0, ...productAmounts);
}

export function isValidShippingRegion(region: string): region is ShippingRegion {
  return region === 'JEJU' || region === 'ISLAND' || region === 'JEJU_ISLAND';
}

export function normalizeShippingSurcharges(value: unknown): ShippingSurchargeDto[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => {
      if (!item || typeof item !== 'object') return null;

      const region = (item as { region?: unknown }).region;
      const amount = Number((item as { amount?: unknown }).amount);

      if (typeof region !== 'string' || !isValidShippingRegion(region)) return null;
      if (!Number.isFinite(amount) || amount <= 0) return null;

      return { region, amount };
    })
    .filter((item): item is ShippingSurchargeDto => item !== null);
}
