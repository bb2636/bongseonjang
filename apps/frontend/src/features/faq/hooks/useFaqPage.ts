import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaqCategory, FaqItem } from '../types/faq';
import { useGoBack } from '../../../hooks/useGoBack';

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: 'orders-payments', name: '주문/결제' },
  { id: 'shipping', name: '배송' },
  { id: 'products', name: '상품' },
  { id: 'returns', name: '취소/교환/환불' },
  { id: 'membership', name: '회원' },
  { id: 'others', name: '기타' },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'missing-account-number',
    categoryId: 'orders-payments',
    question: '무통장 입금 시 계좌번호를 잊어버렸어요',
    answer:
      '결제 단계에서 발급된 가상계좌 번호는 주문 내역에서도 확인할 수 있어요. 주문 상세 화면에서 계좌번호와 입금 금액을 다시 확인하신 뒤 24시간 내에 입금해 주세요.',
  },
  {
    id: 'cash-receipt',
    categoryId: 'orders-payments',
    question: '현금영수증 하고 싶어요',
    answer:
      '채팅 상담을 통해 현금영수증이 필요한 번호를 남겨주시면 발급을 도와드려요. 발급된 현금영수증은 국세청 홈택스에서 조회·발급 메뉴로 확인할 수 있습니다.',
  },
  {
    id: 'delivery-schedule',
    categoryId: 'shipping',
    question: '배송 일정이 궁금해요',
    answer:
      '주문하신 상품은 신선도를 위해 지정된 새벽 배송 일정에 맞춰 출발합니다. 마이페이지 > 주문내역에서 예정 일정을 확인할 수 있습니다.',
  },
  {
    id: 'product-storage',
    categoryId: 'products',
    question: '수산물 보관은 어떻게 하나요?',
    answer:
      '상품마다 권장 보관 방법이 달라요. 상품 상세 페이지의 보관 안내를 확인하시고, 받으신 즉시 냉장 또는 냉동 보관해 주세요.',
  },
  {
    id: 'refund-process',
    categoryId: 'returns',
    question: '환불은 어떻게 진행되나요?',
    answer:
      '상품 상태 확인 후 영업일 기준 3~5일 내 결제 수단으로 환불됩니다. 자세한 진행 상황은 주문 상세에서 확인할 수 있습니다.',
  },
  {
    id: 'account-support',
    categoryId: 'membership',
    question: '로그인이 안 될 때는 어떻게 하나요?',
    answer:
      '비밀번호 재설정 후에도 문제가 지속된다면 고객센터 채팅으로 문의해 주세요. 가입 시 사용한 이메일과 휴대폰 번호를 알려주시면 빠르게 도와드릴게요.',
  },
  {
    id: 'partnership',
    categoryId: 'others',
    question: '제휴 및 제안은 어디로 전달하면 되나요?',
    answer:
      '제휴 제안은 고객센터 > 기타 > 제휴/제안 항목을 통해 접수해 주세요. 담당자가 내용을 검토한 후 연락드립니다.',
  },
];

export function useFaqPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('orders-payments');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('cash-receipt');

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((faq) => {
      const matchesCategory = faq.categoryId === selectedCategoryId;
      if (!normalizedQuery) {
        return matchesCategory;
      }
      const matchesQuery = faq.question.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategoryId]);

  const handleBack = () => {
    goBack();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setExpandedFaqId(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleToggle = (faqId: string) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  return {
    state: {
      categories: FAQ_CATEGORIES,
      selectedCategoryId,
      searchQuery,
      filteredFaqs,
      expandedFaqId,
    },
    actions: {
      handleBack,
      handleCartClick,
      handleCategorySelect,
      handleSearchChange,
      handleToggle,
    },
  };
}
