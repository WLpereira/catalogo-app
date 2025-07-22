'use client';

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation'
import { IMaskInput } from 'react-imask'

export default function CadastroEmpresa() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [usuarioPrincipal, setUsuarioPrincipal] = useState("");
  const [senhaPrincipal, setSenhaPrincipal] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarioExtra1, setUsuarioExtra1] = useState("");
  const [usuarioExtra2, setUsuarioExtra2] = useState("");
  const [usuarioExtra3, setUsuarioExtra3] = useState("");
  const [senhaExtra1, setSenhaExtra1] = useState("");
  const [senhaExtra2, setSenhaExtra2] = useState("");
  const [senhaExtra3, setSenhaExtra3] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let logoUrl = "";
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile);
      if (uploadError) {
        setMensagem("Erro ao fazer upload da logo: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      logoUrl = publicUrlData.publicUrl;
    }
    const { error } = await supabase.from("empresas").insert([
      {
        nome,
        cnpj,
        email,
        telefone,
        whatsapp,
        logo_url: logoUrl,
        usuario_principal: usuarioPrincipal,
        senha_principal: senhaPrincipal
      }
    ]);
    setLoading(false);
    if (error) {
      setMensagem("Erro ao cadastrar empresa: " + error.message);
    } else {
      setMensagem("Empresa cadastrada com sucesso!");
      setNome("");
      setCnpj("");
      setEmail("");
      setTelefone("");
      setWhatsapp("");
      setLogoFile(null);
      setUsuarioPrincipal("");
      setSenhaPrincipal("");
      setMostrarExtras(false); // Resetar mostrarExtras para false após cadastro bem-sucedido
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-gray-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-blue-200">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800 tracking-tight">Cadastro de Empresa</h1>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-1">Nome da Empresa</label>
            <input type="text" className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400" placeholder="Nome da empresa" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold text-blue-900 mb-1">CNPJ</label>
              <IMaskInput
                mask="00.000.000/0000-00"
                value={cnpj}
                onAccept={(value) => setCnpj(String(value))}
                placeholder="CNPJ da empresa"
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-blue-900 placeholder-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-blue-900 mb-1">Telefone</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={telefone}
                onAccept={(value) => setTelefone(String(value))}
                placeholder="Telefone de contato"
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-blue-900 placeholder-blue-400"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-blue-900 mb-1">WhatsApp</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={whatsapp}
                onAccept={(value) => setWhatsapp(String(value))}
                placeholder="WhatsApp da empresa"
                className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-blue-900 placeholder-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-1">E-mail</label>
            <input type="email" className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-1">Logo (imagem)</label>
            <input type="file" accept="image/*" className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900" onChange={handleLogoChange} />
          </div>
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-1">Usuário Principal (E-mail)</label>
            <input type="email" className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400" placeholder="E-mail do usuário principal" value={usuarioPrincipal} onChange={e => setUsuarioPrincipal(e.target.value)} required />
          </div>
          <div>
            <label className="block text-base font-semibold text-blue-900 mb-1">Senha Principal</label>
            <input type="password" className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-900 placeholder-blue-400" placeholder="Senha do usuário principal" value={senhaPrincipal} onChange={e => setSenhaPrincipal(e.target.value)} required />
          </div>
          <button type="button" className="mt-2 mb-2 text-blue-700 font-semibold underline" onClick={() => setMostrarExtras(!mostrarExtras)}>
            {mostrarExtras ? 'Ocultar usuários extras' : 'Adicionar usuário extra'}
          </button>
          {mostrarExtras && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Usuário Extra 1</label>
                <input type="text" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={usuarioExtra1} onChange={e => setUsuarioExtra1(e.target.value)} placeholder="Usuário extra 1" />
              </div>
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Senha Extra 1</label>
                <input type="password" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={senhaExtra1} onChange={e => setSenhaExtra1(e.target.value)} placeholder="Senha extra 1" />
              </div>
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Usuário Extra 2</label>
                <input type="text" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={usuarioExtra2} onChange={e => setUsuarioExtra2(e.target.value)} placeholder="Usuário extra 2" />
              </div>
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Senha Extra 2</label>
                <input type="password" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={senhaExtra2} onChange={e => setSenhaExtra2(e.target.value)} placeholder="Senha extra 2" />
              </div>
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Usuário Extra 3</label>
                <input type="text" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={usuarioExtra3} onChange={e => setUsuarioExtra3(e.target.value)} placeholder="Usuário extra 3" />
              </div>
              <div>
                <label className="block text-base font-semibold text-blue-900 mb-1">Senha Extra 3</label>
                <input type="password" className="w-full p-3 border border-blue-200 rounded-lg text-black placeholder-gray-400" value={senhaExtra3} onChange={e => setSenhaExtra3(e.target.value)} placeholder="Senha extra 3" />
              </div>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-800 hover:to-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? "Cadastrando..." : "Cadastrar Empresa"}
          </button>
          {mensagem && <p className="mt-2 text-center text-blue-900 font-semibold">{mensagem}</p>}
        </form>
      </div>
    </div>
  );
} 