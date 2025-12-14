import './ShippingAddressSection.css';

interface ShippingAddressSectionProps {
  postalCode: string;
  address: string;
  addressDetail: string | null;
}

export function ShippingAddressSection({
  postalCode,
  address,
  addressDetail,
}: ShippingAddressSectionProps) {
  const fullAddress = addressDetail
    ? `(${postalCode}) ${address} ${addressDetail}`
    : `(${postalCode}) ${address}`;

  return (
    <section className="shipping-address-section">
      <h2 className="shipping-address-section__title">배송지 정보</h2>
      <p className="shipping-address-section__address">{fullAddress}</p>
    </section>
  );
}
