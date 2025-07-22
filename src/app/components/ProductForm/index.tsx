'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: {
    id?: string;
    nome: string;
    descricao: string;
    preco: string;
    imagem_url?: string;
  };
  onSubmit: (data: {
    nome: string;
    descricao: string;
    preco: string;
    imagem: File | null;
  }) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  title: string;
}

export default function ProductForm({
  initialData = {
    nome: '',
    descricao: '',
    preco: '',
    imagem_url: ''
  },
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Salvar Produto',
  title
}: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: initialData.nome,
    descricao: initialData.descricao,
    preco: initialData.preco,
  });
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState(initialData.imagem_url || '');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      imagem
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2" style={{ borderColor: '#29B6F6' }}>
      <div className="p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-6">
          {title}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black placeholder-gray-400"
                  style={{ borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  placeholder="Ex: Camiseta Personalizada"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black placeholder-gray-400"
                  style={{ borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  placeholder="Descreva o produto detalhadamente"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black"
                    style={{ borderColor: '#4FC3F7', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {initialData.imagem_url ? 'Alterar Imagem' : 'Imagem do Produto *'}
                </label>
                <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg" style={{ borderColor: '#4FC3F7' }}>
                  {(imagemPreview || initialData.imagem_url) && (
                    <div className="mb-4">
                      <img 
                        src={imagemPreview || initialData.imagem_url} 
                        alt="Preview" 
                        className="h-32 w-32 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        style={{ color: '#039BE5' }}
                      >
                        <span>Enviar uma foto</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                          required={!initialData.imagem_url}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 border border-transparent rounded-lg font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)' }}
            >
              {isSubmitting ? 'Salvando...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
