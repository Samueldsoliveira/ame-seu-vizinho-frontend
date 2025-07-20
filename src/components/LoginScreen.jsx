import React from "react";

const LoginScreen = ({
  ASVLogo,
  triboSelectRef,
  password,
  setPassword,
  performLogin,
  isLoading,
}) => {
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
          <div>
            <label
              htmlFor="password-input"
              className="block text-sm font-medium text-stone-700"
            >
              Senha
            </label>
            <input
              type="password"
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Digite a senha da tribo"
              required
            />
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
    </div>
  );
};

export default React.memo(LoginScreen);
