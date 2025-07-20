import React from "react";

const DashboardHeader = ({ ASVLogo, currentUser, performLogout }) => {
  return (
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
  );
};

export default React.memo(DashboardHeader);
