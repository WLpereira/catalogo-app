'use client';

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginEmpresa() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Se for ADM, buscar no banco
    if (usuario.trim().toLowerCase() === "adm") {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("usuario_principal", "ADM")
        .limit(1);
      setLoading(false);
      if (error) {
        setMensagem("Erro ao tentar logar: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        const empresa = data[0];
        if (empresa.senha_principal === senha) {
          sessionStorage.setItem("adm", "true");
          router.push("/adm");
          return;
        } else {
          setMensagem("Usuário ou senha inválidos.");
          return;
        }
      } else {
        setMensagem("Usuário ou senha inválidos.");
        return;
      }
    }
    // Busca empresa onde o usuário informado é igual ao principal ou a qualquer extra
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .or(`email.eq.${usuario},usuario_extra1.eq.${usuario},usuario_extra2.eq.${usuario},usuario_extra3.eq.${usuario}`)
      .limit(1);
    setLoading(false);
    if (error) {
      setMensagem("Erro ao tentar logar: " + error.message);
    } else if (data && data.length > 0) {
      const empresa = data[0];
      // Verifica se a senha bate com o campo correto
      const senhaCorreta =
        (empresa.email === usuario && empresa.senha_principal === senha) ||
        (empresa.usuario_extra1 === usuario && empresa.senha_extra1 === senha) ||
        (empresa.usuario_extra2 === usuario && empresa.senha_extra2 === senha) ||
        (empresa.usuario_extra3 === usuario && empresa.senha_extra3 === senha);
      if (senhaCorreta) {
        sessionStorage.setItem("empresa_id", empresa.id);
        router.push("/empresa/painel");
      } else {
        setMensagem("Usuário ou senha inválidos.");
      }
    } else {
      setMensagem("Usuário ou senha inválidos."); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border-2" style={{borderColor: '#4FC3F7'}}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Acesse sua conta</h1>
          <p className="text-gray-600">Entre para gerenciar seus produtos</p>
        </div>
        
        {mensagem && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {mensagem}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail ou usuário</label>
            <input 
              type="text" 
              className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400"
              style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
              placeholder="Digite seu e-mail ou usuário" 
              value={usuario} 
              onChange={e => setUsuario(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700">Senha</label>
              <button 
                type="button"
                onClick={() => router.push('/empresa/cadastro')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Criar conta
              </button>
            </div>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                className="w-full p-3 border-2 rounded-lg focus:ring-2 text-black placeholder-gray-400 pr-12"
                style={{borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}
                placeholder="Digite sua senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setMostrarSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
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
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white p-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-800 hover:to-blue-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" onClick={() => router.push('/empresa/cadastro')} className="w-full mt-2 bg-gradient-to-r from-gray-200 to-blue-100 text-blue-800 p-3 rounded-lg font-bold text-lg shadow hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200">
            Não tenho cadastro
          </button>
          {mensagem && <p className="mt-2 text-center text-blue-900 font-semibold">{mensagem}</p>}
        </form>
      </div>
    </div>
  );
} 