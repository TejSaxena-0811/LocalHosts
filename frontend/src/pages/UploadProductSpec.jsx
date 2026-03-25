import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function UploadProductSpec() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [productSpecText, setProductSpecText] = useState("");
  const [message, setMessage] = useState("");

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage("⚠️ Please select a Product Specification file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/upload-productspec", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed");

      setProductSpecText(data.content);
      setMessage(`✅ ${data.message}`);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Failed to upload and extract text");
    }
  };


  const handleNext = (type) => {

    const editedSpecBlob = new Blob([productSpecText], { type: "text/plain" });
    const editedSpecFile = new File(
      [editedSpecBlob],
      selectedFile?.name || "productspec.txt",
      { type: "text/plain" }
    );

    const state = {
      specFile: editedSpecFile,
      specText: productSpecText,
      specFileName: selectedFile?.name || "productspec.txt",
    };

    if (type === "plantuml") {
      navigate("/upload-plantuml", { state });
    } else if (type === "drawio") {
      navigate("/drawio", { state });
    }
  };

  const handleBack = () => {
    navigate("/threats");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-12 py-12 space-y-6">

      <div className="flex items-center justify-between">
        <button
          className="flex items-center text-indigo-300 hover:text-white transition"
          onClick={handleBack}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <h2 className="text-4xl font-bold text-center flex-1 text-center -ml-5">
          Upload Product Specification File
        </h2>

        <div className="w-24" />
      </div>

      <p className="text-center text-gray-300">
        Upload your .docx file and preview/edit its contents.
      </p>


      {/* File Upload Section */}
      <div className="border-2 border-dashed border-[#4f46e5] rounded-2xl p-6 bg-white/5 text-center shadow-md">
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="block mx-auto text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-[#4f46e5] file:text-white hover:file:bg-[#4338CA] cursor-pointer"
        />
        <button
          onClick={handleFileUpload}
          className="flex mx-auto mt-8 items-center bg-indigo-600 text-white px-6 py-3 rounded-full shadow hover:bg-indigo-700 transition hover:scale-105"
        >
          Upload & Extract
        </button>
      </div>

      {/* The Editable Text Area */}
      <div>
        <h3 className="text-2xl font-semibold mb-3">Edit Extracted Content</h3>
        <textarea
          value={productSpecText}
          onChange={(e) => setProductSpecText(e.target.value)}
          placeholder="Extracted text will appear here..."
          className="w-full h-[17.5rem] p-4 bg-black/30 border border-white/20 rounded-xl text-white shadow-inner resize-none"
        />
      </div>


      {/* Navigation Buttons */}
      <div className="flex justify-center items-center pt-2">

        <div className="flex gap-4">
          <button
            onClick={() => handleNext("plantuml")}
            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-full shadow hover:bg-indigo-700 transition hover:scale-105"
          >
            Use PlantUML
          </button>

          {/* disabling drawio button for now */}
          {/* <button
            onClick={() => handleNext("drawio")}
            className="flex items-center bg-green-600 text-white px-6 py-3 rounded-full shadow hover:bg-green-700 transition hover:scale-105"
          >
            Use Draw.io
          </button> */}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="text-center text-md text-yellow-300 font-medium mt-4">
          {message}
        </div>
      )}
    </div>
  );
}
