import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full text-center shadow-lg">
        <h2 className="text-2xl font-bold text-white-800 mb-4">How It Works</h2>
        <ul className="text-white-700 text-left mb-6 space-y-2">
          <li>✅ Step 1: Upload Product Specification</li>
          <li>✅ Step 2: Upload PlantUML or Draw.io File</li>
          <li>✅ Step 3: Edit Files If Required</li>
          <li>✅ Step 4: Generate AI-Driven Threats</li>
        </ul>
        <button
          onClick={onClose}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

// This is the infoModal page
