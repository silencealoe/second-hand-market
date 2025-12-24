import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './layout';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          {token && (
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>
          )}
          <Route path="*" element={<Login setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;