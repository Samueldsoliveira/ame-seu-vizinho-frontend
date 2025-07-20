import React from "react";

const MessageBox = () => {
  return (
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
  );
};

export default React.memo(MessageBox);
