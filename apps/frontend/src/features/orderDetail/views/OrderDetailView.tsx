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
        <header className="order-detail__header">
          <button className="order-detail__back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="order-detail__title">{title}</h1>
          <button className="order-detail__cart-button" onClick={onCartClick}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M8.66667 23.8333C9.58714 23.8333 10.3333 23.0871 10.3333 22.1667C10.3333 21.2462 9.58714 20.5 8.66667 20.5C7.74619 20.5 7 21.2462 7 22.1667C7 23.0871 7.74619 23.8333 8.66667 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
              <path d="M19.5 23.8333C20.4205 23.8333 21.1667 23.0871 21.1667 22.1667C21.1667 21.2462 20.4205 20.5 19.5 20.5C18.5795 20.5 17.8333 21.2462 17.8333 22.1667C17.8333 23.0871 18.5795 23.8333 19.5 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
              <path d="M2.16667 2.16667H5.5L8.28 15.3567C8.37428 15.8085 8.61968 16.2132 8.97567 16.5032C9.33166 16.7932 9.7765 16.9512 10.2367 16.95H18.9167C19.3769 16.9512 19.8217 16.7932 20.1777 16.5032C20.5337 16.2132 20.7791 15.8085 20.8733 15.3567L22.5333 7.33333H6.58333" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>
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
        <header className="order-detail__header">
          <button className="order-detail__back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="order-detail__title">{title}</h1>
          <button className="order-detail__cart-button" onClick={onCartClick}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M8.66667 23.8333C9.58714 23.8333 10.3333 23.0871 10.3333 22.1667C10.3333 21.2462 9.58714 20.5 8.66667 20.5C7.74619 20.5 7 21.2462 7 22.1667C7 23.0871 7.74619 23.8333 8.66667 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
              <path d="M19.5 23.8333C20.4205 23.8333 21.1667 23.0871 21.1667 22.1667C21.1667 21.2462 20.4205 20.5 19.5 20.5C18.5795 20.5 17.8333 21.2462 17.8333 22.1667C17.8333 23.0871 18.5795 23.8333 19.5 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
              <path d="M2.16667 2.16667H5.5L8.28 15.3567C8.37428 15.8085 8.61968 16.2132 8.97567 16.5032C9.33166 16.7932 9.7765 16.9512 10.2367 16.95H18.9167C19.3769 16.9512 19.8217 16.7932 20.1777 16.5032C20.5337 16.2132 20.7791 15.8085 20.8733 15.3567L22.5333 7.33333H6.58333" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>
        <div className="order-detail__error">
          <p>주문 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail">
      <header className="order-detail__header">
        <button className="order-detail__back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="order-detail__title">{title}</h1>
        <button className="order-detail__cart-button" onClick={onCartClick}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M8.66667 23.8333C9.58714 23.8333 10.3333 23.0871 10.3333 22.1667C10.3333 21.2462 9.58714 20.5 8.66667 20.5C7.74619 20.5 7 21.2462 7 22.1667C7 23.0871 7.74619 23.8333 8.66667 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
            <path d="M19.5 23.8333C20.4205 23.8333 21.1667 23.0871 21.1667 22.1667C21.1667 21.2462 20.4205 20.5 19.5 20.5C18.5795 20.5 17.8333 21.2462 17.8333 22.1667C17.8333 23.0871 18.5795 23.8333 19.5 23.8333Z" fill="rgba(12, 12, 12, 0.9)"/>
            <path d="M2.16667 2.16667H5.5L8.28 15.3567C8.37428 15.8085 8.61968 16.2132 8.97567 16.5032C9.33166 16.7932 9.7765 16.9512 10.2367 16.95H18.9167C19.3769 16.9512 19.8217 16.7932 20.1777 16.5032C20.5337 16.2132 20.7791 15.8085 20.8733 15.3567L22.5333 7.33333H6.58333" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

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
