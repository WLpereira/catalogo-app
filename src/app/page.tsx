'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useSearch } from './contexts/SearchContext';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string;
  empresa_id: string;
  empresa_nome?: string;
}

interface CarrosselImg {
  id: string;
  url: string;
  ordem: number;
}

interface CampanhaImg {
  id: string;
  url: string;
  ordem: number;
  mostrar: boolean;
}

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { searchQuery: busca, setSearchQuery: setBusca } = useSearch();
  const [tipoBusca, setTipoBusca] = useState<"produto" | "empresa">("produto");
  const [ordenacao, setOrdenacao] = useState<"nome" | "preco_asc" | "preco_desc">("nome");
  const [carrossel, setCarrossel] = useState<CarrosselImg[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaImg[]>([]);
  const [carrosselIndex, setCarrosselIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const carrosselInterval = useRef<NodeJS.Timeout | null>(null);

  // Funções de navegação do carrossel principal
  const handlePrev = useCallback(() => {
    setCarrosselIndex(prev => (prev - 1 + carrossel.length) % carrossel.length);
  }, [carrossel.length]);

  const handleNext = useCallback(() => {
    setCarrosselIndex(prev => (prev + 1) % carrossel.length);
  }, [carrossel.length]);

  // Autoplay do carrossel principal
  useEffect(() => {
    if (carrossel.length <= 1) return;
    
    if (carrosselInterval.current) clearInterval(carrosselInterval.current);
    
    carrosselInterval.current = setInterval(() => {
      setCarrosselIndex(prev => (prev + 1) % carrossel.length);
    }, 5000);
    
    return () => {
      if (carrosselInterval.current) {
        clearInterval(carrosselInterval.current);
      }
    };
  }, [carrossel]);

  // Tipagem para os dados retornados do Supabase
  type ProdutoWithEmpresa = Omit<Produto, 'empresa_nome'> & {
    empresas: { nome: string } | null;
  };

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          { data: produtosData, error: produtosError },
          { data: carrosselData, error: carrosselError },
          { data: campanhasData, error: campanhasError }
        ] = await Promise.all([
          supabase
            .from('produtos')
            .select('*, empresas(nome)')
            .order('created_at', { ascending: false }),
          supabase
            .from('carrossel_home')
            .select('id, url, ordem')
            .order('ordem'),
          supabase
            .from('campanhas_home')
            .select('id, url, ordem, mostrar')
            .order('ordem')
        ]);

        // Verificação de erros
        const errors = [
          { error: produtosError, message: 'Erro ao carregar produtos' },
          { error: carrosselError, message: 'Erro ao carregar carrossel' },
          { error: campanhasError, message: 'Erro ao carregar campanhas' }
        ];

        for (const { error, message } of errors) {
          if (error) {
            console.error(`${message}:`, error);
            throw new Error(message);
          }
        }

        // Processamento dos dados
        const produtosFormatados = (produtosData as ProdutoWithEmpresa[] || []).map(produto => ({
          id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          imagem_url: produto.imagem_url,
          empresa_id: produto.empresa_id,
          empresa_nome: produto.empresas?.nome || ''
        }));
        
        setProdutos(produtosFormatados);
        setCarrossel((carrosselData as CarrosselImg[]) || []);
        setCampanhas(((campanhasData as CampanhaImg[]) || []).filter(c => c.mostrar));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    // Carregar dados
    fetchData();

    // Limpar intervalos ao desmontar
    return () => {
      if (carrosselInterval.current) clearInterval(carrosselInterval.current);
      if (ofertaInterval.current) clearInterval(ofertaInterval.current);
    };
  }, []);

  // Lógica do carrossel de ofertas
  const [ofertaIndex, setOfertaIndex] = useState(0);
  const ofertaInterval = useRef<NodeJS.Timeout | null>(null);
  const ofertasPorSlide = 5;
  const ofertaSlideCount = Math.max(1, Math.ceil(campanhas.length / ofertasPorSlide));
  
  const handlePrevOferta = useCallback(() => {
    setOfertaIndex(prev => (prev - 1 + ofertaSlideCount) % ofertaSlideCount);
  }, [ofertaSlideCount]);

  const handleNextOferta = useCallback(() => {
    setOfertaIndex(prev => (prev + 1) % ofertaSlideCount);
  }, [ofertaSlideCount]);

  // Autoplay do carrossel de ofertas
  useEffect(() => {
    if (campanhas.length <= ofertasPorSlide) return;
    
    if (ofertaInterval.current) clearInterval(ofertaInterval.current);
    
    ofertaInterval.current = setInterval(() => {
      setOfertaIndex(prev => (prev + 1) % ofertaSlideCount);
    }, 5000);
    
    return () => {
      if (ofertaInterval.current) {
        clearInterval(ofertaInterval.current);
      }
    };
  }, [campanhas, ofertasPorSlide, ofertaSlideCount]);

  const campanhasSlide = useMemo(
    () => campanhas.slice(
      ofertaIndex * ofertasPorSlide, 
      ofertaIndex * ofertasPorSlide + ofertasPorSlide
    ),
    [campanhas, ofertaIndex, ofertasPorSlide]
  );

  // Contador regressivo para ofertas relâmpago
  const [countdown, setCountdown] = useState({h: 0, m: 0, s: 0});
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      const diff = Math.max(0, Math.floor((nextHour.getTime() - now.getTime()) / 1000));
      setCountdown({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtro e ordenação dos produtos
  const produtosFiltrados = useMemo(() => {
    if (!busca) return produtos;
    
    const searchLower = busca.toLowerCase();
    return produtos.filter(produto => 
      tipoBusca === "produto"
        ? produto.nome.toLowerCase().includes(searchLower) ||
          (produto.descricao || "").toLowerCase().includes(searchLower)
        : (produto.empresa_nome || "").toLowerCase().includes(searchLower)
    );
  }, [produtos, busca, tipoBusca]);
  
  // Definir campanhas visíveis (filtradas por mostrar: true)
  const campanhasVisiveis = useMemo(() => 
    campanhas.filter(c => c.mostrar),
    [campanhas]
  );

  const produtosOrdenados = useMemo(() => {
    return [...produtosFiltrados].sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome);
      if (ordenacao === "preco_asc") return (a.preco || 0) - (b.preco || 0);
      if (ordenacao === "preco_desc") return (b.preco || 0) - (a.preco || 0);
      return 0;
    });
  }, [produtosFiltrados, ordenacao]);

  // Paginação
  const totalPages = Math.ceil(produtosOrdenados.length / ITEMS_PER_PAGE);
  const paginatedProdutos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return produtosOrdenados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [produtosOrdenados, currentPage]);

  // Manipuladores de eventos
  const handleSearch = useCallback((query: string) => {
    setBusca(query);
    setCurrentPage(1); // Reset para a primeira página ao buscar
  }, [setBusca]);

  const handleProdutoClick = useCallback((produtoId: string) => {
    // Busca o produto para pegar empresa_id
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      // Busca empresa para pegar as cores
      supabase.from('empresas').select('cor_primaria, cor_secundaria').eq('id', produto.empresa_id).single().then(({ data }) => {
        const corPrimaria = data?.cor_primaria || '#29B6F6';
        const corSecundaria = data?.cor_secundaria || '#4FC3F7';
        router.push(`/produto/${produtoId}?corPrimaria=${encodeURIComponent(corPrimaria)}&corSecundaria=${encodeURIComponent(corSecundaria)}`);
      });
    } else {
      router.push(`/produto/${produtoId}`);
    }
  }, [router, produtos]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Divisão das campanhas para exibição
  const meioCount = Math.ceil(campanhas.length / 2);
  const campanhasMeio = useMemo(() => campanhas.slice(0, meioCount), [campanhas, meioCount]);
  const campanhasFinal = useMemo(() => campanhas.slice(meioCount), [campanhas, meioCount]);

  return (
    <div className="min-h-screen bg-white p-0">
      {/* BANNER PRINCIPAL */}
      <section aria-label="Carrossel de destaques" className="w-full flex items-center justify-center px-0 py-0 md:py-0 gap-0 shadow-2xl min-h-[320px] md:min-h-[420px] relative overflow-hidden bg-white">
        {carrossel.length > 0 ? (
          <>
            <div className="relative w-full h-[320px] md:h-[420px]">
              <img
                src={carrossel[carrosselIndex].url}
                alt=""
                className="w-full h-full object-cover bg-black transition-all duration-700 rounded-b-3xl shadow-xl"
                style={{ maxWidth: '100vw' }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <h2 className="sr-only">Ofertas em destaque</h2>
              </div>
            </div>
            
            {/* Navegação do carrossel */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button 
                onClick={handlePrev}
                onKeyDown={(e) => e.key === 'Enter' && handlePrev()}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 text-3xl z-10 shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Slide anterior"
                aria-controls="carrossel-indicadores"
              >
                <span aria-hidden="true">&#8592;</span>
              </button>
              
              <button 
                onClick={handleNext}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 text-3xl z-10 shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Próximo slide"
                aria-controls="carrossel-indicadores"
              >
                <span aria-hidden="true">&#8594;</span>
              </button>
            </div>
            
            {/* Indicadores */}
            <div 
              id="carrossel-indicadores" 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10"
              role="tablist"
              aria-label="Navegação do carrossel"
            >
              {carrossel.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  role="tab"
                  aria-label={`Ir para o slide ${idx + 1}`}
                  aria-selected={carrosselIndex === idx}
                  onClick={() => setCarrosselIndex(idx)}
                  onKeyDown={(e) => e.key === 'Enter' && setCarrosselIndex(idx)}
                  className={`w-5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 ${carrosselIndex === idx ? 'bg-[#039BE5] scale-110' : 'bg-[#B3E5FC] hover:bg-[#81D4FA]'}`}
                  style={{ display: 'inline-block' }}
                  tabIndex={0}
                />
              ))}
            </div>
          </>
        ) : (
          <span className="text-white text-lg">Nenhuma imagem no carrossel ainda.</span>
        )}
      </section>

      {/* PRIMEIRA SEÇÃO DE OFERTAS */}
      {campanhasVisiveis.length > 0 && (
        <section aria-labelledby="ofertas-relampago-heading" className="bg-gradient-to-r from-yellow-50 to-amber-50 py-6 border-y border-amber-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                  <span aria-hidden="true" className="animate-pulse">⚡</span>
                  <h2 id="ofertas-relampago-heading" className="ml-2">OFERTA RELÂMPAGO</h2>
                </div>
                <div className="flex items-center bg-white px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
                  <span className="text-amber-700 font-bold text-sm">
                    <span className="sr-only">Oferta termina em: </span>
                    <span aria-live="polite">
                      {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}
                    </span>
                  </span>
                </div>
              </div>
              <button 
                className="text-amber-700 hover:text-amber-800 text-sm font-semibold flex items-center bg-white px-4 py-1.5 rounded-full border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-50"
                onClick={() => {
                  const ofertasMeio = document.getElementById('ofertas-meio');
                  if (ofertasMeio) {
                    ofertasMeio.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                aria-label="Ver mais ofertas"
              >
                Ver mais ofertas
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {campanhasVisiveis.slice(0, 6).map((img: CampanhaImg, index: number) => (
                <article 
                  key={img.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-amber-100 group focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 focus-within:ring-offset-amber-50"
                  tabIndex={0}
                >
                  <div className="relative pt-[100%] bg-white">
                    <img 
                      src={img.url} 
                      alt="" 
                      className="absolute top-0 left-0 w-full h-full object-contain p-3"
                      aria-hidden="true"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      -{20 + index * 5}%
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-amber-600 group-focus:text-amber-600 transition-colors">
                      Oferta Exclusiva {index + 1}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-extrabold text-amber-600">R$ {99 - index * 10},90</span>
                        <span className="sr-only">De: </span>
                        <span className="text-xs text-gray-400 line-through ml-1">R$ {149 - index * 10},90</span>
                      </div>
                      <button 
                        className="text-amber-600 hover:text-white hover:bg-amber-600 text-xs font-semibold py-1 px-2 rounded-full border border-amber-200 hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Lógica de compra aqui
                        }}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUTOS EM DESTAQUE */}
      <section aria-labelledby="produtos-destaque-heading" className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 id="produtos-destaque-heading" className="text-3xl font-extrabold text-black tracking-tight">Produtos em Destaque</h1>
          <div className="flex flex-col">
            <label htmlFor="ordenacao" className="text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
            <select
              id="ordenacao"
              className="p-2 border-2 rounded-lg text-black bg-white font-semibold shadow focus:ring-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={ordenacao}
              onChange={e => setOrdenacao(e.target.value as "nome" | "preco_asc" | "preco_desc")}
              style={{ minWidth: 220, borderColor:'#4FC3F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}
              aria-label="Ordenar produtos por"
            >
              <option value="nome">Nome (A-Z)</option>
              <option value="preco_asc">Preço (menor para maior)</option>
              <option value="preco_desc">Preço (maior para menor)</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 text-xl">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
            {produtosOrdenados.length === 0 ? (
              <p className="text-gray-400 col-span-3 text-center">Nenhum produto cadastrado ainda.</p>
            ) : (
              produtosOrdenados.slice(0, 6).map((produto: Produto) => (
                <article
                  key={produto.id}
                  className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  onClick={() => handleProdutoClick(produto.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProdutoClick(produto.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Ver detalhes do produto ${produto.nome}`}
                >
                  <div className="relative w-24 h-24 mb-3">
                    {produto.imagem_url ? (
                      <img 
                        src={produto.imagem_url} 
                        alt="" 
                        className="w-full h-full object-contain rounded-lg bg-gray-50 p-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-500 group-focus:text-blue-600 transition-all duration-200 text-center">
                    {produto.nome}
                  </h2>
                  <p className="font-bold mb-1 text-[#039BE5] text-lg">
                    <span className="sr-only">Preço: </span>
                    R$ {produto.preco?.toFixed(2).replace('.', ',')}
                  </p>
                  {produto.descricao && (
                    <p className="text-gray-600 text-xs mb-2 text-center line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                  {produto.empresa_nome && (
                    <span className="text-xs text-gray-400 font-medium mt-auto">
                      <span className="sr-only">Vendido por </span>
                      {produto.empresa_nome}
                    </span>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* MAIS PRODUTOS (se houver mais de 6) */}
        {produtosOrdenados.length > 6 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-black mb-8 text-center">Mais Produtos</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
              {produtosOrdenados.slice(6).map((produto: Produto) => (
                <article
                  key={produto.id}
                  className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  onClick={() => handleProdutoClick(produto.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProdutoClick(produto.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Ver detalhes do produto ${produto.nome}`}
                >
                  <div className="relative w-24 h-24 mb-3">
                    {produto.imagem_url ? (
                      <img 
                        src={produto.imagem_url} 
                        alt="" 
                        className="w-full h-full object-contain rounded-lg bg-gray-50 p-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-500 group-focus:text-blue-600 transition-all duration-200 text-center">
                    {produto.nome}
                  </h3>
                  <p className="font-bold mb-1 text-[#039BE5] text-lg">
                    <span className="sr-only">Preço: </span>
                    R$ {produto.preco?.toFixed(2).replace('.', ',')}
                  </p>
                  {produto.descricao && (
                    <p className="text-gray-600 text-xs mb-2 text-center line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                  {produto.empresa_nome && (
                    <span className="text-xs text-gray-400 font-medium mt-auto">
                      <span className="sr-only">Vendido por </span>
                      {produto.empresa_nome}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SEGUNDA SEÇÃO DE OFERTAS */}
      {campanhasVisiveis.length > 0 && (
        <section aria-labelledby="ofertas-imperdiveis-heading" id="ofertas-meio" className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 border-y border-blue-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 id="ofertas-imperdiveis-heading" className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Ofertas Imperdíveis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Aproveite nossas ofertas especiais por tempo limitado</p>
              
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                  <span aria-hidden="true" className="animate-pulse">🔥</span>
                  <span className="ml-2">OFERTA ESPECIAL</span>
                </div>
                <div className="flex items-center bg-white px-4 py-1.5 rounded-full border border-blue-200 shadow-sm">
                  <span className="text-blue-700 font-bold text-sm">
                    <span className="sr-only">Oferta termina em: </span>
                    <span aria-live="polite">
                      {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...campanhasVisiveis].slice(0, 5).map((img: CampanhaImg, index: number) => (
                <article 
                  key={`oferta-${index}`} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-blue-50 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-blue-50"
                  tabIndex={0}
                >
                  <div className="relative pt-[100%] bg-white">
                    <img 
                      src={img.url} 
                      alt="" 
                      className="absolute top-0 left-0 w-full h-full object-contain p-4"
                      aria-hidden="true"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      -{15 + index * 5}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 group-focus:text-blue-600 transition-colors">
                      Oferta Exclusiva {index + 1}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-extrabold text-blue-600">R$ {89 - index * 10},90</span>
                        <span className="sr-only">De: </span>
                        <span className="text-xs text-gray-400 line-through ml-1">R$ {139 - index * 10},90</span>
                      </div>
                      <button 
                        className="text-blue-600 hover:text-white hover:bg-blue-600 text-xs font-semibold py-1 px-2 rounded-full border border-blue-200 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Lógica de ver oferta aqui
                        }}
                        aria-label={`Ver detalhes da Oferta Exclusiva ${index + 1}`}
                      >
                        Ver oferta
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Voltar para o topo da página"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Voltar para o topo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SEGUNDA PARTE DOS PRODUTOS */}
      {!loading && produtosOrdenados.length > 6 && (
        <section aria-labelledby="mais-produtos-heading" className="max-w-6xl mx-auto py-12 px-4">
          <h2 id="mais-produtos-heading" className="text-2xl font-bold text-gray-800 mb-8 text-center">Mais Produtos em Destaque</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
            {produtosOrdenados.slice(6).map((produto: Produto) => (
              <article
                key={produto.id}
                className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => handleProdutoClick(produto.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProdutoClick(produto.id);
                  }
                }}
                tabIndex={0}
                aria-label={`Ver detalhes do produto ${produto.nome}`}
              >
                <div className="relative w-24 h-24 mb-3">
                  {produto.imagem_url ? (
                    <img 
                      src={produto.imagem_url} 
                      alt="" 
                      className="w-full h-full object-contain rounded-lg bg-gray-50 p-2"
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sem imagem</span>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-500 group-focus:text-blue-600 transition-all duration-200 text-center">
                  {produto.nome}
                </h3>
                <p className="font-bold mb-1 text-[#039BE5] text-lg">
                  <span className="sr-only">Preço: </span>
                  R$ {produto.preco?.toFixed(2).replace('.', ',')}
                </p>
                {produto.descricao && (
                  <p className="text-gray-600 text-xs mb-2 text-center line-clamp-2">
                    {produto.descricao}
                  </p>
                )}
                {produto.empresa_nome && (
                  <span className="text-xs text-gray-400 font-medium mt-auto">
                    <span className="sr-only">Vendido por </span>
                    {produto.empresa_nome}
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
