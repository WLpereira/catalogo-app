'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

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
  const [busca, setBusca] = useState("");
  const [tipoBusca, setTipoBusca] = useState("produto");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
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

  // Filtro e ordenação dos produtos (igual antes)
  const produtosFiltrados = produtos.filter((produto) => {
    if (tipoBusca === "produto") {
      return produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
             (produto.descricao || "").toLowerCase().includes(busca.toLowerCase());
    } else {
      return (produto.empresa_nome || "").toLowerCase().includes(busca.toLowerCase());
    }
  });
  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (ordenacao === "nome") {
      return a.nome.localeCompare(b.nome);
    } else if (ordenacao === "preco_asc") {
      return (a.preco || 0) - (b.preco || 0);
    } else if (ordenacao === "preco_desc") {
      return (b.preco || 0) - (a.preco || 0);
    }
    return 0;
  });

  // Campanhas para o meio e final
  const meioCount = Math.ceil(campanhas.length / 2);
  const campanhasMeio = campanhas.slice(0, meioCount);
  const campanhasFinal = campanhas.slice(meioCount);

  return (
    <div className="min-h-screen bg-white p-0">
      {/* HEADER */}
      <header className="w-full bg-white text-black flex items-center justify-between px-8 py-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Logo ClickGo */}
          <span className="flex items-center font-extrabold text-2xl rounded overflow-hidden">
            <span className="pl-2 pr-0 py-1 text-black">Click</span><span className="pl-0 pr-2 py-1" style={{background:'#4FC3F7', color:'white', borderRadius:'0 8px 8px 0'}}>Go</span>
          </span>
        </div>
        <form className="flex-1 flex justify-center max-w-2xl mx-6">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full p-3 pl-12 rounded-lg bg-gray-100 text-black border-2"
              style={{ borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              placeholder="O que você procura?"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl pointer-events-none" style={{color:'#4FC3F7'}}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
          </div>
          <button type="submit" className="ml-2" style={{background:'#4FC3F7', color:'white', borderRadius:'8px', fontWeight:'bold', fontSize:'1.125rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'0.75rem 1.5rem', transition:'all 0.2s'}}>
            Buscar
          </button>
        </form>
        <button
          onClick={() => router.push('/empresa/login')}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-400 transition-all duration-200"
        >
          Área da Empresa
        </button>
      </header>
      {/* CARROSSEL NO BANNER */}
      <div className="w-full flex items-center justify-center px-0 py-0 md:py-0 gap-0 shadow-lg min-h-[260px] relative overflow-hidden bg-black">
        {carrossel.length > 0 ? (
          <>
            <img
              src={carrossel[carrosselIndex].url}
              alt="Carrossel"
              className="w-full h-[260px] md:h-[340px] object-cover bg-black transition-all duration-700"
              style={{ maxWidth: '100vw' }}
            />
            {/* Setas */}
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-400 text-black hover:text-white rounded-full p-2 text-2xl z-10 shadow-lg transition-all duration-200">
              &#8592;
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-400 text-black hover:text-white rounded-full p-2 text-2xl z-10 shadow-lg transition-all duration-200">
              &#8594;
            </button>
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carrossel.map((img, idx) => (
                <span
                  key={img.id}
                  className={`w-4 h-2 rounded-full ${carrosselIndex === idx ? '' : ''} transition-all duration-300`}
                  style={{ display: 'inline-block', background: carrosselIndex === idx ? '#4FC3F7' : '#B3E5FC' }}
                />
              ))}
            </div>
          </>
        ) : (
          <span className="text-white text-lg">Nenhuma imagem no carrossel ainda.</span>
        )}
      </div>
      {/* OFERTAS RELÂMPAGO */}
      {campanhasVisiveis.length > 0 && (
        <section className="w-full bg-white py-10 shadow-lg border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4 justify-center">
                <span style={{color:'#039BE5'}} className="font-extrabold text-2xl tracking-widest animate-pulse text-center">OFERTAS RELÂMPAGO</span>
                <span className="bg-black text-white px-3 py-2 rounded font-mono text-xl flex items-center gap-1">
                  {String(countdown.h).padStart(2, '0')} : {String(countdown.m).padStart(2, '0')} : {String(countdown.s).padStart(2, '0')}
                </span>
              </div>
              <button style={{color:'#039BE5'}} className="font-bold hover:underline text-base text-center">Ver Tudo</button>
            </div>
            <div className="relative flex items-center justify-center w-full">
              <button onClick={handlePrevOferta} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block" style={{background:'#4FC3F7', color:'white', borderRadius:'9999px', padding:'0.75rem', fontSize:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'all 0.2s'}}>
                &#8592;
              </button>
              <div className="flex gap-2 sm:gap-4 px-0 sm:px-4 w-full justify-center items-center" style={{height:'340px', overflowY:'visible', overflowX:'hidden'}}>
                {campanhasSlide.map(img => (
                  <div key={img.id} className="bg-white border-2 rounded-2xl shadow-md flex flex-col items-center justify-between p-2 w-[180px] sm:w-[220px] h-[200px] sm:h-[240px] min-w-[150px] max-w-[220px] hover:scale-105 transition-all duration-300 relative group overflow-hidden" style={{borderColor:'#29B6F6', marginTop:'50px', marginBottom:'50px'}}>
                    <img src={img.url} alt="Oferta" className="object-contain h-16 sm:h-24 w-full mb-2 rounded" />
                    {/* Modal flutuante ao passar o mouse */}
                    <div className="hidden group-hover:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-98 rounded-2xl shadow-2xl flex-col items-center justify-center p-6 z-20 transition-all duration-200 overflow-hidden" style={{width:'320px', height:'320px', minWidth:'220px', maxWidth:'95vw', minHeight:'220px'}}>
                      <img src={img.url} alt="Oferta" className="object-contain h-24 w-full mb-2 rounded" />
                      <span className="text-lg font-bold" style={{color:'#039BE5'}}>Oferta Especial!</span>
                      <span className="text-sm text-blue-500 mt-2 text-center">Clique aqui</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleNextOferta} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block" style={{background:'#4FC3F7', color:'white', borderRadius:'9999px', padding:'0.75rem', fontSize:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'all 0.2s'}}>
                &#8594;
              </button>
              {/* Botões para mobile */}
              <button onClick={handlePrevOferta} className="md:hidden absolute left-2 bottom-2 z-10" style={{background:'#4FC3F7', color:'white', borderRadius:'9999px', padding:'0.5rem', fontSize:'1.25rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'all 0.2s'}}>
                &#8592;
              </button>
              <button onClick={handleNextOferta} className="md:hidden absolute right-2 bottom-2 z-10" style={{background:'#4FC3F7', color:'white', borderRadius:'9999px', padding:'0.5rem', fontSize:'1.25rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'all 0.2s'}}>
                &#8594;
              </button>
              {/* Indicadores */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {Array.from({ length: ofertaSlideCount }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-4 h-2 rounded-full transition-all duration-300`}
                    style={{ display: 'inline-block', background: ofertaIndex === idx ? '#4FC3F7' : '#B3E5FC' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* PRODUTOS */}
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 md:gap-0 px-4">
          <h1 className="text-3xl font-extrabold text-black tracking-tight flex items-center gap-4">
            Produtos em Destaque
          </h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {produtosOrdenados.length === 0 && <p className="text-gray-400 col-span-3">Nenhum produto cadastrado ainda.</p>}
            {produtosOrdenados.map((produto) => (
              <div
                key={produto.id}
                className="bg-white border-2 rounded-2xl shadow-lg p-6 flex flex-col items-center cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
                onClick={() => { setProdutoSelecionado(produto); setQuantidade(1); }}
                style={{borderColor:'#29B6F6'}}
              >
                {produto.imagem_url && (
                  <img src={produto.imagem_url} alt={produto.nome} className="w-32 h-32 object-contain mb-2 rounded group-hover:drop-shadow-lg transition-all duration-200" />
                )}
                <h4 className="text-lg font-bold text-black mb-1 group-hover:text-blue-400 transition-all duration-200">{produto.nome}</h4>
                <p className="font-bold mb-1" style={{color:'#039BE5'}}>R$ {produto.preco?.toFixed(2)}</p>
                <p className="text-gray-700 text-sm mb-1 text-center">{produto.descricao}</p>
                <span className="text-xs text-gray-500 font-semibold">Empresa: {produto.empresa_nome}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal de compra na home */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold transition-all duration-200" onClick={() => setProdutoSelecionado(null)}>&times;</button>
            <h3 className="text-xl font-bold mb-4" style={{color:'#039BE5'}}>Finalizar Compra</h3>
            <div className="flex flex-col items-center mb-4">
              {produtoSelecionado.imagem_url && (
                <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="w-24 h-24 object-contain mb-2 rounded" />
              )}
              <h4 className="text-lg font-bold text-black mb-1">{produtoSelecionado.nome}</h4>
              <p className="font-bold mb-1" style={{color:'#039BE5'}}>R$ {produtoSelecionado.preco?.toFixed(2)}</p>
              <p className="text-gray-700 text-sm mb-1 text-center">{produtoSelecionado.descricao}</p>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="block text-base font-semibold text-black mb-1">Quantidade</label>
              <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-full p-3 border rounded-lg focus:ring-2 text-black placeholder-gray-400" style={{borderColor:'#4FC3F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}} />
            </div>
            <button className="w-full text-white p-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 mt-2" style={{background:'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)'}} onClick={() => alert('Compra simulada!')}>
              Finalizar Compra
            </button>
            <button className="w-full mt-2 bg-black text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-400 transition-all duration-200" onClick={() => { router.push(`/empresa/${produtoSelecionado.empresa_id}`); setProdutoSelecionado(null); }}>
              Ver página da empresa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
