'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';

interface PersonalizacaoLojaProps {
  empresaId: string;
  onClose: () => void;
}

export default function PersonalizacaoLoja({ empresaId, onClose }: PersonalizacaoLojaProps) {
  const [corPrimaria, setCorPrimaria] = useState('#29B6F6');
  const [corSecundaria, setCorSecundaria] = useState('#4FC3F7');
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);

  // Carregar configurações atuais da empresa
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('cor_primaria, cor_secundaria, banner_urls')
        .eq('id', empresaId)
        .single();

      if (data && !error) {
        if (data.cor_primaria) setCorPrimaria(data.cor_primaria);
        if (data.cor_secundaria) setCorSecundaria(data.cor_secundaria);
        if (data.banner_urls) {
          setCurrentBanners(data.banner_urls);
          setBannerPreviews(data.banner_urls);
        }
      }
    };

    carregarConfiguracoes();
  }, [empresaId]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBannerFiles(files);
      
      // Criar previews das imagens
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setBannerPreviews([...bannerPreviews, ...newPreviews]);
    }
  };

  const removerBanner = (index: number) => {
    const novosBanners = [...bannerPreviews];
    novosBanners.splice(index, 1);
    setBannerPreviews(novosBanners);
    
    // Se for um banner existente, adiciona à lista de banners para remoção
    if (index < currentBanners.length) {
      const bannersAtualizados = [...currentBanners];
      bannersAtualizados.splice(index, 1);
      setCurrentBanners(bannersAtualizados);
    }
  };

  const salvarPersonalizacao = async () => {
    try {
      setLoading(true);
      
      // 1. Fazer upload dos novos banners
      const uploadedBannerUrls = [...currentBanners];
      
      for (const file of bannerFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `banners/${empresaId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        uploadedBannerUrls.push(publicUrl);
      }
      
      // 2. Atualizar as configurações da empresa
      const { error } = await supabase
        .from('empresas')
        .update({
          cor_primaria: corPrimaria,
          cor_secundaria: corSecundaria,
          banner_urls: uploadedBannerUrls
        })
        .eq('id', empresaId);
        
      if (error) throw error;
      
      toast.success('Personalização salva com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar personalização:', error, typeof error, JSON.stringify(error));
      toast.error('Erro ao salvar personalização: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-black">Personalizar Loja</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-black">Cores da Loja</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Cor Primária
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-800">{corPrimaria}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Cor Secundária
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={corSecundaria}
                  onChange={(e) => setCorSecundaria(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-800">{corSecundaria}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-black">Banner da Loja</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Adicionar Imagens do Banner
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="block w-full text-sm text-gray-800
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          {/* Pré-visualização dos banners */}
          {bannerPreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-black mb-2">
                Pré-visualização dos Banners
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {bannerPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removerBanner(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvarPersonalizacao}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            style={{ backgroundColor: corPrimaria }}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
