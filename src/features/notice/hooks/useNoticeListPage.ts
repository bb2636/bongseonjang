import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts';
import { Notice } from '../types/notice';

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    category: '일반',
    title: '[공지] 봉선장 수산물 선도 관리 안내',
    createdAt: '2025.01.15',
  },
  {
    id: '2',
    category: '이벤트',
    title: '[이벤트] 설 연휴 특별 할인 프로모션',
    createdAt: '2025.01.10',
  },
  {
    id: '3',
    category: '배송',
    title: '[공지] 설 연휴 배송 일정 안내',
    createdAt: '2025.01.08',
  },
  {
    id: '4',
    category: '일반',
    title: '[공지] 개인정보 처리방침 변경 안내',
    createdAt: '2025.01.05',
  },
  {
    id: '5',
    category: '점검',
    title: '[점검] 시스템 정기 점검 안내 (1/20)',
    createdAt: '2025.01.03',
  },
  {
    id: '6',
    category: '이벤트',
    title: '[이벤트] 신규 회원 가입 혜택 안내',
    createdAt: '2024.12.28',
  },
];

export interface NoticeListPageState {
  notices: Notice[];
  cartCount: number;
  handleBack: () => void;
  handleCartClick: () => void;
  handleNoticeClick: (noticeId: string) => void;
}

export function useNoticeListPage(): NoticeListPageState {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleBack = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNoticeClick = (noticeId: string) => {
    console.log('Notice clicked:', noticeId);
  };

  return {
    notices: MOCK_NOTICES,
    cartCount,
    handleBack,
    handleCartClick,
    handleNoticeClick,
  };
}
