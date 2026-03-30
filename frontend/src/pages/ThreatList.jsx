import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ThreatsList = () => {
  const [threats, setThreats] = useState([]);
  const navigate = useNavigate();

  const fetchThreats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/get_threats');
      setThreats(res.data);
    } catch (error) {
      console.error("Error fetching threats", error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this threat?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/delete_threat/${id}`);
      setThreats(threats.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete threat", error);
      alert("Error deleting threat.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-12">
      <div className="max-w-5xl mx-auto relative">
        
        <button
          onClick={handleBack}
          className="absolute top-0 left-0 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <button
          onClick={() => navigate('/upload-product-spec')}
          className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
        >
          + New Threat
        </button>

        <h1 className="text-4xl font-bold mb-16 text-center">Threat History</h1>

        {threats.length === 0 ? (
          <p className="text-gray-300 text-center">No threats found. Upload to generate some!</p>
        ) : (
          <div className="space-y-4">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="bg-slate-700 rounded-xl p-6 shadow-md flex justify-between items-center hover:shadow-lg transition"
              >
                <div
                  onClick={() => navigate(`/threats/${threat.id}`)}
                  className="cursor-pointer flex-grow"
                >
                  <h3 className="text-lg font-semibold text-indigo-400">• {threat.threat_name}</h3>
                  <p className="text-sm text-gray-300">Uploaded: {new Date(threat.timestamp).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}</p>
                  <p className="text-sm text-gray-400 mt-1"><b>Spec: </b>{threat.spec_filename}</p>
                  <p className="text-sm text-gray-400 mt-1"><b>System Diagram: </b>{threat.plantuml_filename}</p>
                </div>
                <button
                  onClick={() => handleDelete(threat.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow-md"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreatsList;
