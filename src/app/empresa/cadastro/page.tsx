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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 border-2" style={{borderColor: '#4FC3F7'}}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cadastro de Empresa</h1>
          <p className="text-gray-600">Preencha os dados da sua empresa para começar</p>
        </div>
        
        {mensagem && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${mensagem.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {mensagem}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
            <input 
              type="text" 
              className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
              style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
              placeholder="Digite o nome da sua empresa" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
              <IMaskInput
                mask="00.000.000/0000-00"
                value={cnpj}
                onAccept={(value) => setCnpj(String(value))}
                placeholder="00.000.000/0000-00"
                className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={telefone}
                onAccept={(value) => setTelefone(String(value))}
                placeholder="Telefone de contato"
                className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-blue-900 mb-1">WhatsApp</label>
              <IMaskInput
                mask="(00) 00000-0000"
                value={whatsapp}
                onAccept={(value) => setWhatsapp(String(value))}
                placeholder="(00) 00000-0000"
                className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail da Empresa</label>
            <input 
              type="email" 
              className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
              style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
              placeholder="contato@empresa.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Logo da Empresa (opcional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed rounded-lg cursor-pointer" style={{borderColor: '#4FC3F7'}}>
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-500 group-hover:text-gray-600">
                    {logoFile ? logoFile.name : 'Selecione uma imagem'}
                  </p>
                </div>
                <input type="file" className="opacity-0" accept="image/*" onChange={handleLogoChange} />
              </label>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuário Principal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome de Usuário</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                  style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                  placeholder="Escolha um nome de usuário"
                  value={usuarioPrincipal}
                  onChange={(e) => setUsuarioPrincipal(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                  style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                  placeholder="Crie uma senha segura"
                  value={senhaPrincipal}
                  onChange={(e) => setSenhaPrincipal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setMostrarExtras(!mostrarExtras)}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center gap-1"
            >
              {mostrarExtras ? 'Ocultar' : 'Adicionar'} usuários adicionais (opcional)
              <svg
                className={`w-4 h-4 transition-transform ${mostrarExtras ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {mostrarExtras && (
              <div className="space-y-4 border-2 border-blue-100 rounded-lg p-4 bg-blue-50 mt-3">
                <h3 className="font-semibold text-gray-900">Usuários Adicionais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário Extra 1</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Nome de usuário"
                        value={usuarioExtra1}
                        onChange={(e) => setUsuarioExtra1(e.target.value)}
                      />
                      <input
                        type="password"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Senha"
                        value={senhaExtra1}
                        onChange={(e) => setSenhaExtra1(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário Extra 2</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Nome de usuário"
                        value={usuarioExtra2}
                        onChange={(e) => setUsuarioExtra2(e.target.value)}
                      />
                      <input
                        type="password"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Senha"
                        value={senhaExtra2}
                        onChange={(e) => setSenhaExtra2(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário Extra 3</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Nome de usuário"
                        value={usuarioExtra3}
                        onChange={(e) => setUsuarioExtra3(e.target.value)}
                      />
                      <input
                        type="password"
                        className="p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
                        style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                        placeholder="Senha"
                        value={senhaExtra3}
                        onChange={(e) => setSenhaExtra3(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cadastrando...
                </>
              ) : 'Cadastrar Empresa'}
            </button>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para a página anterior
              </button>
            </div>
          </div>
          {mensagem && <p className="mt-2 text-center text-blue-900 font-semibold">{mensagem}</p>}
        </form>
      </div>
    </div>
  );
} 