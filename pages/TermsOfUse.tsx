
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TermsOfUse = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="mb-8 text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
           <span>←</span> Voltar
        </button>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Termos de Uso</h1>
        <p className="text-gray-400 font-bold text-sm mb-10">Última atualização: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta, acessar ou utilizar a plataforma Pede Mais ("Plataforma"), você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concorda com algum destes termos, está proibido de usar ou acessar este serviço.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">2. Descrição do Serviço</h2>
            <p>A Pede Mais é uma plataforma SaaS (Software as a Service) white-label que fornece infraestrutura tecnológica para que estabelecimentos comerciais ("Lojistas") criem lojas virtuais, gerenciem cardápios, pedidos e coordenem entregas com prestadores de serviço ("Entregadores").</p>
            <p className="mt-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm font-bold text-yellow-800">
                Importante: A Pede Mais atua exclusivamente como intermediadora tecnológica e não é responsável pela produção, qualidade, embalagem ou entrega física dos produtos comercializados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">3. Responsabilidades do Lojista</h2>
            <p>O Lojista declara e garante que:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Possui todas as licenças e autorizações necessárias para a venda de seus produtos.</li>
                <li>É o único responsável pela qualidade, segurança e conformidade sanitária dos alimentos e produtos.</li>
                <li>É responsável por manter as informações de cardápio, preços e disponibilidade atualizados.</li>
                <li>É responsável pelo cumprimento das obrigações fiscais decorrentes das vendas realizadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">4. Planos e Pagamentos</h2>
            <p>O acesso à plataforma é concedido mediante assinatura de planos. O não pagamento das mensalidades poderá resultar na suspensão ou cancelamento do acesso aos serviços e da loja virtual.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">5. Propriedade Intelectual</h2>
            <p>O software, design, código-fonte e logomarca da Pede Mais são de propriedade exclusiva da nossa empresa. O Lojista mantém a propriedade sobre sua marca e conteúdo (fotos de produtos) inseridos na plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">6. Limitação de Responsabilidade</h2>
            <p>Em nenhuma hipótese a Pede Mais ou seus fornecedores serão responsáveis por quaisquer danos indiretos, incidentais, especiais ou consequentes (incluindo, sem limitação, danos por perda de dados ou lucro) decorrentes do uso ou da incapacidade de usar a plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4">7. Modificações</h2>
            <p>A Pede Mais pode revisar estes termos de serviço a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>
          </section>
        </div>
        
        <div className="mt-12 pt-12 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">© {new Date().getFullYear()} Pede Mais Tecnologia. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
