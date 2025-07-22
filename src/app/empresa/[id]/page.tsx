"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSearch } from '@/app/contexts/SearchContext';
import { supabase } from "@/lib/supabaseClient";

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  whatsapp: string;
  logo_url: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  banner_urls?: string[];
}

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  created_at: string;
}

export default function EmpresaPage() {
  const params = useParams();
  const empresaId = params.id as string;
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const { searchQuery: busca, setSearchQuery: setBusca } = useSearch();
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [corPrimaria, setCorPrimaria] = useState('#29B6F6');
  const [corSecundaria, setCorSecundaria] = useState('#4FC3F7');
  
  // Função para formatar o preço em reais
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
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5FE] to-[#B3E5FC]">
      {!empresa ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4FC3F7]"></div>
            <p className="mt-4 text-gray-700">Carregando informações da empresa...</p>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                {empresa.logo_url ? (
                  <img 
                    src={empresa.logo_url} 
                    alt={`Logo ${empresa.nome}`} 
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <span className="text-xl font-bold">{empresa.nome.charAt(0)}</span>
                  </div>
                )}
                <h1 className="ml-3 text-2xl font-bold text-gray-900">{empresa.nome}</h1>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: corSecundaria, boxShadow: `0 0 0 1px ${corSecundaria}80` }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Produtos Disponíveis</h2>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4FC3F7]"></div>
                <p className="mt-2 text-gray-600">Carregando produtos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtosFiltrados.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Tente ajustar sua busca para encontrar o que procura.</p>
                  </div>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <div 
                      key={produto.id} 
                      className="bg-white border-2 rounded-xl shadow-sm p-4 flex flex-col items-center cursor-pointer hover:shadow-md transition-all duration-200" 
                      style={{borderColor: '#E1F5FE'}}
                      onClick={() => { setProdutoSelecionado(produto); setQuantidade(1); }}
                    >
                      {produto.imagem_url ? (
                        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                          <img 
                            src={produto.imagem_url} 
                            alt={produto.nome} 
                            className="max-h-full max-w-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 mb-4 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <h4 className="text-lg font-bold text-gray-900 mb-1 text-center">{produto.nome}</h4>
                      <p className="text-[#4FC3F7] font-bold text-lg mb-2">R$ {produto.preco?.toFixed(2).replace('.', ',')}</p>
                      {produto.descricao && (
                        <p className="text-gray-600 text-sm text-center line-clamp-2">{produto.descricao}</p>
                      )}
                      <button
                        onClick={() => setProdutoSelecionado(produto)}
                        className="mt-4 w-full text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium"
                        style={{ 
                          backgroundColor: corPrimaria,
                          boxShadow: `0 2px 4px ${corPrimaria}40`
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Modal de compra */}
          {produtoSelecionado && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#B3E5FC] relative overflow-hidden">
                <button
                  onClick={() => setProdutoSelecionado(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ color: corPrimaria }}
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h3>
                  <div className="flex flex-col items-center mb-6">
                    {produtoSelecionado.imagem_url ? (
                      <div className="w-full h-48 mb-4 rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
                        <img 
                          src={produtoSelecionado.imagem_url} 
                          alt={produtoSelecionado.nome}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 mb-4 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-gray-900 text-center mb-2">{produtoSelecionado.nome}</h4>
                    <p className="text-[#4FC3F7] font-bold text-2xl mb-3">R$ {produtoSelecionado.preco?.toFixed(2).replace('.', ',')}</p>
                    {produtoSelecionado.descricao && (
                      <p className="text-gray-600 text-center mb-4">{produtoSelecionado.descricao}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <div className="flex items-center border-2 rounded-lg overflow-hidden" style={{borderColor: '#4FC3F7'}}>
                        <button 
                          className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={quantidade} 
                          onChange={e => setQuantidade(Math.max(1, Number(e.target.value) || 1))}
                          className="flex-1 text-center border-0 focus:ring-0 focus:outline-none"
                        />
                        <button 
                          className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          onClick={() => setQuantidade(prev => prev + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-xl font-bold text-[#4FC3F7]">
                          R$ {(produtoSelecionado.preco * quantidade).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <button 
                        className="w-full bg-gradient-to-r from-[#4FC3F7] to-[#29B6F6] text-white p-3 rounded-lg font-bold text-lg shadow-md hover:opacity-90 transition-opacity"
                        onClick={() => {
                          alert(`Compra simulada de ${quantidade}x ${produtoSelecionado.nome} por R$ ${(produtoSelecionado.preco * quantidade).toFixed(2).replace('.', ',')}`);
                          setProdutoSelecionado(null);
                        }}
                      >
                        Confirmar Compra
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}