import { Route, Routes } from 'react-router-dom';
import './App.css';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import CreatUser from './pages/CreatUser';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On component mount, check if the user is logged in
  useEffect(() => {
    // Retrieve 'user' data from localStorage to check if user is authenticated
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // Update localStorage when the authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('user', 'authenticated');
    } else {
      localStorage.removeItem('user');
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
        <Route path="/create-user" element={isAuthenticated ? <CreatUser /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
