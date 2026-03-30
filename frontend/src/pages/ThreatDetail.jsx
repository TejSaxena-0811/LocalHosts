import React, { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ThreatDetail = () => {
  const { id } = useParams();
  const [threat, setThreat] = useState(null);
  const [activeTab, setActiveTab] = useState("context");
  const navigate = useNavigate();

  const tabsRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });


  const tabs = useMemo(() => {
    const baseTabs = [
      { key: "context", label: "Context" },
      { key: "threats", label: "Threat Scenarios" },
      { key: "uses", label: "Use Cases" },
    ];

    // only add UML tab if file is .puml
    if (threat?.plantuml_filename?.toLowerCase().endsWith(".puml")) {
      baseTabs.splice(2, 0, { key: "uml", label: "UML Diagram" }); 
    }

    return baseTabs;
  }, [threat]);


  useLayoutEffect(() => {
    if (!tabsRef.current) return;
    const tabButtons = tabsRef.current.querySelectorAll("button");
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    const activeButton = tabButtons[activeIndex];
    if (activeButton) {
      setHighlightStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    async function fetchThreat() {
      try {
        const res = await axios.get(`http://localhost:5000/get_threats/${id}`);
        setThreat(res.data);
      } catch (err) {
        console.error('Failed to fetch threat:', err);
      }
    }
    fetchThreat();
  }, [id]);

  const formatContext = (context) => {
    if (!context) return '';
    let cleaned = context;
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    cleaned = cleaned.replace(/`([^`]+)`/g, '<code>$1</code>');
    cleaned = cleaned.replace(/^(\d+)\.\s/gm, '<br/><strong>$1.</strong> ');
    cleaned = cleaned.replace(/^- /gm, '• ');
    cleaned = cleaned.replace(/\n{2,}/g, '<br/><br/>');
    cleaned = cleaned.replace(/\n/g, '<br/>');
    return cleaned;
  };

  const renderThreatScenarios = () => {
    try {
      let parsed = threat.aithreats;
      if (typeof parsed === "string") {
        const cleaned = parsed
          .replace(/^```json/, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();
        parsed = JSON.parse(cleaned);
      }
      const scenarios = Array.isArray(parsed)
        ? parsed
        : parsed.threat_scenarios || [];

      if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new Error();
      }

      return (
        <div className="space-y-4">
          {scenarios.map((item, index) => (
            <div
              key={index}
              className="border border-gray-600 rounded-lg p-4 shadow-sm bg-slate-800 text-white"
            >
              <h3 className="font-semibold text-lg mb-2 text-indigo-300">
                Scenario {index + 1}
              </h3>
              <p className="mb-1">
                <span className="font-semibold">Scenario:</span> {item.scenario}
              </p>
              <br />
              <p className="mb-1">
                <span className="font-semibold">Countermeasure:</span> {item.countermeasure}
              </p>
              <br />
              <p>
                <span className="font-semibold">Severity:</span>
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
      );
    } catch {
      return (
        <pre className="bg-slate-800 p-4 rounded overflow-auto whitespace-pre-wrap break-words max-h-[400px] border border-slate-600">
          {typeof threat.aithreats === "string"
            ? threat.aithreats
            : JSON.stringify(threat.aithreats, null, 2)}
        </pre>
      );
    }
  };

  if (!threat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white">
        <p>Loading threat details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-300 hover:text-white transition"
        >
          <ArrowLeftIcon className="h-9 w-9 mr-2" />
        </button>

        <div
          ref={tabsRef}
          className="relative flex bg-slate-700 rounded-md overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.2)" }}
        >
          <span
            className="absolute top-0 bottom-0 bg-blue-600 rounded-md transition-all duration-300 ease-in-out"
            style={{
              left: highlightStyle.left,
              width: highlightStyle.width,
              willChange: "left, width",
              zIndex: 0,
            }}
          />
          {tabs.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-300 ease-in-out whitespace-nowrap
      ${activeTab === tab.key ? 'text-white bg-blue-600' : 'text-slate-300 hover:text-white'}
      ${idx === 0 ? 'rounded-l-md' : ''}
      ${idx === tabs.length - 1 ? 'rounded-r-md' : ''}
    `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-11"></div>
      </div>

      <div>
        {activeTab === "context" && (
          <div>
            <div className="text-white py-12 space-y-6">
              <h3 className="text-3xl font-bold">
                <span className="text-indigo-400">Threat Name:</span>{" "}
                <span className="text-white">{threat.threat_name}</span>
              </h3>
              <div className="text-sm text-slate-400">
                <p className="text-sm text-gray-300">Uploaded: {new Date(threat.timestamp).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}</p>
              </div>
              <p className="text-sm text-gray-300">Spec: {threat.spec_filename}</p>
              <p className="text-sm text-gray-300">System Diagram: {threat.plantuml_filename}</p>
            </div>

            <section>
              <h3 className="font-semibold mb-2 text-xl">Context</h3>
              <div
                className="bg-slate-800 p-4 rounded border border-slate-600 overflow-auto whitespace-pre-wrap break-words max-h-[500px] text-sm hide-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatContext(threat.context) }}
              />
            </section>
          </div>
        )}

        {activeTab === "threats" && (
          <section>
            <h3 className="font-semibold mb-2 text-xl">Threat Scenarios</h3>
            {renderThreatScenarios()}
          </section>
        )}

        {activeTab === "uml" && threat.plantuml_filename?.toLowerCase().endsWith(".puml") && (
          <section>
            <h3 className="font-semibold mb-2 text-xl">Generated UML Diagram:</h3>
            {threat.diagram_url ? (
              <img
                src={threat.diagram_url}
                alt="PlantUML Diagram"
                className="rounded-xl border border-slate-600 shadow max-w-full"
              />
            ) : (
              <p className="text-sm text-slate-400">No UML diagram found.</p>
            )}
          </section>
        )}


        {activeTab === "uses" && (
          <section>
            <h3 className="mt-10 text-xl text-center">Use Cases coming soon!</h3>
          </section>
        )}
      </div>
    </div>
  );
};

export default ThreatDetail;
