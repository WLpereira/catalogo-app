'use client';

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProductForm from "@/app/components/ProductForm";
import { IMaskInput } from 'react-imask';
import CurrencyInputField from 'react-currency-input-field';
import dynamic from 'next/dynamic';

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
{{ ... }}
          </div>
        </div>
      )}
      {/* Modal de edição da empresa */}
      {editandoEmpresa && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 xs:p-4">
          <div className="bg-white rounded-2xl p-4 xs:p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-200 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold transition-all duration-200" onClick={closeModalEdit}>&times;</button>
            <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-2 sm:mb-4" style={{color:'#039BE5'}}>Editar Produto</h3>
            <div className="flex flex-col items-center mb-2 sm:mb-4">
              {produtoEdit.imagem_url && (
                <img src={produtoEdit.imagem_url} alt={produtoEdit.nome} className="w-20 h-20 xs:w-24 xs:h-24 object-contain mb-2 rounded" />
              )}
              <h4 className="text-base xs:text-lg font-bold text-black mb-1">{produtoEdit.nome}</h4>
              <p className="font-bold mb-1" style={{color:'#039BE5'}}>R$ {produtoEdit.preco?.toFixed(2)}</p>
              <p className="text-gray-700 text-xs xs:text-sm mb-1 text-center">{produtoEdit.descricao}</p>
            </div>
            <form onSubmit={handleEditProduto} className="flex flex-col gap-2 mb-2 sm:mb-4">
              <label className="block text-sm xs:text-base font-semibold text-black mb-1">Nome</label>
              <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="w-full p-2 xs:p-3 border rounded-lg focus:ring-2 text-black placeholder-gray-400" style={{borderColor:'#4FC3F7'}} required />
              <label className="block text-sm xs:text-base font-semibold text-black mb-1">Preço</label>
              <input type="number" value={editPreco} onChange={e => setEditPreco(Number(e.target.value))} className="w-full p-2 xs:p-3 border rounded-lg focus:ring-2 text-black placeholder-gray-400" style={{borderColor:'#4FC3F7'}} required />
              <label className="block text-sm xs:text-base font-semibold text-black mb-1">Descrição</label>
              <textarea value={editDescricao} onChange={e => setEditDescricao(e.target.value)} className="w-full p-2 xs:p-3 border rounded-lg focus:ring-2 text-black placeholder-gray-400" style={{borderColor:'#4FC3F7'}} rows={2} required />
              <button type="submit" className="w-full text-white p-2 xs:p-3 rounded-lg font-bold text-base xs:text-lg shadow-lg transition-all duration-200 mt-2" style={{background:'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)'}}>Salvar Alterações</button>
            </form>
            <button className="w-full mt-2 bg-black text-white p-2 xs:p-3 rounded-lg font-bold text-base xs:text-lg shadow-lg hover:bg-blue-400 transition-all duration-200" onClick={closeModalEdit}>
              Cancelar
            </button>
          </div>
        </div>
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">E-mail</label>
                  <input type="email" className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] text-black placeholder-[#B3E5FC]" value={empresaEmail} onChange={e => setEmpresaEmail(e.target.value)} required placeholder="E-mail" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">Telefone</label>
{{ ... }}
                    mask="(00) 00000-0000"
                    value={empresaTelefone}
                    onAccept={(value) => setEmpresaTelefone(String(value))}
                    placeholder="Telefone"
                    className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] text-black placeholder-[#B3E5FC]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">Endereço</label>
                  <input type="text" className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] text-black placeholder-[#B3E5FC]" value={empresaEndereco} onChange={e => setEmpresaEndereco(e.target.value)} placeholder="Endereço completo" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">WhatsApp</label>
                  <IMaskInput
                    mask="(00) 00000-0000"
                    value={empresaWhatsapp}
                    onAccept={(value) => setEmpresaWhatsapp(String(value))}
                    placeholder="WhatsApp"
                    className="w-full p-3 border border-[#B3E5FC] rounded-lg focus:ring-2 focus:ring-[#4FC3F7] text-black placeholder-[#B3E5FC]"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">Horário de Atendimento</label>
                  <textarea
                    className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC] shadow-sm"
                    value={empresaHorario}
                    onChange={e => setEmpresaHorario(e.target.value)}
                    placeholder="Ex: Seg a Sex: 09:00 - 18:00\nSábado: 09:00 - 12:00\nDomingo: Fechado"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#039BE5] mb-1">Sobre Nós</label>
                  <textarea
                    className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC] shadow-sm"
                    value={empresaSobre}
                    onChange={e => setEmpresaSobre(e.target.value)}
                    placeholder="Conte um pouco sobre sua empresa, missão, valores, etc."
                    rows={3}
                  />
                </div>
              </div>
              <button type="button" className="mt-2 mb-2 text-[#039BE5] font-semibold underline" onClick={() => setMostrarExtras(!mostrarExtras)}>
                {mostrarExtras ? 'Ocultar usuários extras' : 'Adicionar usuário extra'}
              </button>
              {mostrarExtras && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mb-4">
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Usuário Extra 1</label>
                    <input type="text" className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC]" value={usuarioExtra1} onChange={e => setUsuarioExtra1(e.target.value)} placeholder="Usuário extra 1" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Senha Extra 1</label>
                    <div className="relative">
                      <input type={mostrarSenhaExtra1 ? "text" : "password"} className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC] pr-12" value={senhaExtra1} onChange={e => setSenhaExtra1(e.target.value)} placeholder="Senha extra 1" />
                      <button type="button" tabIndex={-1} onClick={() => setMostrarSenhaExtra1(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4FC3F7] hover:text-[#039BE5] focus:outline-none" aria-label={mostrarSenhaExtra1 ? "Ocultar senha" : "Mostrar senha"}>
                        {mostrarSenhaExtra1 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.322 19.5 12 19.5c1.658 0 3.237-.336 4.646-.94M21.065 11.999a10.45 10.45 0 00-2.032-3.775M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5c4.5 0 8.5 3 9.75 7.5-1.25 4.5-5.25 7.5-9.75 7.5-4.5 0-8.5-3-9.75-7.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Usuário Extra 2</label>
                    <input type="text" className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC]" value={usuarioExtra2} onChange={e => setUsuarioExtra2(e.target.value)} placeholder="Usuário extra 2" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Senha Extra 2</label>
                    <div className="relative">
                      <input type={mostrarSenhaExtra2 ? "text" : "password"} className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC] pr-12" value={senhaExtra2} onChange={e => setSenhaExtra2(e.target.value)} placeholder="Senha extra 2" />
                      <button type="button" tabIndex={-1} onClick={() => setMostrarSenhaExtra2(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4FC3F7] hover:text-[#039BE5] focus:outline-none" aria-label={mostrarSenhaExtra2 ? "Ocultar senha" : "Mostrar senha"}>
                        {mostrarSenhaExtra2 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.322 19.5 12 19.5c1.658 0 3.237-.336 4.646-.94M21.065 11.999a10.45 10.45 0 00-2.032-3.775M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5c4.5 0 8.5 3 9.75 7.5-1.25 4.5-5.25 7.5-9.75 7.5-4.5 0-8.5-3-9.75-7.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Usuário Extra 3</label>
                    <input type="text" className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC]" value={usuarioExtra3} onChange={e => setUsuarioExtra3(e.target.value)} placeholder="Usuário extra 3" />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-[#039BE5] mb-1">Senha Extra 3</label>
                    <div className="relative">
                      <input type={mostrarSenhaExtra3 ? "text" : "password"} className="w-full p-3 border border-[#B3E5FC] rounded-lg text-black placeholder-[#B3E5FC] pr-12" value={senhaExtra3} onChange={e => setSenhaExtra3(e.target.value)} placeholder="Senha extra 3" />
                      <button type="button" tabIndex={-1} onClick={() => setMostrarSenhaExtra3(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4FC3F7] hover:text-[#039BE5] focus:outline-none" aria-label={mostrarSenhaExtra3 ? "Ocultar senha" : "Mostrar senha"}>
                        {mostrarSenhaExtra3 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 16.273 7.322 19.5 12 19.5c1.658 0 3.237-.336 4.646-.94M21.065 11.999a10.45 10.45 0 00-2.032-3.775M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5c4.5 0 8.5 3 9.75 7.5-1.25 4.5-5.25 7.5-9.75 7.5-4.5 0-8.5-3-9.75-7.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="sticky bottom-0 bg-white pt-4 pb-2 z-10">
                <button type="submit" disabled={loadingEmpresa} className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-800 hover:to-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                  {loadingEmpresa ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}