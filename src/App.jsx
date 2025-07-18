import Chart from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import ASVLogo from "../src/assets/ASV 2.png";

const App = () => {
  const PIX_KEY = "ivvcentro@ccvideira.com.br";
  const BASKET_COST = 35;

  const API_BASE_URL = "https://ame-seu-vizinho-api.onrender.com";

  const [currentUser, setCurrentUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [newDonationRows, setNewDonationRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const triboSelectRef = useRef(null);
  const chartRef = useRef(null);
  let tribosChartInstance = useRef(null);

  const TRIBES = {
    start: { name: "Tribo Start", color: "rgba(229, 255, 0, 0.911)" },
    rock: { name: "Tribo Rock", color: "rgb(255, 217, 0)" },
    safe: { name: "Tribo Safe", color: "rgba(0, 255, 255, 0.7)" },
  };

  const showMessageBox = (title, content) => {
    document.getElementById("messageBoxTitle").textContent = title;
    document.getElementById("messageBoxContent").textContent = content;
    document.getElementById("messageBox").classList.remove("hidden");
  };

  useEffect(() => {
    if (currentUser) {
      updateDashboard();
      updateChart();
    }
  }, [donations, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchInitialDonations();
    }
  }, [currentUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUserAmeSeuVizinho");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao parsear usuário do localStorage:", e);
        localStorage.removeItem("currentUserAmeSeuVizinho"); // Limpa dados corrompidos
      }
    }
  }, []);

  const formatCurrency = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const updateDashboard = () => {
    if (!currentUser) return;

    // Total Arrecadado e Cestas Básicas agora consideram TODAS as doações
    const totalDonated = donations.reduce((sum, d) => sum + d.valor_doado, 0); // Usa valor_doado do backend
    const totalBaskets = Math.floor(totalDonated / BASKET_COST);

    // Sua Tribo Arrecadou continua sendo apenas da tribo logada
    const userTribeDonated = donations
      .filter((d) => d.tribo === currentUser.id)
      .reduce((sum, d) => sum + d.valor_doado, 0); // Usa valor_doado do backend

    document.getElementById("total-arrecadado").textContent =
      formatCurrency(totalDonated);
    document.getElementById("total-cestas").textContent = totalBaskets;
    document.getElementById("tribo-arrecadado").textContent =
      formatCurrency(userTribeDonated);
  };

  const updateChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    const data = Object.keys(TRIBES).map((tribeId) => {
      return donations
        .filter((d) => d.tribo === tribeId)
        .reduce((sum, d) => sum + d.valor_doado, 0); // Usa valor_doado do backend
    });

    if (tribosChartInstance.current) {
      tribosChartInstance.current.data.datasets[0].data = data;
      tribosChartInstance.current.update();
    } else {
      tribosChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.values(TRIBES).map((t) => t.name),
          datasets: [
            {
              label: "Total Arrecadado (R$)",
              data: data,
              backgroundColor: Object.values(TRIBES).map((t) => t.color),
              borderColor: Object.values(TRIBES).map((t) =>
                t.color.replace("0.7", "1")
              ),
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Arrecadação por Tribo" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return ` R$ ${context.raw.toFixed(2)}`;
                },
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: "Valor (R$)" },
            },
          },
        },
      });
    }
  };

  const updateRecentDonationsList = () => {
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
          new Date(b.data_doacao) - new Date(a.data_doacao) || b.id - a.id
      ); // Use data_doacao

    if (userDonations.length === 0) {
      return (
        <p className="text-stone-500 text-center py-4">
          Nenhum registro encontrado.
        </p>
      );
    }

    return userDonations.map((d) => (
      <div key={d.id} className="bg-stone-50 p-3 rounded-lg">
        <div className="flex justify-between items-start">
          <p className="font-semibold">{d.nome_doador}</p>{" "}
          {/* Use nome_doador */}
          <p className="font-bold text-teal-600">
            {formatCurrency(d.valor_doado)}
          </p>{" "}
          {/* Use valor_doado */}
        </div>
        <p className="text-xs text-stone-500">
          {new Date(d.data_doacao).toLocaleDateString("pt-BR")} - Comprovante:{" "}
          {d.url_comprovante ? "Anexado" : "Não Anexado"}
        </p>
      </div>
    ));
  };

  const addDonationRow = () => {
    setNewDonationRows((prevRows) => [
      ...prevRows,
      {
        tempId: Date.now(), // Unique key for React list rendering
        donorName: "",
        amount: "",
        donationDate: new Date().toISOString().slice(0, 10),
        phone: "",
        receiptFile: null,
        receiptFileName: "",
      },
    ]);
  };

  const removeDonationRow = (tempIdToRemove) => {
    setNewDonationRows((prevRows) =>
      prevRows.filter((row) => row.tempId !== tempIdToRemove)
    );
  };

  const handleNewDonationChange = (tempId, field, value) => {
    setNewDonationRows((prevRows) =>
      prevRows.map((row) =>
        row.tempId === tempId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleFileChange = (tempId, file) => {
    setNewDonationRows((prevRows) =>
      prevRows.map((row) =>
        row.tempId === tempId
          ? {
              ...row,
              receiptFile: file,
              receiptFileName: file ? file.name : "",
            }
          : row
      )
    );
  };

  const handleSubmitAllDonations = async () => {
    let allValid = true;
    const donationsDataToSend = [];
    const filesToUpload = [];

    newDonationRows.forEach((row) => {
      if (
        !row.donorName ||
        !row.amount ||
        !row.donationDate ||
        !row.receiptFile
      ) {
        allValid = false;
      } else {
        donationsDataToSend.push({
          donorName: row.donorName,
          amount: parseFloat(row.amount),
          donationDate: row.donationDate,
          phone: row.phone,
        });
        filesToUpload.push(row.receiptFile);
      }
    });

    if (!allValid) {
      showMessageBox(
        "Erro de Validação",
        "Por favor, preencha todos os campos obrigatórios e anexe os comprovantes em todas as linhas de doação."
      );
      return;
    }

    if (donationsDataToSend.length === 0) {
      showMessageBox("Nenhuma Doação", "Nenhuma doação para enviar.");
      return;
    }

    setIsLoading(true); // Inicia loading

    const formData = new FormData();
    formData.append("donations", JSON.stringify(donationsDataToSend));
    formData.append("responsavelId", currentUser.userId); // Adiciona o userId do responsável
    formData.append("tribo", currentUser.id); // Adiciona a tribo do responsável

    filesToUpload.forEach((file) => {
      formData.append(`receipts`, file); // O backend espera um array de arquivos com o mesmo nome 'receipts'
    });

    try {
      const response = await fetch(`${API_BASE_URL}/donations/batch`, {
        method: "POST",
        body: formData, // FormData não precisa de Content-Type manual
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message || "Erro desconhecido ao registrar doações.";
        showMessageBox(
          "Erro no Registro",
          `Falha ao registrar doações: ${errorMessage}`
        );
        return;
      }

      showMessageBox(
        "Sucesso!",
        `${result.count} doação(ões) registrada(s) com sucesso!`
      );
      setNewDonationRows([]); // Limpa o formulário após o sucesso
      fetchInitialDonations(); // Recarrega os dados do backend para atualizar o dashboard
    } catch (error) {
      console.error("Erro ao enviar doações:", error);
      showMessageBox(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
    } finally {
      setIsLoading(false); // Finaliza loading
    }
  };

  const performLogin = async () => {
    const selectedTribeId = triboSelectRef.current.value;
    setIsLoading(true); // Inicia loading

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ triboId: selectedTribeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message || "Erro desconhecido ao fazer login.";
        showMessageBox("Erro de Login", `Falha no login: ${errorMessage}`);
        return;
      }

      // Armazena o userId (UUID) e a tribo retornados pelo backend
      const loggedInUser = {
        id: result.user.tribo,
        name: result.user.name,
        userId: result.user.userId, // UUID do usuário para a tribo
      };
      setCurrentUser(loggedInUser);

      localStorage.setItem(
        "currentUserAmeSeuVizinho",
        JSON.stringify(loggedInUser)
      );
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      showMessageBox(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor de autenticação. Verifique se o backend está rodando."
      );
    } finally {
      setIsLoading(false); // Finaliza loading
    }
  };

  const fetchInitialDonations = async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // Agora, busca TODAS as doações do backend
      const response = await fetch(`${API_BASE_URL}/donations`); // Endpoint que retorna todas as doações
      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message || "Erro desconhecido ao buscar doações iniciais.";
        console.error("Falha ao buscar doações iniciais:", errorMessage);
        showMessageBox(
          "Erro",
          `Falha ao buscar doações iniciais: ${errorMessage}`
        );
        return;
      }
      setDonations(result.donations); // Atualiza o estado com TODOS os dados do backend
    } catch (error) {
      console.error("Erro ao buscar doações iniciais:", error);
      showMessageBox(
        "Erro",
        "Não foi possível buscar as doações iniciais do servidor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = () => {
    setCurrentUser(null);
    setDonations([]); // Limpa os dados ao deslogar
    setNewDonationRows([]); // Limpa qualquer entrada pendente
    localStorage.removeItem("currentUserAmeSeuVizinho");
    // Opcional: Destruir a instância do gráfico se ela existir
    if (tribosChartInstance.current) {
      tribosChartInstance.current.destroy();
      tribosChartInstance.current = null;
    }
  };

  // Renderiza a tela de login se não houver usuário logado
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <img
              src={ASVLogo}
              alt="Ame Seu Vizinho Logo"
              className="block mx-auto h-20 w-auto mb-4"
            />
            <p className="mt-2 text-stone-600">Acesso do Responsável</p>
          </div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="tribo-select"
                className="block text-sm font-medium text-stone-700"
              >
                Selecione sua Tribo
              </label>
              <select
                id="tribo-select"
                ref={triboSelectRef}
                className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              >
                <option value="start">Tribo Start</option>
                <option value="rock">Tribo Rock</option>
                <option value="safe">Tribo Safe</option>
              </select>
            </div>
            <button
              onClick={performLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-stone-400"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
          <p className="text-xs text-center text-stone-500">
            Gestão de Doações - Ame seu vizinho A13 School
          </p>
        </div>
        {/* Message Box for alerts */}
        <div
          id="messageBox"
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden"
        >
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3
              className="text-lg font-semibold mb-4"
              id="messageBoxTitle"
            ></h3>
            <p className="text-gray-700 mb-4" id="messageBoxContent"></p>
            <button
              onClick={() =>
                document.getElementById("messageBox").classList.add("hidden")
              }
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderiza a aplicação principal se o usuário estiver logado
  return (
    <div className="bg-stone-50 text-stone-800 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <img
            src={ASVLogo}
            alt="Ame Seu Vizinho Logo"
            className="h-12 w-auto mb-4"
          />
          <div className="flex items-center space-x-4">
            <p className="text-sm">
              Logado como:{" "}
              <span id="user-info" className="font-semibold">
                {currentUser.name}
              </span>
            </p>
            <button
              onClick={performLogout}
              className="text-sm text-stone-600 hover:text-teal-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-xl flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="text-teal-800">Carregando...</p>
            </div>
          </div>
        )}

        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Estatísticas Gerais
          </h2>
          <p className="text-base text-stone-600 mb-4">
            Este é o painel de controle do projeto. Aqui você pode visualizar
            rapidamente o progresso geral da arrecadação, o desempenho de cada
            tribo e, mais importante, registrar as novas doações que sua tribo
            recebeu.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
              <div>
                <p className="text-sm text-stone-500">Total Arrecadado</p>
                <p id="total-arrecadado" className="text-3xl font-bold">
                  R$0,00
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
              <div>
                <p className="text-sm text-stone-500">Cestas Básicas</p>
                <p id="total-cestas" className="text-3xl font-bold">
                  0
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
              <div>
                <p className="text-sm text-stone-500">Sua Tribo Arrecadou</p>
                <p id="tribo-arrecadado" className="text-3xl font-bold">
                  R$0,00
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="chart-heading"
          className="mt-8 bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 id="chart-heading" className="text-xl font-bold mb-1">
            Desempenho das Tribos
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Acompanhe a competição amigável! Este gráfico compara o total
            arrecadado por cada tribo, atualizado em tempo real. Passe o mouse
            sobre as barras para ver os em média (NÃO PRECISOS).
          </p>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section
            aria-labelledby="form-heading"
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 id="form-heading" className="text-xl font-bold mb-1">
              Registrar Novas Doações
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Adicione uma ou mais doações recebidas. Todos os registros serão
              automaticamente associados à sua tribo. Clique em "Enviar Todas"
              ao finalizar.
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
                          handleNewDonationChange(
                            row.tempId,
                            "phone",
                            e.target.value
                          )
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

          <section
            aria-labelledby="recent-heading"
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h2 id="recent-heading" className="text-xl font-bold mb-1">
              Doações Recentes (Sua Tribo)
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Aqui você vê uma lista das últimas doações que você registrou para
              sua tribo. A lista é atualizada assim que você envia novos
              registros.
            </p>
            <div
              id="recent-donations-list"
              className="space-y-3 max-h-96 overflow-y-auto pr-2"
            >
              {updateRecentDonationsList()}
            </div>
          </section>
        </div>
      </main>
      {/* Message Box for alerts */}
      <div
        id="messageBox"
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-4" id="messageBoxTitle"></h3>
          <p className="text-gray-700 mb-4" id="messageBoxContent"></p>
          <button
            onClick={() =>
              document.getElementById("messageBox").classList.add("hidden")
            }
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
