import { Eye, Pencil } from "lucide-react";
import React, { useState } from "react";

const RecentDonationsList = ({
  donations,
  currentUser,
  formatCurrency,
  handleEditClick,
  handleViewReceipt,
}) => {
  const [filterTerm, setFilterTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDonations = donations
    .filter((d) => d.tribo === currentUser.id)
    .filter((d) =>
      d.nome_doador.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.data_doacao).getTime() - new Date(a.data_doacao).getTime() ||
        (b.id || 0) - (a.id || 0)
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <section
      aria-labelledby="recent-heading"
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      {!currentUser && (
        <p className="text-stone-500 text-center py-4">
          Nenhum registro encontrado.
        </p>
      )}

      <h2 id="recent-heading" className="text-xl font-bold mb-1">
        Doações Recentes (Sua Tribo)
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Aqui você vê uma lista das últimas doações que você registrou para sua
        tribo. A lista é atualizada assim que você envia novos registros.
      </p>
      <div className="mb-4">
        <label htmlFor="search-donor" className="sr-only">
          Buscar Doador
        </label>
        <input
          type="text"
          id="search-donor"
          placeholder="Buscar doador por nome..."
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>
      <div
        id="recent-donations-list"
        className="space-y-3 max-h-96 overflow-y-auto pr-2"
      >
        {filteredDonations.length === 0 && filterTerm !== "" ? (
          <p className="text-stone-500 text-center py-4">
            Nenhuma doação encontrada para "{filterTerm}".
          </p>
        ) : filteredDonations.length === 0 && filterTerm === "" ? (
          <p className="text-stone-500 text-center py-4">
            Nenhum registro encontrado.
          </p>
        ) : (
          currentItems.map((d) => (
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
                  {new Date(d.data_doacao).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}{" "}
                  - Comprovante: {d.url_comprovante ? "Anexado" : "Não Anexado"}
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
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-stone-700 text-sm font-semibold">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      )}
    </section>
  );
};

export default React.memo(RecentDonationsList);
