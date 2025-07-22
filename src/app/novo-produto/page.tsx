import React from "react";

export default function NovoProduto() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Adicionar Produto</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome do Produto</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nome do produto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Preço</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Preço"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Imagem</label>
            <input type="file" className="w-full p-2 border rounded" />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Adicionar Produto
          </button>
        </form>
      </div>
    </div>
  );
} 