'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
import { useSearch } from './contexts/SearchContext';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
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

export default function Home() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery: busca, setSearchQuery: setBusca } = useSearch();
  const [tipoBusca, setTipoBusca] = useState("produto");
  const [ordenacao, setOrdenacao] = useState("nome");
  // Novos estados para carrossel e campanhas
  const [carrossel, setCarrossel] = useState<CarrosselImg[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaImg[]>([]);
  const [carrosselIndex, setCarrosselIndex] = useState(0);
  const carrosselInterval = useRef<NodeJS.Timeout | null>(null);

  // Autoplay do carrossel
  useEffect(() => {
    if (carrossel.length === 0) return;
    if (carrosselInterval.current) clearInterval(carrosselInterval.current);
    carrosselInterval.current = setInterval(() => {
      setCarrosselIndex(idx => (idx + 1) % carrossel.length);
    }, 5000);
    return () => { if (carrosselInterval.current) clearInterval(carrosselInterval.current); };
  }, [carrossel]);

  const handlePrev = () => {
    setCarrosselIndex(idx => (idx - 1 + carrossel.length) % carrossel.length);
  };
  const handleNext = () => {
    setCarrosselIndex(idx => (idx + 1) % carrossel.length);
  };

  // Carrossel de campanhas: mostrar 2 por vez
  const campanhasVisiveis = campanhas;
  const [campanhaIndex, setCampanhaIndex] = useState(0);
  const campanhaInterval = useRef<NodeJS.Timeout | null>(null);
  const campanhaSlideCount = Math.max(1, Math.ceil(campanhasVisiveis.length / 2));

  // Autoplay do carrossel de campanhas
  useEffect(() => {
    if (campanhasVisiveis.length <= 2) return;
    if (campanhaInterval.current) clearInterval(campanhaInterval.current);
    campanhaInterval.current = setInterval(() => {
      setCampanhaIndex(idx => (idx + 1) % campanhaSlideCount);
    }, 5000);
    return () => { if (campanhaInterval.current) clearInterval(campanhaInterval.current); };
  }, [campanhasVisiveis, campanhaSlideCount]);

  const handlePrevCampanha = () => {
    setCampanhaIndex(idx => (idx - 1 + campanhaSlideCount) % campanhaSlideCount);
  };
  const handleNextCampanha = () => {
    setCampanhaIndex(idx => (idx + 1) % campanhaSlideCount);
  };

  // Oferta Relâmpago: contador regressivo até a próxima hora cheia
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

  // Carrossel horizontal de campanhas (efeito slide, múltiplos visíveis)
  const [ofertaIndex, setOfertaIndex] = useState(0);
  const ofertaInterval = useRef<NodeJS.Timeout | null>(null);
  const ofertasPorSlide = 5;
  const ofertaSlideCount = Math.max(1, Math.ceil(campanhasVisiveis.length / ofertasPorSlide));
  useEffect(() => {
    if (campanhasVisiveis.length <= ofertasPorSlide) return;
    if (ofertaInterval.current) clearInterval(ofertaInterval.current);
    ofertaInterval.current = setInterval(() => {
      setOfertaIndex(idx => (idx + 1) % ofertaSlideCount);
    }, 5000);
    return () => { if (ofertaInterval.current) clearInterval(ofertaInterval.current); };
  }, [campanhasVisiveis, ofertaSlideCount]);
  const handlePrevOferta = () => {
    setOfertaIndex(idx => (idx - 1 + ofertaSlideCount) % ofertaSlideCount);
  };
  const handleNextOferta = () => {
    setOfertaIndex(idx => (idx + 1) % ofertaSlideCount);
  };
  const campanhasSlide = campanhasVisiveis.slice(ofertaIndex * ofertasPorSlide, ofertaIndex * ofertasPorSlide + ofertasPorSlide);

  useEffect(() => {
    const fetchAll = async () => {
      // Produtos
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*, empresas(nome)')
        .order('created_at', { ascending: false });
      if (produtosData) {
        const produtosComEmpresa = produtosData.map((p: any) => ({
          ...p,
          empresa_nome: p.empresas?.nome || ''
        }));
        setProdutos(produtosComEmpresa);
      }
      // Carrossel
      const { data: carrosselData } = await supabase
        .from('carrossel_home')
        .select('id, url, ordem')
        .order('ordem');
      setCarrossel(carrosselData || []);
      // Campanhas
      const { data: campanhasData } = await supabase
        .from('campanhas_home')
        .select('id, url, ordem, mostrar')
        .order('ordem');
      setCampanhas((campanhasData || []).filter((c: CampanhaImg) => c.mostrar));
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Filtro e ordenação dos produtos
  const produtosFiltrados = React.useMemo(() => {
    return produtos.filter((produto) => {
      if (!busca) return true; // Se não houver busca, retorna todos os produtos
      
      const searchLower = busca.toLowerCase();
      if (tipoBusca === "produto") {
        return produto.nome.toLowerCase().includes(searchLower) ||
               (produto.descricao || "").toLowerCase().includes(searchLower);
      } else {
        return (produto.empresa_nome || "").toLowerCase().includes(searchLower);
      }
    });
  }, [produtos, busca, tipoBusca]);
  const produtosOrdenados = React.useMemo(() => {
    return [...produtosFiltrados].sort((a, b) => {
    if (ordenacao === "nome") {
      return a.nome.localeCompare(b.nome);
    } else if (ordenacao === "preco_asc") {
      return (a.preco || 0) - (b.preco || 0);
    } else if (ordenacao === "preco_desc") {
      return (b.preco || 0) - (a.preco || 0);
    }
      return 0;
    });
  }, [produtosFiltrados, ordenacao]);

  // Campanhas para o meio e final
  const meioCount = Math.ceil(campanhas.length / 2);
  const campanhasMeio = campanhas.slice(0, meioCount);
  const campanhasFinal = campanhas.slice(meioCount);

  // Função para lidar com a busca
  const handleSearch = (query: string) => {
    setBusca(query);
  };

  // Função para navegar para a página do produto
  const handleProdutoClick = (produtoId: string) => {
    window.location.href = `/produto/${produtoId}`;
  };

  return (
    <div className="min-h-screen bg-white p-0">
      {/* BANNER PRINCIPAL */}
      <div className="w-full flex items-center justify-center px-0 py-0 md:py-0 gap-0 shadow-2xl min-h-[320px] md:min-h-[420px] relative overflow-hidden bg-white">
        {/* Código do carrossel existente   */}
        {carrossel.length > 0 ? (
          <>
            <img
              src={carrossel[carrosselIndex].url}
              alt="Carrossel"
              className="w-full h-[320px] md:h-[420px] object-cover bg-black transition-all duration-700 rounded-b-3xl shadow-xl"
              style={{ maxWidth: '100vw' }}
            />
            {/* Setas */}
            <button onClick={handlePrev} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-200 text-black rounded-full p-3 text-3xl z-10 shadow-xl transition-all duration-200">
              &#8592;
            </button>
            <button onClick={handleNext} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-200 text-black rounded-full p-3 text-3xl z-10 shadow-xl transition-all duration-200">
              &#8594;
            </button>
            {/* Indicadores */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carrossel.map((img, idx) => (
                <span
                  key={img.id}
                  className={`w-5 h-2.5 rounded-full transition-all duration-300 ${carrosselIndex === idx ? 'bg-[#039BE5] scale-110' : 'bg-[#B3E5FC]'}`}
                  style={{ display: 'inline-block' }}
                />
              ))}
            </div>
          </>
        ) : (
          <span className="text-white text-lg">Nenhuma imagem no carrossel ainda.</span>
        )}
      </div>

      {/* PRIMEIRA SEÇÃO DE OFERTAS */}
      {campanhasVisiveis.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 py-6 border-y border-amber-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                  <span className="animate-pulse">⚡</span>
                  <span className="ml-2">OFERTA RELÂMPAGO</span>
                </div>
                <div className="flex items-center bg-white px-4 py-1.5 rounded-full border border-amber-200 shadow-sm">
                  <span className="text-amber-700 font-bold text-sm">
                    ACABA EM: {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <button 
                className="text-amber-700 hover:text-amber-800 text-sm font-semibold flex items-center bg-white px-4 py-1.5 rounded-full border border-amber-200 hover:bg-amber-50 transition-colors shadow-sm"
                onClick={() => {
                  const ofertasMeio = document.getElementById('ofertas-meio');
                  if (ofertasMeio) {
                    window.scrollTo({ 
                      top: ofertasMeio.offsetTop - 100, 
                      behavior: 'smooth' 
                    });
                  }
                }}
              >
                Ver mais ofertas
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {campanhasVisiveis.slice(0, 6).map((img, index) => (
                <div 
                  key={img.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-amber-100 group"
                >
                  <div className="relative pt-[100%] bg-white">
                    <img 
                      src={img.url} 
                      alt="Oferta Especial" 
                      className="absolute top-0 left-0 w-full h-full object-contain p-3"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      -{20 + index * 5}%
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
                      Oferta Exclusiva {index + 1}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-extrabold text-amber-600">R$ {99 - index * 10},90</span>
                        <span className="text-xs text-gray-400 line-through ml-1">R$ {149 - index * 10},90</span>
                      </div>
                      <button className="text-amber-600 hover:text-white hover:bg-amber-600 text-xs font-semibold py-1 px-2 rounded-full border border-amber-200 hover:border-amber-600 transition-colors">
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUTOS EM DESTAQUE */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Produtos em Destaque</h1>
          <select
            className="p-3 border-2 rounded-lg text-black bg-white font-semibold shadow focus:ring-2 transition-all duration-200"
            value={ordenacao}
            onChange={e => setOrdenacao(e.target.value)}
            style={{ minWidth: 220, borderColor:'#4FC3F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <option value="nome">Nome (A-Z)</option>
            <option value="preco_asc">Preço (menor para maior)</option>
            <option value="preco_desc">Preço (maior para menor)</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 text-xl">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
            {produtosOrdenados.length === 0 && (
              <p className="text-gray-400 col-span-3 text-center">Nenhum produto cadastrado ainda.</p>
            )}
            {produtosOrdenados.slice(0, 6).map((produto) => (
              <div
                key={produto.id}
                className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                onClick={() => handleProdutoClick(produto.id)}
              >
                {produto.imagem_url && (
                  <img 
                    src={produto.imagem_url} 
                    alt={produto.nome} 
                    className="w-24 h-24 object-contain mb-3 rounded-lg transition-all duration-200 bg-gray-50 p-2"
                  />
                )}
                <h4 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-500 transition-all duration-200 text-center">
                  {produto.nome}
                </h4>
                <p className="font-bold mb-1 text-[#039BE5] text-lg">R$ {produto.preco?.toFixed(2).replace('.', ',')}</p>
                {produto.descricao && (
                  <p className="text-gray-600 text-xs mb-2 text-center line-clamp-2">
                    {produto.descricao}
                  </p>
                )}
                <span className="text-xs text-gray-400 font-medium mt-auto">
                  {produto.empresa_nome}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEGUNDA SEÇÃO DE OFERTAS */}
      {campanhasVisiveis.length > 0 && (
        <div id="ofertas-meio" className="bg-gradient-to-r from-blue-50 to-cyan-50 py-12 border-y border-blue-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Ofertas Imperdíveis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Aproveite nossas ofertas especiais por tempo limitado</p>
              
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center shadow-md">
                  <span className="animate-pulse">🔥</span>
                  <span className="ml-2">OFERTA ESPECIAL</span>
                </div>
                <div className="flex items-center bg-white px-4 py-1.5 rounded-full border border-blue-200 shadow-sm">
                  <span className="text-blue-700 font-bold text-sm">
                    TERMINA EM: {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...campanhasVisiveis].slice(0, 5).map((img, index) => (
                <div 
                  key={`oferta-${index}`} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-blue-50 group"
                >
                  <div className="relative pt-[100%] bg-white">
                    <img 
                      src={img.url} 
                      alt="Oferta Especial" 
                      className="absolute top-0 left-0 w-full h-full object-contain p-4"
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      -{15 + index * 5}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      Oferta Exclusiva {index + 1}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-extrabold text-blue-600">R$ {89 - index * 10},90</span>
                        <span className="text-xs text-gray-400 line-through ml-1">R$ {139 - index * 10},90</span>
                      </div>
                      <button className="text-blue-600 hover:text-white hover:bg-blue-600 text-xs font-semibold py-1 px-2 rounded-full border border-blue-200 hover:border-blue-600 transition-colors">
                        Ver oferta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Voltar para o topo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEGUNDA PARTE DOS PRODUTOS */}
      {!loading && produtosOrdenados.length > 6 && (
        <div className="max-w-6xl mx-auto py-12 px-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
            {produtosOrdenados.slice(6).map((produto) => (
              <div
                key={produto.id}
                className="bg-white border border-gray-100 rounded-xl shadow p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                onClick={() => handleProdutoClick(produto.id)}
              >
                {produto.imagem_url && (
                  <img 
                    src={produto.imagem_url} 
                    alt={produto.nome} 
                    className="w-24 h-24 object-contain mb-3 rounded-lg transition-all duration-200 bg-gray-50 p-2"
                  />
                )}
                <h4 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-blue-500 transition-all duration-200 text-center">
                  {produto.nome}
                </h4>
                <p className="font-bold mb-1 text-[#039BE5] text-lg">R$ {produto.preco?.toFixed(2).replace('.', ',')}</p>
                {produto.descricao && (
                  <p className="text-gray-600 text-xs mb-2 text-center line-clamp-2">
                    {produto.descricao}
                  </p>
                )}
                <span className="text-xs text-gray-400 font-medium mt-auto">
                  {produto.empresa_nome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
