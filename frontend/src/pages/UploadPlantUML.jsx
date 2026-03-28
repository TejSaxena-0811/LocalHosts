import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import plantumlEncoder from 'plantuml-encoder';

const UploadPlantUML = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { specText, specFileName } = location.state || {};

  const [umlFile, setUmlFile] = useState(null);
  const [umlText, setUmlText] = useState('');
  const [threatName, setThreatName] = useState('');
  const [message, setMessage] = useState('');
  const [threatResponse, setThreatResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [umlImageUrl, setUmlImageUrl] = useState(null);

  const phrases = [
    "Shoveling the soil...",
    "Watering the idea garden...",
    "Feeding data to the thinking engine...",
    "Herding digital sheep...",
    "Untangling the wires of logic...",
    "Cooking up some threats...",
    "Sweeping the blueprint for danger...",
    "Sharpening pencils and minds...",
    "Knocking on the doors of possibility...",
    "Chasing down suspicious patterns...",
    "Brewing some cybersecurity tea...",
    "Assembling the threat-detection squad...",
    "Sneaking through the system shadows..."
  ];

  const handleUmlChange = (e) => {
    const file = e.target.files[0];
    setUmlFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUmlText(ev.target.result);
    reader.readAsText(file);
  };

  useEffect(() => {
    if (umlText.trim()) {
      const encoded = plantumlEncoder.encode(umlText);
      setUmlImageUrl(`https://www.plantuml.com/plantuml/svg/${encoded}`);
    } else {
      setUmlImageUrl(null);
    }
  }, [umlText]);

  const handleGenerate = async () => {
    if (!specText || !umlFile || !threatName.trim()) {
      setMessage('⚠️ Please provide a threat name, upload UML, and ensure spec is present.');
      return;
    }

    setLoading(true);

    let index = 0;
    const shuffled = [...phrases].sort(() => 0.5 - Math.random());
    const intervalId = setInterval(() => {
      setLoadingPhrase(shuffled[index % shuffled.length]);
      index++;
    }, 2500);

    const formData = new FormData();
    const specBlob = new Blob([specText], { type: 'text/plain' });
    const umlBlob = new Blob([umlText], { type: 'text/plain' });

    formData.append('prodspecdoc', specBlob, specFileName || 'productspec.txt');
    formData.append('plantumlfile', umlBlob, umlFile.name);
    formData.append('threat_name', threatName);

    try {
      const res = await axios.post('http://localhost:5000/generate_threats', formData);
      setThreatResponse(res.data);
      setMessage('✅ Threats generated below');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage('❌ Generation failed.');
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setLoadingPhrase('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-12 py-12 space-y-8">

      <div className="flex items-center justify-between">
        <button
          className="flex items-center text-indigo-300 hover:text-white transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <h2 className="text-4xl font-bold text-center flex-1 text-center -ml-5">
          Upload PlantUML Diagram
        </h2>

        <div className="w-24" />
      </div>

      <p className="text-center text-gray-300">
        Upload your .puml file and preview/edit its contents.
      </p>


      <div>
        <label className="block mb-2 font-medium text-indigo-300 text-lg">Threat Name</label>
        <input
          type="text"
          value={threatName}
          onChange={(e) => setThreatName(e.target.value)}
          className="w-full p-4 rounded bg-slate-800 text-white border border-slate-600 text-base"
          placeholder="Enter a meaningful threat name..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-4 border border-slate-600 rounded bg-slate-800">
          <input
            type="file"
            accept=".puml,.txt"
            onChange={handleUmlChange}
            className="block mx-auto text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
          />
        </div>

        <div className="p-4 border border-slate-600 rounded bg-slate-800">
          <textarea
            rows={12}
            value={umlText}
            onChange={(e) => setUmlText(e.target.value)}
            className="w-full h-full bg-slate-900 text-white border border-gray-600 rounded p-3 font-mono text-sm"
            placeholder="Preview/edit diagram here..."
          />
        </div>
      </div>

      {umlImageUrl && (
        <div className="flex justify-center">
          <div className="bg-slate-800 p-4 rounded shadow-md w-full md:w-auto border border-slate-600">
            <h3 className="font-semibold text-center mb-2 text-indigo-300">🖼️ UML Diagram Preview</h3>
            <img
              src={umlImageUrl}
              alt="UML Diagram Preview"
              className="w-full md:w-[400px] border shadow rounded"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full shadow hover:scale-105 transition"
        >
          Generate Threats
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-2xl text-indigo-300 italic font-semibold text-center">
          {loadingPhrase}
        </p>
      )}

      {message && (
        <p className="text-center text-md font-medium text-white">{message}</p>
      )}

      {threatResponse && (
        <div className="bg-slate-700 p-6 rounded space-y-4 text-sm text-gray-200">
          <h3 className="text-xl font-semibold text-indigo-400 mb-2">Threat Scenarios</h3>
          {Array.isArray(threatResponse.aithreats) ? (
            <div className="space-y-4">
              {threatResponse.aithreats.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-600 rounded-lg p-4 shadow-sm bg-slate-800 text-white"
                >
                  <h3 className="font-semibold text-lg mb-2 text-indigo-300">
                    Scenario {idx + 1}
                  </h3>
                  <p className="mb-1">
                    <span className="font-semibold">Scenario:</span> {item.scenario}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Countermeasure:</span> {item.countermeasure}
                  </p>
                  <p>
                    <span className="font-semibold">Severity:</span>{' '}
                    <span
                      className={`ml-2 px-2 py-1 rounded text-white ${
                        item.severity === 'Critical'
                          ? 'bg-red-500'
                          : item.severity === 'High'
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <pre className="whitespace-pre-wrap bg-slate-800 p-3 rounded border border-slate-600 text-gray-300">
              {JSON.stringify(threatResponse, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPlantUML;
