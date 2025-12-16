import { useMemo } from 'react';
import type { ProductInquiry } from '../types/productInquiry';

export function useProductInquiries(productId: string) {
  const inquiries: ProductInquiry[] = useMemo(
    () => [
      {
        id: `${productId}-1`,
        status: 'pending',
        categoryLabel: '/상품문의',
        authorAlias: '블**',
        createdAt: '2025-01-01',
        title: '안녕하세요 이 곳에 문의 제목이 들어갑니다안녕하세요 이 곳에 문의 제목이 들어갑니다',
        isPrivate: true,
      },
      {
        id: `${productId}-2`,
        status: 'answered',
        categoryLabel: '/상품문의',
        authorAlias: '블**',
        createdAt: '2025-01-02',
        title: '안녕하세요 이 곳에 문의 제목이 들어갑니다안녕하세요 이 곳에 문의 제목이 들어갑니다',
        answer:
          '안녕하세요 고객님! 이 곳에 문의 답변이 들어갑니다 안녕하세요 고객님! 이 곳에 문의 답변이 들어갑니다 안녕하세요 고객님! 이 곳에 문의 답변이 들어갑니다 안녕하세요 고객님! 이 곳에 문의 답변이 들어갑니다',
      },
      {
        id: `${productId}-3`,
        status: 'pending',
        categoryLabel: '/상품문의',
        authorAlias: '블**',
        createdAt: '2025-01-03',
        title: '비밀글입니다',
        isPrivate: true,
      },
    ],
    [productId]
  );

  return { inquiries, isLoading: false };
}
