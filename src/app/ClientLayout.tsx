'use client';

import { usePathname } from 'next/navigation';
import Header from "./components/Header";
import { SearchProvider } from './contexts/SearchContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <SearchProvider>
      <Header 
        showSearchBar={isHomePage}
      />
      {children}
    </SearchProvider>
  );
}
