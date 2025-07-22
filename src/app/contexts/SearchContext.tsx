'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  // Sincroniza a busca com o sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedQuery = sessionStorage.getItem('searchQuery') || '';
      setSearchQuery(savedQuery);
    }
  }, [pathname]);

  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('searchQuery', query);
    }
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery: updateSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
