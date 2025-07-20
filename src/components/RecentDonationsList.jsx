import { Eye, Pencil } from "lucide-react";
import React from "react";

const RecentDonationsList = ({
  donations,
  currentUser,
  formatCurrency,
  handleEditClick,
  handleViewReceipt,
}) => {
  if (!currentUser)
    return (
      <p className="text-stone-500 text-center py-4">
        Nenhum registro encontrado.
      </p>
    );

  const userDonations = donations
    .filter((d) => d.tribo === currentUser.id)
    .sort(
      (a, b) =>
        new Date(b.data_doacao).getTime() - new Date(a.data_doacao).getTime() ||
        (b.id || 0) - (a.id || 0)
    );

  if (userDonations.length === 0) {
    return (
      <p className="text-stone-500 text-center py-4">
        Nenhum registro encontrado.
      </p>
    );
  }

  return (
    <section
      aria-labelledby="recent-heading"
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h2 id="recent-heading" className="text-xl font-bold mb-1">
        Doações Recentes (Sua Tribo)
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Aqui você vê uma lista das últimas doações que você registrou para sua
        tribo. A lista é atualizada assim que você envia novos registros.
      </p>
      <div
        id="recent-donations-list"
        className="space-y-3 max-h-96 overflow-y-auto pr-2"
      >
        {userDonations.map((d) => (
          <div
            key={d.id}
            className="bg-stone-50 p-3 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{d.nome_doador}</p>
              <p className="font-bold text-teal-600">
                {formatCurrency(d.valor_doado)}
              </p>
              <p className="text-xs text-stone-500">
                {new Date(d.data_doacao).toLocaleDateString("pt-BR")} -
                Comprovante: {d.url_comprovante ? "Anexado" : "Não Anexado"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {d.url_comprovante && (
                <button
                  onClick={() => handleViewReceipt(d.url_comprovante)}
                  className="p-2 text-stone-500 hover:text-blue-600 rounded-full hover:bg-stone-100 transition-colors duration-200"
                  title="Ver Comprovante"
                >
                  <Eye size={18} />
                </button>
              )}
              <button
                onClick={() => handleEditClick(d)}
                className="p-2 text-stone-500 hover:text-teal-600 rounded-full hover:bg-stone-100 transition-colors duration-200"
                title="Editar Doação"
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(RecentDonationsList);
