import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ASVLogo from "./assets/ASV 2.png";
import LoginScreen from "./components/LoginScreen";
import DashboardHeader from "./components/DashboardHeader";
import StatsSection from "./components/StatsSection";
import ChartSection from "./components/ChartSection";
import NewDonationForm from "./components/NewDonationForm";
import RecentDonationsList from "./components/RecentDonationsList";
import EditDonationModal from "./components/EditDonationModal";
import MessageBox from "./components/MessageBox";

const App = () => {
  const BASKET_COST = 35;

  // Variável de ambiente para a URL da API
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [currentUser, setCurrentUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [newDonationRows, setNewDonationRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [editingDonation, setEditingDonation] = useState(null);
  const [showMoneyForTribe, setShowMoneyForTribe] = useState(true);

  // Ref para o select da tribo na tela de login
  const triboSelectRef = useRef(null);

  // Dados das tribos para o gráfico e outras lógicas
  const TRIBES = useMemo(
    () => ({
      start: { name: "Tribo Start", color: "rgb(251, 255, 0)" },
      rock: { name: "Tribo Rock", color: "rgb(255, 217, 0)" },
      safe: { name: "Tribo Safe", color: "rgba(0, 255, 255, 0.7)" },
    }),
    []
  );

  // Função para exibir mensagens (MessageBox)
  const showMessageBox = useCallback((title, content) => {
    const messageBox = document.getElementById("messageBox");
    const messageBoxTitle = document.getElementById("messageBoxTitle");
    const messageBoxContent = document.getElementById("messageBoxContent");

    if (messageBox && messageBoxTitle && messageBoxContent) {
      messageBoxTitle.textContent = title;
      messageBoxContent.textContent = content;
      messageBox.classList.remove("hidden");
    }
  }, []);

  // Função para formatar valores como moeda BRL
  const formatCurrency = useCallback((value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const chartData = useMemo(() => {
    return Object.keys(TRIBES).map((tribeId) => {
      return donations
        .filter((d) => d.tribo === tribeId)
        .reduce((sum, d) => sum + d.valor_doado, 0);
    });
  }, [donations, TRIBES]);

  // Função para buscar todas as doações do backend
  const fetchInitialDonations = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/donations`);
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
      setDonations(result.donations);
    } catch (error) {
      console.error("Erro ao buscar doações iniciais:", error);
      showMessageBox(
        "Erro",
        "Não foi possível buscar as doações iniciais do servidor."
      );
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, currentUser, showMessageBox]);

  // Função para lidar com o login do usuário
  const performLogin = useCallback(async () => {
    const selectedTribeId = triboSelectRef.current?.value;
    const enteredPassword = password;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          triboId: selectedTribeId,
          password: enteredPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message || "Erro desconhecido ao fazer login.";
        showMessageBox("Erro de Login", `Falha no login: ${errorMessage}`);
        return;
      }

      const loggedInUser = {
        id: result.user.tribo,
        name: result.user.name,
        userId: result.user.userId,
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
      setIsLoading(false);
    }
  }, [API_BASE_URL, password, showMessageBox]);

  // Função para lidar com o logout do usuário
  const performLogout = useCallback(() => {
    setCurrentUser(null);
    setDonations([]);
    setNewDonationRows([]);
    localStorage.removeItem("currentUserAmeSeuVizinho");
  }, []);

  // Função para adicionar uma nova linha de doação no formulário
  const addDonationRow = useCallback(() => {
    setNewDonationRows((prevRows) => [
      ...prevRows,
      {
        tempId: Date.now(),
        donorName: "",
        amount: "",
        donationDate: (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const day = String(today.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })(),
        phone: "",
        receiptFile: null,
        receiptFileName: "",
      },
    ]);
  }, []);

  // Função para remover uma linha de doação do formulário
  const removeDonationRow = useCallback((tempIdToRemove) => {
    setNewDonationRows((prevRows) =>
      prevRows.filter((row) => row.tempId !== tempIdToRemove)
    );
  }, []);

  // Função para lidar com a mudança de campos em uma nova linha de doação
  const handleNewDonationChange = useCallback((tempId, field, value) => {
    setNewDonationRows((prevRows) =>
      prevRows.map((row) =>
        row.tempId === tempId ? { ...row, [field]: value } : row
      )
    );
  }, []);

  // Função para lidar com a seleção de arquivo de comprovante
  const handleFileChange = useCallback((tempId, file) => {
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
  }, []);

  // Função para submeter todas as novas doações em lote
  const handleSubmitAllDonations = useCallback(async () => {
    if (!currentUser || !currentUser.userId || !currentUser.id) {
      showMessageBox(
        "Erro de Autenticação",
        "Por favor, faça login novamente. Dados do usuário não encontrados para registrar a doação."
      );
      setIsLoading(false);
      return;
    }

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

    setIsLoading(true);

    const formData = new FormData();
    formData.append("donations", JSON.stringify(donationsDataToSend));
    formData.append("responsavelId", currentUser.userId);
    formData.append("tribo", currentUser.id);

    filesToUpload.forEach((file) => {
      formData.append(`receipts`, file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/donations/batch`, {
        method: "POST",
        body: formData,
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
      setNewDonationRows([]);
      fetchInitialDonations();
    } catch (error) {
      console.error("Erro ao enviar doações:", error);
      showMessageBox(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    API_BASE_URL,
    currentUser,
    newDonationRows,
    fetchInitialDonations,
    showMessageBox,
  ]);

  const handleUpdateDonation = useCallback(async () => {
    if (!editingDonation || !currentUser || !currentUser.userId) {
      showMessageBox("Erro", "Dados inválidos para atualização.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/donations/${editingDonation.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome_doador: editingDonation.nome_doador,
            valor_doado: parseFloat(editingDonation.valor_doado),
            data_doacao: editingDonation.data_doacao,
            telefone_doador: editingDonation.telefone_doador,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.message || "Erro desconhecido ao atualizar doação.";
        showMessageBox(
          "Erro na Atualização",
          `Falha ao atualizar doação: ${errorMessage}`
        );
        return;
      }

      showMessageBox("Sucesso!", "Doação atualizada com sucesso!");
      setEditingDonation(null);
      fetchInitialDonations();
    } catch (error) {
      console.error("Erro ao atualizar doação:", error);
      showMessageBox(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor para atualizar a doação."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    API_BASE_URL,
    editingDonation,
    currentUser,
    fetchInitialDonations,
    showMessageBox,
  ]);

  const handleViewReceipt = useCallback(
    (url) => {
      if (url) {
        window.open(url, "_blank");
      } else {
        showMessageBox(
          "Comprovante Não Disponível",
          "Esta doação não possui um comprovante anexado ou a URL está inválida."
        );
      }
    },
    [showMessageBox]
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUserAmeSeuVizinho");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erro ao parsear usuário do localStorage:", e);
        localStorage.removeItem("currentUserAmeSeuVizinho");
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchInitialDonations();
    }
  }, [currentUser, fetchInitialDonations]);

  return (
    <div className="bg-stone-50 text-stone-800 min-h-screen">
      {!currentUser ? (
        <LoginScreen
          ASVLogo={ASVLogo}
          triboSelectRef={triboSelectRef}
          password={password}
          setPassword={setPassword}
          performLogin={performLogin}
          isLoading={isLoading}
        />
      ) : (
        <>
          <DashboardHeader
            ASVLogo={ASVLogo}
            currentUser={currentUser}
            performLogout={performLogout}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-xl flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <p className="text-teal-800">Carregando...</p>
                </div>
              </div>
            )}

            <StatsSection
              donations={donations}
              currentUser={currentUser}
              BASKET_COST={BASKET_COST}
              formatCurrency={formatCurrency}
              showMoneyForTribe={showMoneyForTribe}
              setShowMoneyForTribe={setShowMoneyForTribe}
            />

            <ChartSection chartData={chartData} TRIBES={TRIBES} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <NewDonationForm
                newDonationRows={newDonationRows}
                addDonationRow={addDonationRow}
                removeDonationRow={removeDonationRow}
                handleNewDonationChange={handleNewDonationChange}
                handleFileChange={handleFileChange}
                handleSubmitAllDonations={handleSubmitAllDonations}
                isLoading={isLoading}
              />

              <RecentDonationsList
                donations={donations}
                currentUser={currentUser}
                formatCurrency={formatCurrency}
                handleEditClick={setEditingDonation}
                handleViewReceipt={handleViewReceipt}
              />
            </div>
          </main>
        </>
      )}

      <EditDonationModal
        editingDonation={editingDonation}
        setEditingDonation={setEditingDonation}
        handleUpdateDonation={handleUpdateDonation}
        isLoading={isLoading}
      />
      <MessageBox />
    </div>
  );
};

export default App;
