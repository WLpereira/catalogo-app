export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  whatsapp?: string;
  logo_url?: string;
  descricao?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  banner_urls?: string[];
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  created_at: string;
}
