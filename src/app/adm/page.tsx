"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface CarrosselImg {
  id?: string;
  url: string;
  ordem: number;
}
interface CampanhaImg {
  id?: string;
  url: string;
  ordem: number;
  mostrar: boolean;
}

export default function PainelADM() {
  const [carrossel, setCarrossel] = useState<CarrosselImg[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaImg[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  // Buscar imagens ao carregar
  useEffect(() => {
    const fetchImgs = async () => {
      setLoading(true);
      const { data: carrosselData } = await supabase
        .from("carrossel_home")
        .select("id, url, ordem")
        .order("ordem");
      const { data: campanhasData } = await supabase
        .from("campanhas_home")
        .select("id, url, ordem, mostrar")
        .order("ordem");
      setCarrossel(carrosselData || []);
      setCampanhas(campanhasData || []);
      setLoading(false);
    };
    fetchImgs();
  }, []);

  // Upload imagem para o bucket adm
  async function uploadImagem(file: File, pasta: string) {
    const filePath = `${pasta}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("adm").upload(filePath, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from("adm").getPublicUrl(filePath).data.publicUrl;
  }

  // Adicionar imagem ao carrossel
  async function adicionarCarrossel(file: File) {
    if (carrossel.length >= 5) return setMensagem("Limite de 5 imagens no carrossel.");
    try {
      const url = await uploadImagem(file, "carrossel");
      const ordem = carrossel.length + 1;
      const { data, error } = await supabase.from("carrossel_home").insert({ url, ordem }).select().single();
      if (error) throw error;
      setCarrossel([...carrossel, data]);
      setMensagem("Imagem adicionada ao carrossel!");
    } catch (e: any) {
      setMensagem("Erro: " + e.message);
    }
  }
  // Remover imagem do carrossel
  async function removerCarrossel(id?: string) {
    if (!id) return;
    await supabase.from("carrossel_home").delete().eq("id", id);
    setCarrossel(carrossel.filter(img => img.id !== id));
  }

  // Adicionar imagem à campanha
  async function adicionarCampanha(file: File) {
    if (campanhas.length >= 10) return setMensagem("Limite de 10 campanhas.");
    try {
      const url = await uploadImagem(file, "campanhas");
      const ordem = campanhas.length + 1;
      const { data, error } = await supabase.from("campanhas_home").insert({ url, ordem, mostrar: false }).select().single();
      if (error) throw error;
      setCampanhas([...campanhas, data]);
      setMensagem("Imagem de campanha adicionada!");
    } catch (e: any) {
      setMensagem("Erro: " + e.message);
    }
  }
  // Remover imagem da campanha
  async function removerCampanha(id?: string) {
    if (!id) return;
    await supabase.from("campanhas_home").delete().eq("id", id);
    setCampanhas(campanhas.filter(img => img.id !== id));
  }
  // Editar mostrar campanha
  async function editarMostrarCampanha(id?: string, mostrar?: boolean) {
    if (!id) return;
    await supabase.from("campanhas_home").update({ mostrar }).eq("id", id);
    setCampanhas(campanhas.map(img => img.id === id ? { ...img, mostrar: !!mostrar } : img));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-2 xs:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg xs:max-w-xl md:max-w-2xl p-4 xs:p-6 md:p-8 border-2" style={{borderColor: '#4FC3F7'}}>
        <div className="text-center mb-6 xs:mb-8">
          <h1 className="text-xl xs:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600 text-sm xs:text-base mb-6">Gerencie o carrossel e campanhas do site</p>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4" style={{color:'#039BE5'}}>Carrossel (máx. 5)</h2>
                <div className="flex gap-4 flex-wrap mb-4">
                  {carrossel.map((img, idx) => (
                    <div key={img.id} className="bg-white border-2 rounded-xl shadow-lg p-4 flex flex-col items-center" style={{borderColor:'#4FC3F7'}}>
                      <img src={img.url} alt="Carrossel" className="w-32 h-32 object-contain mb-2 rounded" />
                      <span className="text-sm font-bold mb-2 text-black">Ordem: {img.ordem}</span>
                      <button onClick={() => removerCarrossel(img.id)} className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded mb-1 transition-all duration-200">Remover</button>
                    </div>
                  ))}
                  {carrossel.length < 5 && (
                    <label className="bg-gray-100 border-2 border-dashed rounded-xl shadow-lg p-4 flex flex-col items-center justify-center cursor-pointer w-32 h-32" style={{borderColor:'#4FC3F7'}}>
                      <span className="text-gray-500 mb-2">Adicionar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && adicionarCarrossel(e.target.files[0])} />
                      <span className="text-2xl" style={{color:'#039BE5'}}>+</span>
                    </label>
                  )}
                </div>
              </section>
              {/* Campanhas */}
              <section>
                <h2 className="text-xl font-bold mb-4" style={{color:'#039BE5'}}>Campanhas (máx. 10)</h2>
                <div className="flex gap-4 flex-wrap mb-4">
                  {campanhas.map((img) => (
                    <div key={img.id} className="bg-white border-2 rounded-xl shadow-lg p-4 flex flex-col items-center" style={{borderColor:'#4FC3F7'}}>
                      <img src={img.url} alt="Campanha" className="w-32 h-32 object-contain mb-2 rounded" />
                      <span className="text-sm font-bold mb-2 text-black">Ordem: {img.ordem}</span>
                      <label className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={img.mostrar} onChange={e => editarMostrarCampanha(img.id, e.target.checked)} className="accent-[#4FC3F7] w-4 h-4" />
                        <span className="text-sm text-black">Mostrar</span>
                      </label>
                      <button onClick={() => removerCampanha(img.id)} className="bg-red-500 hover:bg-red-700 text-white px-4 py-1 rounded transition-all duration-200">Remover</button>
                    </div>
                  ))}
                  {campanhas.length < 10 && (
                    <label className="bg-gray-100 border-2 border-dashed rounded-xl shadow-lg p-4 flex flex-col items-center justify-center cursor-pointer w-32 h-32" style={{borderColor:'#4FC3F7'}}>
                      <span className="text-gray-500 mb-2">Adicionar</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && adicionarCampanha(e.target.files[0])} />
                      <span className="text-2xl" style={{color:'#039BE5'}}>+</span>
                    </label>
                  )}
                </div>
              </section>
              
              {/* Mensagem de feedback */}
              {mensagem && (
                <div className="mt-4 p-3 rounded-lg bg-blue-100 text-blue-800 text-sm">
                  {mensagem}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}