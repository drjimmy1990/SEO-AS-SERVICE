// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProjectPage from './pages/ProjectPage';
import './App.css';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        {/* We will add more routes later */}
      </Routes>
    </div>
  );
}

export default App;
