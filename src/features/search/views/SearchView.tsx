import './SearchView.css';
import { AppBar } from '@/components/AppBar';
import SearchInput from '../components/SearchInput';
import { ProductGridContent } from '@/components/ProductGridContent';
import { BottomNav } from '@/components/BottomNav';
import type { SearchPageState } from '../hooks/useSearchPage';

interface SearchViewProps {
  state: SearchPageState;
}

export default function SearchView({ state }: SearchViewProps) {
  return (
    <div className="search-view">
      <AppBar onCartClick={state.onCartClick} onLogoClick={state.onLogoClick} />
      
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

        {!state.hasSearched && state.popularSearches.length > 0 && (
          <section className="search-view__popular">
            <h3 className="search-view__popular-title">인기 검색어</h3>
            <div className="search-view__popular-grid">
              <div className="search-view__popular-column">
                {state.popularSearches.slice(0, 5).map((item, index) => (
                  <button
                    key={item.term}
                    className="search-view__popular-item"
                    onClick={() => state.onPopularSearchClick(item.term)}
                  >
                    <span className="search-view__popular-rank">{index + 1}</span>
                    <span className="search-view__popular-term">{item.term}</span>
                  </button>
                ))}
              </div>
              <div className="search-view__popular-column">
                {state.popularSearches.slice(5, 10).map((item, index) => (
                  <button
                    key={item.term}
                    className="search-view__popular-item"
                    onClick={() => state.onPopularSearchClick(item.term)}
                  >
                    <span className="search-view__popular-rank">{index + 6}</span>
                    <span className="search-view__popular-term">{item.term}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {state.hasSearched && (
          <section className="search-view__results">
            {!state.isSearching && state.searchResults.length === 0 ? (
              <div className="search-view__empty">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <ProductGridContent
                products={state.searchResults}
                isLoading={state.isSearching}
                error={null}
                onAddToCart={state.onAddToCart}
                onToggleFavorite={state.onToggleFavorite}
                onProductClick={state.onProductClick}
              />
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
