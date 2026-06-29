import { detectDeliveryRegion, resolveOrderSurcharge, normalizeShippingSurcharges } from '@bongkru/contract';

const DEFAULT_BASE_SHIPPING_FEE = 3500;

interface ShippingProductInput {
  detailContent?: string | null;
}

interface ParsedShippingInfo {
  shippingFee: number;
  freeShippingThreshold: number | null;
  surcharges: ReturnType<typeof normalizeShippingSurcharges>;
}

function parseShippingInfo(detailContent: string | null | undefined): ParsedShippingInfo {
  const parsed: ParsedShippingInfo = {
    shippingFee: DEFAULT_BASE_SHIPPING_FEE,
    freeShippingThreshold: null,
    surcharges: [],
  };

  if (!detailContent) return parsed;

  try {
    const detail = JSON.parse(detailContent);
    if (detail.shippingInfo) {
      parsed.shippingFee = detail.shippingInfo.shippingFee ?? DEFAULT_BASE_SHIPPING_FEE;
      parsed.freeShippingThreshold = detail.shippingInfo.freeShippingThreshold ?? null;
    }
    parsed.surcharges = normalizeShippingSurcharges(detail.shippingSurcharges);
  } catch {
    return parsed;
  }

  return parsed;
}

export function computeOrderShippingFee(
  products: ShippingProductInput[],
  postalCode: string | null | undefined,
  totalProductPrice: number,
): number {
  const region = detectDeliveryRegion(postalCode);
  const parsedList = products.map(product => parseShippingInfo(product.detailContent));

  const firstProduct = parsedList[0];
  const baseFee = firstProduct?.shippingFee ?? DEFAULT_BASE_SHIPPING_FEE;
  const freeShippingThreshold = firstProduct?.freeShippingThreshold ?? null;

  const surcharge = resolveOrderSurcharge(parsedList.map(item => item.surcharges), region);

  const isFreeShipping = freeShippingThreshold !== null && totalProductPrice >= freeShippingThreshold;
  if (isFreeShipping) return surcharge;

  return baseFee + surcharge;
}
