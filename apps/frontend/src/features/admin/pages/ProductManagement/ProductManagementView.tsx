import { useState } from 'react';
import { AdminProduct } from './useProductManagement';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import './ProductManagement.css';

interface ProductManagementViewProps {
  products: AdminProduct[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  page: number;
  totalPages: number;
  onSearchChange: (query: string) => void;
  onAddProduct: () => void;
  onViewProduct: (product: AdminProduct) => void;
  onDeleteProduct: (product: AdminProduct) => void;
  onGoToPage: (page: number) => void;
  formatPrice: (price: number) => string;
  getExposureLabel: (product: AdminProduct) => string;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ProductManagementView({
  products,
  totalCount,
  isLoading,
  error,
  searchQuery,
  page,
  totalPages,
  onSearchChange,
  onAddProduct,
  onViewProduct,
  onDeleteProduct,
  onGoToPage,
  formatPrice,
  getExposureLabel,
}: ProductManagementViewProps) {
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<AdminProduct | null>(null);

  const handleDeleteClick = (product: AdminProduct) => {
    setDeleteConfirmProduct(product);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmProduct) {
      onDeleteProduct(deleteConfirmProduct);
      setDeleteConfirmProduct(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmProduct(null);
  };

  return (
    <div className="product-management">
      <div className="product-management__toolbar">
        <div className="product-management__toolbar-left">
          <span className="product-management__total">총 상품 수 · {totalCount.toLocaleString()}</span>
        </div>
        <div className="product-management__toolbar-right">
          <div className="product-management__search">
            <span className="product-management__search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="product-management__search-input"
            />
          </div>
          <button className="product-management__add-button" onClick={onAddProduct}>
            신규 상품 등록
          </button>
        </div>
      </div>

      {error && (
        <div className="product-table__error">
          <p className="product-table__error-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="product-table">
          <div className="product-table__header">
            <div className="product-table__header-row">
              <div className="product-table__header-cell product-table__header-cell--info">상품 정보</div>
              <div className="product-table__header-cell product-table__header-cell--price">가격</div>
              <div className="product-table__header-cell product-table__header-cell--option">옵션</div>
              <div className="product-table__header-cell product-table__header-cell--stock">재고</div>
              <div className="product-table__header-cell product-table__header-cell--exposure">노출상태</div>
              <div className="product-table__header-cell product-table__header-cell--actions">관리</div>
            </div>
          </div>
          <div className="product-table__body">
            {isLoading ? (
              <div className="product-table__body-row product-table__body-row--loading">
                <div className="product-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="product-table__empty">
                <p className="product-table__empty-message">
                  등록된 상품이 없습니다.
                </p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-table__body-row">
                  <div className="product-table__cell product-table__cell--info">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="product-table__thumbnail"
                      />
                    ) : (
                      <div className="product-table__thumbnail product-table__thumbnail--placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <div className="product-table__info">
                      <span className="product-table__name">{product.name}</span>
                      <span className="product-table__category">{product.categoryName}</span>
                    </div>
                  </div>
                  <div className="product-table__cell product-table__cell--price">
                    <span className="product-table__price">{formatPrice(product.lowestPrice)}</span>
                  </div>
                  <div className="product-table__cell product-table__cell--option">
                    <span className="product-table__option">{product.optionSummary}</span>
                  </div>
                  <div className="product-table__cell product-table__cell--stock">
                    <span className="product-table__stock">{product.stockQuantity}</span>
                  </div>
                  <div className="product-table__cell product-table__cell--exposure">
                    <span
                      className={`product-table__exposure-status ${product.isExposed ? 'product-table__exposure-status--active' : 'product-table__exposure-status--inactive'}`}
                    >
                      {product.isExposed ? getExposureLabel(product) : '노출'}
                    </span>
                  </div>
                  <div className="product-table__cell product-table__cell--actions">
                    <button
                      className="product-table__action-button product-table__action-button--view"
                      onClick={() => onViewProduct(product)}
                    >
                      수정
                    </button>
                    <button
                      className="product-table__action-button product-table__action-button--delete"
                      onClick={() => handleDeleteClick(product)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="product-pagination">
          <button
            className="product-pagination__button product-pagination__button--prev"
            onClick={() => onGoToPage(page - 1)}
            disabled={page === 1}
          >
            이전
          </button>
          <div className="product-pagination__pages">
            {generatePageNumbers(page, totalPages).map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="product-pagination__ellipsis">...</span>
              ) : (
                <button
                  key={pageNum}
                  className={`product-pagination__page ${page === pageNum ? 'product-pagination__page--active' : ''}`}
                  onClick={() => onGoToPage(pageNum as number)}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>
          <button
            className="product-pagination__button product-pagination__button--next"
            onClick={() => onGoToPage(page + 1)}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmProduct !== null}
        title={`'${deleteConfirmProduct?.name}' 상품을 삭제하시겠습니까?`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        cancelText="취소"
        confirmText="삭제"
        confirmColor="danger"
      />
    </div>
  );
}

function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  pages.push(1);
  
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);
  
  if (currentPage <= 3) {
    startPage = 2;
    endPage = Math.min(totalPages - 1, maxVisiblePages);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    endPage = totalPages - 1;
  }
  
  if (startPage > 2) {
    pages.push('...');
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  if (endPage < totalPages - 1) {
    pages.push('...');
  }
  
  pages.push(totalPages);
  
  return pages;
}
