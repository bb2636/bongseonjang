import SearchView from '../views/SearchView';
import { useSearchPage } from '../hooks/useSearchPage';

export default function SearchPage() {
  const state = useSearchPage();
  
  return <SearchView state={state} />;
}
