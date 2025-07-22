'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '@/app/contexts/SearchContext';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  showSearchBar?: boolean;
}

export default function Header({ 
  showBackButton = false, 
  title, 
  showSearchBar = true 
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();
  const isHomePage = pathname === '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // A busca já é atualizada em tempo real pelo onChange
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="w-full bg-white text-black shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e botão voltar */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {showBackButton && !isHomePage && (
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-blue-500 transition-colors"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-1">
              <span className="flex items-center font-extrabold text-2xl rounded overflow-hidden">
                <span className="pl-2 pr-0 py-1 text-black">Click</span>
                <span className="pl-0 pr-2 py-1" style={{background:'#4FC3F7', color:'white', borderRadius:'0 8px 8px 0'}}>Go</span>
              </span>
            </Link>
            {title && (
              <span className="text-xl font-semibold text-gray-800 ml-2">
                {title}
              </span>
            )}
          </div>

          {/* Barra de busca */}
          {showSearchBar && isHomePage && (
            <div className="w-full md:max-w-md lg:max-w-xl">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full p-2 pl-10 rounded-lg bg-gray-100 text-black border-2 text-sm"
                    style={{ borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    placeholder="O que você procura?"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{color:'#4FC3F7'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </span>
                </div>
                <button 
                  type="submit" 
                  className="hidden sm:block" 
                  style={{
                    background:'#4FC3F7', 
                    color:'white', 
                    borderRadius:'8px', 
                    fontWeight:'bold', 
                    fontSize:'0.875rem', 
                    boxShadow:'0 2px 8px rgba(0,0,0,0.08)', 
                    padding:'0.5rem 1.25rem', 
                    transition:'all 0.2s',
                    height: '38px',
                    minWidth: '100px'
                  }}
                >
                  Buscar
                </button>
              </form>
            </div>
          )}

          {/* Botão Área da Empresa */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              onClick={() => router.push('/empresa/login')}
              className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base shadow-lg hover:bg-blue-600 transition-all duration-200 whitespace-nowrap w-full md:w-auto"
            >
              Área da Empresa
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
