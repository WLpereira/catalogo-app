"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresa = async () => {
      const { data, error } = await supabase.from("empresas").select("*").eq("id", empresaId).single();
      if (!error && data) setEmpresa(data);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-green-700 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {empresa && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-200 flex flex-col md:flex-row gap-6 items-center">
            {empresa.logo_url && (
              <img src={empresa.logo_url} alt="Logo da empresa" className="w-32 h-32 object-contain rounded-xl border-2 border-green-700 bg-gray-100" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-blue-800 mb-2">{empresa.nome}</h1>
              <p className="text-base text-gray-700 mb-1"><b>CNPJ:</b> {empresa.cnpj}</p>
              <p className="text-base text-gray-700 mb-1"><b>E-mail:</b> {empresa.email}</p>
              <p className="text-base text-gray-700 mb-1"><b>Telefone:</b> {empresa.telefone}</p>
              <p className="text-base text-gray-700 mb-1"><b>WhatsApp:</b> {empresa.whatsapp}</p>
              <p className="text-base text-gray-700 mb-1"><b>Endereço:</b> {empresa.endereco}</p>
            </div>
          </div>
        )}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold text-green-700">Produtos da Empresa</h2>
          <input
            type="text"
            className="p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 text-black placeholder-gray-400 w-full md:w-80"
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-center text-blue-200 text-xl">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {produtosFiltrados.length === 0 && <p className="text-gray-200 col-span-2">Nenhum produto encontrado.</p>}
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white border border-green-200 rounded-xl shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition" onClick={() => { setProdutoSelecionado(produto); setQuantidade(1); }}>
                {produto.imagem_url && (
                  <img src={produto.imagem_url} alt={produto.nome} className="w-24 h-24 object-contain mb-2 rounded" />
                )}
                <h4 className="text-lg font-bold text-blue-900 mb-1">{produto.nome}</h4>
                <p className="text-green-700 font-bold mb-1">R$ {produto.preco?.toFixed(2)}</p>
                <p className="text-gray-700 text-sm mb-1 text-center">{produto.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal de compra */}
      {produtoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-green-200 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setProdutoSelecionado(null)}>&times;</button>
            <h3 className="text-xl font-bold text-green-700 mb-4">Finalizar Compra</h3>
            <div className="flex flex-col items-center mb-4">
              {produtoSelecionado.imagem_url && (
                <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="w-24 h-24 object-contain mb-2 rounded" />
              )}
              <h4 className="text-lg font-bold text-blue-900 mb-1">{produtoSelecionado.nome}</h4>
              <p className="text-green-700 font-bold mb-1">R$ {produtoSelecionado.preco?.toFixed(2)}</p>
              <p className="text-gray-700 text-sm mb-1 text-center">{produtoSelecionado.descricao}</p>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="block text-base font-semibold text-blue-900 mb-1">Quantidade</label>
              <input type="number" min={1} value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 text-black placeholder-gray-400" />
            </div>
            <button className="w-full bg-gradient-to-r from-green-700 to-green-500 text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-600 transition-all duration-200 mt-2" onClick={() => alert('Compra simulada!')}>
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 