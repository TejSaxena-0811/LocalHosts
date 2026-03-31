import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function DrawIOEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef(null);

  const specFileName = location.state?.specFileName || "productspec.txt";
  const specText = location.state?.specText || "";

  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState(null);
  const [threatName, setThreatName] = useState("");
  const [message, setMessage] = useState("");
  const [diagramXML, setDiagramXML] = useState("");
  const [threatResponse, setThreatResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

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

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage("⚠️ Please select a Draw.io file first");
      setTimeout(() => setUploadMessage(""), 5000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/drawio_upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Upload failed");

      setFilename(data.filename);

      const fileRes = await fetch(`http://localhost:5000/uploads/${data.filename}`);
      const xmlText = await fileRes.text();
      setDiagramXML(xmlText);

      // Load into draw.io iframe (important)
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ action: "load", autosave: 1, xml: xmlText }),
        "*"
      );

      setUploadMessage(`✅ File ${data.filename} uploaded & opened in editor`);
      setTimeout(() => setUploadMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setUploadMessage("⚠️ Error uploading file");
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  // Save XML from iframe
  const requestSave = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ action: "export", format: "xml", spin: "Saving..." }),
      "*"
    );
  };

  useEffect(() => {
    const listener = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "export" && msg.xml) {
          setDiagramXML(msg.xml);

          // save in uploads/drawio/
          fetch("http://localhost:5000/save_drawio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              xml: msg.xml,
              filename: filename || "diagram.drawio",
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              setFilename(data.filename);
              setSaveMessage(`✅ Diagram saved as ${data.filename}`);
              setTimeout(() => setSaveMessage(""), 5000);
            })
            .catch((err) => {
              console.error("Error saving:", err);
              setSaveMessage("⚠️ Error saving file");
              setTimeout(() => setSaveMessage(""), 5000);
            });
        }
      } catch (err) {
        console.error("Message parsing failed", err);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [filename]);

  // Generate Threats
  const handleGenerate = async () => {
    if (!specText || !diagramXML || !threatName.trim()) {
      setMessage("⚠️ Please provide a threat name, upload diagram, and ensure spec is present.");
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
    const specBlob = new Blob([specText], { type: "text/plain" });
    const xmlBlob = new Blob([diagramXML], { type: "text/xml" });

    formData.append("prodspecdoc", specBlob, specFileName);
    formData.append("drawiofile", xmlBlob, filename || "diagram.drawio");
    formData.append("threat_name", threatName);

    try {
      const res = await axios.post("http://localhost:5000/generate_threats", formData);
      setThreatResponse(res.data);
      setMessage("✅ Threats generated below");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("❌ Generation failed.");
    } finally {
      clearInterval(intervalId);
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/upload-product-spec");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-12 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center text-indigo-300 hover:text-white transition"
          onClick={handleBack}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <h2 className="text-4xl font-bold text-center flex-1 text-center -ml-5">
          Upload & Edit Draw.io Diagram
        </h2>

        <div className="w-24" />
      </div>

      <p className="text-center text-gray-300">
        Upload your .drawio file and preview/edit its contents.
      </p>


      {/* Enter a threat name */}
      <div>
        <h3 className="text-2xl font-semibold mb-3">Threat Name</h3>
        <input
          type="text"
          value={threatName}
          onChange={(e) => setThreatName(e.target.value)}
          placeholder="Enter a meaningful threat name..."
          className="w-full p-4 bg-black/30 border border-white/20 rounded-xl text-white shadow-inner"
        />
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-[#4f46e5] rounded-2xl p-6 bg-white/5 text-center shadow-md">
        <input
          type="file"
          accept=".drawio,.xml"
          onChange={(e) => setFile(e.target.files[0])}
          className="block mx-auto text-white file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 file:text-sm 
            file:bg-[#4f46e5] file:text-white hover:file:bg-[#4338CA] cursor-pointer"
        />
        <button
          onClick={handleUpload}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition hover:scale-105"
        >
          Upload & Open in Editor
        </button>
        <button
          onClick={requestSave}
          className="ml-4 px-6 py-3 bg-green-600 text-white rounded-full shadow hover:bg-green-700 transition hover:scale-105"
        >
          Save Diagram
        </button>
      </div>

      {(uploadMessage || saveMessage) && (
        <p className="text-center text-green-400 font-medium mt-4">
          {uploadMessage || saveMessage}
        </p>
      )}

      {/* Embedded Draw.io editor/board */}
      <iframe
        ref={iframeRef}
        title="Draw.io Editor"
        src="https://embed.diagrams.net/?embed=1&ui=min&proto=json"
        width="100%"
        height="600px"
        className="rounded-xl shadow-lg border border-white/20"
      ></iframe>


      {/* Generate Threats */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleGenerate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full shadow hover:scale-105 transition"
          disabled={loading}
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


      {/* Threat Scenarios Output */}
      {threatResponse && (
        <div className="bg-slate-700 p-6 rounded space-y-4 text-sm text-gray-200 mt-6">
          <h3 className="text-xl font-semibold text-indigo-400 mb-2">
            Threat Scenarios
          </h3>
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
                  <p>
                    <span className="font-semibold">Scenario:</span>{" "}
                    {item.scenario}
                  </p>
                  <p>
                    <span className="font-semibold">Countermeasure:</span>{" "}
                    {item.countermeasure}
                  </p>
                  <p>
                    <span className="font-semibold">Severity:</span>{" "}
                    <span
                      className={`ml-2 px-2 py-1 rounded text-white ${
                        item.severity === "Critical"
                          ? "bg-red-500"
                          : item.severity === "High"
                          ? "bg-orange-500"
                          : "bg-green-500"
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
}
