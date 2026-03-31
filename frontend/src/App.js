import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProductSpec from './pages/ProductSpec';
import ThreatsList from './pages/ThreatList';
import ThreatDetail from './pages/ThreatDetail';
import UploadPlantUML from './pages/UploadPlantUML';
import UploadProductSpec from './pages/UploadProductSpec';
import DrawIOEditor from "./pages/DrawIOEditor";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/threats" element={<ThreatsList />} />
        <Route path="/threats/:id" element={<ThreatDetail />} />
        <Route path="/generate" element={<ProductSpec />} />
        <Route path="/upload-product-spec" element={<UploadProductSpec />} />
        <Route path="/upload-plantuml" element={<UploadPlantUML />} />
        <Route path="/drawio" element={<DrawIOEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
