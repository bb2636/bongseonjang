import { ShipmentSummary } from '../api/orderDetailApi';
import './ShipmentInfoSection.css';

interface ShipmentInfoSectionProps {
  shipments: ShipmentSummary[];
}

export function ShipmentInfoSection({ shipments }: ShipmentInfoSectionProps) {
  if (shipments.length === 0) {
    return null;
  }

  return (
    <section className="shipment-info-section">
      <h2 className="shipment-info-section__title">배송 정보</h2>
      <div className="shipment-info-section__list">
        {shipments.map(shipment => (
          <div key={shipment.id} className="shipment-info-section__item">
            <div className="shipment-info-section__item-header">
              <span className="shipment-info-section__status">{shipment.statusLabel}</span>
              {shipment.shippedAt && (
                <span className="shipment-info-section__timestamp">{shipment.shippedAt}</span>
              )}
            </div>
            <div className="shipment-info-section__details">
              <div className="shipment-info-section__row">
                <span className="shipment-info-section__label">택배사</span>
                <span className="shipment-info-section__value">{shipment.carrier}</span>
              </div>
              <div className="shipment-info-section__row">
                <span className="shipment-info-section__label">운송장 번호</span>
                <span className="shipment-info-section__value">{shipment.trackingNumber}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
