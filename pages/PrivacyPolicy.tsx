
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="mb-8 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
           <span>←</span> Voltar
        </button>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Política de Privacidade</h1>
        <p className="text-gray-400 font-bold text-sm mb-10">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">1. Introdução</h2>
            <p>A Pede Mais ("nós", "nosso") valoriza a sua privacidade e se compromete a proteger seus dados pessoais. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nossa plataforma SaaS de delivery, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">2. Coleta de Dados</h2>
            <p className="mb-4">Coletamos apenas as informações necessárias para a prestação eficiente dos nossos serviços:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Para Lojistas:</strong> Nome, e-mail, telefone, dados da empresa (CNPJ, endereço), logotipos, cardápios e dados financeiros para faturamento de assinaturas.</li>
                <li><strong>Para Clientes Finais:</strong> Nome, endereço de entrega, telefone e dados de pagamento (processados de forma segura por gateways parceiros).</li>
                <li><strong>Para Entregadores:</strong> Nome, CPF/CNH, dados do veículo, dados bancários para repasse e geolocalização em tempo real durante o serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">3. Uso das Informações</h2>
            <p>Utilizamos seus dados para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Processar pedidos, entregas e pagamentos.</li>
                <li>Gerenciar contas e assinaturas na plataforma.</li>
                <li>Melhorar a experiência do usuário e oferecer suporte técnico.</li>
                <li>Enviar comunicações transacionais (status do pedido, atualizações de serviço).</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">4. Compartilhamento de Dados</h2>
            <p>Não vendemos seus dados pessoais. O compartilhamento ocorre apenas nas seguintes situações:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Operacionalização:</strong> Dados de entrega são compartilhados entre Lojista e Entregador para a execução do serviço.</li>
                <li><strong>Parceiros de Serviço:</strong> Com gateways de pagamento, provedores de hospedagem e ferramentas de análise, sob estritos acordos de confidencialidade.</li>
                <li><strong>Obrigação Legal:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">5. Segurança da Informação</h2>
            <p>Implementamos medidas técnicas e organizacionais robustas, incluindo criptografia SSL, controle de acesso restrito e monitoramento constante para proteger seus dados contra acesso não autorizado, perda ou alteração.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">6. Seus Direitos</h2>
            <p>Você tem o direito de solicitar o acesso, correção, portabilidade ou exclusão dos seus dados pessoais. Para exercer esses direitos, entre em contato através dos nossos canais de suporte.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">7. Contato</h2>
            <p>Em caso de dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: <span className="text-emerald-600 font-bold">privacidade@pedemais.app</span>.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-12 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">© {new Date().getFullYear()} Pede Mais Tecnologia. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
