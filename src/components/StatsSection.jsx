import { ArrowLeftRight } from "lucide-react";
import React from "react";

const StatsSection = ({
  donations,
  currentUser,
  BASKET_COST,
  formatCurrency,
  showMoneyForTribe,
  setShowMoneyForTribe,
}) => {
  // Total Arrecadado e Cestas Básicas agora consideram TODAS as doações
  const totalDonated = donations.reduce((sum, d) => sum + d.valor_doado, 0);
  const totalBaskets = Math.floor(totalDonated / BASKET_COST);

  // Calcula o total da tribo do usuário logado
  const userTribeDonated = donations
    .filter((d) => d.tribo === currentUser.id)
    .reduce((sum, d) => sum + d.valor_doado, 0);
  const userTribeBaskets = Math.floor(userTribeDonated / BASKET_COST);

  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">
        Estatísticas Gerais
      </h2>
      <p className="text-base text-stone-600 mb-4">
        Este é o painel de controle do projeto. Aqui você pode visualizar
        rapidamente o progresso geral da arrecadação, o desempenho de cada tribo
        e, mais importante, registrar as novas doações que sua tribo recebeu.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <div>
            <p className="text-sm text-stone-500">Total Arrecadado</p>
            <p className="text-3xl font-bold">{formatCurrency(totalDonated)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
          <div>
            <p className="text-sm text-stone-500">Cestas Básicas</p>
            <p className="text-3xl font-bold">{totalBaskets}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">
              {showMoneyForTribe
                ? "Sua Tribo Arrecadou"
                : "Cestas da Sua Tribo"}
            </p>
            <p className="text-3xl font-bold">
              {showMoneyForTribe
                ? formatCurrency(userTribeDonated)
                : userTribeBaskets}
            </p>
          </div>
          <button
            onClick={() => setShowMoneyForTribe(!showMoneyForTribe)}
            className="p-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            title={
              showMoneyForTribe ? "Ver Cestas Básicas" : "Ver Valor em Dinheiro"
            }
          >
            <ArrowLeftRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(StatsSection);
