import React from "react";

const NewDonationForm = ({
  newDonationRows,
  addDonationRow,
  removeDonationRow,
  handleNewDonationChange,
  handleFileChange,
  handleSubmitAllDonations,
  isLoading,
}) => {
  return (
    <section
      aria-labelledby="form-heading"
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h2 id="form-heading" className="text-xl font-bold mb-1">
        Registrar Novas Doações
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Adicione uma ou mais doações recebidas. Todos os registros serão
        automaticamente associados à sua tribo. Clique em "Enviar Todas" ao
        finalizar.
      </p>
      <div id="donation-form-container" className="space-y-4">
        {newDonationRows.map((row) => (
          <div
            key={row.tempId}
            className="border border-stone-200 p-4 rounded-lg space-y-3 relative form-row-enter"
          >
            <button
              onClick={() => removeDonationRow(row.tempId)}
              className="absolute top-2 right-2 text-stone-400 hover:text-red-500"
            >
              &times;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Nome do Doador
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={row.donorName}
                  onChange={(e) =>
                    handleNewDonationChange(
                      row.tempId,
                      "donorName",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Valor Doado (R$)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="1"
                  value={row.amount}
                  onChange={(e) =>
                    handleNewDonationChange(
                      row.tempId,
                      "amount",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Data da Doação
                </label>
                <input
                  type="date"
                  name="donationDate"
                  value={row.donationDate}
                  onChange={(e) =>
                    handleNewDonationChange(
                      row.tempId,
                      "donationDate",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Telefone (Opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={row.phone}
                  onChange={(e) =>
                    handleNewDonationChange(row.tempId, "phone", e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Comprovante (.png, .jpg, .pdf)
              </label>
              <input
                type="file"
                name="receipt"
                onChange={(e) =>
                  handleFileChange(row.tempId, e.target.files[0])
                }
                className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                accept=".png,.jpg,.jpeg,.pdf"
                required
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={addDonationRow}
          className="w-full bg-teal-100 text-teal-800 font-semibold py-2 px-4 rounded-lg hover:bg-teal-200"
        >
          + Adicionar Doação
        </button>
        <button
          onClick={handleSubmitAllDonations}
          disabled={newDonationRows.length === 0 || isLoading}
          className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 disabled:bg-stone-400"
        >
          {isLoading ? "Enviando..." : "Enviar Todas"}
        </button>
      </div>
    </section>
  );
};

export default React.memo(NewDonationForm);
