'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  empresa_id: string;
  empresa_nome?: string;
}

export default function ProdutoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const [produtosRelacionados, setProdutosRelacionados] = useState<Produto[]>([]);

  useEffect(() => {
    const carregarProduto = async () => {
      try {
        setLoading(true);
        // Carrega os dados do produto
        const { data: produtoData, error } = await supabase
          .from('produtos')
          .select('*, empresas(nome)')
          .eq('id', id)
          .single();

        if (error) throw error;

        const produtoCompleto = {
          ...produtoData,
          empresa_nome: produtoData.empresas?.nome
        };

        setProduto(produtoCompleto);

        // Carrega produtos relacionados (mesma empresa)
        const { data: relacionados } = await supabase
          .from('produtos')
          .select('*')
          .eq('empresa_id', produtoData.empresa_id)
          .neq('id', id)
          .limit(4);

        setProdutosRelacionados(relacionados || []);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      carregarProduto();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Produto não encontrado</h1>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Voltar para a loja
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Seção principal do produto */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Imagem do produto */}
            <div className="md:flex-shrink-0 md:w-1/2 lg:w-2/5 p-6">
              <div className="h-64 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {produto.imagem_url ? (
                  <img 
                    src={produto.imagem_url} 
                    alt={produto.nome} 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">Sem imagem</span>
                )}
              </div>
            </div>

            {/* Informações do produto */}
            <div className="p-6 md:w-1/2 lg:w-3/5">
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-500">Vendido por: </span>
                <Link 
                  href={`/empresa/${produto.empresa_id}`}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  {produto.empresa_nome || 'Loja'}
                </Link>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {produto.nome}
              </h1>
              
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-blue-600">
                  R$ {produto.preco?.toFixed(2).replace('.', ',')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  em até 12x sem juros
                </span>
              </div>





              <div className="space-y-3">
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-800 mb-2">Descrição do Produto</h3>
                  <p className="text-gray-800">{produto.descricao || 'Nenhuma descrição disponível.'}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-black mb-2">
                    Quantidade desejada:
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      className="px-4 py-2 border border-gray-300 rounded-l-md bg-white hover:bg-gray-100 text-black"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-t border-b border-gray-300 py-2 text-black"
                    />
                    <button 
                      onClick={() => setQuantidade(quantidade + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-r-md bg-white hover:bg-gray-100 text-black"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botão Comprar via WhatsApp */}
                <button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={async () => {
                    try {
                      // Buscar o telefone da empresa
                      const { data: empresaData } = await supabase
                        .from('empresas')
                        .select('telefone, nome')
                        .eq('id', produto.empresa_id)
                        .single();
                      
                      if (!empresaData?.telefone) {
                        alert('Desculpe, não foi possível encontrar o contato da empresa.');
                        return;
                      }
                      
                      const precoTotal = (produto.preco * quantidade).toFixed(2).replace('.', ',');
                      const precoUnitario = produto.preco.toFixed(2).replace('.', ',');
                      
                      const message = `Olá ${empresaData.nome || 'Lojista'}!%0A%0A` +
                        `📌 *NOVO PEDIDO*%0A` +
                        `----------------------------------------%0A` +
                        `*Produto:* ${produto.nome}%0A` +
                        `*Quantidade:* ${quantidade} unidade(s)%0A` +
                        `*Preço unitário:* R$ ${precoUnitario}%0A` +
                        `*Preço total:* R$ ${precoTotal}%0A` +
                        `----------------------------------------%0A` +
                        `Gostaria de finalizar esta compra. Por favor, me informe as formas de pagamento e prazo de entrega.`;
                      
                      // Formata o telefone removendo caracteres não numéricos
                      const telefone = empresaData.telefone.replace(/\D/g, '');
                      window.open(`https://wa.me/55${telefone}?text=${message}`, '_blank');
                    } catch (error) {
                      console.error('Erro ao processar compra:', error);
                      alert('Ocorreu um erro ao tentar abrir o WhatsApp. Por favor, tente novamente.');
                    }
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.222-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Comprar Agora
                </button>

                {/* Botão Ir para a Loja */}
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2"
                  onClick={() => window.location.href = `/empresa/${produto.empresa_id}`}
                >
                  Ir para a Loja
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos relacionados */}
        {produtosRelacionados.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quem viu este item também viu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosRelacionados.map((produto) => (
                <div 
                  key={produto.id}
                  onClick={() => router.push(`/produto/${produto.id}`)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center p-4">
                    {produto.imagem_url ? (
                      <img 
                        src={produto.imagem_url} 
                        alt={produto.nome}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">Sem imagem</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2 h-12">
                      {produto.nome}
                    </h3>
                    <p className="text-blue-600 font-bold mt-1">
                      R$ {produto.preco?.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      em até 12x sem juros
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
