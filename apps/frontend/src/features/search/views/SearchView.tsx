import './SearchView.css';
import { AppBar, AppBarSpacer } from '@/components/AppBar';
import SearchInput from '../components/SearchInput';
import { ProductGridContent } from '@/components/ProductGridContent';
import { BottomNav } from '@/components/BottomNav';
import SortDropdown from '../components/SortDropdown';
import { SORT_OPTIONS } from '../types/SortTypes';
import { useSearchPage } from '../hooks/useSearchPage';

type SearchPageReturn = ReturnType<typeof useSearchPage>;

interface SearchViewProps {
  state: SearchPageReturn['state'];
  actions: SearchPageReturn['actions'];
}

export default function SearchView({ state, actions }: SearchViewProps) {
  return (
    <div className="search-view">
      <AppBar variant="subpage" />
      <AppBarSpacer variant="subpage" />
      
      <main className="search-view__content">
        <section className="search-view__search-section">
          <h2 className="search-view__title">어떤 상품을 찾아드릴까요?</h2>
          <div className="search-view__input-wrapper">
            <SearchInput
              value={state.searchQuery}
              onChange={actions.onSearchChange}
              onClear={actions.onSearchClear}
              onSubmit={actions.onSearch}
            />
          </div>
        </section>

        {!state.hasSearched && state.recentSearches.length > 0 && (
          <section className="search-view__recent">
            <div className="search-view__recent-header">
              <span className="search-view__recent-title">최근 검색어</span>
              <button 
                className="search-view__recent-clear"
                onClick={actions.onClearAllRecent}
              >
                전체 삭제
              </button>
            </div>
            <div className="search-view__recent-chips">
              {state.recentSearches.map((term) => (
                <div key={term} className="search-view__recent-chip">
                  <button 
                    className="search-view__recent-chip-term"
                    onClick={() => actions.onRecentSearchClick(term)}
                  >
                    {term}
                  </button>
                  <button 
                    className="search-view__recent-chip-delete"
                    onClick={() => actions.onRecentSearchDelete(term)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round"/>
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
                    onClick={() => actions.onPopularSearchClick(item.term)}
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
                    onClick={() => actions.onPopularSearchClick(item.term)}
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
            <div className="search-view__sort-bar">
              <SortDropdown
                value={state.sortBy}
                options={SORT_OPTIONS}
                onChange={actions.onSortChange}
              />
            </div>
            {!state.isSearching && state.searchResults.length === 0 ? (
              <div className="search-view__empty">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <ProductGridContent
                products={state.searchResults}
                isLoading={state.isSearching}
                error={null}
                onProductClick={actions.onProductClick}
              />
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
