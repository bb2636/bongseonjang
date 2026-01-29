import AppBar, { AppBarSpacer } from '../../../components/AppBar';
import { OrderDetail } from '../api/orderDetailApi';
import { OrderInfoCard } from '../components/OrderInfoCard';
import { ShippingAddressSection } from '../components/ShippingAddressSection';
import { OrderInfoSection } from '../components/OrderInfoSection';
import { OrderItemsSection } from '../components/OrderItemsSection';
import { PaymentInfoSection } from '../components/PaymentInfoSection';
import { ShipmentInfoSection } from '../components/ShipmentInfoSection';
import './OrderDetailView.css';

interface OrderDetailViewProps {
  title: string;
  order: OrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onCartClick: () => void;
}

export function OrderDetailView({
  title,
  order,
  isLoading,
  isError,
  onBack,
  onCartClick,
}: OrderDetailViewProps) {
  if (isLoading) {
    return (
      <div className="order-detail">
        <AppBar variant="subpage" title={title} onBackClick={onBack} onCartClick={onCartClick} />
        <AppBarSpacer variant="subpage" />
        <div className="order-detail__loading">
          <div className="order-detail__skeleton">
            <div className="order-detail__skeleton-card"></div>
            <div className="order-detail__skeleton-section"></div>
            <div className="order-detail__skeleton-section"></div>
            <div className="order-detail__skeleton-section"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="order-detail">
        <AppBar variant="subpage" title={title} onBackClick={onBack} onCartClick={onCartClick} />
        <AppBarSpacer variant="subpage" />
        <div className="order-detail__error">
          <p>주문 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail">
      <AppBar variant="subpage" title={title} onBackClick={onBack} onCartClick={onCartClick} />
      <AppBarSpacer variant="subpage" />

      <div className="order-detail__content">
        <OrderInfoCard
          orderDate={order.orderDate}
          orderNumber={order.orderNumber}
        />

        <ShippingAddressSection
          postalCode={order.postalCode}
          address={order.address}
          addressDetail={order.addressDetail}
        />

        <OrderInfoSection
          orderNumber={order.orderNumber}
          recipientName={order.recipientName}
          paidAt={order.paidAt}
        />

        <ShipmentInfoSection shipments={order.shipments} />

        <OrderItemsSection
          statusLabel={order.statusLabel}
          items={order.items}
        />

        <PaymentInfoSection
          totalProductPrice={order.totalProductPrice}
          usedPoints={order.usedPoints}
          couponDiscountAmount={order.couponDiscountAmount}
          shippingFee={order.shippingFee}
          finalAmount={order.finalAmount}
          payment={order.payment}
        />
      </div>
    </div>
  );
}
