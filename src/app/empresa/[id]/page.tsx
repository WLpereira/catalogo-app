"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSearch } from '@/app/contexts/SearchContext';
import { supabase } from "@/lib/supabaseClient";
import Footer from '@/app/components/Footer';
import { Empresa, Produto } from '@/types/empresa';


   
export default function EmpresaPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const { searchQuery: busca, setSearchQuery: setBusca } = useSearch();
  const [buscaLocal, setBuscaLocal] = useState(busca);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [corPrimaria, setCorPrimaria] = useState('#29B6F6');
  const [corSecundaria, setCorSecundaria] = useState('#4FC3F7');
  
  // Função para formatar o preço em reais    R$
  const formatarPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  useEffect(() => {
    const fetchEmpresa = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresaId)
        .single();
      
      if (!error && data) {
        setEmpresa(data);
        // Aplicar cores personalizadas ou usar padrão
        if (data.cor_primaria) setCorPrimaria(data.cor_primaria);
        if (data.cor_secundaria) setCorSecundaria(data.cor_secundaria);
      }
    };
    const fetchProdutos = async () => {
      const { data } = await supabase.from("produtos").select("*").eq("empresa_id", empresaId).order("created_at", { ascending: false });
      setProdutos(data || []);
      setLoading(false);
    };
    if (empresaId) {
      fetchEmpresa();
      fetchProdutos();
    }
  }, [empresaId]);

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: corPrimaria, minHeight: '100vh' }}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: corPrimaria }}></div>
        </div>
      ) : empresa ? (
        <>
          <header className="w-full bg-transparent flex flex-col items-center py-4 px-2 sm:px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/80 rounded-xl shadow-lg px-4 py-3 max-w-xl w-full">
              {empresa.logo_url && (
                <img
                  src={empresa.logo_url}
                  alt={`Logo ${empresa.nome}`}
                  className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain rounded-full border border-gray-200 shadow"
                />
              )}
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-center w-full break-words" style={{ color: corPrimaria }}>{empresa.nome}</h1>
            </div>
          </header>
          {/* Banner responsivo */}
          {empresa.banner_urls && empresa.banner_urls.length > 0 && (
            <div className="w-full flex justify-center mt-4 px-1 sm:px-4">
              <div className="w-full max-w-5xl h-28 xs:h-36 sm:h-44 md:h-56 rounded-xl overflow-hidden shadow-xl mb-6 border-4 border-white/80 flex justify-center items-center bg-white/10">
                <img
                  src={empresa.banner_urls[0]}
                  alt="Banner da loja"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          {/* Barra de pesquisa responsiva */}
          <div className="w-full flex justify-center mt-2 mb-8 px-2 sm:px-4">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={buscaLocal}
                onChange={(e) => {
                  setBuscaLocal(e.target.value);
                  setBusca(e.target.value);
                }}
                className="w-full px-6 py-3 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  border: `2px solid ${corSecundaria}`,
                  color: corSecundaria,
                  backgroundColor: 'rgba(255,255,255,0.96)',
                  fontWeight: 500
                }}
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <main className="flex-1 w-full py-6 px-1 xs:px-2 sm:px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center tracking-tight" style={{ color: corSecundaria, letterSpacing: 1 }}>Produtos Disponíveis</h2>
              {produtosFiltrados.length === 0 ? (
                <p className="text-center text-gray-100/80 text-lg font-medium">Nenhum produto encontrado.</p>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {produtosFiltrados.map((produto) => (
                    <div
                      key={produto.id}
                      className="bg-white/95 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col h-full border-2 border-transparent hover:border-blue-200"
                      onClick={() => setProdutoSelecionado(produto)}
                    >
                      <div className="bg-white rounded-xl shadow-lg flex flex-col h-full cursor-pointer hover:scale-105 transition-transform duration-200 border border-gray-200 min-w-0" onClick={() => setProdutoSelecionado(produto)}>
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-full h-40 xs:h-44 sm:h-52 md:h-56 object-contain rounded-t-xl bg-gray-50 border-b"
                        />
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <h2 className="text-base xs:text-lg font-bold mb-1 truncate" style={{ color: corPrimaria }}>{produto.nome}</h2>
                          <p className="text-gray-700 mb-2 sm:mb-3 line-clamp-2 text-xs xs:text-sm">{produto.descricao}</p>
                          <p className="text-lg sm:text-xl font-extrabold" style={{ color: corSecundaria }}>{formatarPreco(produto.preco)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
          {produtoSelecionado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 xs:p-4">
              <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-3 xs:p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold break-words" style={{ color: corPrimaria }}>{produtoSelecionado?.nome}</h3>
                    <button
                      onClick={() => setProdutoSelecionado(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <img
                      src={produtoSelecionado?.imagem_url ?? ''}
                      alt={produtoSelecionado?.nome ?? ''}
                      className="w-full h-40 xs:h-52 sm:h-64 object-contain mb-2 sm:mb-4"
                    />
                    <p className="text-gray-700 mb-2 sm:mb-4 text-xs xs:text-sm">{produtoSelecionado?.descricao}</p>
                    <p className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4" style={{ color: corSecundaria }}>
                      {produtoSelecionado ? formatarPreco(produtoSelecionado.preco) : ''}
                    </p>
                    <div className="flex items-center mb-4 sm:mb-6 flex-wrap gap-2 xs:gap-4">
                      <span className="mr-2 xs:mr-4">Quantidade:</span>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                          className="px-2 xs:px-3 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="px-3 xs:px-4 py-1">{quantidade}</span>
                        <button
                          onClick={() => setQuantidade(quantidade + 1)}
                          className="px-2 xs:px-3 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="w-full py-2 rounded-md text-white font-medium text-base xs:text-lg"
                      style={{ backgroundColor: corPrimaria }}
                      onClick={() => {
                        const whatsappNumber = empresa?.whatsapp?.replace(/\D/g, '');
                        const message = produtoSelecionado ? `Olá! Gostaria de comprar ${quantidade}x ${produtoSelecionado.nome} - ${formatarPreco(produtoSelecionado.preco * quantidade)}` : '';
                        const url = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(message)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Comprar Agora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Footer empresa={empresa} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Empresa não encontrada</p>
        </div>
      )}
    </div>
  );
}