import { useGuestOrderLookup } from '../hooks/useGuestOrderLookup';
import GuestOrderLookupView from '../views/GuestOrderLookupView';

export default function GuestOrderLookupPage() {
  const { guestOrderLookup } = useGuestOrderLookup();

  return <GuestOrderLookupView guestOrderLookup={guestOrderLookup} />;
}
