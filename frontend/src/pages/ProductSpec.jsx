import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import InfoModal from '../components/InfoModal';
import axios from 'axios';

const ProductSpec = () => {
  const navigate = useNavigate();
  const [plantumlFile, setPlantumlFile] = useState(null);
  const [specFile, setSpecFile] = useState(null);
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');

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
  "Sneaking through the system shadows...",
  ];

  const handlePlantUMLChange = (event) => {
    setPlantumlFile(event.target.files[0]);
  };

  const handleSpecFileChange = (event) => {
    setSpecFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!plantumlFile || !specFile) {
      setMessage('⚠️ Please upload both PlantUML and Product Spec files.');
      setTimeout(() =>{
        setMessage('');
      } , 3000);
      return;
    }

    try {
      // Upload PlantUML File
      const plantumlFormData = new FormData();
      plantumlFormData.append('file', plantumlFile);
      await axios.post('http://localhost:5000/upload-plantuml', plantumlFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Upload Product Spec File
      const specFormData = new FormData();
      specFormData.append('file', specFile);
      await axios.post('http://localhost:5000/upload-productspec', specFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('✅ Both files uploaded successfully!');
      setTimeout(() => {
        setMessage('');
      } , 2500);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('❌ File upload failed. Please try again.');
      setTimeout(() => {
        setMessage('');
      } , 5000);
    }
  };

  const handleGenerateThreats = async () => {
    if (!plantumlFile || !specFile) {
      setMessage('⚠️ Please upload both files before generating threats.');
      setTimeout(() => {
        setMessage('');
      } , 3000)
      return;
    }

    setLoading(true);
    let index = 0;

    const shuffledPhrases = [...phrases].sort(() => 0.5-Math.random());
    const intervalId = setInterval(() => {
      setLoadingPhrase(shuffledPhrases[index % shuffledPhrases.length]);
      index++;
    } , 2500);


    try {
      const formData = new FormData();
      formData.append('plantumlfile', plantumlFile);
      formData.append('prodspecdoc', specFile);

      const res = await axios.post('http://localhost:5000/generate_threats', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const parsedThreats = res.data.aithreats;

      setContext(res.data.context || '');
      setThreats(Array.isArray(parsedThreats) ? parsedThreats : []);
      setMessage('✅ Threat generation successful!');
      setTimeout(() => {
        setMessage('');
      } , 5000);
    } catch (error) {
      console.error('Threat generation failed:', error);
      setMessage('❌ Threat generation failed. Please try again.');
      setTimeout(() => {
        setMessage('');
      } , 5000);
    }
    finally{
      clearInterval(intervalId);
      setLoading(false);
      setLoadingPhrase('');
    }
  };

  const handleNext = () => navigate('/architecture');
  const handleBack = () => navigate('/');


  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-100 via-amber-100 to-teal-200 flex flex-col justify-between text-gray-800 p-6 space-y-12">
      <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-md rounded-3xl p-8 shadow-xl space-y-8 transition transform hover:scale-[1.01]">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Upload PlantUML & Product Specification</h2>
          <InfoModal />
        </div>

        <p className="text-gray-700 text-center">
          Please upload your PlantUML (.puml) and Product Specification (.pdf/.docx) files. Both are required.
        </p>

        {/* PlantUML Upload */}
        <div className="border-2 border-dashed border-amber-300 bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4 hover:scale-105 hover:shadow-lg transition cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">PlantUML File (.puml)</p>
          <input
            type="file"
            accept=".puml"
            onChange={handlePlantUMLChange}
            className="block mx-auto"
          />
        </div>

        {/* Product Spec Upload */}
        <div className="border-2 border-dashed border-teal-300 bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4 hover:scale-105 hover:shadow-lg transition cursor-pointer">
          <p className="text-lg font-semibold text-gray-800">Product Specification (.pdf, .docx)</p>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleSpecFileChange}
            className="block mx-auto"
          />
        </div>

        <button
          onClick={handleUpload}
          className="w-40 py-3 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 hover:scale-105 transition block mx-auto"
        >
          Upload Files
        </button>

        {/* Generate Threats Button */}
        <button
          onClick={handleGenerateThreats}
          className="w-60 py-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 hover:scale-105 transition block mx-auto"
        >
          Generate Threats
        </button>

        {loading && (
          <p className="text-center text-sm text-gray-600 italic mt-4">
            {loadingPhrase}
          </p>
        )}

        {message && (
          <p className="text-center text-md text-gray-700 font-medium">
            {message}
          </p>
        )}

        {context && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-x-auto text-sm mb-6">
            <h3 className="font-bold mb-2">System Context:</h3>
            <pre className="whitespace-pre-wrap">{context}</pre>
          </div>
        )}

        {threats.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-lg text-red-700">Generated Threats:</h3>
            {threats.map((threat, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-md shadow-sm border">
                <p><strong>Scenario:</strong> {threat.scenario}</p>
                <p><strong>Severity:</strong> {threat.severity}</p>
                <p><strong>Countermeasure:</strong> {threat.countermeasure}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="flex items-center bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-full shadow-md transition hover:scale-105"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full shadow-md transition hover:scale-105"
          >
            Next
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 mt-6">
        © 2025 Sentinel. All rights reserved.
      </footer>
    </div>
  );
};

export default ProductSpec;
