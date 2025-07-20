import React from "react";

const EditDonationModal = ({
  editingDonation,
  setEditingDonation,
  handleUpdateDonation,
  isLoading,
}) => {
  if (!editingDonation) return null; // Não renderiza se não houver doação em edição

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">Editar Doação</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateDonation();
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-donorName"
                className="block text-sm font-medium text-stone-700"
              >
                Nome do Doador
              </label>
              <input
                type="text"
                id="edit-donorName"
                value={editingDonation.nome_doador || ""}
                onChange={(e) =>
                  setEditingDonation({
                    ...editingDonation,
                    nome_doador: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-amount"
                className="block text-sm font-medium text-stone-700"
              >
                Valor Doado (R$)
              </label>
              <input
                type="number"
                id="edit-amount"
                step="0.01"
                min="1"
                value={editingDonation.valor_doado || ""}
                onChange={(e) =>
                  setEditingDonation({
                    ...editingDonation,
                    valor_doado: parseFloat(e.target.value) || "",
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-donationDate"
                className="block text-sm font-medium text-stone-700"
              >
                Data da Doação
              </label>
              <input
                type="date"
                id="edit-donationDate"
                value={
                  editingDonation.data_doacao
                    ? new Date(editingDonation.data_doacao)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditingDonation({
                    ...editingDonation,
                    data_doacao: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-phone"
                className="block text-sm font-medium text-stone-700"
              >
                Telefone (Opcional)
              </label>
              <input
                type="tel"
                id="edit-phone"
                value={editingDonation.telefone_doador || ""}
                onChange={(e) =>
                  setEditingDonation({
                    ...editingDonation,
                    telefone_doador: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <p className="text-sm text-stone-500">
              Comprovante atual:{" "}
              {editingDonation.url_comprovante ? (
                <a
                  href={editingDonation.url_comprovante}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  Ver comprovante
                </a>
              ) : (
                "Nenhum"
              )}
            </p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setEditingDonation(null)} // Fecha o modal
              className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditDonationModal);
