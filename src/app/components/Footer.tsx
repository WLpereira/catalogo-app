import React from 'react';
import { Empresa } from '@/types/empresa';

interface FooterProps {
  empresa: Empresa | null;
}

const Footer: React.FC<FooterProps> = ({ empresa }) => {
  if (!empresa) return null;

  const currentYear = new Date().getFullYear();
  const { 
    nome, 
    descricao, 
    endereco, 
    telefone, 
    email, 
    whatsapp, 
    cor_primaria, 
    cor_secundaria, 
    horario_atendimento, 
    sobre_nos 
  } = empresa;

  return (
    <footer 
      className="mt-12 py-6 xs:py-8 px-2 xs:px-4 w-full"
      style={{ 
        backgroundColor: cor_primaria || '#1a365d',
        color: cor_secundaria || '#ffffff'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">

          {/* About Column */}
          <div>
            <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-4">Sobre Nós</h3>
            <p className="text-xs xs:text-sm opacity-90 whitespace-pre-line">
              {sobre_nos || descricao || 'Sua descrição de negócio aqui.'}
            </p>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-4">Contato</h3>
            <ul className="space-y-1 xs:space-y-2">
              {endereco && (
                <li className="flex items-start">
                  <svg className="h-4 w-4 xs:h-5 xs:w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ stroke: 'currentColor' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs xs:text-sm opacity-90">{endereco}</span>
                </li>
              )}
              {telefone && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ stroke: 'currentColor' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${telefone}`} className="text-xs xs:text-sm hover:underline opacity-90 break-all">
                    {telefone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ stroke: 'currentColor' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${email}`} className="text-xs xs:text-sm hover:underline opacity-90 break-all">
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" style={{ stroke: 'currentColor' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <a 
                    href={`https://wa.me/55${whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs xs:text-sm hover:underline opacity-90 break-all"
                  >
                    {whatsapp}
                  </a>
                </li>
              )}
            </ul>
          </div>
          
          {/* Business Hours Column */}
          <div>
            <h3 className="text-base xs:text-lg font-bold mb-2 xs:mb-4">Horário de Atendimento</h3>
            {horario_atendimento ? (
              <pre className="text-xs xs:text-sm opacity-90 whitespace-pre-line">{horario_atendimento}</pre>
            ) : (
              <ul className="space-y-1 xs:space-y-2">
                <li className="flex justify-between">
                  <span className="text-xs xs:text-sm opacity-90">Segunda a Sexta:</span>
                  <span className="text-xs xs:text-sm opacity-90">09:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs xs:text-sm opacity-90">Sábado:</span>
                  <span className="text-xs xs:text-sm opacity-90">09:00 - 12:00</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-xs xs:text-sm opacity-90">Domingo:</span>
                  <span className="text-xs xs:text-sm opacity-90">Fechado</span>
                </li>
              </ul>
            )}
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-opacity-20 mt-6 xs:mt-8 pt-4 xs:pt-6 text-center">
          <p className="text-xs xs:text-sm opacity-80">
            &copy; {currentYear} {nome}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
