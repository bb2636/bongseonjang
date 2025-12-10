import './SearchView.css';
import SearchAppBar from '../components/SearchAppBar';
import SearchInput from '../components/SearchInput';
import type { SearchPageState } from '../hooks/useSearchPage';

interface SearchViewProps {
  state: SearchPageState;
}

export default function SearchView({ state }: SearchViewProps) {
  return (
    <div className="search-view">
      <SearchAppBar onCartClick={state.onCartClick} />
      
      <main className="search-view__content">
        <section className="search-view__search-section">
          <h2 className="search-view__title">어떤 상품을 찾아드릴까요?</h2>
          <div className="search-view__input-wrapper">
            <SearchInput
              value={state.searchQuery}
              onChange={state.onSearchChange}
              onClear={state.onSearchClear}
              onSubmit={state.onSearch}
            />
          </div>
        </section>

        {!state.hasSearched && state.recentSearches.length > 0 && (
          <section className="search-view__recent">
            <div className="search-view__recent-header">
              <span className="search-view__recent-title">최근 검색어</span>
              <button 
                className="search-view__recent-clear"
                onClick={state.onClearAllRecent}
              >
                전체 삭제
              </button>
            </div>
            <div className="search-view__recent-list">
              {state.recentSearches.map((term) => (
                <div key={term} className="search-view__recent-item">
                  <button 
                    className="search-view__recent-term"
                    onClick={() => state.onRecentSearchClick(term)}
                  >
                    {term}
                  </button>
                  <button 
                    className="search-view__recent-delete"
                    onClick={() => state.onRecentSearchDelete(term)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M12 4L4 12" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {state.hasSearched && (
          <section className="search-view__results">
            {state.isSearching ? (
              <div className="search-view__loading">검색 중...</div>
            ) : state.searchResults.length === 0 ? (
              <div className="search-view__empty">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="search-view__results-grid">
                {state.searchResults.map((product) => (
                  <div 
                    key={product.id} 
                    className="search-view__product-card"
                    onClick={() => state.onProductClick(product.id)}
                  >
                    <div className="search-view__product-image-container">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="search-view__product-image"
                        />
                      ) : (
                        <div className="search-view__product-placeholder" />
                      )}
                      <button 
                        className="search-view__add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          state.onAddToCart(product.id);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M5.33333 14.6667C5.88562 14.6667 6.33333 14.219 6.33333 13.6667C6.33333 13.1144 5.88562 12.6667 5.33333 12.6667C4.78105 12.6667 4.33333 13.1144 4.33333 13.6667C4.33333 14.219 4.78105 14.6667 5.33333 14.6667Z" fill="#0C0C0C"/>
                          <path d="M12 14.6667C12.5523 14.6667 13 14.219 13 13.6667C13 13.1144 12.5523 12.6667 12 12.6667C11.4477 12.6667 11 13.1144 11 13.6667C11 14.219 11.4477 14.6667 12 14.6667Z" fill="#0C0C0C"/>
                          <path d="M1.33333 1.33333H3.33333L5.12 9.59333C5.17918 9.86583 5.32876 10.1108 5.54428 10.2872C5.75979 10.4636 6.02806 10.5612 6.30667 10.5667H11.68C11.9586 10.5612 12.2269 10.4636 12.4424 10.2872C12.6579 10.1108 12.8075 9.86583 12.8667 9.59333L14 4.33333H4.05333" stroke="#0C0C0C" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>담기</span>
                      </button>
                    </div>
                    <div className="search-view__product-info">
                      <p className="search-view__product-name">{product.name}</p>
                      <div className="search-view__product-price-row">
                        {product.discountRate > 0 && (
                          <span className="search-view__product-discount">{product.discountRate}%</span>
                        )}
                        <span className="search-view__product-price">
                          {(product.price || 0).toLocaleString('ko-KR')}원
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
