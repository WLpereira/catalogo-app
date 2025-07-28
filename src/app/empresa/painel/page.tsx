'use client';

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/components/ProductForm";
import { IMaskInput } from 'react-imask';
import CurrencyInputField from 'react-currency-input-field';
import dynamic from 'next/dynamic';
import EmpresaNavbar from '@/app/components/EmpresaNavbar';

// Carregar o componente de personalização dinamicamente para evitar problemas de SSR
const PersonalizacaoLoja = dynamic(
  () => import('@/app/components/PersonalizacaoLoja'),
  { ssr: false }
);

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  created_at: string;
}

export default function PainelEmpresa() {
  const [empresa, setEmpresa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nomeProduto, setNomeProduto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [loadingProduto, setLoadingProduto] = useState(false);
  const router = useRouter();

  // Adiciona estado para modal de edição de produto
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [editImagemFile, setEditImagemFile] = useState<File | null>(null);
  const [editImagemUrl, setEditImagemUrl] = useState("");
  const [loadingEditar, setLoadingEditar] = useState(false);

  // Estado para modal de personalização
  const [mostrarPersonalizacao, setMostrarPersonalizacao] = useState(false);

  // Estado para modal de edição da empresa
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaCnpj, setEmpresaCnpj] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");
  const [empresaTelefone, setEmpresaTelefone] = useState("");
  const [empresaEndereco, setEmpresaEndereco] = useState("");
  const [empresaWhatsapp, setEmpresaWhatsapp] = useState("");
  const [empresaLogoFile, setEmpresaLogoFile] = useState<File | null>(null);
  const [empresaLogoUrl, setEmpresaLogoUrl] = useState("");
  const [empresaHorario, setEmpresaHorario] = useState("");
  const [empresaSobre, setEmpresaSobre] = useState("");
  const [usuarioExtra1, setUsuarioExtra1] = useState("");
  const [usuarioExtra2, setUsuarioExtra2] = useState("");
  const [usuarioExtra3, setUsuarioExtra3] = useState("");
  const [senhaExtra1, setSenhaExtra1] = useState("");
  const [senhaExtra2, setSenhaExtra2] = useState("");
  const [senhaExtra3, setSenhaExtra3] = useState("");
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);

  // Estado para mostrar campos extras
  const [mostrarExtras, setMostrarExtras] = useState(false);
  // Estado para mostrar/ocultar senha extra
  const [mostrarSenhaExtra1, setMostrarSenhaExtra1] = useState(false);
  const [mostrarSenhaExtra2, setMostrarSenhaExtra2] = useState(false);
  const [mostrarSenhaExtra3, setMostrarSenhaExtra3] = useState(false);

  const precoInputRef = useRef<any>(null);
  const editPrecoInputRef = useRef<any>(null);

  const abrirModalEditar = (produto: Produto) => {
    setProdutoEditando(produto);
    setEditNome(produto.nome);
    setEditDescricao(produto.descricao);
    // Formatar o preço para o formato brasileiro (com vírgula como separador decimal)
    const precoFormatado = produto.preco ? 
      produto.preco.toString().replace('.', ',') : 
      "0,00";
    setEditPreco(precoFormatado);
    setEditImagemUrl(produto.imagem_url);
    setEditImagemFile(null);
  };

  const fecharModalEditar = () => {
    setProdutoEditando(null);
    setEditNome("");
    setEditDescricao("");
    setEditPreco("");
    setEditImagemFile(null);
    setEditImagemUrl("");
  };

  const handleEditImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImagemFile(e.target.files[0]);
    }
  };

  const handleSalvarEdicaoProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;
    setLoadingEditar(true);
    let imagemUrl = editImagemUrl;
    if (editImagemFile) {
      const fileExt = editImagemFile.name.split('.').pop();
      const fileName = `produto_${produtoEditando.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, editImagemFile, { upsert: true });
      if (uploadError) {
        setMensagem("Erro ao fazer upload da imagem: " + uploadError.message);
        setLoadingEditar(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      imagemUrl = publicUrlData.publicUrl;
    }
    // Corrigir conversão de preço: remover tudo que não for número ou vírgula/ponto, depois converter
    let precoNumber = 0;
    if (editPreco) {
      const precoLimpo = editPreco.replace(/[^0-9,\.]/g, '').replace(',', '.');
      precoNumber = parseFloat(precoLimpo);
    }
    const { error } = await supabase.from("produtos").update({
      nome: editNome,
      descricao: editDescricao,
      preco: precoNumber || null,
      imagem_url: imagemUrl
    }).eq("id", produtoEditando.id);
    setLoadingEditar(false);
    if (error) {
      setMensagem("Erro ao editar produto: " + error.message);
    } else {
      setMensagem("Produto editado com sucesso!");
      if (!empresa) return;
      // Atualiza lista
      const { data } = await supabase.from("produtos").select("*").eq("empresa_id", empresa.id).order("created_at", { ascending: false });
      setProdutos(data || []);
      fecharModalEditar();
    }
  };

  const abrirModalEditarEmpresa = () => {
    setEmpresaNome(empresa.nome || "");
    setEmpresaCnpj(empresa.cnpj || "");
    setEmpresaEmail(empresa.email || "");
    setEmpresaTelefone(empresa.telefone || "");
    setEmpresaEndereco(empresa.endereco || "");
    setEmpresaWhatsapp(empresa.whatsapp || "");
    setEmpresaLogoUrl(empresa.logo_url || "");
    setEmpresaLogoFile(null);
    setEmpresaHorario(empresa.horario_atendimento || "");
    setEmpresaSobre(empresa.sobre_nos || "");
    setUsuarioExtra1(empresa.usuario_extra1 || "");
    setUsuarioExtra2(empresa.usuario_extra2 || "");
    setUsuarioExtra3(empresa.usuario_extra3 || "");
    setSenhaExtra1(empresa.senha_extra1 || "");
    setSenhaExtra2(empresa.senha_extra2 || "");
    setSenhaExtra3(empresa.senha_extra3 || "");
    setMostrarExtras(false); // Sempre iniciar oculto
    setEditandoEmpresa(true);
  };
  const fecharModalEditarEmpresa = () => {
    setEditandoEmpresa(false);
    setEmpresaLogoFile(null);
  };
  const handleEmpresaLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEmpresaLogoFile(e.target.files[0]);
    }
  };
  const handleSalvarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmpresa(true);
    let logoUrl = empresaLogoUrl;
    if (empresaLogoFile) {
      const fileExt = empresaLogoFile.name.split('.').pop();
      const fileName = `empresa_logo_${empresa.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, empresaLogoFile, { upsert: true });
      if (uploadError) {
        setMensagem("Erro ao fazer upload da logo: " + uploadError.message);
        setLoadingEmpresa(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrlData.publicUrl;
    }
    const { error } = await supabase.from("empresas").update({
      nome: empresaNome,
      cnpj: empresaCnpj,
      email: empresaEmail,
      telefone: empresaTelefone,
      endereco: empresaEndereco,
      whatsapp: empresaWhatsapp,
      logo_url: logoUrl,
      horario_atendimento: empresaHorario,
      sobre_nos: empresaSobre,
      usuario_extra1: usuarioExtra1 || null,
      usuario_extra2: usuarioExtra2 || null,
      usuario_extra3: usuarioExtra3 || null,
      senha_extra1: senhaExtra1 || null,
      senha_extra2: senhaExtra2 || null,
      senha_extra3: senhaExtra3 || null
    }).eq("id", empresa.id);
    setLoadingEmpresa(false);
    if (error) {
      setMensagem("Erro ao editar empresa: " + error.message);
    } else {
      setMensagem("Empresa atualizada com sucesso!");
      setEmpresa({ ...empresa, nome: empresaNome, cnpj: empresaCnpj, email: empresaEmail, telefone: empresaTelefone, endereco: empresaEndereco, whatsapp: empresaWhatsapp, logo_url: logoUrl, usuario_extra1: usuarioExtra1, usuario_extra2: usuarioExtra2, usuario_extra3: usuarioExtra3, senha_extra1: senhaExtra1, senha_extra2: senhaExtra2, senha_extra3: senhaExtra3 });
      fecharModalEditarEmpresa();
    }
  };

  useEffect(() => {
    const empresaId = sessionStorage.getItem("empresa_id");
    if (!empresaId) {
      router.push("/empresa/login");
      return;
    }
    const fetchEmpresa = async () => {
      const { data, error } = await supabase.from("empresas").select("*").eq("id", empresaId).single();
      if (error || !data) {
        router.push("/empresa/login");
      } else {
        setEmpresa(data);
        fetchProdutos(empresaId);
      }
      setLoading(false);
    };
    const fetchProdutos = async (empresaId: string) => {
      const { data } = await supabase.from("produtos").select("*").eq("empresa_id", empresaId).order("created_at", { ascending: false });
      setProdutos(data || []);
    };
    fetchEmpresa();
    // eslint-disable-next-line
  }, [router]);

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagemFile(e.target.files[0]);
    }
  };

  const handleCadastrarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;
    setLoadingProduto(true);
    let imagemUrl = "";
    if (imagemFile) {
      const fileExt = imagemFile.name.split('.').pop();
      const fileName = `produto_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, imagemFile);
      if (uploadError) {
        setMensagem("Erro ao fazer upload da imagem: " + uploadError.message);
        setLoadingProduto(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      imagemUrl = publicUrlData.publicUrl;
    }
    // Corrigir conversão de preço: remover tudo que não for número ou vírgula/ponto, depois converter
    let precoNumber = 0;
    if (preco) {
      const precoLimpo = preco.replace(/[^0-9,\.]/g, '').replace(',', '.');
      precoNumber = parseFloat(precoLimpo);
    }
    const { error } = await supabase.from("produtos").insert([
      {
        empresa_id: empresa.id,
        nome: nomeProduto,
        descricao,
        preco: precoNumber || null,
        imagem_url: imagemUrl
      }
    ]);
    setLoadingProduto(false);
    if (error) {
      setMensagem("Erro ao cadastrar produto: " + error.message);
    } else {
      setMensagem("Produto cadastrado com sucesso!");
      setNomeProduto("");
      setDescricao("");
      setPreco("");
      setImagemFile(null);
      if (precoInputRef.current) precoInputRef.current.value = "";
      // Atualiza lista
      const { data } = await supabase.from("produtos").select("*").eq("empresa_id", empresa.id).order("created_at", { ascending: false });
      setProdutos(data || []);
    }
  };

  const handleExcluirProduto = async (produtoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    setLoadingProduto(true);
    const { error } = await supabase.from('produtos').delete().eq('id', produtoId);
    setLoadingProduto(false);
    if (error) {
      setMensagem('Erro ao excluir produto: ' + error.message);
    } else {
      setMensagem('Produto excluído com sucesso!');
      // Atualiza lista
      const { data } = await supabase.from('produtos').select('*').eq('empresa_id', empresa.id).order('created_at', { ascending: false });
      setProdutos(data || []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-2xl text-[#039BE5] font-bold">Carregando painel...</div>
      </div>
    );
  }

  if (!empresa) return null;

  return (
    <>
      {/* Navbar personalizada da empresa */}
      <EmpresaNavbar logoUrl={empresa.logo_url} nome={empresa.nome} corPrimaria={empresa.cor_primaria || '#29B6F6'} />
      <div style={{height:'64px'}}></div>
      {/* Modal de Personalização da Loja */}
      {mostrarPersonalizacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 xs:p-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <PersonalizacaoLoja
              empresaId={empresa.id}
              onClose={() => setMostrarPersonalizacao(false)}
            />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold transition-all duration-200 z-10"
              onClick={() => setMostrarPersonalizacao(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Modal de edição de produto */}
      {produtoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 xs:p-4">
          <div className="bg-white rounded-2xl p-4 xs:p-6 sm:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-2xl border border-gray-200 relative flex flex-col" style={{maxWidth:'95vw'}}>
            <button className="absolute top-2 right-2 text-black hover:text-red-600 text-2xl font-bold transition-all duration-200" onClick={fecharModalEditar}>&times;</button>
            <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-black">Editar Produto</h3>
            <form onSubmit={handleSalvarEdicaoProduto} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Nome</label>
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Descrição</label>
                <textarea value={editDescricao} onChange={e => setEditDescricao(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Preço</label>
                <input type="text" value={editPreco} onChange={e => setEditPreco(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Imagem</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {editImagemUrl && !editImagemFile && (
                    <img src={editImagemUrl} alt="Imagem do produto" className="h-20 w-20 object-contain rounded-lg border border-gray-300 mb-2" />
                  )}
                  {editImagemFile && (
                    <img src={URL.createObjectURL(editImagemFile)} alt="Nova imagem" className="h-20 w-20 object-contain rounded-lg border border-gray-300 mb-2" />
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition-colors border border-gray-300 font-medium">
                    Alterar Imagem
                    <input type="file" accept="image/*" onChange={handleEditImagemChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={fecharModalEditar} className="px-4 py-2 border border-gray-300 rounded-lg text-black bg-white hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full p-6 md:p-8 border border-[#B3E5FC] mb-8">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-black tracking-tight">Painel da Empresa</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8">
            {empresa.logo_url && (
              <img src={empresa.logo_url} alt="Logo da empresa" className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-xl border-2 border-[#4FC3F7] bg-gray-100 mx-auto sm:mx-0" />
            )}
            <div className="flex flex-col flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">Painel da Empresa</h1>
                <button
                  onClick={() => setMostrarPersonalizacao(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                >
                  Personalizar Loja
                </button>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#039BE5] mb-2 text-center sm:text-left">Bem-vindo, {empresa.nome}!</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <p className="text-base text-gray-700"><b>CNPJ:</b> {empresa.cnpj}</p>
                <p className="text-base text-gray-700"><b>E-mail:</b> {empresa.email}</p>
                <p className="text-base text-gray-700"><b>Telefone:</b> {empresa.telefone}</p>
              </div>
              <button
                className="mt-2 bg-[#4FC3F7] hover:bg-[#039BE5] text-white px-4 py-2 rounded font-bold text-sm transition-all duration-200 border border-[#29B6F6] w-full sm:w-auto"
                onClick={abrirModalEditarEmpresa}
              >
                Editar empresa
              </button>
            </div>
          </div>
          <form className="flex flex-col gap-4 mb-8 bg-[#F5FBFF] p-6 rounded-xl border border-[#B3E5FC]" onSubmit={handleCadastrarProduto}>
            <h3 className="text-xl font-bold text-[#039BE5] mb-2">Cadastrar Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-[#039BE5] mb-1">Nome do Produto</label>
                <input type="text" className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] bg-white text-black placeholder-[#B3E5FC]" placeholder="Nome do produto" value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} required />
              </div>
              <div>
                <label className="block text-base font-semibold text-[#039BE5] mb-1">Preço</label>
                <CurrencyInputField
                  id="cadastro-preco"
                  name="preco"
                  placeholder="R$ 0,00"
                  defaultValue={0}
                  decimalsLimit={2}
                  decimalSeparator="," 
                  groupSeparator="."
                  prefix="R$ "
                  className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] bg-white text-black placeholder-[#B3E5FC]"
                  onValueChange={(value) => {
                    setPreco(value || "");
                  }}
                  ref={precoInputRef}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-[#039BE5] mb-1">Descrição</label>
                <textarea className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] bg-white text-black placeholder-[#B3E5FC]" placeholder="Descrição do produto" value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-[#039BE5] mb-1">Imagem do Produto</label>
                <input type="file" accept="image/*" className="w-full p-3 border border-[#B3E5FC] rounded-lg bg-white text-black" onChange={handleImagemChange} />
              </div>
            </div>
            <button type="submit" disabled={loadingProduto} className="w-full bg-gradient-to-r from-[#4FC3F7] to-[#039BE5] text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:from-[#039BE5] hover:to-[#4FC3F7] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loadingProduto ? "Cadastrando..." : "Cadastrar Produto"}
            </button>
            {mensagem && <p className="mt-2 text-center text-[#039BE5] font-semibold">{mensagem}</p>}
          </form>
          <h3 className="text-xl font-bold text-[#039BE5] mb-4">Produtos Cadastrados</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {produtos.length === 0 && <p className="text-gray-500 col-span-full">Nenhum produto cadastrado ainda.</p>}
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white border-2 border-[#B3E5FC] rounded-xl shadow p-3 sm:p-4 flex flex-col items-center">
                {produto.imagem_url && (
                  <img src={produto.imagem_url} alt={produto.nome} className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-2 rounded" />
                )}
                <h3 className="font-bold text-center text-black mb-1">{produto.nome}</h3>
                <p className="text-black text-sm text-center mb-1 line-clamp-2 min-h-[32px]">{produto.descricao}</p>
                <p className="text-[#039BE5] font-bold mb-2">R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => abrirModalEditar(produto)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleExcluirProduto(produto.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      {/* Modal de edição da empresa */}
      {editandoEmpresa && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 xs:p-4">
          <div className="bg-white rounded-2xl p-0 xs:p-0 sm:p-0 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-2xl border border-gray-200 relative flex flex-col" style={{maxWidth:'95vw', maxHeight:'100vh', height:'100vh'}}>
            <button className="absolute top-2 right-2 text-black hover:text-red-600 text-2xl font-bold transition-all duration-200 z-20" onClick={fecharModalEditarEmpresa}>&times;</button>
            <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#039BE5] px-4 pt-6">Editar Empresa</h3>
            <form onSubmit={handleSalvarEmpresa} className="flex flex-col flex-1 h-full">
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6" style={{maxHeight:'calc(100vh - 110px)', minHeight:0}}>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Logo</label>
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {empresaLogoUrl && !empresaLogoFile && (
                      <img src={empresaLogoUrl} alt="Logo da empresa" className="h-20 w-20 object-contain rounded-lg border border-gray-300" />
                    )}
                    {empresaLogoFile && (
                      <img src={URL.createObjectURL(empresaLogoFile)} alt="Nova logo" className="h-20 w-20 object-contain rounded-lg border border-gray-300" />
                    )}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition-colors border border-gray-300 font-medium">
                      Alterar Logo
                      <input type="file" accept="image/*" className="hidden" onChange={handleEmpresaLogoChange} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Nome da Empresa</label>
                    <input 
                      type="text" 
                      value={empresaNome} 
                      onChange={e => setEmpresaNome(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black" 
                      required 
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">CNPJ</label>
                    <IMaskInput
                      mask="00.000.000/0000-00"
                      value={empresaCnpj}
                      onAccept={(value) => setEmpresaCnpj(String(value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">E-mail</label>
                    <input 
                      type="email" 
                      value={empresaEmail} 
                      onChange={e => setEmpresaEmail(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black" 
                      required 
                      placeholder="E-mail"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Telefone</label>
                    <IMaskInput
                      mask="(00) 00000-0000"
                      value={empresaTelefone}
                      onAccept={(value) => setEmpresaTelefone(String(value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Endereço</label>
                    <input 
                      type="text" 
                      value={empresaEndereco} 
                      onChange={e => setEmpresaEndereco(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black" 
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">WhatsApp</label>
                    <IMaskInput
                      mask="(00) 00000-0000"
                      value={empresaWhatsapp}
                      onAccept={(value) => setEmpresaWhatsapp(String(value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Horário de Atendimento</label>
                    <input 
                      type="text" 
                      value={empresaHorario} 
                      onChange={e => setEmpresaHorario(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black" 
                      placeholder="Ex: Segunda a Sexta, 08:00 às 18:00"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Sobre a Empresa</label>
                    <textarea 
                      value={empresaSobre} 
                      onChange={e => setEmpresaSobre(e.target.value)} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-black" 
                      rows={3}
                      placeholder="Fale um pouco sobre sua empresa..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setMostrarExtras(!mostrarExtras)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
                  >
                    {mostrarExtras ? 'Ocultar' : 'Mostrar'} usuários adicionais
                    <svg 
                      className={`ml-1 w-4 h-4 transition-transform ${mostrarExtras ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </button>

                  {mostrarExtras && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-black">Usuários Adicionais</h4>
                      <div className="space-y-4">
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-black mb-1">Usuário {num}</label>
                                <input
                                  type="text"
                                  value={eval(`usuarioExtra${num}`) || ''}
                                  onChange={(e) => eval(`setUsuarioExtra${num}(e.target.value)`)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
                                  placeholder={`E-mail do usuário ${num}`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-black mb-1">Senha</label>
                                <div className="relative">
                                  <input
                                    type={eval(`mostrarSenhaExtra${num}`) ? 'text' : 'password'}
                                    value={eval(`senhaExtra${num}`) || ''}
                                    onChange={(e) => eval(`setSenhaExtra${num}(e.target.value)`)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10 text-black"
                                    placeholder={`Senha do usuário ${num}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => eval(`setMostrarSenhaExtra${num}(!mostrarSenhaExtra${num})`)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                  >
                                    {eval(`mostrarSenhaExtra${num}`) ? (
                                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                      </svg>
                                    ) : (
                                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Sticky action bar for buttons */}
              <div className="sticky bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-200 z-10 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={fecharModalEditarEmpresa}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingEmpresa}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex justify-center items-center"
                >
                  {loadingEmpresa ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}