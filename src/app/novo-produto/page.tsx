'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/app/components/ProductForm';
import { supabase } from '@/lib/supabaseClient';

export default function NovoProduto() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    nome: string;
    descricao: string;
    preco: string;
    imagem: File | null;
  }) => {
    try {
      setIsSubmitting(true);
      
      // 1. Upload da imagem se houver
      let imageUrl = '';
      if (data.imagem) {
        const fileExt = data.imagem.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `produtos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(filePath, data.imagem);
          
        if (uploadError) throw uploadError;
        
        // Obter URL pública da imagem
        const { data: { publicUrl } } = supabase.storage
          .from('produtos')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // 2. Salvar os dados do produto
      const { error } = await supabase
        .from('produtos')
        .insert([
          { 
            nome: data.nome,
            descricao: data.descricao,
            preco: parseFloat(data.preco),
            imagem_url: imageUrl,
            empresa_id: 'ID_DA_EMPRESA_AQUI' // Você precisará obter o ID da empresa logada
          }
        ]);
        
      if (error) throw error;
      
      // 3. Redirecionar após o sucesso
      router.push('/painel-empresa'); // Ajuste a rota conforme necessário
      
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Ocorreu um erro ao cadastrar o produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <ProductForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="Adicionar Novo Produto"
          submitButtonText={isSubmitting ? 'Salvando...' : 'Salvar Produto'}
        />
      </div>
    </div>
  );
}