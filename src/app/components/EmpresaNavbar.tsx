import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EmpresaNavbarProps {
  logoUrl?: string;
  nome: string;
  corPrimaria: string;
}

export default function EmpresaNavbar({ logoUrl, nome, corPrimaria }: EmpresaNavbarProps) {
  const router = useRouter();
  return (
    <nav className="w-full fixed top-0 left-0 z-40 bg-white border-b border-gray-100 shadow-sm" style={{height:'64px'}}>
      <div className="flex items-center justify-between px-2 sm:px-4 h-16 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`Logo ${nome}`}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border border-gray-200 bg-white"
              />
            )}
          </Link>
          <span className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{color: corPrimaria}}>{nome}</span>
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => router.push('/empresa/login')}
          className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base shadow hover:bg-blue-700 transition-colors ml-auto"
        >
          Área da Empresa
        </button>
      </div>
    </nav>
  );
}
